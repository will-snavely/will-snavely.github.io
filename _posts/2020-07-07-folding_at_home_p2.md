---
layout: post
title: "Folding at Home, Part 2: Basic Folding in Scala"
date: 2020-07-07
section: horsing
author: WS
---

(Note: The final code associated with this post
[can be found here.](https://github.com/will-snavely/foldingathome/blob/master/src/main/scala/etmologyfun1/EtymologyFun1.scala))

[Last time]({% post_url 2020-07-01-folding_at_home_p1 %}) we touched on the
etymology of the word "fold". Suppose we want to do some computing
(in particular, some `fold`-ing) with this data. For now,
let's limit our attention to one branch of 
[fold's rather rich etymology](https://en.wiktionary.org/wiki/fold):

<img src="/assets/images/posts/fold2/fold_etym.svg" alt="Fold Etymology" class="img-fluid" style="max-width: 400px;"/>

For now, a list-like structure is sufficient to store this information,
though something more tree-like (arboresque, if you'll allow—in which case
the data resident therein might be called "arboreal", which I find far more
appealing than the more traditional "hierarchical") will be
required at some point, e.g. to represent multiple etymologies for
a given word.

I will be proceeding in the [Scala programming language](https://www.scala-lang.org/),
which I have been learning lately. Scala features a variety of
built data structures, e.g. the [List](https://www.scala-lang.org/api/current/scala/collection/immutable/List.html),
which I could very well use to represent this simple etymology.
But for the purpose of illustration, I will be starting from scratch.

The basic unit of information in an etymology is a _word_, which is a
combination of a character string with a language name. For example,
the top-most element of the "fold" etymology shown above is an English
word consisting of the characters `["f", "o", "l", "d"]`. Below, we
define some Scala types to represent this definition: a `Language` type
type and a `Word` type. There is some Scala syntax here that might
be confusing to one unfamiliar with the language, but it's not terribly
important to understand the specifics, e.g. what precisely a `sealed trait`
is (it sounds vaguely like a legal term, in my opinion).

```scala
sealed trait Language
case object English extends Language
case object MiddleEnglish extends Language
case object OldEnglish extends Language
case object ProtoGermanic extends Language
case object ProtoIndoEuropean extends Language
case object Latin extends Language

case class Word(characters: String, language: Language)
```

We use the `case object` construct (which also sounds like it could be
plausibly uttered in a courtroom) to define some specific, common languages,
like English and Latin. Next, we need to build our list data structure.
We will use a singly-linked, null-terminated list, defined as follows.

```scala
sealed trait Etymology
case class EtymologyNode(word: Word, root: Etymology) extends Etymology
case object End extends Etymology
```

That is, an element of an etymology, called an `EtymologyNode`, consists of a
word and its immediate ancestor (called `root` above). If a word has no
known ancestor, then `root` is set to the special `End` element. Using
these definitions, this is how we instantiate the etymology for the word
"fold":

```scala
val foldEtymology =
    EtymologyNode(Word("fold", English),
        EtymologyNode(Word("folden", MiddleEnglish),
            EtymologyNode(Word("fealdan", OldEnglish),
                EtymologyNode(Word("falþaną", ProtoGermanic),
                    EtymologyNode(Word("pel", ProtoIndoEuropean),
                        End)))))
```

Note that Scala strings are Unicode, so we have no issues representing
funky characters. Let's write a few functions for this data structure.
Below we describe three simple functions, and some test cases for each.

```scala
object EtymologyFun1 {
  def describe(etymology: Etymology): String = ...
    // Return a string description of the etymology

  def length(etymology: Etymology): Int = ...
    // Count the number of words in the etymology

  def contains(etymology: Etymology, language: Language): Boolean = ...
    // Return true if the etymology contains a certain language, false otherwise.


  def main(args: Array[String]): Unit = {
    val foldEtymology =
      EtymologyNode(Word("fold", English),
        EtymologyNode(Word("folden", MiddleEnglish),
          EtymologyNode(Word("fealdan", OldEnglish),
            EtymologyNode(Word("falþaną", ProtoGermanic),
              EtymologyNode(Word("pel", ProtoIndoEuropean),
                End)))))

    print(describe(foldEtymology))
    assert(length(foldEtymology) == 5)
    assert(contains(foldEtymology, English))
    assert(contains(foldEtymology, OldEnglish))
    assert(contains(foldEtymology, ProtoIndoEuropean))
    assert(!contains(foldEtymology, Latin))
  }
}
```

Let's start with the `describe` function. The idea here is to return some simple,
English-text description of the etymology. The only real issue to work out is how
to traverse through our list. The simplest way to do so is with recursion:

```
def traverse(etymology: Etymology): Unit = etymology match {
  case End =>
    ; // Recursion has concluded, nothing to do
  case EtymologyNode(word, root) =>
    print(word)
    traverse(root)
}
```

The `Unit` return type on this function indicates that it doesn't produce a value,
roughly analogous to the `void` type in Java. This `traverse` function is a touch
heretical, in that it has a side-effect, and therefore is not a
[pure function](https://en.wikipedia.org/wiki/Pure_function). Namely, it prints
something to the screen. But, it gets the idea across. Note that we use
Scala's [pattern matching](https://docs.scala-lang.org/tour/pattern-matching.html)
capabilities here, to identify which kind of `Etymology` instance we are working
with (`End` or `EtymologyNode`) in a particular call.

With this in mind, our `describe` function might look something like this:
```scala
  def describe(etymology: Etymology): String = etymology match {
    case End =>
      ""
    case EtymologyNode(w, root) =>
      // "+" here represents string concatenation
      "(%s, %s)\n".format(w.characters, w.language) + describe(root)
  }
```

The evaluation of this function for the "fold" etymology produces the following string:

```
(fold, English)
(folden, MiddleEnglish)
(fealdan, OldEnglish)
(falþaną, ProtoGermanic)
(pel, ProtoIndoEuropean)
```

The `length` and `contains` functions can be tackled in a very similar way:

```scala
def length(etymology: Etymology): Int = etymology match {
  case End =>
    0
  case EtymologyNode(_, root) =>
    1 + length(root)
}

def contains(etymology: Etymology, language: Language): Boolean = etymology match {
  case End =>
    false
  case EtymologyNode(word, root) =>
    word.language == language || contains(root, language)
}
```

Since all of these functions have a very similar shape, it's natural to wonder
whether we can unify their implementation in some way. One way to think about this
is in terms of the `fold` operator. The intuition we built for this operator is
that it rolls through a data structure like a snowball, incorporating each element
into some ultimate return value (the type of which may differ from the type of the
data structure elements). To be a little more specific, recall that `fold` requires
three basic pieces of information:

1. What is the nature of the entity we are accumulating, a.k.a. the destination type?
2. What is the initial value of the accumulator?
3. How do we accumulate elements of the source type into the destination type, a.k.a. the accumulation function.

With these requirements in mind, here is an initial implementation.

```scala
def fold[V](e: Etymology, v: V, f: (Word, V) => V): V = e match {
case End =>
    v
case EtymologyNode(word, root) =>
    fold(root, f(word, v), f)
}
```

We must again contend with some Scala syntax here to figure out what's going on.
Namely, we define `fold` as a ["polymorphic method"](https://docs.scala-lang.org/tour/polymorphic-methods.html)
by adding the `[V]` syntax next to the name of the function. This means that callers of
the function must specify a type when calling the `fold` function, which will get bound to
the symbol `V`. `V` represents the destination type of the `fold`.

The function takes three arguments:

1. An `Etymology` instance, `e`, representing the etymology we wish to fold.
2. A value of type `V`, representing the initial value of the accumulator.
3. A function `f`, which takes an individual `Word` and a "running total" `V`,
   and accumulates the word into the "running total."

When we encounter the `End` node, we simply return the accumulator value given to
us. For a list node, we "roll the snowball", that is, fold the word in the node
into the "running total" by applying the accumulator function `f`. We then recurse
on the remainder of the list, passing our updated "total" as well as the
original accumulator function.

Let's see how `describe` can be implemented with this `fold` function.

```scala
def describe(e: Etymology): String =
  fold[String](
    e,
    // Initial accumulator value is the empty string
    "",
    // The accumulator function, defined anonymously
    (w: Word, acc: String) => acc + "(%s, %s)\n".format(w.characters, w.language)
  )
```

We encounter some more Scala syntax here, namely the syntax for defining
an [anonymous function](https://docs.scala-lang.org/overviews/scala-book/anonymous-functions.html),
which we use simply to make the implementation more compact. Note that the `String`
type parameter is strictly optional here: Scala features
[_type inference_](https://docs.scala-lang.org/tour/type-inference.html), which
allows you to omit types if the compiler can discover them from context.
Here, since we pass a `String` value to the second parameter, the compiler can
figure out that `V` ought to be `String`.

(As an aside, we _cannot_ omit the types on the anonymous function arguments,
even though it seems that the compiler should be able to figure out those types.
This is due to some fundamental properties of Scala's typing system that are
significantly beyond the scope of this post. Fortunately, there are ways to
hack around these limitations, which we might explore in a future post.)

Again, `length` and `contains` can be implemented similarly. We will omit
the explicit type parameters this time, where possible.

```scala
def length(e: Etymology): Int =
  fold(e, 0, (_, acc: Int) => acc + 1)

def contains(e: Etymology, language: Language): Boolean =
  fold(e, false, (w: Word, acc: Boolean) => acc || w.language == language)
```

Note that in `length`, our accumulator function doesn't make use of the
current `Word`, so we are able to replace this parameter with an underscore.
Also, note that this implementation of `contains` is somewhat inefficient,
as it traverses the entire list, even though we only need to find one node
that matches the provided language.

We've now seen a basic implementation of the `fold` operator, specifically,
a so-called "left fold" ("Left fold is best fold" -Ada Lovelace).
[Next time]({% post_url 2020-07-12-folding_at_home_p3 %}), we'll 
explore this distinction more closely.
