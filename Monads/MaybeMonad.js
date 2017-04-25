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
let Option = DU.Option;

/* A Maybe monad, which can be used to compose functions that return the option type.

Example usage:
	function div_by (a, b) {
		if (0 === b) {
			return Option.None;
		}
		else {
			return Option.Some (a / b);
		}
	}

	let m = new MaybeMonad.MaybeMonad ();
	let result = m.monad_eval_2 (`
		bind ('x', div_by (10.0, 5.0));
		bind ('y', div_by (20.0, x));
		bind ('z', div_by (10.0, y));
		unit (z);
	`, { 'div_by' : div_by });
    // z === Option.Some (1)
// Tested 20170424 2106

Note that without the Maybe monad, the code above would look like the following.
    var result = div_by (10.0, 5.0);
    if (true === result.is_Some) {
        var x = result.value;
    }
    else {
        return;
    }

    result = div_by (20.0, x);
    if (true === result.is_Some) {
        var y = result.value;
    }
    else {
        return;
    }

    result = div_by (10.0, y);
    if (true === result.is_Some) {
        var z = result.value;
    }
    else {
        return;
    }
    // z === 1
// Tested 20170424 2107
*/
class MaybeMonad extends Monad {
}

	/* MaybeMonad.unit
    Promotes a value to the option type.

    Example usage:
        let m = new MaybeMonad.MaybeMonad ();
        let code = `unit (1);`;
        let result = m.monad_eval_2 (code);
        // result === Option.Some (1)
	// Tested 20170424 2117

    Remarks:
    None.
    
    @value - The value to promote to the option type.
    @return - The option type value.
    */
    MaybeMonad.prototype.unit = function (value /* : any */) /* : option */ {
		return Option.Some (value);
	}

    /* MaybeMonad.bind
    Binds the contents of an option value for the rest of the monadic code. If the option value is Some, this function runs the
	rest of the monadic code. If the option value is None, this function returns None.

    Example usage:
        let m = new MaybeMonad.MaybeMonad ();
        let code = `
            bind ('x', Option.Some (1));
            let x = x + 1;
            unit (x);
        `;
        let result = m.monad_eval_2 (code);
        // result === Option.Some (2);
	// Tested 20170424 2117

    Remarks:
    None.

    @result - The option value whose contents should be bound.
    @rest - A function that represents the remaining monadic code.
        @value - The contents of @result.
        @return - The result of running the rest of the monadic code.
    @return - If @result is Some, @return is the result of running rest of the monadic code. If @result is None, @return is
	@result.
    */
    MaybeMonad.prototype.bind = function (result /* : option */, rest /* : function */) /* : option */ {
		if (result.is_Some) {
			return rest (result.value);
		}
		else {
			return Option.None;
		}
	}

    /* MaybeMonad.monad_do
    Processes an option value. If the option value is Some, this function runs the rest of the monadic code. If the option value
	is None, this function returns None.
    
    Example usage:
        function run () {
            return Option.Some (0);
        }
        function stop () {
            return Option.None;
        }
        
        let m = new MaybeMonad.MaybeMonad ();
        var code = `
            monad_do (run ());
            unit (1);
        `;
        var result = m.monad_eval_2 (code, { 'run' : run });
        // result === Option.Some (1)

        code = `
            monad_do (stop ());
            unit (1);
        `;
        result = m.monad_eval_2 (code, { 'stop' : stop });
        // result.is_None === true
	// Tested 20170424 2118
        
    Remarks:
    None.

    @result - The input option value.
    @rest - A function that represents the remaining monadic code.
        @return - The result of running the rest of the monadic code.
    @return - If @result is Some, @return is the result of running rest of the monadic code. If @result is None, @return is
	@result.
    */
    MaybeMonad.prototype.monad_do = function (result /* : option */, rest /* : function */) /* : option */ {
		if (result.is_Some) {
			return rest ();
		}
		else {
			return Option.None;
		}
	}

    /* MaybeMonad.zero
    Returns None.

    Example usage:
        let m = new MaybeMonad.MaybeMonad ();
        let code = `
            bind ('x', Option.Some (1));
        `;
        let result = m.monad_eval_2 (code);
        // result === Option.None
	// Tested 20170424 2119
    
    Remarks:
    This method is called when the last expression in the the monadic code does not call unit () or unit2 ().

    @return - None.
    */
    MaybeMonad.prototype.zero = function () /* : option */ {
        return Option.None;
    }

    /* MaybeMonad.combine
    Returns the result of combining two option values.

    Example usage:
        let m = new MaybeMonad.MaybeMonad ();
        let code = `
            unit (1);
            unit2 (Option.Some (2));
        `;
        let result = m.monad_eval_2 (code);
        // result === Option.Some (3)
	// Tested 20170424 2119

    Remarks:
    This method is called when the monadic code calls unit () more than once, calls unit2 () more than once, or calls unit () and
    unit2 () at least once each.
    For more information, see the comments for Monad.combine ().
    
    @value1 - The first option value to combine.
    @value2 - The second option value to combine.
    @return - The combined option value.
    */
    MaybeMonad.prototype.combine = function (value1 /* : option */, value2 /* : option */) /* : option */ {
        if (true === value1.is_Some && false === value2.is_Some) {
            return value1;
        }
        else if (false === value1.is_Some && true === value2.is_Some) {
            return value2;
        }
        else if (true === value1.is_Some && true === value2.is_Some) {
// TODO2 This breaks for values that can't be added.
            return Option.Some (value1.value + value2.value);
        }
        else {
            return Option.None;
        }
    }

    /* We implement Monad.combine (), so we must implement Monad.delay (). */
    /* MaybeMonad.delay
    Removes the delay from a delayed option value.
    
    Example usage:
    This function is for internal use only.
    
    Remarks:
    None.
    
    @f - The delayed option value.
    @return - The option value.
    */
    MaybeMonad.prototype.delay = function (f /* : function */) /* : option */ {
        return f ();
    }
    
    /* We do not implement Monad.run (). */

	/* MaybeMonad.monad_eval_2
	Calls Monad.monad_eval with the specified code and context. Adds the option module alias to the context.

    Example usage:
		let m = new MaybeMonad.MaybeMonad ();
		let result = m.monad_eval_2 (`unit(1);`);
		// result ===  Option.Some (1);
	// Tested 20170424 2120

    Remarks:
    None.

    @code - The monadic code.
    @context - The values to be defined in the scope of the monadic code.
    @result - The result of running the monadic code.
    */
	/* Note you cannot create an associative array with []. Adding items to the array fails silently. */
	MaybeMonad.prototype.monad_eval_2 = function (code /* : string */, context = {} /* : object */) /* : option */ {
		context.Option = Option;
		return this.monad_eval (code, context);
	}

module.exports.MaybeMonad = MaybeMonad;
