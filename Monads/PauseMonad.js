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

let Monad = require (`./Monad.js`);
let DU = require (`../Utils/DiscriminatedUnion.js`);

/* Either a step in a coroutine, or the result of the coroutine.

Example usage:
	let d = PauseMonad.Step.Done (3);
	let p = PauseMonad.Step.Paused (function () { return d; });
	let p_ = p.next ();
	// d.value === 3
	// p_.value === 3
// Tested 20172201
*/
let Step = DU.make_discriminated_union_type (`Step`, {
	'Done' : [`value`],
	'Paused' : [`next`]
});

/* pause
Returns a coroutine that is used to pause another coroutine.

Example usage:
    let m = new PauseMonad.PauseMonad ();
    let code = `
        monad_do (pause (0));
        unit (1);
    `;
    let result = m.monad_eval (code, { 'pause' : PauseMonad.pause });
    let result_ = result ();
    let result__ = result_.next ();
    let result___ = result__.value;
    // result___ === 1
// Tested 20170424 2202

Remarks:
None.

@value - The result of the coroutine.
@return - The coroutine.
*/
function pause (value /* : any */) /* : function */ {
    return function () {
        return Step.Paused (function () {
            return Step.Done (value);
        });
    };
}

/* A Pause monad, which can be used to create a coroutine.

Example usage:
See ../Samples/Coroutine.js.
*/
class PauseMonad extends Monad {
	constructor () {
/* Note we must call super () to use the this keyword. */
		super (`function`);
	}
}

    /* PauseMonad.unit
    Creates a coroutine from a value.
    
    Example usage:
        let m = new PauseMonad.PauseMonad ();
        let code = `unit (1);`;
        let result = m.monad_eval (code);
        let result_ = result ();
        let result__ = result_.value;
        // result__ === 1
    // Tested 20170424 2202

    Remarks:
    None.
    
    @value - The input value.
    @return - The coroutine.
    */
    /* Note we cannot override the parameter types in inherited functions, but we can override the return value types. */
    PauseMonad.prototype.unit = function (value /* : any */) /* : function */ {
        return function () { return Step.Done (value); };
    }

    /* PauseMonad.bind
    Binds the result of a coroutine for the rest of the monadic code.
    
    Example usage:
        let m = new PauseMonad.PauseMonad ();
        let code = `
            bind ('x', pause (1));
            unit (x);
        `;
        let result = m.monad_eval (code, { 'pause' : PauseMonad.pause });
        let result_ = result ();
        let result__ = result_.next ();
        let result___ = result__.value;
        // result___ === 1
    // Tested 20170424 2203

    Remarks:
    None.
    
    @result - The coroutine whose result should be bound.
    @rest - A function that represents the remaining monadic code.
        @value - The contents of @result.
        @return - The result of running the rest of the monadic code.
    @return - The result of running the rest of the monadic code.
    */
	PauseMonad.prototype.bind = function (result /* : function */, rest /* : function */) /* : function */ {
		/* The this keyword is undefined inside the closure. */
		let t = this;
        return function () {
            let result_ = result ();
            if (true === result_.is_Done) {
                return rest (result_.value) ();
            }
            else {
                return Step.Paused (t.bind (result_.next, rest));
            }
        };
    }

    /* PauseMonad.monad_do
    Runs a coroutine.
    
    Example usage:
		let m = new PauseMonad.PauseMonad ();
		let code = `
			monad_do (pause (0));
			unit (1);
		`;
		let result = m.monad_eval (code, { 'pause' : PauseMonad.pause });
		let result_ = result ();
		let result__ = result_.next ();
		let result___ = result__.value;
		// result___ === 1
	// Tested 20170424 2203
    
    Remarks:
    None.
    
    @result - The coroutine to run.
    @rest - A function that represents the remaining monadic code.
        @value - The contents of @result.
        @return - The result of running the rest of the monadic code.
    @return - The result of running the rest of the monadic code.
    */    
    PauseMonad.prototype.monad_do = function (result /* : function */, rest /* : function */) /* : function */ {
        /* No value is bound as a result of this call. rest simply calls Monad.monad_eval_helper (). See Monad.do_helper (). */
        return this.bind (result, rest);
    }

module.exports.Step = Step;
module.exports.pause = pause;
module.exports.PauseMonad = PauseMonad;
