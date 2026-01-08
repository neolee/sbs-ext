"""Bridge widget block renderer."""

from __future__ import annotations

from dataclasses import dataclass, field
import html
from typing import Any, Dict

from .utils import escape_script_payload, parse_fence_config


_ATTR_MAP = {
    "layout": "layout",
}

_BOOL_ATTRS = set()


@dataclass
class BridgeBlock:
    """Represents a single `sbs-bridge` fenced block."""

    config: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_fence(cls, raw: str) -> "BridgeBlock":
        """Parse the fenced block body as YAML-like config."""
        # Handle explicit config/data split via '---'
        if "---" in raw:
            parts = raw.split("---", 1)
            config_part = parts[0].strip()
            pbn_part = parts[1].strip()

            import yaml
            # Try to parse the first part as YAML
            try:
                config = yaml.safe_load(config_part)
                if isinstance(config, dict):
                    # Prioritize 'pbn' as the key
                    config["pbn"] = pbn_part
                    return cls(config)
            except yaml.YAMLError:
                pass

        parsed = parse_fence_config(raw)
        if parsed is not None:
            return cls(parsed)
        # Fall back to treating the entire body as a PBN payload.
        return cls({"pbn": raw})

    def to_html(self) -> str:
        """Serialize to the <sbs-bridge> custom element."""
        # Support 'pbn' and 'data' keys for the payload, prioritizing 'pbn'
        pbn_payload = (
            self.config.get("pbn") or 
            self.config.get("data") or 
            ""
        ).strip()
        if not pbn_payload:
            return "<sbs-bridge></sbs-bridge>"

        lang = (self.config.get("lang") or "zh").strip()
        data_format = (self.config.get("format") or "pbn").strip()

        # Build list of attributes.
        attr_pairs = [
            ("lang", lang),
            ("data-format", data_format),
        ]

        # Apply standardized mappings.
        for key, value in self.config.items():
            if key in _ATTR_MAP:
                attr_name = _ATTR_MAP[key]
                if attr_name in _BOOL_ATTRS:
                    value = "true" if value else "false"
                attr_pairs.append((attr_name, str(value)))

        # Serialize remaining custom attributes as data-* for future use.
        for key, value in self.config.items():
            if key in {"lang", "format", "data", "pbn"} or key in _ATTR_MAP:
                continue
            attr_pairs.append((f"data-{key}", str(value)))

        attr_html = " ".join(
            f"{name}='{html.escape(str(value), quote=True)}'" for name, value in attr_pairs
        ).strip()

        # Preserve raw PBN text so the web component receives literal quotes and
        # suit symbols. Escape only the closing script tag sentinel.
        script = escape_script_payload(pbn_payload)
        return (
            f"<sbs-bridge {attr_html}>"
            f"<script type='application/pbn'>{script}</script>"
            "</sbs-bridge>"
        )
