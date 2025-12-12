"""Primary entry point for rendering SBS Markdown documents."""

from __future__ import annotations

import html
from textwrap import dedent
from typing import Any, Optional, Protocol, cast

from markdown_it import MarkdownIt
from markdown_it.token import Token
from mdit_py_plugins.attrs import attrs_plugin
from .bridge import BridgeBlock
from .chess import ChessBlock
from .sticky import use_sticky


class _FenceRenderer(Protocol):
    rules: dict[str, Any]

    def render_token(self, tokens: list[Token], idx: int, options, env) -> str: ...


class SBSRenderer:
    """Turn SBS flavored Markdown into HTML pages."""

    def __init__(self, *, widgets_dir: str = "./widgets", theme: str = "default"):
        self.widgets_dir = widgets_dir.rstrip("/")
        self.theme = theme or "default"
        self.md = MarkdownIt("commonmark", {"linkify": True, "typographer": True})
        self.md.use(attrs_plugin)
        use_sticky(self.md)
        self._renderer: _FenceRenderer = cast(_FenceRenderer, self.md.renderer)
        self._default_fence = self._renderer.rules.get("fence")
        self._renderer.rules["fence"] = self._render_fence

    # ------------------------------------------------------------------
    # Rendering
    # ------------------------------------------------------------------
    def render(self, text: str, env: Optional[dict[str, Any]] = None) -> str:
        """Render Markdown to an HTML fragment."""
        if env is None:
            env = {}
        elif not isinstance(env, dict):
            raise TypeError("env must be a dict")
        return self.md.render(text, env)

    def render_document(self, text: str, *, title: str = "SBS Document") -> str:
        env: dict[str, Any] = {}
        body = self.render(text, env)
        title_html = html.escape(title)
        css_hrefs = [
            f"{self.widgets_dir}/sbs-ext.css",
            f"{self.widgets_dir}/themes/{self.theme}.css",
        ]
        css_links = "\n".join(f"<link rel='stylesheet' href='{href}'>" for href in css_hrefs)

        used_widgets = env.get("_sbs_used_widgets")
        script_srcs: list[str] = []
        if used_widgets:
            if "bridge" in used_widgets:
                script_srcs.append(f"{self.widgets_dir}/bridge/index.js")
            if "chess" in used_widgets:
                script_srcs.append(f"{self.widgets_dir}/chess/index.js")

        script_tags = "\n".join(
            f"<script type='module' src='{src}'></script>" for src in script_srcs
        )
        html_str = dedent("""\
            <!DOCTYPE html>
            <html lang='en'>
            <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <title>{title_html}</title>
            {css_links}
            {script_tags}
            </head>
            <body>
            {body}
            </body>
            </html>
        """).strip("\n").format(
            title_html=title_html,
            css_links=css_links,
            script_tags=script_tags,
            body=body,
        )
        return html_str


    # ------------------------------------------------------------------
    # private helpers
    # ------------------------------------------------------------------
    def _render_fence(self, tokens, idx, options, env):
        token = tokens[idx]
        info = (token.info or "").strip().split(None, 1)
        fence_lang = info[0] if info else ""
        if fence_lang == "sbs-bridge":
            env.setdefault("_sbs_used_widgets", set()).add("bridge")
            block = BridgeBlock.from_fence(token.content)
            html_block = block.to_html()
            return self._wrap_sticky_if_needed(html_block, env)

        if fence_lang == "sbs-chess":
            env.setdefault("_sbs_used_widgets", set()).add("chess")
            block = ChessBlock.from_fence(token.content)
            html_block = block.to_html()
            return self._wrap_sticky_if_needed(html_block, env)

        if self._default_fence:
            return self._default_fence(tokens, idx, options, env)

        return self._renderer.render_token(tokens, idx, options, env)

    def _wrap_sticky_if_needed(self, html_block: str, env) -> str:
        sticky_stack = env.get("_sbs_sticky_stack")
        if sticky_stack:
            state = sticky_stack[-1]
            if not state.get("visual_done"):
                state["visual_done"] = True
                state["text_open"] = True
                return (
                    "<div class='sbs-sticky-figure'>"
                    f"{html_block}"
                    "</div>\n<div class='sbs-sticky-body'>"
                )
        return html_block
