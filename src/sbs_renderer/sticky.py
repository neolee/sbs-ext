"""Sticky container helpers."""

from __future__ import annotations

from typing import Any

from markdown_it import MarkdownIt
from markdown_it.token import Token
from mdit_py_plugins.container import container_plugin


def _stack(env: dict[str, Any]) -> list[dict[str, Any]]:
    return env.setdefault("_sbs_sticky_stack", [])


def wrap_sticky_if_needed(html_block: str, env: dict[str, Any]) -> str:
    """Wrap the first rendered block inside an active sticky container.

    The `sbs-sticky` container layout expects:
    - `.sbs-sticky-container` opened/closed by the container rule.
    - Exactly one `.sbs-sticky-figure` (the first visual block).
    - A `.sbs-sticky-body` that contains the remaining content.

    This helper keeps the minimal state needed to ensure the wrapping happens
    once per container.
    """

    stack = _stack(env)
    if not stack:
        return html_block

    state = stack[-1]
    if state.get("figure_rendered"):
        return html_block

    state["figure_rendered"] = True
    state["body_open"] = True
    return (
        "<div class='sbs-sticky-figure'>"
        f"{html_block}"
        "</div>\n<div class='sbs-sticky-body'>"
    )


def render_sticky(_, tokens: list[Token], idx: int, _options, env) -> str:
    token = tokens[idx]
    stack = _stack(env)
    if token.nesting == 1:
        stack.append({"figure_rendered": False, "body_open": False})
        return "<div class='sbs-sticky-container'>\n"

    state = stack.pop() if stack else None
    closing = ""
    if state and state.get("body_open"):
        closing += "</div>\n"  # closes .sbs-sticky-body
    closing += "</div>\n"  # closes .sbs-sticky-container
    return closing


def use_sticky(md: MarkdownIt) -> None:
    """Register the ::: sbs-sticky container."""
    md.use(container_plugin, "sbs-sticky", render=render_sticky)
