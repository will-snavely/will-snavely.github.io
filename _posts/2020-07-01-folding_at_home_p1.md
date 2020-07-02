---
layout: post
title: "Folding at Home, Part 1: Origins"
date: 2020-07-01
section: haskell
author: WS
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

"Fold" moreover has special meaning in computer science, which we will explore in depth,
over time. Let's first try to develop some intuition about folding in this context. Suppose
we are interested in  

<img 
    src="/assets/images/posts/fold_etym.svg" 
    alt="alt text" 
    width="300" 
    class="img-fluid mx-auto d-block">
