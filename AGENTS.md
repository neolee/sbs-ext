# AI Agent Context: sbs-ext

This document serves as a persistent context file for AI agents working on the `sbs-ext` project. It outlines project goals, design decisions, current status, and protocols. **Update this file after every major milestone.**

## 1. Project Overview
`sbs-ext` provides the **documentation** and **standard reference implementation** for a set of extensions to the Smart Book Standard (SBS). SBS is a Markdown-based specification for creating interactive, media-rich digital books.

## 2. Workflow Protocol
- **Strategy**: **Specification First**.
- **Process**:
  1. Discuss and confirm requirements/specifications with the user.
  2. Once specs are confirmed, proceed to the implementation of software modules.
- **Role**: The AI agent acts as a co-developer, ensuring requirements are clear before writing code.

## 3. Key Design Decisions & Specifications

### General Architecture
- **Language**: Python (>= 3.11) for the reference implementation/tooling.
- **Markdown Parser**: `markdown-it-py` (Primary target).
- **Frontend Technology**: **Web Components (Custom Elements)**.
- **Syntax**: Extensions use **SBS 1.1 Syntax**: Fenced Code Blocks (` ```sbs-xxx `), Containers (`::: sbs-xxx`), and Attributes (`{ key=value }`).

### Directory Structure
- `src/`: Python source code for Markdown renderer extensions.
- `widgets/`: Source code for Web Components.
- `prototype/`: Static HTML/JS prototypes for widget research and validation.

### Extension Modules

#### A. Chess
- **Goal**: Full interactive support.
- **Input**: FEN string (position) + PGN move history.
- **Capabilities**:
  - **Static**: Render board state.
  - **Interactive**: Allow users to move pieces, validate legal moves, and support Undo/Redo.
- **Configuration**: `interactive: true/false`, `orientation`, `size`, `layout` presets.

#### B. Bridge
- **Goal**: Static display only.
- **Input**: PBN (Portable Bridge Notation).
- **Capabilities**:
  - **Static**: Render hand/deal diagrams.
  - **Interactive**: **None** (Explicitly out of scope).

#### C. Go (Weiqi)
- **Goal**: Display and Playback.
- **Input**: SGF (Smart Game Format).
- **Capabilities**:
  - **Static**: Render board state.
  - **Playback**: Step-through moves from SGF records (Read-only).
  - **Interactive**: **None** (User placement of stones is explicitly out of scope).

#### D. Sticky Layout
- **Goal**: Side-by-side view for analysis.
- **Syntax**: `::: sbs-sticky`.
- **Capabilities**:
  - **Layout**: Sticky positioning for the first child element.

## 4. Project Status
- **Date**: December 23, 2025
- **Phase**: **Implementation**
- **Current State**:
  - Repository initialized; `README.md` and `sbs-1.1.md` upgraded to **SBS 1.1**.
  - Bridge web component packaged under `widgets/bridge/` with sticky layout hooks and inline PBN parser, matching prototype behavior.
  - Python renderer (`sbs_renderer`) renders SBS Markdown via `markdown-it-py`, supports `sbs-bridge`, `sbs-chess`, `sbs-go`, and `sbs-sticky`.
  - Theme system shipped (`widgets/sbs-ext.css` plus `widgets/themes/{default,classic}.css`) with CLI `--theme` flag; layout CSS removed from Python bundle.
  - Sample rendering script (`render_samples.sh`) regenerates default/classic outputs in `dist/` for all widgets.
  - Chess prototype now enforces FEN+PGN truth, PGN-powered demos, and shared layout presets across widget variants.
  - Go widget promoted to `widgets/go/` with `<sbs-go>` custom element and full SGF support.
  - Renderer supports `sbs-go` fenced blocks with YAML configuration and SGF payloads.
  - Sticky layout verified with Bridge, Chess, and Go widgets.
- **Immediate Next Steps**:
  - Expand automated tests/fixtures covering widgets (especially chess/go), themes, and CLI variants.
  - Provide guidance + tooling for author-defined themes/typography overrides.

## 5. Technical Context
- **Dependencies**: `markdown-it-py` (Python), Standard Web APIs (JS).
- **Plugins**: `mdit-py-plugins` (specifically `attrs`, `container`).
- **Testing**: All implementations must include unit tests.

## 6. Operational Notes
- Normally `.md` files are tracked as VS Code Notebooks. Writing to them via plain text editors overwrites the JSON notebook structure with `cells: []`, effectively blanking the file. Always edit via the Notebook UI or the `edit_notebook_file` tool to preserve structure.

### 2025-12-04 Update
- Prototype chess playground now ships a chess.js-powered controller with click-to-move, legal-move surfacing, undo/redo, promotion dialog, capture tally, and bilingual status copy.
- Added two interactive demos (sandbox + Immortal Game trainer) alongside the earlier static showcases to validate responsive sizing, language toggle, and shared controls.
- Completed FEN+PGN-only data model; canonical PGN now feeds demos and layout presets replace bespoke control toggles.
- Removed legacy timeline helpers (`createTimelineStates`, `normalizeMoves`) to keep the prototype renderer in lockstep with the upcoming widget bundle.

### 2025-12-05 Update
- ECO lookup builder (`prototype/chess/scripts/build-eco-table.mjs`) now ingests `data/eco-zh.json` to emit bilingual (en/zh) labels for every ECO code.
- Prototype chess logic and widget consume localized ECO labels so the timeline status panel mirrors the active language.
- Generated both JSON + JS ECO artifacts to stay browser-import safe while serving the localization data.

### 2025-12-08 Update
- Promoted the chess prototype into `widgets/chess/` with a reusable `<sbs-chess>` custom element plus parity demo page.
- Added chess Markdown fixtures (`chess-demo.md`, `chess-sticky-layout.md`) alongside renamed bridge counterparts to keep renderer samples aligned.
- Extended `sbs_renderer` to emit `<sbs-chess>` fences, load the new widget bundle + sticky CSS, and refreshed `render_samples.sh` to produce bridge/chess HTML in `dist/`.
- Chess widget now derives axis visibility from a single helper so board-only + sticky layouts stay perfectly centered regardless of host CSS.
- Renderer blocks share a new `parse_fence_config` + `escape_script_payload` utility, keeping bridge/chess modules smaller and preventing future duplication.
- Sticky chess markdown received much longer narration to showcase the anchored board experience in docs and regenerated demo HTML via `render_samples.sh`.

### 2025-12-10 Update (Chess & Bridge)
- Chess widget now parses PGN tag pairs to surface event/site/date/scoring metadata alongside the board, and renderer demos were refreshed so this information is visible in `chess-demo.md`.
- Bridge widget received a full layout pass: hand panels auto-resize symmetrically, optional sides collapse cleanly, bidding width stays within the widget, and the opening lead now anchors to the left column with mode-aware positioning.

### 2025-12-12 Update (Themes in Shadow DOM)
- Bridge + Chess web components now map `font-family` and core text/muted colors to the global `--sbs-*` theme variables so theme choices apply inside Shadow DOM.
- Reduced hard-coded widget styling by deriving borders/shadows/background tints from theme-driven colors (keeping game-specific palettes like chessboard squares intact).

### 2025-12-12 Update (Widgets Entry Script)
+- Added a single `widgets/index.js` entry module that dynamically imports the bridge/chess widget bundles based on which custom elements are present on the page.
+- Updated the Python renderer to inject only this entry script when any SBS widget is used, keeping documents without widgets free of extra JS.

### 2025-12-13 Update (Renderer Fence Registry - Generic Registration)
- Fence handlers are now registered via a small helper (`_register_fence`) that wires together: widget usage tracking, block parsing, HTML serialization, and sticky wrapping.
- Adding a new `sbs-*` fenced block no longer requires a bespoke handler method—just a single registry entry.

### 2025-12-13 Update (Renderer Attributes Registry - Scaffold)
- Added a no-op attribute handler registry in the renderer (modeled after `_register_fence`) so we can adopt SBS 1.1 `{ key=value }` attributes incrementally later.
- The hook is wired into fence rendering but defaults to no behavior changes until specific attributes are registered.

### 2025-12-13 Update (Sticky State Machine Simplification)
- Sticky wrapping logic is now centralized in `sticky.wrap_sticky_if_needed`, so the renderer no longer manages per-container sticky flags.
- Container open/close now matches the CSS contract (`.sbs-sticky-container` + optional `.sbs-sticky-body`), fixing previously mismatched closing comments and reducing state to two booleans.

### 2025-12-13 Update (Bridge Widget DOM Construction)
- Refactored `BridgeWidget` to build its UI using DOM APIs (`createElement`, `DocumentFragment`, `replaceChildren`) instead of `innerHTML`, keeping the same CSS class hooks and layout.
- This reduces HTML string concatenation and makes future layout changes safer and easier to maintain.

### 2025-12-13 Update (Image Attributes - First Adoption)
- Implemented the first real SBS 1.1 attribute extension: image display attributes `{ align=..., scale=..., width=..., height=... }`.
- Renderer now normalizes comma-separated attribute syntax (per spec examples) into the underlying parser format and applies the attributes as computed inline styles on `<img>`.
- Image `scale` now uses a browser runtime helper (`widgets/image-attrs.js`) so scaling is strictly relative to `naturalWidth/naturalHeight` for both local and remote images.
- Renderer emits `data-sbs-scale` on `<img>` when `{ scale=... }` is present and injects `widgets/image-attrs.js` only when needed.

### 2025-12-23 Update (Go Widget Integration)
- Promoted Go prototype to `widgets/go/` with `<sbs-go>` custom element.
- Integrated Go widget into `sbs_renderer` with support for `sbs-go` fenced blocks.
- Updated `widgets/index.js` for dynamic loading of the Go module.
- Verified rendering with `go-demo.md` and `go-sticky-layout.md`.
