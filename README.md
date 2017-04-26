# JS Monad
Adds F#-style computation expressions to JavaScript.

JS Monad implements the following monads:
- Maybe
- Either
- Array
- State
- Pause (also known as the Interrupt or Coroutine monad)
- Sequence

For examples of using these monads, see the Samples folder, as well as the code comments in the Monads/*Monad.js files.

JS Monad also lets you implement new monads, and supports the following methods:
- bind (let! in F#)
- monad_do (do! in F#)
- unit (return in F#)
- unit2 (return! in F#)
- zero
- combine
- delay
- run

JS Monad does not yet support the following methods:
- yield
- yield!
- for
- while
- using
- try/with
- try/finally

<h3>Dependencies</h3>
JS Monad was built with Node.js 6.10.2 which supports ECMAScript 2015 (ES6) (see http://node.green/ for details of Node.js support for ECMAScript 2015).

JS Monad uses the following tools, which you do not need to install.
- seedrandom.js by David Bau, https://github.com/davidbau/seedrandom
- PEG.js by David Majda, https://pegjs.org/

<h3>Quick Start</h3>

The quickest way to get started with JS Monad is to download the repository as a .zip file by clicking the "Clone or download" drop down at the right side of the JS Monad Github page, and selecting "Download ZIP." Unzip the repository in a location of your choice. Then simply reference the .js file for the monad you want to use. For example, to use the Maybe monad, you would write:

```
let MaybeMonad = require (`<JS monad repository folder>/Monads/MaybeMonad.js`);
```

You can then write code such as:

```
let m = new MaybeMonad.MaybeMonad ();
let code = `unit (1);`;
let result = m.monad_eval_2 (code);
// result === Option.Some (1)
```

<h3>Known Issues</h3>

- Functions and values that are visible in the scope where monadic code is defined are not visible to the monadic code,
regardless of how they are defined. To reference these functions and values in the monadic code, you must include them in the
context passed to Monad.monad_eval () or Monad.monad_eval_2 (). For example:

```
let m = new MaybeMonad.MaybeMonad ();
let x = 1;
let context = { 'x' : x };
let code = `unit (x);`;
let result = m.monad_eval_2 (code, context);
// result === Option.Some (1);
```

We recommend you use Monad.monad_eval_2 () rather than Monad.monad_eval (), because Monad.monad_eval_2 () adds values to the context that are related to the child monad class. For example, MaybeMonad.monad_eval_2 () adds a reference to the Option type defined in Utils/DiscriminatedUnion.js, so you can use Option.Some () and Option.None in the monadic code.

If you use 'let' in monadic code, the parser translates into the function monad_let (). monad_let () adds a name and value to the context. For example, the following code works.

```
let m = new MaybeMonad.MaybeMonad ()
let code = `
	let x = 1;
	let x = x + 1;
	unit (x);
`;
let result = m.monad_eval_2 (code);
// result === Option.Some (2);
```

The following code also works.

```
let m = new MaybeMonad.MaybeMonad ()
let code = `
	monad_let ('x', 1);
	monad_let ('x', x + 1);
	unit (x);
`;
let result = m.monad_eval_2 (code);
// result === Option.Some (2);
```

- You cannot use control flow constructs in monadic code except the following: if, else if, else.
- You cannot define a function, either named or anonymous, inside monadic code. However, you can reference a named or anonymous function that you include in the context passed to Monad.monad_eval () or Monad.monad_eval_2 (). For example, the following code works.

```
let m = new MaybeMonad.MaybeMonad ();
let context = { 'f' : function (x) { return x + 1; } };
let code = `unit (f (1));`;
let result = m.monad_eval_2 (code, context);
// result === Option.Some (2);
```

- Currently, you should not use escaped quotes in monadic code, as they might not work as expected. For example, the following
code works.

```
let m = new MaybeMonad.MaybeMonad ();
let code = `
console.log ('"Hello world"');
unit (0);
`;
let result = m.monad_eval_2 (code);
```

The following does not work.

```
let m = new MaybeMonad.MaybeMonad ();
let code = `
console.log ('\'Hello world\'');
unit (0);
`;
let result = m.monad_eval_2 (code);
```

<h3>Thank You</h3>

I wrote JS Monad using what I learned from the following people. JS Monad could not exist without them.
- Scott Wlaschin (https://fsharpforfunandprofit.com/series/computation-expressions.html)
- Bartosz Milewski (https://bartoszmilewski.com/2011/01/09/monads-for-the-curious-programmer-part-1/)
- Giulia Costantini and Giuseppe Maggiore (https://www.amazon.com/Friendly-Fun-game-programming-Book-ebook/dp/B005HHYIWC)
- Tomas Petricek (http://tryjoinads.org/docs/computations/layered.html)
