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

/* An array monad, which can be used to compose functions that return the array type.

Example usage:
    let m = new ArrayMonad.ArrayMonad ();
    let result = m.monad_eval (`
        bind ('x', [1, 2, 3]);
        bind ('y', [4, 5, 6]);
        unit (x * y);
    `);
    // result === [4, 5, 6, 8, 10, 12, 12, 15, 18]
// Tested 20170423 1417
*/
class ArrayMonad extends Monad {
	constructor () {
/* Note we must call super () to use the this keyword. */
		super (`object`);
	}
}

    /* ArrayMonad.unit
    Promotes a value to the Array type.

    Example usage:
        let m = new ArrayMonad.ArrayMonad ();
        let code = `unit (1);`;
        let result = m.monad_eval (code);
        // result === [1]
	// Tested 20170423 1355

    Remarks:
    None.
    
    @value - The value to promote to the array type.
    @return - The array type value.
    */
    ArrayMonad.prototype.unit = function (value /* : any */) /* : Array */ {
        return [value];
    }

    /* ArrayMonad.bind
    Binds the contents of an array for the rest of the monadic code. If the array is empty, this function returns the empty
    array.

    Example usage:
        let m = new ArrayMonad.ArrayMonad ();
        let code = `
            bind ('x', [1, 2, 3]);
            let x = x + 1;
            unit (x);
        `;
        let result = m.monad_eval (code);
        // result === [2, 3, 4];

    Remarks:
    None.

    @result - The array whose contents should be bound.
    @rest - A function that represents the remaining monadic code.
        @value - The contents of @result.
        @return - The result of running the rest of the monadic code.
    @return - If @result is not an empty array, @return is the result of running rest of the monadic code. If @result is an empty
    array, @return is @result.
    */
    ArrayMonad.prototype.bind = function (result /* : Array */, rest /* : function */) /* : Array */ {
		return result.map (rest).reduce(function (a, b) {
			return a.concat(b);
		}, []);
    }

    /* ArrayMonad.monad_do
    Processes an array. If the array is not empty, this function runs the rest of the monadic code. If the array is empty, this
    function returns the empty array.
    
    Example usage:
        let m = new ArrayMonad.ArrayMonad ();
        var code = `
            monad_do ([1, 2, 3]);
            unit (1);
        `;
        var result = m.monad_eval (code);
        // result === [1, 1, 1]

        code = `
            monad_do ([]);
            unit (1);
        `;
        result = m.monad_eval (code);
		// result === []
	// Tested 20170423 1411
        
    Remarks:
    None.

    @result - The input array.
    @rest - A function that represents the remaining monadic code.
        @return - The result of running the rest of the monadic code.
    @return - If @result is not empty, @return is the result of running the rest of the monadic code. If @result is empty,
    @return is @result.
    */
    ArrayMonad.prototype.monad_do = function (result /* : Array */, rest /* : function */) /* : Array */ {
        /* The rest function passed to monad_do takes no parameters, so the contents of result are ignored. */
        return this.bind (result, rest);
	}

    /* ArrayMonad.zero
    Returns an empty array.

    Example usage:
        let m = new ArrayMonad.ArrayMonad ();
        let code = `
            bind ('x', [1]);
        `;
        let result = m.monad_eval (code);
        // result === []
	// Tested 20170423 1411
    
    Remarks:
    This method is called when the last expression in the the monadic code does not call unit () or unit2 ().

    @return - An empty array.
    */
	ArrayMonad.prototype.zero = function () /* : Array */ {
		return [];
	}

    /* ArrayMonad.combine
    Returns the result of combining two arrays.

    Example usage:
        let m = new ArrayMonad.ArrayMonad ();
        let code = `
            unit (1);
            unit2 ([2]);
        `;
        let result = m.monad_eval (code);
        // result === array [1, 2]
	// Tested 20170423 1940

    Remarks:
    This method is called when the monadic code calls unit () more than once, calls unit2 () more than once, or calls unit () and
    unit2 () at least once each.
    For more information, see the comments for Monad.combine ().
    
    @value1 - The first array to combine.
    @value2 - The second array to combine.
    @return - The combined array.
    */
    ArrayMonad.prototype.combine = function (value1 /* : Array */, value2 /* : Array */) /* : Array */ {
        return value1.concat (value2);
    }

    /* We implement Monad.combine (), so we must implement Monad.delay (). */
    /* ArrayMonad.delay
    Removes the delay from a delayed array.
    
    Example usage:
    This function is for internal use only.
    
    Remarks:
    None.
    
    @f - The delayed array.
    @return - The array.
    */
    ArrayMonad.prototype.delay = function (f /* : function */) /* : Array */ {
        return f ();
    }

	/* We do not implement Monad.run (). */

module.exports.ArrayMonad = ArrayMonad;
