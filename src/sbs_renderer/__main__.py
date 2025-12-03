from __future__ import annotations

import argparse
from pathlib import Path

from .renderer import SBSRenderer


def main() -> None:
    parser = argparse.ArgumentParser(description="Render SBS Markdown to HTML")
    parser.add_argument("source", type=Path, help="Markdown source file")
    parser.add_argument("output", type=Path, help="Destination HTML file")
    parser.add_argument(
        "--widgets-dir",
        default="./widgets",
        help="Directory containing SBS widget assets",
    )
    parser.add_argument(
        "--theme",
        default="default",
        help="Theme name located under widgets/themes",
    )
    parser.add_argument("--title", default="SBS Document", help="Document title")
    args = parser.parse_args()

    text = args.source.read_text(encoding="utf-8")
    renderer = SBSRenderer(widgets_dir=args.widgets_dir, theme=args.theme)
    html_doc = renderer.render_document(text, title=args.title)
    args.output.write_text(html_doc, encoding="utf-8")


if __name__ == "__main__":
    main()
