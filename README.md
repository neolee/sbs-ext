# Extensions for Smart Book Standard (SBS)

Smart Book Standard (SBS) is a specification for creating interactive and media-rich digital books, which is based on Markdown. This repository contains extensions to the SBS that enhance its capabilities, allowing for more interactive scenarios.

The extensions are designed to be used with the SBS format and can be integrated into any SBS-compliant book. Each extension is documented below, along with its usage and examples.

## Chess

- Authors can use FEN string to display a chess board and game state.
- Readers can play on that interactive chess board, and roll back to the original state.
- The chess board can be used to display a game in progress or a historical game.
- The automatically generated chess board can be assigned to a specific section of the book and floating on with text of that section.

## Bridge

Similar to the Chess extension, the Bridge extension allows authors to display a bridge game in progress through a specific format. Only static images are supported, no need to be interactive.

## Go

Similar to the Bridge extension, the Go extension allows authors to display a Go game in progress through a specific format. Only static images are supported, no need to be interactive.