# Go (Weiqi) Widget Demo

This page demonstrates the SBS Go widget.

## 19x19 Board (Interactive)

```sbs-go
theme: book
interactive: true
lang: zh
size: 500
---
(;GM[1]FF[4]SZ[19]AP[SmartGo:2.7.1]CA[UTF-8]GN[Demo Game]DT[2025-12-23]PB[Black Player]PW[White Player]BR[1d]WR[1d]KM[6.5]RE[B+R];B[pd];W[dp];B[pp];W[dd];B[pj];W[nc];B[qf];W[pb];B[qc];W[kc];B[fq];W[cn];B[jp];W[dr];B[cq];W[dq];B[cp];W[co];B[br];W[cr];B[bq];W[er];B[fr];W[bs];B[ar];W[do];B[bo];W[bn];B[ap];W[cf];B[ch];W[eg];B[eh];W[fg];B[fh];W[gh];B[gi];W[hi];B[gj];W[hj];B[hk];W[ik];B[hl];W[il];B[im];W[jm];B[in];W[jn];B[jo];W[ko];B[kp];W[lo];B[lp];W[mo];B[mp];W[no];B[np];W[oo];B[po];W[on];B[pn];W[om];B[pm];W[ol];B[pl];W[ok];B[pk];W[oj];B[oi];W[ni];B[oh];W[nh];B[ng];W[mg];B[mf];W[lg];B[lf];W[kf];B[ke];W[je];B[kd];W[jd];B[lc];W[kb];B[lb];W[la];B[ma];W[ka];B[mb];W[nb];B[na];W[oa];B[mc];W[nd];B[ne];W[oe];B[of];W[pe];B[qe];W[pf];B[pg];W[qg];B[qh];W[rg];B[rh];W[rf];B[re];W[se];B[rd];W[sd];B[sc];W[sf];B[rb];W[ra];B[qa];W[pa];B[qb];W[pc];B[pd])

```

## 2. Classic Theme (English, Interactive)

```sbs-go
theme: classic
interactive: true
lang: en
size: 500
---
(;GM[1]FF[4]SZ[19]AP[SmartGo:2.7.1]CA[UTF-8]GN[Demo Game]DT[2025-12-23]PB[Black Player]PW[White Player]BR[1d]WR[1d]KM[6.5]RE[B+R];B[pd];W[dp];B[pp];W[dd];B[pj];W[nc];B[qf];W[pb];B[qc];W[kc];B[fq];W[cn];B[jp];W[dr];B[cq];W[dq];B[cp];W[co];B[br];W[cr];B[bq];W[er];B[fr];W[bs];B[ar];W[do];B[bo];W[bn];B[ap];W[cf];B[ch];W[eg];B[eh];W[fg];B[fh];W[gh];B[gi];W[hi];B[gj];W[hj];B[hk];W[ik];B[hl];W[il];B[im];W[jm];B[in];W[jn];B[jo];W[ko];B[kp];W[lo];B[lp];W[mo];B[mp];W[no];B[np];W[oo];B[po];W[on];B[pn];W[om];B[pm];W[ol];B[pl];W[ok];B[pk];W[oj];B[oi];W[ni];B[oh];W[nh];B[ng];W[mg];B[mf];W[lg];B[lf];W[kf];B[ke];W[je];B[kd];W[jd];B[lc];W[kb];B[lb];W[la];B[ma];W[ka];B[mb];W[nb];B[na];W[oa];B[mc];W[nd];B[ne];W[oe];B[of];W[pe];B[qe];W[pf];B[pg];W[qg];B[qh];W[rg];B[rh];W[rf];B[re];W[se];B[rd];W[sd];B[sc];W[sf];B[rb];W[ra];B[qa];W[pa];B[qb];W[pc];B[pd])

```

## 3. 9x9 with Markers (Static, Book Theme)

```sbs-go
board: 9
theme: book
interactive: false
size: 240
---
(;SZ[9]AB[cc][gc][cg][gg]AW[ee][ge][ec][eg]LB[cc:1][gc:2][cg:3][gg:4][ee:A][ge:B][ec:C][eg:D][df:X][fd:Y][de:E][ed:F][ff:G]TR[df][cc]SQ[fd][gc]CR[cg][ee];B[hh])

```

## 4. 13x13 with Move Numbers (Classic Theme)

```sbs-go
board: 13
theme: classic
interactive: true
showMoveNumbers: true
size: 360
---
(;SZ[13]AB[dd][jj][jd][dj];B[gc];W[cg];B[gg];W[cc];B[dc];W[cb];B[db];W[da];B[ea];W[ca];B[fb];W[ee];B[fe];W[ef];B[ff];W[eg];B[eh];W[dh];B[ei];W[di];B[ej];W[ek];B[fk];W[el];B[fl];W[em];B[fm];W[en];B[fn];W[eo];B[fo];W[ep];B[fp];W[eq];B[fq];W[er];B[fr];W[es];B[fs];W[dr];B[ds];W[cs];B[cr];W[br];B[bs];W[as];B[ar];W[aq];B[ap];W[ao];B[an];W[am];B[al];W[ak];B[aj];W[ai];B[ah];W[ag];B[af];W[ae];B[ad];W[ac];B[ab];W[aa])

```

## 5. 19x19 with Last 10 Move Numbers (Book Theme, ZH)

