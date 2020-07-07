---
layout: post
title: "Folding at Home, Part 1: Intuitions"
date: 2020-07-01
section: horsing
author: WS
scripts: ["/assets/js/folding1.js"]
---

The word "fold" has an impressive diversity of meanings. One can fold a sheet,
fold a hand in poker, [fold cheese into a sauce](https://www.youtube.com/watch?v=NywzrUJnmTo),
be welcomed into a fold, or herd a fold of sheep. A business might fold, and those who
shorted the stock might find their investment returning ten-fold. Stocks themselves
are known to fold, not to mention socks, though in the latter case they may more frequently
be balled—or, in my case, heaped. For bills there are billfolds and for files there
are folders. [Proteins are notorious folders](https://foldingathome.org/about/). There are
folding chairs and Ben Folds Five. Origami elevates folding to art.

Wiktionary offers [three etymologies for fold](https://en.wiktionary.org/wiki/fold),
depending on the sense in which it is used—a rather complicated history for such a
small word. While we are on the subject, "complicated"
[derives from the Latin _complicare_](https://en.wiktionary.org/wiki/complicate#English):
_com-_ ("together") + _plicare_ ("to fold, weave, knit"). _Plicare_ traces back to the
[Proto-Indo-European _pleḱ_](https://en.wiktionary.org/wiki/Reconstruction:Proto-Indo-European/ple%E1%B8%B1-),
which is related to the [PIE root _pel_](https://en.wiktionary.org/wiki/Reconstruction:Proto-Indo-European/pel-),
which itself is the ultimate root for the Proto-Germanic word that became the English
"fold." Everything folds together nicely.

"Fold" moreover has special meaning in computer science. Suppose I have a simple list of
numbers.

```
1,2,3,4,5
```

I'd like to find the sum of these numbers. One way to go about this: replace every comma
in the list with a plus sign, and compute the result.

```
1,2,3,4,5 
=> replace "," with '+' 
=> 1+2+3+4+5
=> 15
```

Similarly, I could compute the product:

```
1,2,3,4,5 
=> replace "," with '*' 
=> 1*2*3*4*5
=> 120
```

In both cases, I've taken my list of numbers and "reduced" it to a single value, using some
common arithmetic operator to the combine numbers together. In other words, I've "folded" together
the list in a way that produces a single number. These examples—sum and product—are generally
the first offered in most explanations of the `fold` operator, with good reason. They are simple
examples using generally understood concepts. But like most simple examples, they miss something.
Specifically, they give the impression that `fold`-ing something necessarily simplifies or reduces it.
The word "fold" itself adds to this impression—folding a list is like folding a sheet, in that we
make it "smaller".

Instead, the `fold` operator perhaps should evoke folding in the sense of origami. We are applying
some well-defined operation to convert one thing into something else. These specific examples
just happen to convert something structured into something less structured: a list of numbers
into a single value. It's the kind of origami that turns a square into a smaller square by folding
it in half twice. But if we desired we could make a swan instead. The `fold` operator has
similar flexibility.

Or, perhaps it's more accurate to think about the idea of "folding something in." In the game
[_Katamari Damacy_](https://www.youtube.com/watch?v=JHsFcSNFUMc), you roll around a sort of
magical snowball that picks up everything it comes into contact with, growing larger and larger
as it incorporates—folds in—more material. The `fold` operator works much like this.  In the case
of summation, our snowball is a running total, which grows as it encounters each value of the list.

<div class="row">
  <div class="col-md-12 px-5">
    <div style="max-width: 1000px;">
      <div id="fold1"></div>
    </div>
  </div>
</div>

Thus, when designing a `fold` operation, one has to answer the following questions:

1. What is the nature of the entity we are accumulating? We might call this the destination type.
2. What is the initial value of the accumulator?
3. How do we accumulate elements of the source type into the destination type? We might call this the accumulation function.

For the summation of a list of integers, the answers to these questions are:

1. The destination type is an integer.
2. The initial value is 0 (the additive identity).
3. For a given value in the list, we simply add it to the accumulator.

For the product of a list of integers, the answers are almost the same:

1. The destination type is an integer.
2. The initial value is 1 (the multiplicative identity).
3. For a given value in the list, we multiply the accumulator by this value.

One has substantial latitude in answering these questions. For example, the destination type
need not be simpler than the source type. The accumulation function can be as simple or
complex as needed. And, of course, the initial value must adjust based on the destination
type chosen. In the [next post]({% post_url 2020-07-07-folding_at_home_p2 %}), 
we'll start looking at some of these ideas in code.
