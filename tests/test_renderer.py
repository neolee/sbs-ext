from __future__ import annotations

import re
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
sys.path.insert(0, str(SRC))

from sbs_renderer.renderer import SBSRenderer

TESTS_ROOT = Path(__file__).resolve().parent
MARKDOWN_DIR = TESTS_ROOT / "markdown"


def load_markdown(filename: str) -> str:
    return (MARKDOWN_DIR / filename).read_text(encoding="utf-8")


class TestSBSRenderer(unittest.TestCase):
    def setUp(self) -> None:
        self.renderer = SBSRenderer(widgets_dir="/widgets", theme="default")

    def test_bridge_scenarios_render_bridge_elements(self) -> None:
        text = load_markdown("bridge-scenarios.md")
        html = self.renderer.render(text)
        bridges = re.findall(r"<sbs-bridge", html)
        self.assertGreaterEqual(len(bridges), 7)

    def test_bridge_payload_preserves_literal_quotes(self) -> None:
        text = load_markdown("bridge-scenarios.md")
        html = self.renderer.render(text)
        self.assertIn('[Event "World Bridge Championship"]', html)

    def test_sticky_layout_wraps_content(self) -> None:
        text = load_markdown("bridge-sticky-layout.md")
        html = self.renderer.render(text)
        self.assertIn("sbs-sticky-container", html)
        self.assertIn("sbs-sticky-figure", html)
        self.assertIn("<sbs-bridge", html)

    def test_full_document_includes_assets(self) -> None:
        text = load_markdown("bridge-scenarios.md")
        doc = self.renderer.render_document(text, title="Bridge Catalog")
        self.assertIn("/widgets/sbs-ext.css", doc)
        self.assertIn("/widgets/themes/default.css", doc)
        self.assertIn("/widgets/bridge/index.js", doc)
        self.assertIn("Bridge Catalog", doc)


if __name__ == "__main__":
    unittest.main()
