---
layout: post
title: "Folding at Home, Part 4: In Trust we Trust"
date: 2020-07-16
section: horsing
author: WS
---

## Review
[Last time]({% post_url 2020-07-12-folding_at_home_p3 %}) we looked at the
difference between left and right folds. Our initial implementations of the
two looked something like this:

``` scala
@annotation.tailrec
def foldLeft[A, B](as: LinkedList[A], b: B, f: (A, B) => B): B = as match {
  case End => b
  case Node(data, next) => foldLeft(next, f(data, b), f)
}

def foldRight[A, B](as: LinkedList[A], b: B, f: (A, B) => B): B = as match {
  case End => b
  case Node(data, next) => f(data, foldRight(next, b, f))
}
```

We observed that `foldLeft` has a [tail call](https://en.wikipedia.org/wiki/Tail_call),
and therefore can be optimized into a loop by the Scala compiler. By adding the 
[tailrec](https://www.scala-lang.org/api/2.12.2/scala/annotation/tailrec.html)
annotation to `foldLeft`, we, in fact, require the compiler to perform this
optimization, else scuttle the build.

The naïve `foldRight` implementation, however, is not tail-recursive, and is 
likely to overflow the stack for large inputs. This bore out in practice 
when we used these folds to sum up large  lists of integers: `foldLeft` was a 
successful summer, while `foldRight` died ignobly at the hands of a `StackOverflowError`.

The `tailrec` annotation gives you some peace of mind: recursive methods
that successfully compile under this annotation will be implemented
with a loop, and therefore will be stack-friendly. Of course, they can
still call other, less-stack-friendly methods, and can do other fun things
like fail to terminate. For some reason, the Scala team has refused
to add [`@annotation.halts`](https://en.wikipedia.org/wiki/Halting_problem).
For example, here is a perfectly valid tail-recursive function:

``` scala
@annotation.tailrec
def foo: Int = foo
```

## Trusting Trust
Of course, we are [trusting the compiler](https://www.cs.cmu.edu/~rdriley/487/papers/Thompson_1984_ReflectionsonTrustingTrust.pdf) 
to do the right thing here. If we are particularly paranoid, we might
demand additional proof that our `tailrec`-labeled functions are 
indeed being compiled into loops. As with `foldLeft` and `foldRight`, we might
write test cases that challenge our functions with large inputs. To further
cement our confidence, we can go as far as looking at the lower-level code
emitted by the compiler, and verifying that our `tailrec` functions don't
make recursive calls.

I made a few attempts at analyzing the `scalac` compiler artifacts to
find evidence that `tailrec` was working as expected. Namely:

1. Using [`javap`](https://docs.oracle.com/javase/7/docs/technotes/tools/windows/javap.html), 
a standard tool included with the JDK to disassemble class files produced by `scalac`,
and reading the bytecode.

2. Using the [Soot Framework](https://github.com/soot-oss/soot) to produce
[control-flow graphs](https://en.wikipedia.org/wiki/Control-flow_graph) of the
functions from the same class files.

## Obtaining `.class` Files
Both approaches require obtaining the class files produced by the `scalac` compiler.
Fortunately, this is very easy. Here is our test program, `SimpleFolds.scala`:

``` scala
sealed trait LinkedList[+A]
case class Node[A](data: A, next: LinkedList[A]) extends LinkedList[A]
case object End extends LinkedList[Nothing]

object SimpleFolds {
  @annotation.tailrec
  def foldLeft[A, B](as: LinkedList[A], b: B, f: (A, B) => B): B = as match {
    case End => b
    case Node(data, next) => foldLeft(next, f(data, b), f)
  }

  def foldRight[A, B](as: LinkedList[A], b: B, f: (A, B) => B): B = as match {
    case End => b
    case Node(data, next) => f(data, foldRight(next, b, f))
  }

  def main(args: Array[String]): Unit = {
    val intList = Node(1, Node(2, Node(3, Node(4, Node(5, End)))))
    assert(foldLeft(intList, 0, (a: Int, z: Int) => a + z) == 15)
    assert(foldRight(intList, 0, (a: Int, z: Int) => a + z) == 15)
  }
}
```

We can compile this file with:

```
scalac SimpleFolds.java
```

...and in the same directory, we will find a number of class files produced:

```
'End$.class'
End.class
LinkedList.class
'Node$.class'
Node.class
'SimpleFolds$.class'
SimpleFolds.class
```

We won't get into the details of how Scala maps its various objects/classes to Java `.class` files,
but will just accept that somewhere in this collection of files lives the bytecode for our
fold functions.

## Using `javap` to Inspect Bytecode

It happens that `SimpleFolds$.class.il` contains the desired bytecode. We can disassemble 
this class file into bytecode with the `javap` command, as follows:

```
javap -v 'SimpleFolds$.class.il'
```

This will dump the disassembled bytecode to `stdout`, which we can redirect to a file
for convenience. We can find the definition of `foldLeft` without too much difficulty,
though the bytecode itself is not the easiest thing to read. My disassembled `foldLeft`
looked like the following. Note that the disassembler inserted some comments, e.g. to
help identify symbols. I supplemented these comments with my own notes, which I've
marked with triple-slashes (`///`).

```
public <A extends java.lang.Object, B extends java.lang.Object> B foldLeft(LinkedList<A>, B, scala.Function2<A, B, B>);
  descriptor: (LLinkedList;Ljava/lang/Object;Lscala/Function2;)Ljava/lang/Object;
  flags: ACC_PUBLIC
  Code:
    stack=4, locals=10, args_size=4

       /// This first block is the "top" of the loop. If performs
       /// a comparison of the current list node with "End",
       /// jumping to the return statement on success (line 83),
       /// and jumping to the loop body on failure (line 23)
       0: aload_1
       1: astore        6
       3: getstatic     #30                 // Field End$.MODULE$:LEnd$;
       6: aload         6
       8: invokevirtual #34                 // Method java/lang/Object.equals:(Ljava/lang/Object;)Z              
      11: ifeq          20 /// Compares the current node with "End". 
                           /// If the node != End, jump to line 20, else fall through
      14: aload_2
      15: astore        5
      17: goto          83 /// Jump to return
      20: goto          23 /// Jump to loop body

      /// This is the loop body. This performs some type checking, calls the accumulator
      /// function, then jumps back to the top of the loop (line 0)
      23: aload         6
      25: instanceof    #36                 // class Node
      28: ifeq          70
      31: aload         6
      33: checkcast     #36                 // class Node
      36: astore        7
      38: aload         7
      40: invokevirtual #40                 // Method Node.data:()Ljava/lang/Object;
      43: astore        8
      45: aload         7
      47: invokevirtual #44                 // Method Node.next:()LLinkedList;
      50: astore        9
      52: aload         9
      54: aload_3
      55: aload         8
      57: aload_2
      /// This is the call to the accumulator function
      58: invokeinterface #50,  3           // InterfaceMethod scala/Function2.apply:(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
      63: aload_3
      64: astore_3
      65: astore_2
      66: astore_1
      67: goto          0  /// Jump to the next iteration of the loop
      70: goto          73 /// Jump to the error handler

      /// This block seems to be related to error handling
      73: new           #52               
      76: dup
      77: aload         6
      79: invokespecial #55

      /// The return statement of the function.
      83: aload         5
      85: areturn
```

It's not necessary to understand every single bytecode instruction; just by looking at `goto`'s,
we can generally figure out that this function uses a loop. We can also go through the
various function calls (`invokevirtual` and `invokeinterface` instructions) and ensure
the function never calls itself. Fortunately, the disassembler labels these calls with the
original function names, which makes this task easier.

Overall, inspecting the bytecode is not terribly arduous, and gives us good confidences that
`tailrec` is operating as expected, but perhaps we can generate some more human-friendly visuals.

## Using Soot to Generate a Control-Flow Graph
A control-flow graph (CFG) for a given function models its various execution paths. 
Nodes in this graph represent [basic blocks](https://en.wikipedia.org/wiki/Basic_block), 
that is, contiguous sequences of instructions that don't branch. Edges in this graph 
represent branches, e.g. if statements. There are various ways me might generate 
CFGs for our `fold` functions. We could, for example, build them from hand by looking 
at the bytecode output. However, it would be nice if we could generate the CFGs with a tool.

[Soot](https://github.com/soot-oss/soot) is a framework for analyzing and transforming 
Java bytecode, which I've used in the past in various contexts, e.g. to instrument
Android applications. Soot provides fairly easy access to CFG's, so I was
curious if I could use it on class files generated by Scala. Though I ran into a 
few minor issues along the way, this approach more-or-less worked as expected.
These class files, after all, are just bytecode, so we should expect Soot to
handle them like any other bytecode.

I first tried to run Soot directly. I downloaded a JAR distribution from 
[here](https://repo1.maven.org/maven2/org/soot-oss/soot/4.2.1/) (it's easiest 
to use the version "with dependencies"), and ran Soot as follows, in the directory
where my class files were located:

```
java -cp soot-4.2.0-jar-with-dependencies.jar soot.Main -pp -cp . -dump-cfg ALL 'SimpleFolds$'
```

The `-cp .` arguments add the current directory to the Soot class path, so that it
can find the class files I compiled. The `-pp` option ensures that this directory
is _prepended_ to the class path, so that I don't clobber what ever else might be
on the class path. The `-dump-cfg ALL` command will cause a variety of CFG's to
be produced from the various stages of the Soot analysis pipeline. This first,
simplest attempt failed with:

```
soot.SootResolver$SootClassNotFoundException: couldn't find class: scala.Function2 (is your soot-class-path set properly?)
```

This makes sense: we haven't included any of the Scala dependencies on our classpath,
so Soot doesn't know what to do with Scala-related objects like `Function2`. To remedy
this, we can locate the appropriate Scala jar files on our system, and add
them to our `-cp` argument; alternatively, we can simply ask Soot to ignore classes 
it can't locate. This latter option would perhaps be inappropriate if we were attempting
some non-trivial program analysis. But since we are just generating CFG's, it should
be fine. We can accomplish this by adding the `-allow-phantom-refs` option to the command:

```
java -cp /soot/soot-4.2.0-jar-with-dependencies.jar soot.Main -pp -cp . -allow-phantom-refs -dump-cfg ALL 'SimpleFolds$'
```

Unfortunately, this command also failed, this time with a somewhat cryptic error:

```
Caused by: java.lang.RuntimeException: This operation requires resolving level HIERARCHY but scala.runtime.java8.JFunction2$mcIII$sp is at resolving level DANGLING
If you are extending Soot, try to add the following call before calling soot.Main.main(..):
Scene.v().addBasicClass(scala.runtime.java8.JFunction2$mcIII$sp,HIERARCHY);
Otherwise, try whole-program mode (-w).
```

Evidently, Soot was still struggling with some of the Scala types, even with `-allow-phantom-refs` turned on.
I was hopeful that adding the `-w` switch to the command, as suggested by the error message, would 
fix the problem, but this didn't work.

Ultimately, I decided to write a small wrapper program to test out the other recommendation from 
the error message (the `addBasicClass` call). After some tinkering, I found I had to add some
other classes as well. My final wrapper looked like this:

``` java
import soot.Scene;
import soot.SootClass;

public class Runner {
    public static void main(String[] args) {
      Scene.v().addBasicClass("scala.runtime.java8.JFunction2$mcIII$sp", SootClass.HIERARCHY);
      Scene.v().addBasicClass("scala.runtime.java8.JFunction1$mcIII$sp", SootClass.HIERARCHY);
      Scene.v().addBasicClass("scala.runtime.java8.JFunction1$mcII$sp", SootClass.HIERARCHY);
      soot.Main.main(args);
    }
}
```

I compiled this wrapper with:

```
javac -cp soot-4.2.0-jar-with-dependencies.jar Runner.java
```

I now could run the following:

```
java -cp /soot/soot-4.2.0-jar-with-dependencies.jar:. Runner -pp -cp . -allow-phantom-refs -dump-cfg ALL 'SimpleFolds$'
```

...and a whole bunch of `.dot` files representing CFG's were dumped into a `sootOutput` folder! I converted these to pdfs,
and scanned the outputs. I found that a graph labeled "ZonedBlockGraph" was a useful representation for my purposes. It looked
like this, for `foldLeft`:

<div class="m-5" div style="max-width: 500px;">
  <img src="/assets/images/posts/fold4/cfg_left.png" alt="foldLeft CFG" class="img-fluid"/>
</div>

We can see the loop here fairly clearly, as it shows up as a cycle in the control-flow graph. I've colored the back 
edge of the loop red. Compare this with the CFG for `foldRight`, which exhibits no such cycles:

<div class="m-5" div style="max-width: 500px;">
  <img src="/assets/images/posts/fold4/cfg_right.png" alt="foldright CFG" class="img-fluid"/>
</div>

Moreover, we can easily locate the recursive `foldRight` call, boxed in red above.

## Summary

In most cases, it's likely not worth the effort to dive down and examine your Scala program
at the bytecode level. But it's a useful skill to keep in your back pocket. In this case,
it helped us understand better what the `tailrec` annotation was doing, at a low level, and
moreover verify that it was working as expected.

You can recreate this experiment by following the instructions in 
[this repository.](https://github.com/will-snavely/soot-scala-demo)