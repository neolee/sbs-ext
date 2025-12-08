"""Bridge widget block renderer."""

from __future__ import annotations

from dataclasses import dataclass, field
import html
from typing import Any, Dict

from .utils import escape_script_payload, parse_fence_config


@dataclass
class BridgeBlock:
    """Represents a single `sbs-bridge` fenced block."""

    config: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_fence(cls, raw: str) -> "BridgeBlock":
        """Parse the fenced block body as YAML-like config."""
        parsed = parse_fence_config(raw)
        if parsed is not None:
            return cls(parsed)
        # Fall back to treating the entire body as a PBN payload.
        return cls({"data": raw})

    def to_html(self) -> str:
        """Serialize to the <sbs-bridge> custom element."""
        pbn_payload = (self.config.get("data") or "").strip()
        if not pbn_payload:
            return "<sbs-bridge></sbs-bridge>"

        lang = (self.config.get("lang") or "zh").strip()
        data_format = (self.config.get("format") or "pbn").strip()

        attr_pairs = [
            ("lang", lang),
            ("data-format", data_format),
        ]
        # Serialize remaining custom attributes as data-* for future use.
        for key, value in self.config.items():
            if key in {"lang", "format", "data"}:
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
