# Extensions for Smart Book Standard (SBS)

Smart Book Standard (SBS) is a Markdown-based [specification](sbs-1.1.md) for creating interactive, media-rich digital books. This repository provides the documentation and standard reference implementation for a set of SBS extensions. These extensions enable authors to create content with specialized widgets.

This README documents the specifications for supported extensions, their input formats, example usage, and technical notes.

## Extensions

### Chess

Display a chess board from a FEN string plus an optional PGN move history. The chess block can be configured to be interactive (allowing readers to play and move pieces) or rendered as a static diagram.

- `fen` (string): standard FEN describing the board position.
- `pgn` (optional string): PGN text used to build the move list/timeline.
- `interactive` (bool): whether the renderer should allow piece movement and undo (default: `false`).
- `orientation` (string): `white` or `black` to set board orientation (default: `white`).
- `size` (string or number): preferred board size (e.g., `400px`).
- `layout` (string): `full`, `compact`, `minimal`, or `board-only` to control visible sidebar panels (default: `full`).

#### Usage Example

````markdown
```sbs-chess
fen: "r1bqkbnr/pppppppp/2n5/8/8/2N5/PPPPPPPP/R1BQKBNR w KQkq - 0 1"
interactive: true
layout: full
orientation: white
size: 480px
```
````

#### Technical Notes

- If `interactive: true`, the widget should enforce legal moves and provide an undo/redo stack.
- If `interactive: false`, disable all interactivity and just render the static position.
- If `pgn` is provided, the widget may offer a step-through interface to navigate through the moves.
- If no data is provided, render an initial board.
- Default piece styles and board themes should be provided, more themes may be configurable.

### Bridge

Display a Bridge hand/diagram. This extension targets static renderings (diagrams) only; interactive play is not supported. A common interchange format is PBN.

- `format` (string): e.g., `pbn` when providing PBN data.
- `data` (string): PBN text.

#### Usage Example

````markdown
```sbs-bridge
format: "pbn"
data: |
  [Event "Example"]
  [Deal "N:AKQJ. ..."]
```
````

#### Technical Notes

- Widget should parse PBN string when provided and render a compact diagram.

### Go
Display a Go board. Authors may provide SGF data for full game records. Note that this widget is for display and playback only; interactive play is not supported.

- `format` (string): `sgf` when providing SGF data.
- `data` (string): SGF content.

#### Usage Example

````markdown
```sbs-go
format: "sgf"
data: |
  (;GM[1]FF[4]SZ[19];B[pd];W[dd];B[qp])
```
````

#### Technical Notes

- When SGF is provided, widget may offer step-through playback of moves (read-only).
- Interactive placement of stones by the user is not required.
- If no data is provided, render an empty board of default size.
- Default piece styles and board themes should be provided, more themes may be configurable.

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