"""Sticky container helpers."""

from __future__ import annotations

from typing import Any

from markdown_it import MarkdownIt
from markdown_it.token import Token
from mdit_py_plugins.container import container_plugin


def _stack(env: dict[str, Any]) -> list[dict[str, Any]]:
    return env.setdefault("_sbs_sticky_stack", [])


def render_sticky(renderer, tokens: list[Token], idx: int, _options, env) -> str:  # type: ignore[override]
    token = tokens[idx]
    stack = _stack(env)
    if token.nesting == 1:
        stack.append({"visual_done": False, "text_open": False})
        return "<div class='sbs-sticky-container'>\n"

    state = stack.pop() if stack else None
    closing = ""
    if state and state.get("text_open"):
        closing += "</div>\n"  # closes .sbs-text
    closing += "</div>\n"  # closes .sbs-analysis-block
    return closing


def use_sticky(md: MarkdownIt) -> None:
    """Register the ::: sbs-sticky container."""
    md.use(container_plugin, "sbs-sticky", render=render_sticky)
