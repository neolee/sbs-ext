"""Go widget block renderer."""

from __future__ import annotations

from dataclasses import dataclass, field
import html
from typing import Any, Dict

import yaml

from .utils import escape_script_payload, parse_fence_config


_ATTR_MAP = {
    "theme": "theme",
    "lang": "lang",
    "size": "size",
}
_BOOL_ATTRS = {
    "interactive": "interactive",
    "coords": "coords",
}
_NUM_ATTRS = {
    "board": "board",
    "initialMove": "initial-move",
    "move": "initial-move",
}
_OTHER_ATTRS = {
    "showMoveNumbers": "show-move-numbers",
}


@dataclass
class GoBlock:
    """Represents a single `sbs-go` fenced block."""

    config: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_fence(cls, raw: str) -> "GoBlock":
        # Handle explicit config/data split via '---'
        if "---" in raw:
            parts = raw.split("---", 1)
            config_part = parts[0].strip()
            sgf_part = parts[1].strip()
            
            # Try to parse the first part as YAML
            try:
                config = yaml.safe_load(config_part)
                if config is None:
                    config = {}
                if isinstance(config, dict):
                    config["sgf"] = sgf_part
                    return cls(config)
            except yaml.YAMLError:
                pass

        parsed = parse_fence_config(raw)
        if parsed is not None:
            return cls(parsed)

        # No configuration found and no explicit SGF separator.
        return cls({})

    def to_html(self) -> str:
        config = self.config or {}
        attrs: list[tuple[str, str]] = []

        def add_attr(name: str, value: Any) -> None:
            if value is None:
                return
            if isinstance(value, bool):
                # Special case for 'coords' which expects "false" string to disable
                if name == "coords":
                    if not value:
                        attrs.append((name, "false"))
                elif value:
                    attrs.append((name, ""))
            else:
                attrs.append((name, str(value)))

        for key, attr in _ATTR_MAP.items():
            add_attr(attr, config.get(key))

        for key, attr in _BOOL_ATTRS.items():
            add_attr(attr, config.get(key))

        for key, attr in _NUM_ATTRS.items():
            add_attr(attr, config.get(key))

        for key, attr in _OTHER_ATTRS.items():
            add_attr(attr, config.get(key))

        attr_str = " ".join(
            f'{name}="{html.escape(val)}"' if val else name for name, val in attrs
        )
        if attr_str:
            attr_str = " " + attr_str

        sgf = config.get("sgf", "")
        return f"<sbs-go{attr_str}><script type=\"text/sgf\">{escape_script_payload(sgf)}</script></sbs-go>"
