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
*   **Syntax**: Extensions use HTML comment tags (e.g., `<!-- sbs-chess -->`) followed by a code block (usually YAML) containing configuration/data.

### Extension Modules

#### A. Chess
*   **Goal**: Full interactive support.
*   **Input**: FEN string (position), Moves list (SAN).
*   **Capabilities**:
    *   **Static**: Render board state.
    *   **Interactive**: Allow users to move pieces, validate legal moves, and support Undo/Redo.
*   **Configuration**: `interactive: true/false`, `orientation`, `size`.

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

## 4. Project Status
*   **Date**: December 1, 2025
*   **Phase**: **Initialization / Specification Definition**
*   **Current State**:
    *   Repository initialized.
    *   `README.md` defined with initial specifications for Chess, Bridge, and Go.
    *   `pyproject.toml` created.
*   **Immediate Next Steps**:
    *   Finalize implementation details for the reference parsers.
    *   Begin implementation of the Chess module (priority on data structure and FEN parsing).

## 5. Technical Context
*   **Dependencies**: (To be determined, likely `python-chess` for chess logic).
*   **Testing**: All implementations must include unit tests.