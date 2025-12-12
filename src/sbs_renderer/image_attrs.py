"""SBS 1.1 image display attributes.

Implements the spec-level attributes used to control image display:

- align: left|center|right
- scale: float > 0, relative to the intrinsic image size
- width/height: pixel integers

Notes
-----
`mdit_py_plugins.attrs` does not parse comma-separated attrs and also does not
accept bare float values like `0.5`. SBS examples use commas and floats, so we
normalize the source Markdown before it reaches the parser.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Mapping

from markdown_it.token import Token


_IMAGE_META_KEY = "_sbs_image_display"


@dataclass(frozen=True)
class ImageDisplayAttrs:
    align: str | None = None
    scale: float | None = None
    width: int | None = None
    height: int | None = None


def normalize_image_attribute_syntax(text: str) -> str:
    """Normalize SBS 1.1 image attribute syntax to what attrs_plugin accepts.

    - Converts commas to spaces inside `{ ... }` blocks that immediately follow
      an image.
    - Wraps bare floats in double quotes so attrs_plugin treats them as values.

    We keep this scoped to image lines to avoid surprising other attribute uses.
    """

    if not text or "," not in text and "." not in text:
        return text

    in_fence = False
    fence_re = re.compile(r"^\s*```")
    img_attrs_re = re.compile(r"(!\[[^\]]*\]\([^\)]*\))\s*\{([^}]*)\}")

    out_lines: list[str] = []
    for line in (text or "").splitlines(keepends=True):
        if fence_re.match(line):
            in_fence = not in_fence
            out_lines.append(line)
            continue

        if in_fence:
            out_lines.append(line)
            continue

        def repl(match: re.Match[str]) -> str:
            prefix = match.group(1)
            attrs = match.group(2)
            normalized = attrs.replace(",", " ")
            # Quote bare floats (e.g. scale=0.5) so attrs_plugin parses them.
            normalized = re.sub(
                r"(\b[\w-]+\s*=\s*)(\d+\.\d+)\b",
                lambda m: f"{m.group(1)}\"{m.group(2)}\"",
                normalized,
            )
            return f"{prefix}{{{normalized}}}"

        out_lines.append(img_attrs_re.sub(repl, line))

    return "".join(out_lines)


def capture_image_display_attr(
    *,
    token: Token,
    env: dict[str, Any],
    name: str,
    value: str | None,
) -> None:
    """Store an image display attribute on the token meta.

    This is intended to be used as an attrs registry handler.
    """

    if token.type != "image":
        return

    if name == "scale":
        env["_sbs_used_image_scale"] = True

    meta = token.meta or {}
    raw = meta.get(_IMAGE_META_KEY)
    img_meta: dict[str, Any] = raw if isinstance(raw, dict) else {}
    img_meta[name] = value
    meta[_IMAGE_META_KEY] = img_meta
    token.meta = meta


def apply_image_display_attrs(
    token: Token,
) -> None:
    """Apply captured image display attrs to the image token.

    Mutates token.attrs (dict) by appending a computed `style` string.
    """

    meta = token.meta or {}
    raw = meta.get(_IMAGE_META_KEY)
    if not isinstance(raw, Mapping):
        return

    attrs = _parse_attrs(raw)
    if attrs is None:
        return

    if not isinstance(token.attrs, dict):
        return

    style_parts: list[str] = []
    existing_style = token.attrs.get("style")
    if existing_style and str(existing_style).strip():
        style_parts.append(str(existing_style).strip().rstrip(";"))

    _apply_align_style(style_parts, attrs.align)

    if attrs.scale is not None and attrs.scale > 0:
        # Scale is applied at runtime (browser) so it can use naturalWidth/Height
        # for both local and remote images.
        token.attrs["data-sbs-scale"] = f"{attrs.scale:g}"
    else:
        _apply_width_height_style(style_parts, attrs.width, attrs.height)

    if style_parts:
        token.attrs["style"] = "; ".join(style_parts) + ";"

    # Drop extension attrs from the serialized HTML.
    for key in ("align", "scale", "width", "height"):
        token.attrs.pop(key, None)


def _parse_attrs(raw: Mapping[str, Any]) -> ImageDisplayAttrs | None:
    def norm(value: Any) -> str:
        return str(value).strip()

    align = norm(raw.get("align")) if raw.get("align") is not None else None

    scale = None
    if raw.get("scale") is not None:
        try:
            scale = float(norm(raw.get("scale")))
        except ValueError:
            scale = None

    width = None
    if raw.get("width") is not None:
        try:
            width = int(float(norm(raw.get("width"))))
        except ValueError:
            width = None
        if width is not None and width <= 0:
            width = None

    height = None
    if raw.get("height") is not None:
        try:
            height = int(float(norm(raw.get("height"))))
        except ValueError:
            height = None
        if height is not None and height <= 0:
            height = None

    return ImageDisplayAttrs(align=align, scale=scale, width=width, height=height)


def _apply_align_style(style_parts: list[str], align: str | None) -> None:
    if not align:
        return

    align_key = align.lower()
    if align_key not in {"left", "center", "right"}:
        return

    style_parts.append("display: block")
    if align_key == "left":
        style_parts.append("margin-left: 0")
        style_parts.append("margin-right: auto")
    elif align_key == "right":
        style_parts.append("margin-left: auto")
        style_parts.append("margin-right: 0")
    else:
        style_parts.append("margin-left: auto")
        style_parts.append("margin-right: auto")


def _apply_width_height_style(
    style_parts: list[str],
    width: int | None,
    height: int | None,
) -> None:
    if width is not None:
        style_parts.append(f"width: {width}px")
        if height is None:
            style_parts.append("height: auto")
    if height is not None:
        style_parts.append(f"height: {height}px")
        if width is None:
            style_parts.append("width: auto")

