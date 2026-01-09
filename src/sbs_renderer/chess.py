"""Chess widget block renderer."""

from __future__ import annotations

from dataclasses import dataclass, field
import html
from typing import Any, Dict

from .utils import escape_script_payload, parse_fence_config


_ATTR_MAP = {
    "title": "title",
    "fen": "fen",
    "layout": "layout",
    "orientation": "orientation",
    "lang": "lang",
}
_BOOL_ATTRS = {
    "interactive": "interactive",
    "coords": "coords",
}
_NUM_ATTRS = {
    "size": "size",
}


@dataclass
class ChessBlock:
    """Represents a single `sbs-chess` fenced block."""

    config: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_fence(cls, raw: str) -> "ChessBlock":
        # Handle explicit config/data split via '---'
        if "---" in raw:
            parts = raw.split("---", 1)
            config_part = parts[0].strip()
            pgn_part = parts[1].strip()

            import yaml
            # Try to parse the first part as YAML
            try:
                config = yaml.safe_load(config_part)
                if isinstance(config, dict):
                    # Prioritize 'pgn' as the key for consistency
                    config["pgn"] = pgn_part
                    return cls(config)
            except yaml.YAMLError:
                pass

        parsed = parse_fence_config(raw)
        if parsed is not None:
            return cls(parsed)

        # No configuration found and no explicit PGN separator.
        # We return an empty block to avoid unwanted PGN parsing errors.
        return cls({})

    def to_html(self) -> str:
        config = self.config or {}
        attrs: list[tuple[str, str]] = []

        def add_attr(name: str, value: Any) -> None:
            if value is None:
                return
            if isinstance(value, bool):
                rendered = "true" if value else "false"
            else:
                rendered = str(value)
            attrs.append((name, rendered))

        # Scalar attributes
        for key, attr_name in _ATTR_MAP.items():
            value = config.get(key)
            if value is None:
                continue
            add_attr(attr_name, value)

        # Boolean attributes
        for key, attr_name in _BOOL_ATTRS.items():
            if key in config:
                add_attr(attr_name, config.get(key))

        # Numeric attributes
        for key, attr_name in _NUM_ATTRS.items():
            if key in config:
                add_attr(attr_name, config.get(key))

        # Default language so the widget matches bridge behavior.
        if not any(name == "lang" for name, _ in attrs):
            add_attr("lang", config.get("lang") or "zh")

        # Additional custom attributes become data-* for future use.
        for key, value in config.items():
            if key in _ATTR_MAP or key in _BOOL_ATTRS or key in _NUM_ATTRS or key in {"pgn", "data"}:
                continue
            add_attr(f"data-{key}", value)

        attr_html = " ".join(
            f"{name}='{html.escape(value, quote=True)}'" for name, value in attrs
        ).strip()

        pgn_payload = str(config.get("pgn") or config.get("data") or "").strip()
        script_html = ""
        if pgn_payload:
            escaped = escape_script_payload(pgn_payload)
            script_html = (
                "<script type='application/x-chess-pgn'>"
                f"{escaped}"
                "</script>"
            )

        tag_open = "<sbs-chess" + (" " + attr_html if attr_html else "") + ">"
        return f"{tag_open}{script_html}</sbs-chess>"
