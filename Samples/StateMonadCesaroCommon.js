/* Copyright 2017 FSharpN00b.
This file is part of JS Monad.

JS Monad is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

JS Monad is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with JS Monad.  If not, see <http://www.gnu.org/licenses/>. */

/* See:
http://www.w3schools.com/js/js_strict.asp
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/
`use strict`;

let fs = require (`fs`);
let vm = require (`vm`);
function include (path) {
	let code = fs.readFileSync (path, `utf-8`);
	vm.runInThisContext (code, path);
}
include (`../Utils/seedrandom.min.js`);

let StateMonad = require (`../Monads/StateMonad.js`);

/* This is an implementation of the Cesaro method for estimating pi, based on the implementation provided in Structure and
Interpretation of Computer Programs (SICP) by Abelson and Sussman.

Abelson and Sussman use their Cesaro method implementation to show that we sometimes need mutation to separate management of
state (in this case, a random number seed) from the rest of a program. However, they were reckoning without the State monad,
which lets us handle state management abstractly.

This file contains the functions used by both StateMonadCesaro.php and StateMonadCesaroAlt.php. Those files provide alternate
implementations of Haskell's replicateM () function.

See:
SICP (text).
https://mitpress.mit.edu/sicp/full-text/book/book-Z-H-20.html#%_sec_3.1.2
SICP (video). See 1:10:40 for a listing of the Cesaro program without mutation or the State monad.
https://www.youtube.com/watch?v=jl8EHP1WrWY&list=PLB63C06FAF154F047&index=9
Haskell implementation that uses the State monad instead of mutation.
https://pbrisbin.com/posts/random_numbers_without_mutation/
*/

const initial_rand_seed = 0;

/* get_rand
Generates a pseudo-random number based on a seed.

Example usage:
let result = get_rand (0);
// result.state === 343042523274361
// result.value === 343042523274361

Remarks:
get_rand () simulates a pure pseudo-random number generator such as you might find in a functional language.
A pure function (1) has no side effects such as mutation, input or output, and (2) is referentially transparent; that is, when
applied to a given value, it always returns the same result.
A pure function cannot generate a true random number. To do so, (1) it would require input, which is a side effect, and (2) it
would not return the same result every time, so it would not be referentially transparent.

Our implementation of the Cesaro method starts with a random number seed of 0. Thereafter, it uses the previously generated
random number as the seed for the next.

For more information see:
https://programmers.stackexchange.com/questions/202908/how-do-functional-languages-handle-random-numbers
https://secure.php.net/manual/en/function.mt-srand.php

This is a stateful function. A stateful function has the following signature.
initial state -> updated state * function result

@rand_seed - The random number seed.
@return - A tuple.
    @state - The updated random number seed.
    @value - A pseudo-random number.
*/
function get_rand (seed /* : int */) /* : State */ {
	/* seedrandom.min.js adds this method to the Math namespace. */
	let rng = new Math.seedrandom (seed);
	let result = Math.floor (rng () * Number.MAX_SAFE_INTEGER);
	/* This is the impure way to get a random number. */
//	let result = Math.floor (Math.random () * (Number.MAX_SAFE_INTEGER));
    return new StateMonad.State (result, result);
}

/* gcd
Returns the greatest common denominator of two numbers.

Example usage:
let result = gcd (2, 4);
// result === 2

Remarks:
None.

@x - The first number.
@y - The second number.
@return - The greatest common denominator of @x and @y.
*/
function gcd (x /* : int */, y /* : int */) /* : int */ {
    if (0 === y) {
        return x;
    }
    else {
        return gcd (y, (x % y));
    }
}

/* cesaro
Returns true if two pseudo-random numbers are both prime numbers.

Example usage:
result = cesaro (0);
// Starting with random number seed 0, the first two pseudo-random numbers returned by get_rand are 343042523274361,
// 6539011516300175, both of which are prime numbers.
// result === true

Remarks:
This is a stateful function, as it has the following signature. 
initial state -> updated state * function result

@rand_seed - A random number seed.
@return - A tuple.
    @state - The updated random seed.
    @value - True if both pseudo-random numbers are prime numbers.
*/
function cesaro (rand_seed /* : int */) /* : State */ {
    let result1 = get_rand (rand_seed);
    let result2 = get_rand (result1.state);
    return new StateMonad.State (result2.state, (1 === gcd (result1.value, result2.value)));
}

module.exports.initial_rand_seed = initial_rand_seed;
module.exports.cesaro = cesaro;