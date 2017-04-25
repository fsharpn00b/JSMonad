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
let Either = DU.Either;

/* An Either monad, which can be used to compose functions that return the Either type.

Example usage:
	let success_code = 0;
	let error_code = 1;

	function run () {
		return Either.Right (success_code);
	}
	function stop () {
		return Either.Left (error_code);
	}
	
	let m = new EitherMonad.EitherMonad ();
	var code = `
		bind ('result', run ());
		unit (result);
	`;
	var result = m.monad_eval_2 (code, { 'run' : run });
	// result === Either.Right (0)

	code = `
		bind ('result', stop ());
		unit (result);
	`;
	result = m.monad_eval_2 (code, { 'stop' : stop });
	// result === Either.Left (1)
// Tested 20170425 1236
*/
class EitherMonad extends Monad {
}

	/* EitherMonad.unit
    Promotes a value to the Either type.

    Example usage:
        let m = new EitherMonad.EitherMonad ();
        let code = `unit (1);`;
        let result = m.monad_eval_2 (code);
        // result === Either.Right (1)
	// Tested 20140425 1231

    Remarks:
    None.
    
    @value - The value to promote to the Either type.
    @return - The Either type value.
    */
    EitherMonad.prototype.unit = function (value /* : any */) /* : Either */ {
		return Either.Right (value);
	}

    /* EitherMonad.bind
    Binds the contents of an Either value for the rest of the monadic code. If the Either value is Right, this function runs the
	rest of the monadic code. If the Either value is Left, this function returns the Either value.

    Example usage:
		let success_code = 0;
		let error_code = 1;

		function run () {
			return Either.Right (success_code);
		}
		function stop () {
			return Either.Left (error_code);
		}
		
		let m = new EitherMonad.EitherMonad ();
		var code = `
			bind ('result', run ());
			unit (result);
		`;
		var result = m.monad_eval_2 (code, { 'run' : run });
		// result === Either.Right (0)
	
		code = `
			bind ('result', stop ());
			unit (result);
		`;
		result = m.monad_eval_2 (code, { 'stop' : stop });
		// result === Either.Left (1)
	// Tested 20170425 1236

    Remarks:
    None.

    @result - The Either value whose contents should be bound.
    @rest - A function that represents the remaining monadic code.
        @value - The contents of @result.
        @return - The result of running the rest of the monadic code.
    @return - If @result is Right, @return is the result of running rest of the monadic code. If @result is Left, @return is
	@result.
    */
    EitherMonad.prototype.bind = function (result /* : Either */, rest /* : function */) /* : Either */ {
		if (result.is_Right) {
			return rest (result.right_value);
		}
		else {
			return result;
		}
	}

    /* EitherMonad.monad_do
    Processes an Either value. If the Either value is Right, this function runs the rest of the monadic code. If the Either value
	is Left, this function returns the Either value.
    
    Example usage:
		let success_code = 0;
		let error_code = 1;

        function run () {
            return Either.Right (success_code);
        }
        function stop () {
            return Either.Left (error_code);
        }
        
        let m = new EitherMonad.EitherMonad ();
        var code = `
            monad_do (run ());
            unit ('Done.');
        `;
        var result = m.monad_eval_2 (code, { 'run' : run });
        // result === Either.Right ('Done.')

        code = `
            monad_do (stop ());
            unit ('Done.');
        `;
        result = m.monad_eval_2 (code, { 'stop' : stop });
        // result === Either.Left (1)
	// Tested 20170425 1229
        
    Remarks:
    None.

    @result - The input Either value.
    @rest - A function that represents the remaining monadic code.
        @return - The result of running the rest of the monadic code.
    @return - If @result is Right, @return is the result of running rest of the monadic code. If @result is Left, @return is
	@result.
    */
    EitherMonad.prototype.monad_do = function (result /* : Either */, rest /* : function */) /* : Either */ {
		if (result.is_Right) {
			return rest ();
		}
		else {
			return result;
		}
	}

    /* EitherMonad.zero
    Returns Left.

    Example usage:
        let m = new EitherMonad.EitherMonad ();
        let code = `
            bind ('x', Either.Right (1));
        `;
        let result = m.monad_eval_2 (code);
        // result === Either.Left (0)
	// Tested 20150425 1232
    
    Remarks:
    This method is called when the last expression in the the monadic code does not call unit () or unit2 ().

    @return - Left.
    */
    EitherMonad.prototype.zero = function () /* : Either */ {
        return Either.Left (0);
    }

    /* EitherMonad.combine
    Returns the result of combining two Either values.

    Example usage:
        let m = new EitherMonad.EitherMonad ();
        let code = `
            unit (1);
            unit2 (Either.Right (2));
        `;
        let result = m.monad_eval_2 (code);
        // result === Either.Right (3)
	// Tested 20170425 1233

    Remarks:
    This method is called when the monadic code calls unit () more than once, calls unit2 () more than once, or calls unit () and
    unit2 () at least once each.
    For more information, see the comments for Monad.combine ().
    
    @value1 - The first Either value to combine.
    @value2 - The second Either value to combine.
    @return - The combined Either value.
    */
    EitherMonad.prototype.combine = function (value1 /* : Either */, value2 /* : Either */) /* : Either */ {
		/* In the Maybe monad, Some + None = Some. However, since Either.Left typically means an error condition,
		Left + Right = Left. */
        if (true == value1.is_Right && false == value2.is_Right) {
            return value2.left_value;
        }
        else if (false == value1.is_Right && true == value2.is_Right) {
            return value1.left_value;
        }
// TODO2 These last two cases break for values that can't be added.
        else if (true == value1.is_Right && true == value2.is_Right) {
            return Either.Right (value1.right_value + value2.right_value);
        }
        else {
            return Either.Left (value1.left_value + value2.left_value);
        }
    }

    /* We implement Monad.combine (), so we must implement Monad.delay (). */
    /* EitherMonad.delay
    Removes the delay from a delayed Either value.
    
    Example usage:
    This function is for internal use only.
    
    Remarks:
    None.
    
    @f - The delayed Either value.
    @return - The Either value.
    */
    EitherMonad.prototype.delay = function (f /* : function */) /* : Either */ {
        return f ();
    }
    
    /* We do not implement Monad.run (). */

	/* EitherMonad.monad_eval_2
	Calls Monad.monad_eval with the specified code and context. Adds the Either module alias to the context.

    Example usage:
		let m = new EitherMonad.EitherMonad ();
		let result = m.monad_eval_2 (`unit(1);`);
		// result ===  Either.Right (1);
	// Tested 20170425 1234

    Remarks:
    None.

    @code - The monadic code.
    @context - The values to be defined in the scope of the monadic code.
    @result - The result of running the monadic code.
    */
	/* Note you cannot create an associative array with []. Adding items to the array fails silently. */
	EitherMonad.prototype.monad_eval_2 = function (code /* : string */, context = {} /* : object */) /* : Either */ {
		context.Either = Either;
		return this.monad_eval (code, context);
	}

module.exports.EitherMonad = EitherMonad;
