---
layout: post
title: "Folding at Home, Part 3: Learning Left from Right"
date: 2020-07-12
section: horsing
author: WS
scripts: ["/assets/js/folding2.js"]
---

(Note: The final code associated with this post
[can be found here.](https://github.com/will-snavely/etymologyfun/blob/master/src/main/scala/EtymologyFun1.scala))

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

object FoldTest {
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
have a `next` element of type `End`—a.k.a. `List[Nothing]`—because `Nothing`
is a subtype of `Int`, and thus `List[Nothing]` is a subtype of `List[Int]`.)



<div class="row">
  <div class="col-md-12 px-5">
    <div style="max-width: 1000px;">
      <div id="fold2"></div>
    </div>
  </div>
</div>
