"""Primary entry point for rendering SBS Markdown documents."""

from __future__ import annotations

import html
from textwrap import dedent
from typing import Any, Callable, Optional, Protocol, cast

from markdown_it import MarkdownIt
from markdown_it.token import Token
from mdit_py_plugins.attrs import attrs_plugin
from .bridge import BridgeBlock
from .chess import ChessBlock
from .sticky import use_sticky, wrap_sticky_if_needed


class _FenceRenderer(Protocol):
    rules: dict[str, Any]

    def render_token(self, tokens: list[Token], idx: int, options, env) -> str: ...


class _HtmlBlock(Protocol):
    def to_html(self) -> str: ...


class _AttrHandler(Protocol):
    def __call__(
        self,
        *,
        token: Token,
        env: dict[str, Any],
        name: str,
        value: str | None,
    ) -> None: ...


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
        self._fence_handlers: dict[str, Callable[[Token, dict[str, Any]], str]] = {}
        self._attr_handlers: dict[str, _AttrHandler] = {}
        self._register_fence_handlers()
        self._register_attr_handlers()
        self._renderer.rules["fence"] = self._render_fence

    def _register_fence_handlers(self) -> None:
        self._fence_handlers = {}
        self._register_fence("sbs-bridge", widget="bridge", block_factory=BridgeBlock.from_fence)
        self._register_fence("sbs-chess", widget="chess", block_factory=ChessBlock.from_fence)

    def _register_attr_handlers(self) -> None:
        """Register attribute handlers.

        SBS 1.1 supports attributes via `{ key=value }` syntax.
        We already enable the parser plugin (`attrs_plugin`) so attrs are
        available on tokens, but we intentionally keep behavior as a no-op
        until we decide which attrs become supported extensions.

        Future intent:
        - Register `runnable`, layout, sizing, etc.
        - Attach computed data to `env` for document-level asset injection.
        - Optionally modify token attrs for stable HTML output.
        """

        self._attr_handlers = {}

    def _register_attr(self, name: str, handler: _AttrHandler) -> None:
        """Register a single attribute handler.

        Handlers should be side-effect-only and keep output stable unless the
        project explicitly adopts that attribute as part of the SBS extensions.
        """

        self._attr_handlers[name] = handler

    def _apply_registered_attrs(self, token: Token, env: dict[str, Any]) -> None:
        """Apply registered attrs to a token.

        This is currently a no-op because no attrs are registered. It's a
        pre-wired hook so we can adopt attributes incrementally later.
        """

        if not self._attr_handlers:
            return

        for name, value in token.attrs or []:
            handler = self._attr_handlers.get(name)
            if handler is None:
                continue
            handler(token=token, env=env, name=name, value=value)

    def _register_fence(
        self,
        lang: str,
        *,
        widget: str,
        block_factory: Callable[[str], _HtmlBlock],
    ) -> None:
        def handler(token: Token, env: dict[str, Any]) -> str:
            self._note_widget_used(env, widget)
            block = block_factory(token.content)
            return wrap_sticky_if_needed(block.to_html(), env)

        self._fence_handlers[lang] = handler

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
            script_srcs.append(f"{self.widgets_dir}/index.js")

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

        self._apply_registered_attrs(token, env)

        handler = self._fence_handlers.get(fence_lang)
        if handler is not None:
            return handler(token, env)

        if self._default_fence:
            return self._default_fence(tokens, idx, options, env)

        return self._renderer.render_token(tokens, idx, options, env)

    def _note_widget_used(self, env: dict[str, Any], widget: str) -> None:
        env.setdefault("_sbs_used_widgets", set()).add(widget)

    # Sticky wrapping is handled by sticky.wrap_sticky_if_needed.
