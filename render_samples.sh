#!/usr/bin/env bash
cd src
uv run python -m sbs_renderer ../tests/markdown/bridge-scenarios.md ../dist/bridge-scenarios.html --title "Bridge Catalog" --widgets-dir "../widgets" --theme "default"
uv run python -m sbs_renderer ../tests/markdown/bridge-sticky-layout.md ../dist/bridge-sticky-layout.html --title "Sticky Analysis" --widgets-dir "../widgets" --theme "classic"
cd ..