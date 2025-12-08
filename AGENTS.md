# AI Agent Context: sbs-ext

This document serves as a persistent context file for AI agents working on the `sbs-ext` project. It outlines project goals, design decisions, current status, and protocols. **Update this file after every major milestone.**

## 1. Project Overview
`sbs-ext` provides the **documentation** and **standard reference implementation** for a set of extensions to the Smart Book Standard (SBS). SBS is a Markdown-based specification for creating interactive, media-rich digital books.

## 2. Workflow Protocol
*   **Strategy**: **Specification First**.
*   **Process**:
    1.  Discuss and confirm requirements/specifications with the user.
    2.  Once specs are confirmed, proceed to the implementation of software modules.
*   **Role**: The AI agent acts as a co-developer, ensuring requirements are clear before writing code.

## 3. Key Design Decisions & Specifications

### General Architecture
*   **Language**: Python (>= 3.11) for the reference implementation/tooling.
*   **Markdown Parser**: `markdown-it-py` (Primary target).
*   **Frontend Technology**: **Web Components (Custom Elements)**.
*   **Syntax**: Extensions use **SBS 1.1 Syntax**: Fenced Code Blocks (` ```sbs-xxx``` `), Containers (`::: sbs-xxx`), and Attributes (`{ key=value }`).

### Directory Structure
*   `src/`: Python source code for Markdown renderer extensions.
*   `widgets/`: Source code for Web Components.
*   `prototype/`: Static HTML/JS prototypes for widget research and validation.

### Extension Modules

#### A. Chess
*   **Goal**: Full interactive support.
*   **Input**: FEN string (position) + PGN move history.
*   **Capabilities**:
    *   **Static**: Render board state.
    *   **Interactive**: Allow users to move pieces, validate legal moves, and support Undo/Redo.
*   **Configuration**: `interactive: true/false`, `orientation`, `size`, `layout` presets.

#### B. Bridge
*   **Goal**: Static display only.
*   **Input**: PBN (Portable Bridge Notation).
*   **Capabilities**:
    *   **Static**: Render hand/deal diagrams.
    *   **Interactive**: **None** (Explicitly out of scope).

#### C. Go (Weiqi)
*   **Goal**: Display and Playback.
*   **Input**: SGF (Smart Game Format).
*   **Capabilities**:
    *   **Static**: Render board state.
    *   **Playback**: Step-through moves from SGF records (Read-only).
    *   **Interactive**: **None** (User placement of stones is explicitly out of scope).

#### D. Sticky Layout
*   **Goal**: Side-by-side view for analysis.
*   **Syntax**: `::: sbs-sticky`.
*   **Capabilities**:
    *   **Layout**: Sticky positioning for the first child element.

## 4. Project Status
*   **Date**: December 4, 2025
*   **Phase**: **Implementation**
*   **Current State**:
    *   Repository initialized; `README.md` and `sbs-1.1.md` upgraded to **SBS 1.1**.
    *   Bridge web component packaged under `widgets/bridge/` with sticky layout hooks and inline PBN parser, matching prototype behavior.
    *   Python renderer (`sbs_renderer`) renders SBS Markdown via `markdown-it-py`, supports `sbs-bridge` + `sbs-sticky`, and exposes a tested CLI entry point.
    *   Theme system shipped (`widgets/sbs-ext.css` plus `widgets/themes/{default,classic}.css`) with CLI `--theme` flag; layout CSS removed from Python bundle.
    *   Sample rendering script (`render_samples.sh`) regenerates default/classic outputs in `dist/` and documents CLI usage.
    *   Chess prototype now enforces FEN+PGN truth, PGN-powered demos, and shared layout presets across widget variants.
    *   Legacy timeline helpers removed from `prototype/chess/chess-renderer.js`, keeping the prototype renderer aligned with the upcoming widgets bundle.
*   **Immediate Next Steps**:
    *   Promote the chess widget into the shared `widgets/` bundle + renderer plugin using the finalized FEN/PGN contract.
    *   Provide guidance + tooling for author-defined themes/typography overrides.
    *   Expand automated tests/fixtures covering widgets (especially chess/go), themes, and CLI variants.

## 5. Technical Context
*   **Dependencies**: `markdown-it-py` (Python), Standard Web APIs (JS).
*   **Plugins**: `mdit-py-plugins` (specifically `attrs`, `container`).
*   **Testing**: All implementations must include unit tests.

## 6. Operational Notes
- Normally `.md` files are tracked as VS Code Notebooks. Writing to them via plain text editors overwrites the JSON notebook structure with `cells: []`, effectively blanking the file. Always edit via the Notebook UI or the `edit_notebook_file` tool to preserve structure.

### 2025-12-04 Update
- Prototype chess playground now ships a chess.js-powered controller with click-to-move, legal-move surfacing, undo/redo, promotion dialog, capture tally, and bilingual status copy.
- Added two interactive demos (sandbox + Immortal Game trainer) alongside the earlier static showcases to validate responsive sizing, language toggle, and shared controls.
- Completed FEN+PGN-only data model; canonical PGN now feeds demos and layout presets replace bespoke control toggles.
- Removed legacy timeline helpers (`createTimelineStates`, `normalizeMoves`) to keep the prototype renderer in lockstep with the upcoming widget bundle.

### 2025-12-05 Update
+- ECO lookup builder (`prototype/chess/scripts/build-eco-table.mjs`) now ingests `data/eco-zh.json` to emit bilingual (en/zh) labels for every ECO code.
+- Prototype chess logic and widget consume localized ECO labels so the timeline status panel mirrors the active language.
+- Generated both JSON + JS ECO artifacts to stay browser-import safe while serving the localization data.

### 2025-12-08 Update
- Promoted the chess prototype into `widgets/chess/` with a reusable `<sbs-chess>` custom element plus parity demo page.
- Added chess Markdown fixtures (`chess-demo.md`, `chess-sticky-layout.md`) alongside renamed bridge counterparts to keep renderer samples aligned.
- Extended `sbs_renderer` to emit `<sbs-chess>` fences, load the new widget bundle + sticky CSS, and refreshed `render_samples.sh` to produce bridge/chess HTML in `dist/`.