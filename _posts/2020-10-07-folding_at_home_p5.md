---
layout: post
title: "Folding at Home, Part 5: Benchmarking with JMH"
date: 2020-10-07
section: horsing
author: WS
---

If you investigate the `fold` function (in it's [various flavors)]({% post_url 2020-07-12-folding_at_home_p3 %}) 
in the Scala standard library, you'll invariably notice that different collection interfaces provide subtly 
different implementations of this higher-order function. The ostensible reason: performance. 

Consider, for example, [this commit to the Scala collections library](https://github.com/scala/scala/commit/cc53ceeb6f17fd9606e09d04b0d4b41a36348e90).
The commit message reads: "Removing a couple of indirection levels gives some speed-up." Among the changes
is an [implementation of `foldLeft`](https://github.com/scala/scala/commit/cc53ceeb6f17fd9606e09d04b0d4b41a36348e90#diff-5a049159e1e7e3d60de15cc9f61333f1R123)
catered to the [`LinearSeq` trait](https://www.scala-lang.org/api/current/scala/collection/LinearSeq.html), 
specifically:

```scala
override def foldLeft[B](z: B)(op: (B, A) => B): B = {
  var acc = z
  var these: LinearSeq[A] = coll
  while (!these.isEmpty) {
    acc = op(acc, these.head)
    these = these.tail
  }
  acc
}
```

This overrides a more general version of the function, 
[found in the `IterableOnce` trait](https://github.com/scala/scala/blob/2.13.x/src/library/scala/collection/IterableOnce.scala#L632):

```scala
def foldLeft[B](z: B)(op: (B, A) => B): B = {
  var result = z
  val it = iterator
  while (it.hasNext) {
    result = op(result, it.next())
  }
  result
}
```

Before comparing these functions, note that both use `while` loops, unlike [our implementations]({% post_url 2020-07-12-folding_at_home_p3 %}),
which used recursion and relied on [tail optimization]({% post_url 2020-07-16-folding_at_home_p4 %}) to avoid
stack problems. On one hand, this demonstrates Scala's flexibility: one can freely move back and forth between
imperative and functional styles, based on what one deems appropriate for a given situation. On the other hand,
I can't help but feel betrayed. Implementing a key, higher-order function with a `while` loop is nothing
short of blasphemy. We must inform the Office of Functional Purity, and summon a terrible Inquisition upon the
heads of the unfaithful Scala library maintainers.

Perhaps "betrayed" is a strong word. These iterative `foldLeft` implementations are imminently reasonable and 
comprehensible. Perhaps it's simply a touch amusing that Scala goes to great lengths to make recursive functions 
efficient, yet, internally, shies away from using them.

Which brings us back to the topic of optimization. Presumably, a loop was chosen here for the sake
of efficiency, a perfectly valid concern in the standard collections library of a programming language. With that
in mind, let's that a closer look at the two `foldLeft` implementations above.

The first version steps through a `LinearSeq` using the `head` and `tail` fields, while the second uses 
an iterator to accomplish the same thing. The motivation behind the `LinearSeq` version seems to be that
the iterator-based approach introduces unnecessary overhead via additional function calls, e.g. to 
`next` and `hasNext`. One can simply use `tail` and `isEmpty` directly, instead of invoking them
indirectly through the iterator functions. 

This brings us, at last, to the question I would like to address in this post: is the optimization here
at all meaningful? The git commit doesn't offer any quantitative data to support the changes, but
perhaps we can generate some on our own. That is, we'd like to measure the performance of these functions
under various conditions, and come to some conclusions about their relative efficiency. This is better
known as [benchmarking](https://en.wikipedia.org/wiki/Benchmark_(computing)).

## Enter JMH
[JMH, or the Java Microbenchmark Harness](https://github.com/openjdk/jmh), is a framework one
can use to build benchmarks for JVM programs. We'll show how to use this tool to build a simple 
benchmark for the different incarnations of `foldLeft`. Since I am evaluating a Scala
application, I will use the [sbt-jmh](https://github.com/ktoso/sbt-jmh) plugin, which builds
on top of JMH.

### Basic Project Layout
As the name suggests, `sbt-jmh` is meant to be used with a [Scala `sbt` project](https://www.scala-sbt.org/). My simple project
setup looks like this:

```
├── build.sbt
├── project
│   ├── build.properties
│   └── plugins.sbt
└── src
    └── main
        └── scala
            └── benchmark
                └── FoldBenchmark.scala
```

My `built.sbt` file is rather simple; all it needs to do is call the `enablePlugins` function:

```
name := "Benchmark"
version := "0.1"
scalaVersion := "2.13.3"
enablePlugins(JmhPlugin)
```

The `plugins.sbt` file tells the build system which version of the JMH plugin should be installed:

```
addSbtPlugin("pl.project13.scala" % "sbt-jmh" % "0.3.7")
```

...and the `build.properties` file simple contains information about the `sbt` version.

```
sbt.version = 1.3.13
```

## The Benchmark
Our JMH benchmark will have two parts: a state class that describes the inputs
for a given benchmark invocation (in this case, the size of the list we are 
folding), and individual benchmark functions that call the desired fold variant.

### Benchmark State
The `BenchmarkState` class below defines some state that is applied to
each individual benchmark we write. For this particular application, we want to run 
each function with different input sizes. To accomplish this,
we define a field with the `@Param` annotation, and initialize
that annotation with an `Array` of possible values.

```scala
@State(Scope.Benchmark)
class BenchmarkState {
  @Param(Array(
    "1000",
    "10000",
    "100000",
    "1000000",
    "10000000"))
  var inputSize: Int = _

  var testSeq: LinearSeq[Int] = _

  @Setup(Level.Trial)
  def prepare(): Unit = {
    testSeq = LinearSeq.range[Int](0, inputSize)
  }
}
```

Note that the input array contains strings; I'm not entirely sure
why strings are required here, but I assume these values are at
some point passed to a sub-invocation of the JVM as command-line
arguments. At any rate, we can define the field representing a 
given input as in `Int`, and values will be converted appropriately.

Next, we define a function annotated with the `@Setup` annotation,
which gets called at the start of each benchmark. This function
simply creates a `LinearSeq` of size determined by the current
`inputSize`.

### Benchmark Functions
Our individual benchmarks are implemented in a separate class, in functions with
the `@Benchmark` annotation, e.g.:

```scala
class FoldBenchmark {
  @Benchmark
  def foldLeftIteratorBaseline(state: BenchmarkState): Int = {
    state.testSeq.iterator.foldLeft(0)(_ + _)
  }

  @Benchmark
  def foldLeftLinearSeqBaseline(state: BenchmarkState): Int = {
    state.testSeq.foldLeft(0)(_ + _)
  }
}
```

Inside each benchmark, we simply call the desired `foldLeft`. Note that an
instance of `BenchmarkState` is passed to the function, which we
use to access the current input.

For fun, let's put in one more benchmark: a recursive implementation of 
`foldLeft` with tail-optimization turned on:

```scala
@annotation.tailrec
final def foldLeft[A,B](as: LinearSeq[A], z: B)(f : (B,A) => B): B =
  if (as.isEmpty) z
  else foldLeft(as.tail, f(z, as.head))(f)

@Benchmark
def foldLeftRecursiveBaseLine(state: BenchmarkState): Int = {
  foldLeft(state.testSeq, 0)(_ + _)
}
```

### Running the Benchmark
We can run the benchmark by invoking the following command from the project root:
```
sbt jmh:run
```

Note that this can take a very long time (hours), depending on the configuration of the
benchmarks. By default, JMH will measure _throughput_; that is, the number of times
the program can run over a given unit of time. This entails running the program
many times. JMH also does things like "warmup" each JVM instance before collecting
data (by doing dry-runs of your benchmark), to avoid measurements being affected
by JVM operations like class loading (perhaps also to give the JVM an opportunity
to apply [just-in-time optimizations](https://en.wikipedia.org/wiki/Just-in-time_compilation)).
All of this contributes to a rather hefty runtime for the benchmark itself.

## Results

At the end of it's run, JMH spits out a summary like the following:
```
[info] FoldBenchmark.foldLeftIteratorBaseline          1000  thrpt   25  330731.361 ± 3508.192  ops/s
[info] FoldBenchmark.foldLeftIteratorBaseline         10000  thrpt   25   31538.970 ±  255.618  ops/s
[info] FoldBenchmark.foldLeftIteratorBaseline        100000  thrpt   25    2715.065 ±  130.792  ops/s
[info] FoldBenchmark.foldLeftIteratorBaseline       1000000  thrpt   25     206.659 ±    7.558  ops/s
[info] FoldBenchmark.foldLeftIteratorBaseline      10000000  thrpt   25      21.186 ±    0.312  ops/s
[info] FoldBenchmark.foldLeftLinearSeqBaseline         1000  thrpt   25  316580.885 ± 1348.899  ops/s
[info] FoldBenchmark.foldLeftLinearSeqBaseline        10000  thrpt   25   30744.543 ±  515.116  ops/s
[info] FoldBenchmark.foldLeftLinearSeqBaseline       100000  thrpt   25    2702.528 ±   43.966  ops/s
[info] FoldBenchmark.foldLeftLinearSeqBaseline      1000000  thrpt   25     191.799 ±    5.364  ops/s
[info] FoldBenchmark.foldLeftLinearSeqBaseline     10000000  thrpt   25      21.066 ±    0.305  ops/s
[info] FoldBenchmark.foldLeftRecursiveBaseLine         1000  thrpt   25  340990.156 ± 2884.475  ops/s
[info] FoldBenchmark.foldLeftRecursiveBaseLine        10000  thrpt   25   32189.315 ±  288.115  ops/s
[info] FoldBenchmark.foldLeftRecursiveBaseLine       100000  thrpt   25    2592.348 ±   88.177  ops/s
[info] FoldBenchmark.foldLeftRecursiveBaseLine      1000000  thrpt   25     200.300 ±    8.842  ops/s
[info] FoldBenchmark.foldLeftRecursiveBaseLine     10000000  thrpt   25      21.819 ±    0.311  ops/s
```

Summarizing this in a table:
<table id="tablePreview" class="table table-striped table-bordered">
  <thead>
    <tr>
      <th>Function</th>
      <th>Input Size 10^3 (ops/s)</th>
      <th>Input Size 10^4 (ops/s)</th>
      <th>Input Size 10^5 (ops/s)</th>
      <th>Input Size 10^6 (ops/s)</th>
      <th>Input Size 10^7 (ops/s)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">LinearSeq foldLeft</th>
      <td>316580.885 ± 1348.899</td>
      <td>30744.543 ± 515.116</td>
      <td>2702.528 ± 43.966</td>
      <td>191.799 ± 5.364</td>
      <td>21.066 ± 0.305</td>
    </tr>
    <tr>
      <th scope="row">Iterator foldLeft</th>
      <td>330731.361 ± 3508.192</td>
      <td>31538.970 ± 255.618 </td>
      <td>2715.065 ± 130.792</td>
      <td>206.659 ± 7.558</td>
      <td>21.186 ± 0.312</td>
    </tr>
    <tr>
      <th scope="row">Recursive foldLeft</th>
      <td>340990.156 ± 2884.475</td>
      <td>32189.315 ± 288.115</td>
      <td>2592.348 ± 88.177</td>
      <td>200.300 ± 8.842</td>
      <td>21.819 ± 0.311</td>
    </tr>
  </tbody>
</table>

There is very little difference between the throughput of these
functions. Different benchmarks might expose different results, and more
study is required, but on the face of things  it appears that the Scala compiler and 
JVM runtime-JIT do a reasonable job of making these three implementations
roughly equivalent, performance-wise.

You can run this demo yourself by checking out the instructions at 
[this repository](https://github.com/will-snavely/BenchmarkTest).