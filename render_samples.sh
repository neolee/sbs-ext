#!/usr/bin/env bash
set -euo pipefail

cd src

uv run python -m sbs_renderer \
	../tests/markdown/bridge-demo.md \
	../dist/bridge-demo.html \
	--title "Bridge Catalog" \
	--widgets-dir "../widgets" \
	--theme "default"

uv run python -m sbs_renderer \
	../tests/markdown/bridge-sticky-layout.md \
	../dist/bridge-sticky-layout.html \
	--title "Bridge Sticky" \
	--widgets-dir "../widgets" \
	--theme "classic"

uv run python -m sbs_renderer \
	../tests/markdown/chess-demo.md \
	../dist/chess-demo.html \
	--title "Chess Catalog" \
	--widgets-dir "../widgets" \
	--theme "default"

uv run python -m sbs_renderer \
	../tests/markdown/chess-sticky-layout.md \
	../dist/chess-sticky-layout.html \
	--title "Chess Sticky" \
	--widgets-dir "../widgets" \
	--theme "classic"

cd ..