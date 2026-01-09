"""SBS Editor snippets for demo and insertion."""

DEMO_DOCUMENT = r"""
# SBS Editor Demo

Welcome to the **Smart Book Standard** editor.

## Chess Example

::: sbs-sticky
```sbs-chess
lang: "zh"
title: "Sticky Chess Demo"
layout: "compact"
coords: true
interactive: true
size: 400
orientation: "black"
fen: "r1bq1rk1/pp1n1pbp/3p1np1/2pPp3/2P1P3/2N2N2/PPQBBPPP/R3K2R w KQ - 0 11"
```
This is a sticky chess board. You can scroll the text on the right while the board stays visible.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.
:::

## Bridge Example

```sbs-bridge
lang: "zh"
---
[Event "Italy vs USA"]
[Dealer "S"]
[Vulnerable "Both"]
[Deal "N:QJ7.A943.932.865 T3.7652.JT8.AJ87 AK985.K8.AQ.KQT2 642.QJT.K7654.43"]
[Declarer "S"]
[Contract "6S"]
[Auction "S"]
  2C Pass 2H Pass
  2S Pass 3S Pass
  4D Pass 4S Pass
  5C Pass 5S Pass
  6S Pass Pass Pass
[Play "W"]
HQ
```

## Go Example

```sbs-go
lang: "zh"
theme: book
board: 19
coords: true
move: 100
showMoveNumbers: 51-100
interactive: true
size: 500
---
(;GM[1]FF[4]SZ[19]CA[UTF-8]GN[Amazing Game]DT[2025-12-23]PB[Black Player]PW[White Player]BR[1d]WR[1d]KM[6.5]RE[B+R];B[pd];W[dp];B[pp];W[dd];B[pj];W[nc];B[qf];W[pb];B[qc];W[kc];B[fq];W[cn];B[jp];W[dr];B[cq];W[dq];B[cp];W[co];B[br];W[cr];B[bq];W[er];B[fr];W[bs];B[ar];W[do];B[bo];W[bn];B[ap];W[cf];B[ch];W[eg];B[eh];W[fg];B[fh];W[gh];B[gi];W[hi];B[gj];W[hj];B[hk];W[ik];B[hl];W[il];B[im];W[jm];B[in];W[jn];B[jo];W[ko];B[kp];W[lo];B[lp];W[mo];B[mp];W[no];B[np];W[oo];B[po];W[on];B[pn];W[om];B[pm];W[ol];B[pl];W[ok];B[pk];W[oj];B[oi];W[ni];B[oh];W[nh];B[ng];W[mg];B[mf];W[lg];B[lf];W[kf];B[ke];W[je];B[kd];W[jd];B[lc];W[kb];B[lb];W[la];B[ma];W[ka];B[mb];W[nb];B[na];W[oa];B[mc];W[nd];B[ne];W[oe];B[of];W[pe];B[qe];W[pf];B[pg];W[qg];B[qh];W[rg];B[rh];W[rf];B[re];W[se];B[rd];W[sd];B[sc];W[sf];B[rb];W[ra];B[qa];W[pa];B[qb];W[pc];B[pd])
```
"""

WIDGET_SNIPPETS = {
    "chess": r"""
```sbs-chess
lang: "zh"
title: "Chess Game"
layout: "full"
coords: true
interactive: true
size: 400
orientation: "black"
---
1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7
```
""",
    "bridge": r"""
```sbs-bridge
lang: "zh"
---
[Event "Italy vs USA"]
[Dealer "S"]
[Vulnerable "Both"]
[Deal "N:QJ7.A943.932.865 T3.7652.JT8.AJ87 AK985.K8.AQ.KQT2 642.QJT.K7654.43"]
[Declarer "S"]
[Contract "6S"]
[Auction "S"]
  2C Pass 2H Pass
  2S Pass 3S Pass
  4D Pass 4S Pass
  5C Pass 5S Pass
  6S Pass Pass Pass
[Play "W"]
HQ
```
""",
    "go": r"""
```sbs-go
lang: "zh"
theme: book
board: 19
coords: true
move: 0
showMoveNumbers: no
interactive: true
size: 500
---
(;GM[1]FF[4]SZ[19]PB[Black]PW[White];B[pd];W[dp];B[pp])
```
""",
    "sticky": r"""
::: sbs-sticky
```sbs-chess
layout: "mini"
size: 300
---
1. e4 e5
```
Your narration text should be placed here. It will scroll while the widget remains sticky.
:::
"""
}