```sbs-go
board: 19
theme: book
interactive: true
showMoveNumbers: 10
lang: zh
size: 500
---
(;GM[1]FF[4]SZ[19]AP[SmartGo:2.7.1]CA[UTF-8]GN[Demo Game]DT[2025-12-23]PB[Black Player]PW[White Player]BR[1d]WR[1d]KM[6.5]RE[B+R];B[pd];W[dp];B[pp];W[dd];B[pj];W[nc];B[qf];W[pb];B[qc];W[kc];B[fq];W[cn];B[jp];W[dr];B[cq];W[dq];B[cp];W[co];B[br];W[cr];B[bq];W[er];B[fr];W[bs];B[ar];W[do];B[bo];W[bn];B[ap];W[cf];B[ch];W[eg];B[eh];W[fg];B[fh];W[gh];B[gi];W[hi];B[gj];W[hj];B[hk];W[ik];B[hl];W[il];B[im];W[jm];B[in];W[jn];B[jo];W[ko];B[kp];W[lo];B[lp];W[mo];B[mp];W[no];B[np];W[oo];B[po];W[on];B[pn];W[om];B[pm];W[ol];B[pl];W[ok];B[pk];W[oj];B[oi];W[ni];B[oh];W[nh];B[ng];W[mg];B[mf];W[lg];B[lf];W[kf];B[ke];W[je];B[kd];W[jd];B[lc];W[kb];B[lb];W[la];B[ma];W[ka];B[mb];W[nb];B[na];W[oa];B[mc];W[nd];B[ne];W[oe];B[of];W[pe];B[qe];W[pf];B[pg];W[qg];B[qh];W[rg];B[rh];W[rf];B[re];W[se];B[rd];W[sd];B[sc];W[sf];B[rb];W[ra];B[qa];W[pa];B[qb];W[pc];B[pd])

```

## 6. 19x19 Static (No Coordinates, Book Theme)

```sbs-go
board: 19
theme: book
interactive: false
coords: false
size: 360
---
(;GM[1]FF[4]SZ[19]AP[SmartGo:2.7.1]CA[UTF-8]GN[Demo Game]DT[2025-12-23]PB[Black Player]PW[White Player]BR[1d]WR[1d]KM[6.5]RE[B+R];B[pd];W[dp];B[pp];W[dd];B[pj];W[nc];B[qf];W[pb];B[qc];W[kc];B[fq];W[cn];B[jp];W[dr];B[cq];W[dq];B[cp];W[co];B[br];W[cr];B[bq];W[er];B[fr];W[bs];B[ar];W[do];B[bo];W[bn];B[ap];W[cf];B[ch];W[eg];B[eh];W[fg];B[fh];W[gh];B[gi];W[hi];B[gj];W[hj];B[hk];W[ik];B[hl];W[il];B[im];W[jm];B[in];W[jn];B[jo];W[ko];B[kp];W[lo];B[lp];W[mo];B[mp];W[no];B[np];W[oo];B[po];W[on];B[pn];W[om];B[pm];W[ol];B[pl];W[ok];B[pk];W[oj];B[oi];W[ni];B[oh];W[nh];B[ng];W[mg];B[mf];W[lg];B[lf];W[kf];B[ke];W[je];B[kd];W[jd];B[lc];W[kb];B[lb];W[la];B[ma];W[ka];B[mb];W[nb];B[na];W[oa];B[mc];W[nd];B[ne];W[oe];B[of];W[pe];B[qe];W[pf];B[pg];W[qg];B[qh];W[rg];B[rh];W[rf];B[re];W[se];B[rd];W[sd];B[sc];W[sf];B[rb];W[ra];B[qa];W[pa];B[qb];W[pc];B[pd])

```

## 7. Extra Large 19x19 (Classic Theme, 1000px)

```sbs-go
board: 19
theme: classic
interactive: true
size: 1000
---
(;GM[1]FF[4]SZ[19]AP[SmartGo:2.7.1]CA[UTF-8]GN[Demo Game]DT[2025-12-23]PB[Black Player]PW[White Player]BR[1d]WR[1d]KM[6.5]RE[B+R];B[pd];W[dp];B[pp];W[dd];B[pj];W[nc];B[qf];W[pb];B[qc];W[kc];B[fq];W[cn];B[jp];W[dr];B[cq];W[dq];B[cp];W[co];B[br];W[cr];B[bq];W[er];B[fr];W[bs];B[ar];W[do];B[bo];W[bn];B[ap];W[cf];B[ch];W[eg];B[eh];W[fg];B[fh];W[gh];B[gi];W[hi];B[gj];W[hj];B[hk];W[ik];B[hl];W[il];B[im];W[jm];B[in];W[jn];B[jo];W[ko];B[kp];W[lo];B[lp];W[mo];B[mp];W[no];B[np];W[oo];B[po];W[on];B[pn];W[om];B[pm];W[ol];B[pl];W[ok];B[pk];W[oj];B[oi];W[ni];B[oh];W[nh];B[ng];W[mg];B[mf];W[lg];B[lf];W[kf];B[ke];W[je];B[kd];W[jd];B[lc];W[kb];B[lb];W[la];B[ma];W[ka];B[mb];W[nb];B[na];W[oa];B[mc];W[nd];B[ne];W[oe];B[of];W[pe];B[qe];W[pf];B[pg];W[qg];B[qh];W[rg];B[rh];W[rf];B[re];W[se];B[rd];W[sd];B[sc];W[sf];B[rb];W[ra];B[qa];W[pa];B[qb];W[pc];B[pd])

```