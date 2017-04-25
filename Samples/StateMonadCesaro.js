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

let StateMonad = require (`../Monads/StateMonad.js`);
let common = require (`./StateMonadCesaroCommon.js`);

/* repeat
Call a stateful function repeatedly, carrying the state from one call to the next and collecting the function results.

Example usage:
TODO2

Remarks:
repeat () is adapted from Haskell's replicateM () function. See:
https://hackage.haskell.org/package/base-4.9.0.0/docs/Control-Monad.html#v:replicateM
https://hackage.haskell.org/package/base-4.9.0.0/docs/src/Control.Monad.html#replicateM

A stateful function has the following signature.
initial state -> updated state * function result
repeat () would itself be a stateful function except for the @f, @n, and @results parameters.

@f - A stateful function.
    @1 - The initial state.
    @return - A tuple.
        @state - The updated state.
        @value - The function result.
@n - The number of times to repeat @f.
@results - The collected results of @f.
@state - The initial state.
@return - A tuple.
    @state - The updated state.
    @value - The function result.
*/
function repeat (f /* : function */, n /* : int */, results /* : Array */, state /* : any */) /* : State */ {
    let m = new StateMonad.StateMonad ();
    let code =
        `if (n <= 0) {` +
            /* Return the final state and the final function result. */
        `    unit (results);
        }
        else {` +
            /* Call the stateful function and get the result. This also updates the state. */
            `bind ('result', f);
            results.push (result);` +
            /* Apply the recursive call to the updated state. */
        `    unit2 (repeat.bind (null, f, n - 1, results));
        }
    `;
	/* Note it seems we cannot name object fields using template strings. */
	let f_ = m.monad_eval (code, {
		'repeat' : repeat,
		'f' : f,
		'n' : n,
		'results' : results
	});
    return f_ (state);
}

/* monte_carlo
Run an experiment and return the ratio of successful trials to total trials.

Example usage:
TODO2

Remarks:
None.

@trials - The number of trials to run.
@experiment - A stateful function.
    @1 - The initial state.
    @return - A tuple.
        @state - The updated state.
        @value - The function result.
@return - The ratio of successful trials to total trials.
*/
function monte_carlo (trials /* : int */, experiment /* : function */) /* : float */ {
    let result = repeat (experiment, trials, [], common.initial_rand_seed);
    /* Discard the final state. */
    let result_ = result.value;
    /* Discard failed trials. */
    let result__ = result_.filter (function (item) { return item });
    let passed = result__.length;
    return passed / trials;
}

/* estimate_pi
Returns an estimate of pi using Cesaro's method.

Example usage:
let result = estimate_pi (100);
// result === 2.847473987257497

let result = estimate_pi (1000);
// result === 3.123475237772121

Remarks:
None.

@trials - The number of trials to run.
@return - The estimate of pi.
*/
function estimate_pi (trials /* : int */) /* : float */ {
    return Math.sqrt (6 / (monte_carlo (trials, common.cesaro)));
}

/* TODO1 n = 10000 exceeds maximum call stack size. Might be due to recursion of repeat? Might the alternate implementation fix this? */
var i = 0;
while (i < 5) {
    console.log (`${estimate_pi (100)}\n`);
    i++;
}
