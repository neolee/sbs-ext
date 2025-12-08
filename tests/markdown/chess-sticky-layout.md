## Opening Sparks

::: sbs-sticky

```sbs-chess
title: "Move 12 · Catalan Tension"
layout: "board-only"
fen: "r1bqk2r/pp2bppp/2n1pn2/2pp4/2P1P3/1PNP1N2/PB1B1PPP/R2QK2R w KQkq - 4 9"
orientation: "white"
interactive: false
lang: "en"
showAxes: false
```

Catalan structures often hinge on whether Black can safely capture on c4 before White completes development. Here, White has already prepared b3 and Rc1, so the bishop pair is ready to punish any premature ...dxc4. The diagram stays pinned on wider screens while you compare candidate moves.

1. White can strike with `exd5` immediately, forcing ...exd5 2. d4, when the c5 pawn becomes isolated.
2. Alternatively, `cxd5 exd5 e5` locks the light squares and highlights the long Catalan bishop.

Either line underscores that Black's ...Bc5 plan is risky without ...a6 first.
:::

## Middlegame Collision

::: sbs-sticky

```sbs-chess
title: "Move 23 · Exchange Sacrifice"
layout: "board-only"
fen: "2rq1rk1/1b1nbppp/p3pn2/1p6/3PB3/P1N1BN2/1PP2PPP/2RQ1RK1 w - - 0 23"
pgn: |
  1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 Be7
  5. Nf3 O-O 6. O-O dxc4 7. Qc2 a6 8. a4 Bd7
  9. Qxc4 Bc6 10. Nc3 Nbd7 11. Re1 a5 12. e4 Nb6
  13. Qe2 Bb4 14. Bg5 Be7 15. Rad1 Nxa4 16. d5 Nxc3
  17. bxc3 exd5 18. exd5 Ba4 19. Rb1 Re8 20. Nd4 h6
  21. Bxf6 Bxf6 22. Rxb5 Bxb5
orientation: "white"
```

White sacrificed the exchange on b5 to eliminate Black's only active rook file. The static evaluation still hovers around equality, but practical chances favor White because the dark squares are untouchable.

Key takeaways while scrolling:
- The knight on e4 dominates f6 and d6, freezing Black's pieces.
- If Black plays ...Nb6, White hits with d6!, cracking open the long diagonal.
- White's rook lift to e3-g3 becomes irresistible once the g-file opens.

:::

## Endgame Rescue

::: sbs-sticky

```sbs-chess
title: "Move 36 · Knight Fortress"
layout: "board-only"
fen: "6k1/1b1n1pp1/p2Pp2p/1p1nP3/3N4/1P4P1/P4P1P/3R2K1 w - - 0 36"
orientation: "white"
interactive: false
lang: "en"
```

Black traded queens hoping the extra exchange would decide matters, but the knight on d4 creates an impenetrable barrier. White's plan is simply Kg2-h3, f4, and a slow kingside squeeze. Notice how the sticky panel keeps this fortress diagram anchored while paragraphs of endgame technique scroll by.

- If Black tries ...Nxe5, f4! recaptures with tempo and the passed pawn rolls.
- ...Bd5 fails to Kf1, then Nc6  and the rook swings to c1 targeting c5.
- Patience is everything; White triangulates the king until the ...b4 advance becomes impossible.

This closing position is what the renderer must match when exporting long-form analysis pieces.
:::