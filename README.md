# Extensions for Smart Book Standard (SBS)

Smart Book Standard (SBS) is a Markdown-based [specification](sbs-1.0.md) for creating interactive, media-rich digital books. This repository provides the documentation and standard reference implementation for a set of SBS extensions. These extensions enable authors to create content with specialized widgets.

This README documents the specifications for supported extensions, their input formats, example usage, and technical notes.

## Chess

Display a chess board from a FEN string or a simple move list. The chess block can be configured to be interactive (allowing readers to play and move pieces) or rendered as a static diagram.

- `fen` (string): standard FEN describing the board position.
- `moves` (optional array or SAN string): optional move list to display an annotated game.
- `interactive` (bool): whether the renderer should allow piece movement and undo (default: `false`).
- `orientation` (string): `white` or `black` to set board orientation (default: `white`).
- `size` (string or number): preferred board size (e.g., `400px`).

**Usage example**

````markdown
<!-- sbs-chess -->
```yaml
fen: "r1bqkbnr/pppppppp/2n5/8/8/2N5/PPPPPPPP/R1BQKBNR w KQkq - 0 1"
interactive: true
showControls: true
orientation: white
size: 480px
```
````

**Technical notes**

- If `interactive: true`, the widget should enforce legal moves and provide an undo/redo stack.
- If `interactive: false`, disable all interactivity and just render the static position.
- If `moves` is provided, the widget may offer a step-through interface to navigate through the moves.
- If no data is provided, render an initial board.
- Default piece styles and board themes should be provided, more themes may be configurable.

### Bridge

Display a Bridge hand/diagram. This extension targets static renderings (diagrams) only; interactive play is not supported. A common interchange format is PBN.

- `format` (string): e.g., `pbn` when providing PBN data.
- `data` (string): PBN text.

**Usage example**

````markdown
<!-- sbs-bridge -->
```yaml
format: "pbn"
data: |
  [Event "Example"]
  [Deal "N:AKQJ. ..."]
```
````

**Technical notes**

- Widget should parse PBN string when provided and render a compact diagram.

### Go

Display a Go board. Authors may provide SGF data for full game records. Note that this widget is for display and playback only; interactive play is not supported.

- `format` (string): `sgf` when providing SGF data.
- `data` (string): SGF content.

**Usage example**

````markdown
<!-- sbs-go -->
```yaml
format: "sgf"
data: |
  (;GM[1]FF[4]SZ[19];B[pd];W[dd];B[qp])
```
````

**Technical notes**

- When SGF is provided, widget may offer step-through playback of moves (read-only).
- Interactive placement of stones by the user is not required.
- If no data is provided, render an empty board of default size.
- Default piece styles and board themes should be provided, more themes may be configurable.

## Implementation notes

During the process of this project's progression, several implementation considerations are subject to change. The following notes are intended to guide implementers of above extensions:

- The syntax uses HTML comments (e.g., `<!-- sbs-chess -->`) to tag the following code block, which contains the configuration/data (usually in YAML). This aligns with the SBS 1.0 specification for custom tags.
- Widget implementation should:
  - validate required fields (e.g., FEN is valid);
  - better provide accessible fallbacks (e.g. static images) when interactivity is not available;
  - sanitize inputs before rendering (avoid executing arbitrary code);
  - provide configuration options for default board size, theme, and controls.

## License

This project is licensed under the MIT License. See the [LICENSE.txt](LICENSE.txt) file for details.

## Contact

For questions or clarifications, open an issue or contact the maintainers listed in the repository metadata.