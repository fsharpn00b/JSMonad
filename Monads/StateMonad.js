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

/* The result of running one or more stateful functions. */
class State {
	constructor (state /* : any */, value /* : any */) {
		/* The final state. */
		this.state = state;
		/* The stateful function result. */
		this.value = value;
	}
}

/* A context that is useful to pass to Monad.monad_eval when using StateMonad. */
const state_monad_context = {
	'get_state' : get_state,
	'set_state' : set_state
};

/* get_state
Returns a stateful function that takes the current state and returns it as both the new state and the function result. This is
used to get the current state while running a series of stateful functions.

Example usage:
    let m = new StateMonad.StateMonad ();
    let code = `
        bind ('x', get_state ());
        let x = x + 1;
        monad_do (set_state (x));
        let x = x + 1;
        unit (x);
    `;
    let f = m.monad_eval (code, StateMonad.state_monad_context);
    let state = 1;
    let result = f (state);
    // result.state === 2
    // result.value === 3
// Tested 20170423 0115

Remarks:
A stateful function has the following signature.
initial state -> updated state * function result

@return - A stateful function.
    @state - The current state.
    @return - A State.
        @state - The current state.
        @value - The current state.
*/
function get_state () /* : function */ {
	return function (state /* : any */) /* : State */ {
		return new State (state, state);
	};
}

/* set_state
Returns a stateful function that takes the current state and returns the indicated new state and no function result. This is used
to update the state while running a series of stateful functions.

Example usage:
    let m = new StateMonad.StateMonad ();
    let code = `
        bind ('x', get_state ());
        let x = x + 1;
        monad_do (set_state (x));
        let x = x + 1;
        unit (x);
    `;
    let f = m.monad_eval (code, StateMonad.state_monad_context);
    let state = 1;
    let result = f (state);
    // result.state === 2
    // result.value === 3
// Tested 20170423 0115

Remarks:
A stateful function has the following signature.
initial state -> updated state * function result

@state - The new state.
@return - A stateful function.
    @state - The current state.
    @return - A State.
        @state - The new state.
        @value - null.
*/
function set_state (state /* : any */) /* : function */ {
	return function () /* : state */ {
		return new State (state, null);
	}
}

/* A State monad, which can be used to compose stateful functions.

Example usage:
See ../Samples/StateMonadCesaro.js.
*/
class StateMonad extends Monad {
	constructor () {
/* Note we must call super () to use the this keyword. */
		super (`function`);
	}
}

    /* StateMonad.unit
    Promotes a value to a stateful function.

    Example usage:
        let m = new StateMonad.StateMonad ();
        let code = `unit (1);`;
        let f = m.monad_eval (code, StateMonad.state_monad_context);
        let state = 2;
        let result = f (state);
        // result.state === 2
        // result.value === 1
	// Tested 20170423 1327

    Remarks:
    None.
    
    @value - The value to promote to the stateful function.
    @return - The stateful function.
    */
    StateMonad.prototype.unit = function (value /* : any */) /* : function */ {
		return function (state /* : any */) /* : State */ {
			return new State (state, value);
		};
	}

    /* StateMonad.bind
    Binds the result of a stateful function for the rest of the monadic code.

    Example usage:
        let m = new StateMonad.StateMonad ();
        let code = `
            bind ('x', get_state ());
            let x = x + 1;
            unit (x);
        `;
        let f = m.monad_eval (code, StateMonad.state_monad_context);
        let state = 1;
        let result = f (state);
        // result.state === 1
        // result.value === 2
	// Tested 20170423 1329

    Remarks:
    None.

    @result - The stateful function whose result should be bound.
    @rest - A function that represents the remaining monadic code.
        @value - The contents of @result.
        @return - The result of running the rest of the monadic code.
    @return - The result of running the rest of the monadic code.
    */
    StateMonad.prototype.bind = function (result /* : function */, rest /* : function */) /* : function */ {
		return function (state /* : any */) /* : State */ {
			let new_state = result (state);
			let stateful_f = rest (new_state.value);
			return stateful_f (new_state.state);
		};
	}

    /* StateMonad.monad_do
    Runs a stateful function.

    Example usage:
        let m = new StateMonad.StateMonad ();
        let code = `
            monad_do (set_state (2));
            unit (1);
        `;
        let f = m.monad_eval (code, StateMonad.state_monad_context);
        let state = 1;
        let result = f (state);
        // result.state === 2
        // result.value === 1
	// Tested 20170423 1330

    Remarks:
    None.

    @result - The stateful function to run.
    @rest - A function that represents the remaining monadic code.
        @return - The result of running the rest of the monadic code.
    @return - The result of running the rest of the monadic code.
    */
    StateMonad.prototype.monad_do = function (result /* : function */, rest /* : function */) /* : function */ {
		return function (state /* : any */) /* : State */ {
			let new_state = result (state);
			let stateful_f = rest ();
			return stateful_f (new_state.state);
		};
	}

	/* StateMonad.monad_eval_2
	Calls Monad.monad_eval with the specified code and context. Adds get_state and set_state to the context.

    Example usage:
		let m = new StateMonad.StateMonad ();
		let code = `
			bind ('x', get_state ());
			let x = x + 1;
			monad_do (set_state (x));
			let x = x + 1;
			unit (x);
		`;
		let f = m.monad_eval_2 (code);
		let state = 1;
		let result = f (state);
		// result.state === 2
		// result.value === 3
	// Tested 20170423 2032

    Remarks:
    None.

    @code - The monadic code.
    @context - The values to be defined in the scope of the monadic code.
    @result - The result of running the monadic code.
    */
	/* Note you cannot create an associative array with []. Adding items to the array fails silently. */
	StateMonad.prototype.monad_eval_2 = function (code /* : string */, context = {} /* : object */) /* : option */ {
		context.get_state = get_state;
		context.set_state = set_state;
		return this.monad_eval (code, context);
	}

/* We do not implement Monad.zero (), Monad.combine (), Monad.delay (), or Monad.run (). */

module.exports.State = State;
module.exports.get_state = get_state;
module.exports.set_state = set_state;
module.exports.state_monad_context = state_monad_context;
module.exports.StateMonad = StateMonad;