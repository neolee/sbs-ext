# Bridge Widget Scenario Catalog

> This notebook mirrors the original bridge widget prototype and exercises the `sbs-bridge` extension syntax. Each scenario embeds a PBN payload within a fenced widget block so renderers can translate it into the `<sbs-bridge>` web component.

---

## Example 1 · Full Deal with Bidding

```sbs-bridge
lang: zh
format: "pbn"
data: |
  [Event "World Bridge Championship"]
  [Site "Beijing, China"]
  [Date "2025.12.01"]
  [Board "1"]
  [West "Player W"]
  [North "Player N"]
  [East "Player E"]
  [South "Player S"]
  [Dealer "N"]
  [Vulnerable "None"]
  [Deal "N:AKQJ.AKQJ.AK.AQJ 9876.9876.8.K982 5432.5432.54.754 T.T.QJT97632.T63"]
  [Scoring "MP"]
  [Declarer "N"]
  [Contract "6H"]
  [Result "13"]
  [Auction "N"]
  2C Pass 2D Pass
  3NT Pass 4H Pass
  4NT Pass 5C Pass
  6H Pass Pass Pass
```

## Example 2 · Full Deal (No Bidding)

```sbs-bridge
lang: zh
format: "pbn"
data: |
  [Event "Club Game"]
  [Dealer "E"]
  [Vulnerable "EW"]
  [Deal "N:T98.K76.A543.QJ2 KQJ.A54.KQJ.A543 765.QJ9.T98.K876 A432.T832.762.T9"]
  [Declarer "E"]
  [Contract "3NT"]
```

## Example 3 · Declarer and Dummy Only

```sbs-bridge
lang: zh
format: "pbn"
data: |
  [Event ""]
  [Dealer "S"]
  [Vulnerable "Both"]
  [Deal "N:AKQT9.A5.K986.QT - J2.J9732.QT2.K94 -"]
  [Declarer "N"]
  [Contract "3NT"]
```

## Example 4 · Endgame Snapshot

```sbs-bridge
lang: zh
format: "pbn"
data: |
  [Event "Endgame Problem"]
  [Dealer "W"]
  [Vulnerable "NS"]
  [Deal "N:A.K..AJ .A.K3.Q 2.3.7.4 K5.6..7"]
  [Declarer "N"]
  [Contract "4S"]
```

## Example 5 · Declarer/Dummy + Lead + Auction

```sbs-bridge
lang: zh
format: "pbn"
data: |
  [Event "Scenario 5"]
  [Dealer "N"]
  [Vulnerable "None"]
  [Deal "N:AKQJ.AKQJ.AK.AQJ - 9543.5432.54.754 -"]
  [Declarer "S"]
  [Contract "4H"]
  [Auction "N"]
  1H Pass 2H Pass
  4H Pass Pass Pass
  [Play "W"]
  S2
```

## Example 6 · Auction + Lead Hand (West)

```sbs-bridge
lang: en
format: "pbn"
data: |
  [Event "Scenario 6"]
  [Dealer "W"]
  [Vulnerable "EW"]
  [Deal "W:KQJ9.KQJ.KQJ.KQJ - - -"]
  [Declarer "N"]
  [Contract "3NT"]
  [Auction "W"]
  1C Pass 1H Pass
  1NT Pass 3NT Pass
  Pass Pass
```

## Example 7 · Lead + Lead Hand + Dummy

```sbs-bridge
lang: en
format: "pbn"
data: |
  [Event "Scenario 7"]
  [Dealer "S"]
  [Vulnerable "Both"]
  [Deal "W:T987.T98.T98.T98 AK53.AQ.AKQ6.A73 - -"]
  [Declarer "S"]
  [Contract "6NT"]
  [Auction "S"]
  1NT Pass 6NT Pass
  Pass Pass
  [Play "W"]
  H9
```