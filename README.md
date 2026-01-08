# Extensions for Smart Book Standard (SBS)

Smart Book Standard (SBS) is a Markdown-based [specification](sbs-1.1.md) for creating interactive, media-rich digital books. This repository provides the documentation and standard reference implementation for a set of SBS extensions. These extensions enable authors to create content with specialized widgets.

This README documents the specifications for supported extensions, their input formats, example usage, and technical notes.

## Extensions

### Chess

Display a chess board from a FEN string plus an optional PGN move history. The chess block can be configured to be interactive (allowing readers to play and move pieces) or rendered as a static diagram.

- `title` (string): Title displayed in the header (default: `"Chess Diagram"`).
- `fen` (string): standard FEN describing the board position.
- `pgn` (optional string): PGN text used to build the move list/timeline.
- `interactive` (bool): whether the renderer should allow piece movement and undo (default: `false`).
- `orientation` (string): `white` or `black` to set board orientation (default: `white`).
- `size` (string or number): preferred board size (e.g., `480`).
- `layout` (string): `full`, `standard`, `compact`, or `mini` to control visible sidebar panels (default: `full`).
- `lang` (string): UI language, `zh` or `en` (default: `zh`).
- `coords` (bool): whether to show board coordinates (default: `true`).

#### Usage Example

**1. Using the `---` separator (Recommended for long PGN):**

````markdown
```sbs-chess
title: "The Immortal Game"
interactive: true
---
[Event "The Immortal Game"]
...
1. e4 e5 2. f4 exf4 ...
```
````

**2. Using the `pgn` key in YAML:**

````markdown
```sbs-chess
title: "The Immortal Game"
interactive: true
pgn: |
  [Event "The Immortal Game"]
  ...
```
````

### Bridge

Display a Bridge hand/diagram. This extension targets static renderings (diagrams) only; interactive play is not supported.

- `pbn` or `data` (string): PBN text containing deal, auction, or play information.
- `lang` (string): UI language, `zh` or `en` (default: `zh`).
- `format` (string): data format, typically `pbn`.

#### Usage Example

The Bridge widget supports two equivalent ways to provide PBN data:

**1. Using the `---` separator (Recommended for long PBN):**

````markdown
```sbs-bridge
lang: "en"
---
[Event "Example"]
[Deal "N:AKQJ.T98.A87.654 ..."]
...
```
````

**2. Using the `pbn` key in YAML:**

````markdown
```sbs-bridge
lang: "en"
pbn: |
  [Event "Example"]
  ...
```
````

### Go

Display a Go board. Authors may provide SGF data for full game records.

- `sgf` (string): SGF content.
- `board` (number): Board size, typically `19`, `13`, or `9` (default: `19`).
- `interactive` (bool): whether to show playback controls (default: `false`).
- `move` or `initialMove` (number): move index to display initially (default: `-1`).
- `showMoveNumbers` (bool or number): whether to display move numbers on stones. If a number is provided, only shows the last N moves.
- `theme` (string): visual theme, e.g., `book` (default: `book`).
- `coords` (bool): whether to show coordinates (default: `true`).
- `size` (string or number): preferred display width (pixel).
- `lang` (string): UI language, `zh` or `en`.

#### Usage Example

The Go widget supports two equivalent ways to provide SGF data:

**1. Using the `---` separator (Recommended for long SGF):**

````markdown
```sbs-go
interactive: true
move: 3
showMoveNumbers: true
---
(;GM[1]FF[4]SZ[19];B[pd];W[dd];B[qp];W[dq])
```
````

**2. Using the `sgf` key in YAML:**

````markdown
```sbs-go
interactive: true
move: 3
sgf: "(;GM[1]FF[4]SZ[19];B[pd];W[dd];B[qp];W[dq])"
```
````

#### Technical Notes

- **Data Split**: All three widgets (`sbs-chess`, `sbs-bridge`, `sbs-go`) support using `---` to separate YAML configuration (above) from the raw game payload (below). Both styles are equivalent; the separator style is often cleaner for large game records.
- When SGF is provided, the widget offers step-through playback of moves if `interactive` is true.
- If no data is provided, an empty board is rendered.
- Markers like `LB` (labels), `TR` (triangles), `SQ` (squares), and `CR` (circles) in SGF are supported.

### Sticky Layout

A layout container that keeps content (usually a widget) sticky on the screen while scrolling through associated text. This is particularly useful for game analysis where the board should remain visible while reading the commentary.

#### Usage Example

````markdown
::: sbs-sticky
```sbs-bridge
...
```
Analysis text goes here...
:::
````

#### Technical Notes

- The container uses CSS sticky positioning.
- The first element inside the container (typically the widget) is made sticky.
- The subsequent content flows naturally alongside or below the sticky element depending on viewport width.

## Python Renderer

This repository ships a reference renderer (`sbs_renderer`) that converts SBS-flavored Markdown to standalone HTML. It is available as a CLI entry point once the project dependencies are installed (e.g., via `uv sync`).
- **source**: path to the Markdown file you want to render.
- **output**: destination HTML file.
- `--widgets-dir`: directory containing widget bundles (JS/CSS). Defaults to `./widgets`.
- `--theme`: visual theme name located under `widgets/themes/` (defaults to `default`).
You can also import `SBSRenderer` from `src/sbs_renderer/renderer.py` in your own Python tooling to render strings directly.

```shell
uv run python -m sbs_renderer tests/markdown/bridge-scenarios.md dist/bridge-scenarios.html --title "Bridge Catalog" --widgets-dir "./widgets" --theme "default"
uv run python -m sbs_renderer tests/markdown/bridge-sticky-layout.md dist/bridge-sticky-layout.html --title "Sticky Analysis" --widgets-dir "./widgets" --theme "classic"
```

## Implementation Notes

During the process of this project's progression, several implementation considerations are subject to change. The following notes are intended to guide implementers of above extensions:

- The project adopts the SBS syntax extension architecture introduced in the [SBS 1.1 spec](sbs-1.1.md):
  - **Widget Blocks**: Use fenced code blocks with language identifiers (e.g., ` ```sbs-chess``` `) to embed widget configuration/data.
  - **Layout Containers**: Use container syntax (e.g., `::: sbs-sticky`) for layout control.
  - **Attributes**: Use inline attributes (e.g., `{ runnable=true }`) for element modification.
- Widget implementation should:
  - validate required fields (e.g., FEN is valid);
  - better provide accessible fallbacks (e.g. static images) when interactivity is not available;
  - sanitize inputs before rendering (avoid executing arbitrary code);
  - provide configuration options for default board size, theme, and controls.

## License

This project is licensed under the MIT License. See the [LICENSE.txt](LICENSE.txt) file for details.

## Contact

For questions or clarifications, open an issue or contact the maintainers listed in the repository metadata.