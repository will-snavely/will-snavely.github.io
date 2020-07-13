---
layout: post
title: "Folding at Home, Part 3: Learning Left from Right"
date: 2020-07-12
section: horsing
author: WS
scripts: ["/assets/js/folding2.js"]
---

Note: The code associated with this post
[can be found here.](https://github.com/will-snavely/foldingathome/blob/master/src/main/scala/leftandright/LeftAndRight.scala)

## Review

[Last time]({% post_url 2020-07-07-folding_at_home_p2 %}) we looked
at a basic implementation of the fold operator, for a simple list data structure.
The core of our code was the following:

```scala
sealed trait Etymology
case class EtymologyNode(word: Word, root: Etymology) extends Etymology
case object End extends Etymology

def fold[V](e: Etymology, v: V, f: (Word, V) => V): V = e match {
  case End =>
    v
  case EtymologyNode(word, root) =>
    fold(root, f(word, v), f)
}
```

This `fold` function works specifically with the `Etymology` data type,
effectively a singly-linked list of `Word` objects. Without too much difficulty,
we can covert this into a _generic_ implementation:

```scala
sealed trait LinkedList[+A]
case class Node[A](data: A, next: LinkedList[A]) extends LinkedList[A]
case object End extends LinkedList[Nothing]

object LeftAndRight {
  def fold[A, B](as: LinkedList[A], b: B, f: (A, B) => B): B = as match {
    case End => b
    case Node(data, next) => fold(next, f(data, b), f)
  }

  def main(args: Array[String]): Unit = {
    val intList: LinkedList[Int] = Node(1, Node(2, Node(3, End)))
    assert(fold(intList, 0, (elem:Int, acc:Int) => elem + acc) == 6)
  }
}
```

We define a new type called `LinkedList`, which takes a type parameter named
`A`. Adding this type parameter allows us to create lists containing any
kind of data we desire. We can create a `LinkedList[Int]` to represent a list
of integers, a `LinkedList[Word]` to represent a simple etymology, or a
`LinkedList[Animal]` to catalog our pets—save, tragically, for pet rocks.
Static typing can be rather exclusionary at times.

(Note: The `+` in the type parameter makes `A`
[_covariant_](https://docs.scala-lang.org/tour/variances.html).
In brief, this means our `LinkedList` type will exhibit "natural"
or "intuitive" behavior with respect to subtyping. If `B` is a
subtype of `A`, then `LinkedList[B]` will be a subtype of `LinkedList[A]`.
One reason for using covariance here is to facilitate a clean
implementation of the `End` type. Notice that `End` extends from
`LinkedList[Nothing]`. `Nothing` is a special type in Scala
representing the [_bottom_](https://en.wikipedia.org/wiki/Bottom_type)
of the type system, meaning that `Nothing` type is a subtype of every
other type. Since `LinkedList` is covariant, a `Node[Int]` can safely
have a `next` element of type `End`—a.k.a. `LinkedListList[Nothing]`—because `Nothing`
is a subtype of `Int`, and thus `LinkedListList[Nothing]`
is a subtype of `LinkedListList[Int]`.)

## Doubling Up

Suppose now that we wish to write a function `doubleUp`, which takes a
`LinkedList` and returns a new `LinkedList` where every element is
repeated. For example:

```scala
val intList: LinkedList[Int] = Node(1, Node(2, Node(3, End)))
assert(doubleUp(intList)) == Node(1, Node(1, Node(2, Node(2, Node(3, Node(3, End))))))
```

Perhaps we can use our `fold` operator. The following seems reasonable on the surface:

```
def doubleUp[A](as: LinkedList[A]): LinkedList[A] =
  fold(as, End, (elem: A, acc: LinkedList[A]) => Node[A](elem, Node(elem, acc)))
```

We turn each `Node` into two nodes, and add them to an accumulator whose initial value is
the empty list (`End`). Unfortunately, our assertion fails with this implementation. If
we print the value returned by this function, we find:

```
Node(3,Node(3,Node(2,Node(2,Node(1,Node(1,End))))))
```

Whoops. We have an ordering problem. This becomes apparent when we trace the function
execution:

```
Initial Accumulator Value: End

Fold encounters the value "1"
New Accumulator Value: Node(1, Node(1, End))

Fold encounters the value "2"
New Accumulator Value: Node(2, Node(2, Node(1, Node(1, End))))

Fold encounters the value "3"
New Accumulator Value: Node(3, Node (3, Node(, Node(2, Node(1, Node(1, End))))))
```

There are a number of ways we might address this issue. For example, we might simply write
a `reverse` function that flips the order of a given list. Alternatively, we might
be able to tweak our `fold` function to handle this scenario. It would be sufficient to
start folding from the right side of the list instead of the left; that is, process "3"
first instead of "1", in the above example.

## Folding From the Right

This `fold` variation, which we might call `foldRight`, can be implemented as follows:

```scala
def foldRight[A, B](as: LinkedList[A], b: B, f: (A, B) => B): B = as match {
  case End => b
  case Node(data, next) => f(data, foldRight(next, b, f))
}
```

This is very similar to the original `fold` function, save for the recursive case.
Instead of immediately evaluating `f` with the value of the current node and the
passed-in accumulator, we instead recurse first, and pass the value returned by the
recursive call into `f`, along with the current `data` element. The `doubleUp`
function can now be written as:

```scala
def doubleUp[A](as: LinkedList[A]): LinkedList[A] =
  foldRight(as, End, (elem: A, acc: LinkedList[A]) => Node[A](elem, Node(elem, acc)))
```

And now our assertion passes. The following widget demonstrates how the two
variations of `fold` behave in the `doubleUp` scenario. Note that, for the
sake of brevity, we omit `Node` when describing a list, e.g., the list
`Node(1,Node(2,Node(3, End)))` is written simply as `(1, (2, (3, End)))`.

<div class="row">
  <div class="col-md-12 mb-5 px-5">
    <div style="max-width: 1000px;">
      <div id="fold2"></div>
    </div>
  </div>
</div>

## Right Fold, Left Fold: Which Fold Best Fold?

To recap, here are our two fold variations:

```scala
def foldLeft[A, B](as: LinkedList[A], b: B, f: (A, B) => B): B = as match {
  case End => b
  case Node(data, next) => foldLeft(next, f(data, b), f)
}

def foldRight[A, B](as: LinkedList[A], b: B, f: (A, B) => B): B = as match {
  case End => b
  case Node(data, next) => f(data, foldRight(next, b, f))
}
```

Let's try a little experiment. To start, we will implement a function called
`range`, which produces a `LinkedList` of all the integers in a given
range (inclusive). For example, `range(1,3)` should return the list
`(1, (2, (3, End)))`.

There are a few ways we might implement such a function, e.g. a
straightforward recursive implementation. But we are going to be a little
particular. Here is the code:

```scala
def range(from: Int, to: Int): LinkedList[Int] = {
  @annotation.tailrec
  def helper(cur: Int, acc: LinkedList[Int]): LinkedList[Int] =
    if (cur < from) acc
    else helper(cur - 1, Node(cur, acc))

  helper(to, End)
}
```

Our implementation is still recursive, but makes use of a helper function to
carry out the recursion. Notably, this helper function is marked with a special
[annotation](https://docs.scala-lang.org/tour/annotations.html), `@annotation.tailrec`.
This annotation informs the Scala compiler that the function `helper` is
[tail-recursive](https://en.wikipedia.org/wiki/Tail_call). Without getting too
far into the weeds, this means that the compiler can safetly and easily
rewrite the recursive function as a simple iterative loop. As a result, we can
generate very large lists without running into [stack overflow](https://en.wikipedia.org/wiki/Stack_overflow)
problems. It is fairly easy to identify a tail-recursive function: when a
recursive call occurs, it must be the very last operation. For example, the
following implementation of `range`, while nice and concise, is not tail-recursive,
and would invariably generate stack overflows if asked to construct
sufficiently large ranges:

```scala
def range(from: Int, to: Int): LinkedList[Int] =
  if (from <= to) Node(from, range(from + 1, to))
  else End
```

The reason: things happen in the function after the recursive call to `range`.
Namely the return value of the recursive call is packaged up into a `Node` element.
Compare this with the first implementation of range, where nothing happens following the
recursive call.

Let's fold up some ranges. For now, let's stick to simple summation. Say
we want to sum up the first ten-thousand integers, using a `fold`. Note that there is a
[simple formula](https://en.wikipedia.org/wiki/1_%2B_2_%2B_3_%2B_4_%2B_%E2%8B%AF)
for computing such a sum, which we will use to write the following assertion:

```scala
assert(
  foldLeft(range(0, 10000), 0, (elem:Int, acc:Int) => elem + acc)
  == (10000 * 10001) / 2
)
```

This works as expected. What if we switch to `foldRight`? Since addition is commutative,
order shouldn't matter when computing this sum, and we might expect `foldRight` to work just
as well as `foldLeft` here.

```scala
assert(
  foldRight(range(0, 10000), 0, (elem:Int, acc:Int) => elem+acc)
  == (10000 * 10001) / 2
)
```

The result:

```
Exception in thread "main" java.lang.StackOverflowError
  at FoldTest$.foldRight(Test.scala:15)
  at FoldTest$.foldRight(Test.scala:15)
  at FoldTest$.foldRight(Test.scala:15)
  at FoldTest$.foldRight(Test.scala:15)
  ...
```

Given what we just learned about tail-recursion, this makes sense. Even though we didn't
mark `foldLeft` as tail-recursive, it very plainly is such a function, since the recursive
call is the last statement of the function (at least, in the recursive case). The Scala compiler
apparently figured this out, and was able to rewrite `foldLeft` as a loop. We can verify this by
looking at the compiled bytecode for these functions, but since that is somewhat involved,
we'll save it for a later date. Suffice to say, our observations support that idea that
`foldLeft` is compiled into a loop, while `foldRight` is compiled into true recursive function.
This occurs because `foldLeft` is tail-recursive, while `foldRight` is not. Therefore, when
we try to apply `foldRight` to a large-ish list, we hit a `StackOverflowError`.

Perhaps, then, we should simply try to avoid using `foldRight`—except, in some cases, like
`doubleUp`, it seems like the "natural" kind of fold to apply to the problem. Is there a way
we can keep `foldRight` and avoid stack overflows?

## Righting `foldRight`

It turns out there are a number of things we can do to improve our implementation of
`foldRight`. The first, and perhaps simplest idea, is one that was already suggested:
to `foldRight`, we can simply reverse the list, the apply a `foldLeft`:

```scala
def foldRightWithReverse[A, B](as: LinkedList[A], b: B, f: (A, B) => B): B =
  foldLeft(reverse(as), b, f)
```

It remains to implement a stack-safe version of reverse. In fact, we've already seen one.
Our initial `doubleUp` implementation reversed the input list. Therefore, we can simply
use the same idea, without the doubling-up aspect:

```
def reverse[A](as: LinkedList[A]): LinkedList[A] =
  foldLeft(as, End, (elem:A, acc:LinkedList[A]) => Node(elem, acc))
```

Since `foldLeft` is tail-recursive, `reverse` will be stack-safe. The following assertion should
now pass without any exceptions.

```
assert(
  foldRightWithReverse(range(0, 10000), 0, (elem: Int, acc: Int) => elem + acc)
  == (10000 * 10001) / 2
)
```

It appears, strangely, that two lefts make a right.

## A Stranger `foldRight`

There's another, stranger way to write `foldRight` in terms of `foldLeft` which is:

1. Extremely convoluted
2. Not remotely stack safe
3. Purely of academic interest
   
Therefore—naturally—we will spend an inordinate amount of time trying to
understand this other, "strange" approach.

To help us get there, let's first introduce another common
[higher-order function](https://en.wikipedia.org/wiki/Higher-order_function)
called `map`. The [`map` function](<https://en.wikipedia.org/wiki/Map_(higher-order_function)>)
takes a list, and constructs a new list by applying a function to each element.
For example, we could take a list of integers, and build
a new list consisting of those integers plus 1; or those integers squared; or whatever
other kind of transformation you can imagine (transforming to a different type is
acceptable as well). There are a number of ways we could go
about implementing `map`. Here is a stack-safe approach based on `foldLeft` and
`reverse` (which looks suspiciously similar to our first refactor of `foldRight`).
Feel free to study this implementation, though it's not central to
this example. It should suffice to understand what `map` accomplishes,
fundamentally.

```scala
def map[A, B](as: LinkedList[A], f: A => B): LinkedList[B] =
  foldLeft(reverse(as), End, (a:A, b:LinkedList[B]) => Node(f(a), b))

def main(args: Array[String]): Unit = {
  // Add 1 to the integers 0-10 to get the integers 1-11
  assert(map(range(0,10), (x:Int) => x+1) == range(1,11))
}
```

As noted, our `map` implementation can transform list elements to
an arbitrary type, called `B` above. `B` can even be a function type, 
if desired. Consider this strange looking transformation:

```scala
def strangeTransform[A, B](as: LinkedList[A], f: (A, B) => B): LinkedList[B => B] =
  map(as, (a: A) => ((b: B) => f(a, b)))
```

This is a bit of a tongue-twister, function-wise, so let's go through it slowly.
The `strangeTransform` function takes two arguments:

1. A `LinkedList[A]`
2. A function `f` of two arguments (of type `A` and `B`, respectively),
   which returns something of type `B`

`strangeTransform` itself returns a `LinkedList` containing _functions_;
specifically, functions that take a `B` and return a `B`. To build this
result, we use the `map` operator to transform each element
of the input list (of type `A`) into a function; specifically, a
function that takes some `B`, then calls `f` with the list element
and the given `B`. Here's a diagram that hopefully helps to untangle
what's going on here. We further simplify our list syntax to
square-bracket notation, dispensing with the mess of parentheses.

<div class="row text-center mb-3 mt-3">
  <div class="col-md-12">
    <img src="/assets/images/posts/fold3/strangeTransform.png" alt="Strange Transform" class="img-fluid" style="max-width: 500px;"/>
  </div>
</div>

Now that we have a list of functions, we'll do the [same thing we've been
doing with every list](https://www.youtube.com/watch?v=2B3slX6-_20): `fold` it.
It's natural to apply fold to a list of integers, since there are many
ways to "accumulate" integers, e.g. sum and product. But, how do we apply
fold to a list of functions? In other words: how do we take two functions
and combine them together to make another function?

One answer: [function composition](https://en.wikipedia.org/wiki/Function_composition).
If we have a function `f:A=>B`, and a function `g:B=>C`, we can make a third function
`h:A=>C`, where `h(a) = g((f(a)))`. Note that there are rather precise requirements
for the domains of `f` and `g` if we wish to compose them. Namely, `f` must return
a value that we can legally pass into `g` (is a member of `g`'s domain, in other words).

Our `strangeTransform` produces a list of functions that take and return `B`'s, therefore
we can certainly compose these functions together. Here's what that might look like:

```
def strangeComposition[A, B](as: LinkedList[A], f: (A, B) => B): B => B =
  foldLeft(
    strangeTransform(as, f),
    (b: B) => b,
    (cur: B => B, acc: B => B) => (b: B) => acc(cur(b))
  )
```

This `strangeComposition` function takes a list and a function, applies the
`strangeTransform`, then aggregates the list of functions resulting
from this transform together using composition. The end-result of this
is a single function of type `B=>B`. Note that the initial accumulator
value here is the [identify function](https://en.wikipedia.org/wiki/Identity_function),
that is, a function that simply returns its argument. This is analogous to
using the additive identity (zero) for the initial value when performing an
integer sum. Also, note that we perform the composition in a specific order.
Namely, we evaluate the `cur` function first, then pass the result to
the accumulator function. We could compose these functions in the
other direction, but it would end up causing us problems, as we'll
soon see. Let's extend our diagram to illustrate what we've constructed:

<div class="row text-center mb-3 mt-3">
  <div class="col-md-12">
    <img src="/assets/images/posts/fold3/strangeTransform2.png" alt="Strange Transform" class="img-fluid" style="max-width: 500px;"/>
  </div>
</div>

The last line in this diagram is awfully close to the definition of the
`foldRight` operator. All we need to do is pass in our initial 
accumulator value, and we have it exactly.

```
def strangeFoldRight[A, B](as: LinkedList[A], z: B, f: (A, B) => B): B =
  strangeComposition(as, f)(z)
```

To reiterate, this implementation is not particularly practical. For instance, it isn't
stack safe, since it builds up a long chain of composed functions, each link of which
will require its own stack frame. But it is an interesting object to study, in the
service of understanding higher-order functions. Here is a more compact version
of this implementation:

```scala
def strangeFoldRightCompact[A, B](as: LinkedList[A], z: B, f: (A, B) => B): B = {
  foldLeft(as,
    (b: B) => b, // Identify function
    (a: A, g: B => B) => (b: B) => g(f(a, b)) // Composition
  )(z)
}
```

To quickly close a loop: the order of composition matters in the accumulation function
within `strangeComposition`, because if we flip the order we simply end up back at `foldLeft`!