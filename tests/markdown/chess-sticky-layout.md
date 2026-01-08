## Opening Sparks

::: sbs-sticky
```sbs-chess
title: "Move 12 · Catalan Tension"
layout: "mini"
size: 240
fen: "r1bqk2r/pp2bppp/2n1pn2/2pp4/2P1P3/1PNP1N2/PB1B1PPP/R2QK2R w KQkq - 4 9"
orientation: "white"
interactive: false
lang: "en"
coords: false
```

Catalan structures often hinge on whether Black can safely capture on c4 before White completes development. Here, White has already prepared b3 and Rc1, so the bishop pair is ready to punish any premature ...dxc4. The diagram stays pinned on wider screens while you compare candidate moves.

1. White can strike with `exd5` immediately, forcing ...exd5 2. d4, when the c5 pawn becomes isolated.
2. Alternatively, `cxd5 exd5 e5` locks the light squares and highlights the long Catalan bishop.

Either line underscores that Black's ...Bc5 plan is risky without ...a6 first.

Zooming out, this is the canonical Catalan story: every tempo that delays ...a6 or ...b5 hands White another file to pressure. If the viewer scrolls through the surrounding prose while the diagram sticks to the margin, the contrast between written plans and the frozen board state becomes impossible to miss.

Notice how the sticky frame keeps the bishops aligned with the commentary about dark-square control. Readers can compare the c4 pawn lever, memorize the knight routes (b1-d2-f1-g3), and immediately look back at the board without losing their place in the text.
:::

::: sbs-sticky
```sbs-chess
title: "Move 23 · Exchange Sacrifice"
layout: "mini"
size: 240
fen: "2rq1rk1/1b1nbppp/p3pn2/1p6/3PB3/P1N1BN2/1PP2PPP/2RQ1RK1 w - - 0 23"
orientation: "white"
```

White sacrificed the exchange on b5 to eliminate Black's only active rook file. The static evaluation still hovers around equality, but practical chances favor White because the dark squares are untouchable.

Key takeaways while scrolling:
- The knight on e4 dominates f6 and d6, freezing Black's pieces.
- If Black plays ...Nb6, White hits with d6!, cracking open the long diagonal.
- White's rook lift to e3-g3 becomes irresistible once the g-file opens.

Because the sticky pane keeps the diagram in view, you can narrate how Rc1, c4, and h4 converge on f6 without forcing readers to scroll back up for every motif. The text body can stretch to a dozen paragraphs—explaining move orders, sacrifices, or alternative exchanges—while the position stays anchored.

Try scanning the prose quickly: the board never jitters or scrolls away, so concepts like "dark-square bind" and "exchange sacrifice timing" feel tangible. That persistence is exactly what we want authors to experience when they rely on the SBS sticky container.
:::

::: sbs-sticky
```sbs-chess
title: "Move 36 · Knight Fortress"
layout: "mini"
size: 240
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

With the sticky presentation, you can describe subtle maneuvers—opposition triangulations, knight reroutes to c6, or waiting moves with Kf1-e2—over multiple paragraphs. The board never leaves the reader’s peripheral vision, so the strategic checkpoints (freeze the queenside, win the f-pawn race, inch the king forward) stay anchored in the same viewport.

It also highlights how SBS handles longer essays: authors can interleave bullet lists, figurine notation, or even diagrams-within-diagrams, confident that the hero board remains glued to the sidebar for constant reference.
:::