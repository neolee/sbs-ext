## Demo 1 · Starting Position (Static)
Baseline minimal layout with the default starting FEN.

```sbs-chess
title: "Initial Position"
fen: "startpos"
layout: "minimal"
orientation: "white"
lang: "zh"
```

## Demo 2 · Interactive Sandbox
Click-to-move mode with axes displayed for teaching moments.

```sbs-chess
title: "Interactive Sandbox"
fen: "startpos"
interactive: true
showAxes: true
layout: "full"
```

## Demo 3 · Black Orientation + Compact
Middlegame FEN rendered from Black's perspective with a reduced board size.

```sbs-chess
title: "Rich Middlegame · Black Orientation"
fen: "r1bq1rk1/pp1n1pbp/3p1np1/2pPp3/2P1P3/2N2N2/PPQBBPPP/R3K2R w KQ - 0 11"
orientation: "black"
size: 360
layout: "compact"
```

## Demo 4 · Move Log Only
Timeline playback using SAN text only—board stays on the base FEN.

```sbs-chess
title: "Move Log Only"
fen: "startpos"
layout: "full"
pgn: |
  1. e4 e5 2. Nf3 Nc6 3. Bb5 a6
  4. Ba4 Nf6
```

## Demo 5 · Minimal Board
Board-only layout with coordinate axes for inline diagrams.

```sbs-chess
title: "Minimal Board"
fen: "r3k2r/pp1nbppp/2p1pn2/3p4/3P1B2/2N1PN2/PP3PPP/R2QKB1R w KQkq - 0 10"
layout: "board-only"
showAxes: true
```

## Demo 6 · Half-Size Widget
Locked board size at 240px to validate responsive down-scaling.

```sbs-chess
title: "Half-Size Widget"
fen: "rnbq1rk1/ppp2ppp/3bpn2/3p4/3P1B2/2N1PN2/PPP2PPP/R2QKB1R w KQ - 0 8"
size: 240
lockSize: true
layout: "full"
```

## Demo 7 · Immortal Game Trainer
Interactive playback seeded with the classic Immortal Game PGN.

```sbs-chess
title: "Immortal Game Trainer"
fen: "startpos"
interactive: true
layout: "full"
pgn: |
  1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5
  4. b4 Bxb4 5. c3 Ba5 6. d4 exd4
  7. O-O d6 8. cxd4 Bg4
```