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

    def test_bridge_demo_renders_bridge_elements(self) -> None:
        text = load_markdown("bridge-demo.md")
        html = self.renderer.render(text)
        bridges = re.findall(r"<sbs-bridge", html)
        self.assertGreaterEqual(len(bridges), 7)

    def test_bridge_payload_preserves_literal_quotes(self) -> None:
        text = load_markdown("bridge-demo.md")
        html = self.renderer.render(text)
        self.assertIn('[Event "World Bridge Championship"]', html)

    def test_bridge_sticky_layout_wraps_content(self) -> None:
        text = load_markdown("bridge-sticky-layout.md")
        html = self.renderer.render(text)
        self.assertIn("sbs-sticky-container", html)
        self.assertIn("sbs-sticky-figure", html)
        self.assertIn("<sbs-bridge", html)

    def test_full_document_includes_assets(self) -> None:
        text = load_markdown("bridge-demo.md")
        doc = self.renderer.render_document(text, title="Bridge Catalog")
        self.assertIn("/widgets/sbs-ext.css", doc)
        self.assertIn("/widgets/themes/default.css", doc)
        self.assertIn("/widgets/index.js", doc)
        self.assertNotIn("/widgets/bridge/index.js", doc)
        self.assertNotIn("/widgets/chess/index.js", doc)
        self.assertIn("Bridge Catalog", doc)

    def test_document_includes_only_chess_script_when_needed(self) -> None:
        text = load_markdown("chess-demo.md")
        doc = self.renderer.render_document(text, title="Chess Catalog")
        self.assertIn("/widgets/index.js", doc)
        self.assertNotIn("/widgets/bridge/index.js", doc)
        self.assertNotIn("/widgets/chess/index.js", doc)

    def test_document_includes_no_widget_scripts_when_unused(self) -> None:
        text = load_markdown("plain.md")
        doc = self.renderer.render_document(text, title="Plain")
        self.assertNotIn("/widgets/index.js", doc)
        self.assertNotIn("/widgets/bridge/index.js", doc)
        self.assertNotIn("/widgets/chess/index.js", doc)

    def test_chess_demo_renders_chess_elements(self) -> None:
        text = load_markdown("chess-demo.md")
        html = self.renderer.render(text)
        widgets = re.findall(r"<sbs-chess", html)
        self.assertGreaterEqual(len(widgets), 7)

    def test_chess_sticky_uses_board_only_layout(self) -> None:
        text = load_markdown("chess-sticky-layout.md")
        html = self.renderer.render(text)
        self.assertIn("sbs-sticky-container", html)
        self.assertIn("<sbs-chess", html)
        self.assertIn("board-only", html)

    def test_image_attributes_apply_width_and_alignment(self) -> None:
        text = "![beautiful pic](https://images.com/pic.jpg){ align=center, width=300 }"
        html = self.renderer.render(text)
        self.assertIn("<img", html)
        self.assertIn("width: 300px", html)
        self.assertIn("margin-left: auto", html)
        self.assertIn("margin-right: auto", html)
        self.assertNotIn("align=", html)

    def test_image_scale_overrides_width_height(self) -> None:
        text = "![beautiful pic](https://images.com/pic.jpg){ scale=0.5, width=300, height=200 }"
        html = self.renderer.render(text)
        # Scale is applied at runtime; renderer emits a marker attribute.
        self.assertIn("data-sbs-scale=\"0.5\"", html)
        self.assertNotIn("width: 300px", html)
        self.assertNotIn("height: 200px", html)

    def test_image_attributes_fixture_marks_scaled_images(self) -> None:
        text = load_markdown("image-attrs.md")
        html = self.renderer.render(text)

        # Scale examples (applied by widgets/image-attrs.js at runtime).
        self.assertRegex(html, r"data-sbs-scale=\"0\.5\"")
        self.assertRegex(html, r"data-sbs-scale=\"1\.25\"")

        # Align examples.
        self.assertIn("margin-left: auto", html)  # center
        self.assertIn("margin-right: auto", html)  # center
        self.assertIn("margin-left: 0", html)  # left

        # Explicit width/height example.
        self.assertIn("width: 240px", html)
        self.assertIn("height: 160px", html)

        # Width-only example adds height:auto.
        self.assertIn("width: 220px", html)
        self.assertIn("height: auto", html)

        # Height-only example adds width:auto.
        self.assertIn("height: 180px", html)
        self.assertIn("width: auto", html)

        # Invalid values should not generate a scale marker.
        self.assertNotIn('data-sbs-scale="0"', html)
        self.assertNotIn('data-sbs-scale="abc"', html)

    def test_document_includes_image_scale_script_only_when_needed(self) -> None:
        doc_no_scale = self.renderer.render_document(
            "![x](https://example.com/x.jpg){ width=200 }",
            title="No scale",
        )
        self.assertNotIn("/widgets/image-attrs.js", doc_no_scale)

        doc_with_scale = self.renderer.render_document(
            "![x](https://example.com/x.jpg){ scale=0.5 }",
            title="With scale",
        )
        self.assertIn("/widgets/image-attrs.js", doc_with_scale)


if __name__ == "__main__":
    unittest.main()
