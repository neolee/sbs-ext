"""Shared helpers for renderer widget blocks."""

from __future__ import annotations

from typing import Any, Dict, Optional

import yaml


def parse_fence_config(raw: str) -> Optional[Dict[str, Any]]:
    """Attempt to parse fenced block contents as YAML.

    Returns a dict (possibly empty) when the payload decodes to mappings,
    or ``None`` when the block should be treated as a raw data payload.
    """

    text = (raw or "").strip()
    if not text:
        return {}

    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError:
        return None

    if isinstance(data, dict):
        return data
    return None


def escape_script_payload(payload: str) -> str:
    """Prevent ``</script>`` sequences from terminating inline script tags."""

    return (payload or "").replace("</script>", "</scr' 'ipt>")
