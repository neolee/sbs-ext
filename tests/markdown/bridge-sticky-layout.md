# Sticky Layout Demo

> This demo illustrates how to solve the "widget scrolling away" problem. On desktop screens (>900px), the bridge widget on the right will remain **sticky** while you scroll through the long analysis text on the left.

---

::: sbs-sticky
```sbs-bridge
format: "pbn"
data: |
  [Event "Sticky Demo 1"]
  [Dealer "N"]
  [Vulnerable "None"]
  [Deal "N:AKQJ.T98.765.432 987.765.432.KQJ 5432.AKQJ.AK.A5 T6.432.QJT98.T98"]
  [Declarer "S"]
  [Contract "4H"]
  [Auction "N"]
  1S Pass 2H Pass
  4H Pass Pass Pass
  [Play "W"]
  S2
```

## Scenario 1 · The Critical Opening Lead

This deal from the 2025 World Championship illustrates a classic defensive problem. South has reached a contract of 4 Hearts after a competitive auction. West, holding a balanced hand with scattered values, must find the killer opening lead.

Looking at the auction, North showed a strong spade suit before supporting hearts. This strongly suggests that South is short in spades. A spade lead, therefore, seems attractive but might be ruffed immediately, or worse, set up a trick for declarer if they hold the King or Queen guarded.

**The Trump Lead Option.** A trump lead is often right when the opponents are cross-ruffing, but here, the dummy (North) has shown strength. Leading a trump might pick up partner's potential Queen or Jack, giving declarer a free finesse.

**The Passive Defense.** West might consider a club lead. Holding the King-Ten, leading a low club is standard. However, if declarer holds the Ace-Queen, this lead gives away a trick instantly.

(Scroll down to verify that the widget stays pinned on wide screens.)

Eventually, West chose the **Spade 2**. Let's analyze why this works. Declarer plays low from dummy, East wins with the Ace and returns a spade. South ruffs, but now the defensive communication is established.

Later in the play, when West gets in with the King of Diamonds, they can lead another spade. This forces declarer to ruff again, shortening their trump holding to a dangerous level. This "forcing defense" is effective because West has four trumps to the King-Jack.

If West had led a trump originally, declarer would have drawn trumps immediately, losing only one trump trick and two diamond tricks. The spade lead was the only way to generate four defensive tricks.
:::

::: sbs-sticky
```sbs-bridge
lang: en
format: "pbn"
data: |
  [Event "Sticky Demo 2"]
  [Dealer "S"]
  [Vulnerable "Both"]
  [Deal "S:AK.AK.AKQJ.J432 QJ.QJ987.T9.K98 5432.543.5432.AQ T9876.T62.876.T7"]
  [Declarer "S"]
  [Contract "6NT"]
  [Play "W"]
  HJ
```

## Scenario 2 · Endplay Technique

In this second example, we look at a declarer play problem. South is in 6NT. The lead is the Jack of Hearts.

South has 11 top tricks: 3 Spades, 3 Hearts, 4 Diamonds, and 1 Club. The 12th trick must come from Clubs or a squeeze.

The simple line is to take the Club finesse. If West holds the King, the slam is made. This is a 50% chance. Can we do better?

Let's look at the distribution. West has shown up with long hearts. If West also holds the King of Clubs, he might be squeezed. But there is a safer line: the endplay.

South wins the Heart lead, draws rounds of Spades and Diamonds, stripping West of safe exit cards. Finally, South exits with a Heart.

West wins but is now endplayed. He must lead a Club (giving South a free finesse) or lead a Heart/Spade/Diamond (giving a ruff-and-discard, though in NT it just means leading into a tenace).

The endplay guarantees the contract without relying purely on the finesse.
:::