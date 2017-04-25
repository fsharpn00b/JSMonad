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

let DU = require (`../Utils/DiscriminatedUnion.js`);
let Option = DU.Option;

let parser = require (`../Parser/parser.js`);

/* This file implements a monad.
Generally, a monad abstracts out computations that are not easily expressed in functional languages. For our purposes, a monad
helps compose functions that return values of complex types (for example, Maybe).
For general reference, see:
https://bartoszmilewski.com/2011/01/09/monads-for-the-curious-programmer-part-1/
https://fsharpforfunandprofit.com/series/computation-expressions.html
*/

/* Consts. */

/* TODO2 Monad.monad_eval should also search the monadic code for any of these, using a whole word, case sensitive search
(JavaScript values are case-sensitive). */
/* Monad.monad_eval_helper, which evaluates the monadic code, uses values with these names, so they are captured in the scope of
the monadic code. The monadic code should not mutate any of them. Monad.monad_let_helper checks its @name argument against this
list to prevent that. */
const _reserved_words_arr = [`_code`, `_context`, `_head`, `_result`];
/* This is used in the error raised by Monad.monad_let_helper if it finds its @name argument in _reserved_words_arr. */
const _reserved_words_str = `_code, _context, _head, _result`;

/* Helper types. */

/* The result of evaluating an expression in the monadic code. */
/* Monadic code does not call zero (), combine (), delay (), or run () explicitly, so we do not have result types for those
functions. */
/* abstract */ class EvalResult {}

/* In this case, the expression in the monadic code called let (). */
class LetResult extends EvalResult {
	constructor (name /* : string */, value /* : any */) {
/* Note we must call super () to use the this keyword. */
		super ();
		this.name = name;
		this.value = value;
	}
}

/* In this case, the expression in the monadic code called unit (). */
class UnitResult extends EvalResult {
	constructor (value /* : any */) {
/* See the comment for the LetResult constructor. */
		super ();
		this.value = value;
	}
}

/* In this case, the expression in the monadic code called unit2 (). */
class Unit2Result extends EvalResult {
	constructor (value /* : monadic type */) {
/* See the comment for the LetResult constructor. */
		super ();
		this.value = value;
	}
}

/* In this case, the expression in the monadic code called bind (). */
class BindResult extends EvalResult {
	constructor (name /* : string */, value /* : monadic type */) {
/* See the comment for the LetResult constructor. */
		super ();
		this.name = name;
		this.value = value;
	}
}

/* In this case, the expression in the monadic code called monad_do (). */
class DoResult extends EvalResult {
	constructor (value /* : monadic type */) {
/* See the comment for the LetResult constructor. */
		super ();
		this.value = value;
	}
}

/* Helper functions. */

/* We declare the monad_let (), unit (), unit2 (), bind (), and do () functions globally so they are visible to the monadic code.
Monadic code does not call zero (), combine (), delay (), or run () explicitly. */

/* monad_let
Notifies the Monad class that the monadic code called monad_let ().

Example usage:
	let m = new MaybeMonad.MaybeMonad ();
	let code = `
		let x = 1;
		unit (x);
	`;
	let result = m.monad_eval_2 (code);
    // result === Option.Some (1)
// Tested 20170424 2126

Remarks:
None.

@name - The value name to bind.
@value - The value to bind to @name. 
@return - A LetResult that contains @name and @value.
*/
function monad_let (name /* : string */, value /* : any */) /* : LetResult */ {
/* Note unlike in PHP, evaluating an expression returns a value even if the expression does not contain a return statement. */
	return new LetResult (name, value);
}

/* unit
Notifies the Monad class that the monadic code called unit ().

Example usage:
    let m = new MaybeMonad.MaybeMonad ();
    let code = `unit (1);`;
    let result = m.monad_eval_2 (code);
    // result === Option.Some (1)
// Tested 20170424 2127

Remarks:
None.

@value - The value to promote to the monadic type. 
@return - A UnitResult that contains @value.
*/
function unit (value /* : any */) /* : UnitResult */ {
/* See the comment in monad_let. */
	return new UnitResult (value);
}

/* unit2
Notifies the Monad class that the monadic code called unit2 ().

Example usage:
    let m = new MaybeMonad.MaybeMonad ();
    let code = `unit2 (Option.Some (1));`;
    let result = m.monad_eval_2 (code);
    // result === Option.Some (1)
// Tested 20170424 2127

Remarks:
None.

@value - The monadic type value. 
@return - A Unit2Result that contains @value.
*/
function unit2 (value /* : monadic type */) /* : Unit2Result */ {
/* See the comment in monad_let. */
	return new Unit2Result (value);
}

/* bind
Notifies the Monad class that the monadic code called bind ().

Example usage:
    let m = new MaybeMonad.MaybeMonad ();
    let code = `
        bind ('x', Option.Some (1));
        let x = x + 1;
        unit (x);
    `;
    let result = m.monad_eval_2 (code);
    // result === Option.Some (2)
// Tested 20170424 2128

Remarks:
None.

@name - The value name to bind.
@value - The input monadic type value whose contents should be bound to @name. 
@return - A BindResult that contains @name and @value.
*/
function bind (name /* : string */, value /* : monadic type */) /* : BindResult */ {
/* See the comment in monad_let. */
	return new BindResult (name, value);
}

/* monad_do
Notifies the Monad class that the monadic code called monad_do ().

Example usage:
    let m = new MaybeMonad.MaybeMonad ();
    let code = `
        monad_do (Option.Some (1));
        unit (2);
    `;
    let result = m.monad_eval_2 (code);
    // result === Option.Some (2)
// Tested 20170424 2128

Remarks:
None.

@value - The input monadic type value. 
@return - A DoResult that contains @value.
*/
function monad_do (value /* : monadic type */) /* : DoResult */ {
/* See the comment in monad_let. */
	return new DoResult (value);
}

/* extract_content
Converts the context into a string to be evaluated.

Example usage:
This function is for internal use only.

Remarks:
None.

@context - The values defined in the scope of the monadic code.
@return - @context in string format.
*/
function extract_context (context /* : object */) /* : string */ {
	let keys = Object.keys (context);
	return keys.reduce (function (acc, key) {
/* Note in Monad.monad_eval_helper we prefix context with '_' to help avoid collision with user-defined values. */
		return `${acc}let ${key} = _context['${key}'];`;
	}, ``);
}

/* Monad parent class. */
/* abstract */ class Monad /* <monadic type param> */ {

	constructor () {
		/* True if the child class implements combine (). */
		this._is_combine_implemented = this.combine !== undefined;
		/* True if the child class implements delay (). */
		this._is_delay_implemented = this.delay !== undefined;
		/* True if the child class implements run (). */
		this._is_run_implemented = this.run !== undefined;
		if (true === this._is_combine_implemented &&
			false === this._is_delay_implemented) {
			throw new Error (`If your monad implements Monad.combine (), it must also implement Monad.delay ().`);
		}
	}
}

	/* Virtual methods. */

    /* Monad.unit
    Promotes a value to the monadic type.

    Example usage:
    This function is for internal use only.

    Remarks:
    This method is called when the monadic code calls the globally defined unit () function.
	The child class must override this method or it raises an exception.

    @value - The value to promote to the monadic type.
    @return - The monadic type value.
    */
    /* public */ Monad.prototype.unit = function (value /* : any */) /* : monadic type */ {
        throw new Error (`Your monad must implement Monad.unit () in order for your monadic code to call unit ().`);
    }

    /* Monad.unit2
    Returns the input monadic type value.

    Example usage:
    This function is for internal use only.

    Remarks:
    This method is called when the monadic code calls the globally defined unit2 () function.
    This is a default implementation that can be overridden in a child class.

    @value - The monadic type value.
    @return - The monadic type value.
    */
    /* public */ Monad.prototype.unit2 = function (value /* : monadic type */) /* : monadic type */ {
        return value;
    }

    /* Monad.bind
    Binds the contents of the input monadic type value for the rest of the monadic code.

    Example usage:
    This function is for internal use only.

    Remarks:
    This method is called when the monadic code calls the globally defined bind () function.
	The child class must override this method or it raises an exception.

    @result - The input monadic type value whose contents should be bound.
    @rest - A function that represents the remaining monadic code.
        @value - The contents of @result.
        @return - The result of running the rest of the monadic code.
    @return - The result of running the rest of the monadic code.
    */
    /* public */ Monad.prototype.bind = function (result /* : monadic type */, rest /* : function */) /* : monadic type */ {
        throw new Error (`Your monad must implement Monad.bind () in order for your monadic code to call bind ().`);
    }

    /* Monad.monad_do
    Processes the input monadic type value. Typically, this means the value is used in a side effect, or is used to determine
    whether to continue running the monadic code.

    Example usage:
    This function is for internal use only.

    Remarks:
    This method is called when the monadic code calls the globally defined monad_do () function.
	The child class must override this method or it raises an exception.

    @result - The input monadic type value.
    @rest - A function that represents the remaining monadic code.
        @return - The result of running the rest of the monadic code.
    @return - The result of running the rest of the monadic code.
    */
    /* public */ Monad.prototype.monad_do = function (result /* : monadic type */, rest /* : function */) /* : monadic type */ {
        throw new Error (`Your monad must implement Monad.monad_do () in order for your monadic code to call monad_do ().`);
    }

    /* Monad.zero
    Returns a default monadic type value.

    Example usage:
    This function is for internal use only.

    Remarks:
    This method is called when the last expression in the the monadic code does not call unit () or unit2 ().
	The child class must override this method or it raises an exception.

    @return - A monadic type value.
    */
    /* public */ Monad.prototype.zero = function () /* : monadic type */ {
        throw new Error (`Either (1) the last expression in the monadic code must be either unit () or unit2 (), or (2) your monad must implement Monad.zero ().`);
    }

    /* Monad.combine
    Returns the result of combining two monadic type values.

    Example usage:
    This function is for internal use only.

    Remarks:
    This method is called when the monadic code calls unit () more than once, calls unit2 () more than once, or calls unit () and
    unit2 () at least once each. The child class must override this method or it raises an exception.
    
    @value1 - The first monadic type value to combine.
    @value2 - If the child class implements Monad.delay (), @value2 is the return value of Monad.delay (), which is either a
    function that represents the rest of the monadic code, or the result of running the rest of the monadic code. If the child
    class does not implement Monad.delay (), @value2 is the result of running the rest of the monadic code.
        If @value2 is a function, its signature is as follows.
        @return - The result of running the rest of the monadic code.
    @return - The combined monadic type value.
    */
    /* We cannot have a default implementation of this method because we need to determine whether this method is implemented by
	the child class, and there is no way to do so if it is implemented by this class. See the constructor for how we make this
	determination. */
//    /* public */ Monad.prototype.combine = function (value1 /* : monadic type */, value2 /* : monadic type or function */) /* : monadic type */ {}

    /* Monad.delay
    Delays the running of monadic code.
    
    Example usage:
    This function is for internal use only.

    Remarks:
    This method is only called if the child class implements it.
    
    @f - A function that represents the remaining monadic code.
        @return - The result of running the rest of the monadic code.
    @return - Either @f or its return value, depending on whether this function runs @f.
    */
    /* We cannot have a default implementation of this method because we need to determine whether this method is implemented by
	the child class, and there is no way to do so if it is implemented by this class. See the constructor for how we make this
	determination. */
//    /* public */ Monad.prototype.delay = function (f /* : function */) /* : monadic type or function */ {}

    /* Monad.run
    Runs delayed monadic code.
    
    Example usage:
    This function is for internal use only.

    Remarks:
    This method is only called if the child class implements it.
    
    @f - If the child class implements Monad.delay (), @f is the return value of Monad.delay (), which is either a function
    that represents the monadic code, or the result of running the monadic code. If the child class does not implement
    Monad.delay (), @f is the result of running the monadic code.
        If @f is a function, its signature is as follows.
        @return - The result of running the monadic code.
    @return - Either @f or its return value, depending on whether @f is a function and whether this function runs @f.
    */
    /* We cannot have a default implementation of this method because we need to determine whether this method is implemented by
	the child class, and there is no way to do so if it is implemented by this class. See the constructor for how we make this
	determination. */
//    /* public */ Monad.prototype.run = function (f /* : monadic type or function */) /* : monadic type or function */ {}

    /*
    If the child class does not implement Monad.delay () or Monad.run (), the result of Monad.monad_eval () is simply:
    eval (<monadic code>)

    If the child class implements Monad.delay () but not Monad.run (), the result of Monad.monad_eval () is:
    Monad.delay (function () { eval (<monadic code>); })

    If the child class implements Monad.delay () and Monad.run (), the result of Monad.monad_eval () is:
    Monad.run (Monad.delay (function () { eval (<monadic code>); }))

    If the child class implements Monad.run () but not Monad.delay (), the result of Monad.monad_eval () is:
    Monad.run (eval (<monadic code>))
    
    If the child class implements Monad.combine (), it must implement Monad.delay (). The second argument to Monad.combine ()
	is the return value of Monad.delay ().
    // TODO2 This incorrectly makes it look as if Monad.delay has been applied to unit, when it has not. We need to stop using () to denote a function.

    For example, suppose the child class implements Monad.delay () as follows.
	ChildMonad.prototype.delay = function (f) {
        return f;
    }
    Suppose the child class runs the following monadic code.
        unit (1);
        unit (2);
        unit (3);
    The result of the monadic code is as follows.
        Monad.delay (function () {
            return Monad.combine (1, Monad.delay (function () {
                return Monad.combine (2, Monad.delay (function () {
                    return 3;
                }));
            }));
        })
    This allows the implementation of Monad.combine () to skip running the rest of the monadic code, if needed, by simply not
    calling the function that is passed to it as the second parameter.
    */

	/* Private methods. */
	/* Note there is no standard way to declare methods private in Javascript. */

	/* monad_let_helper
	Binds a name and value in the scope of the monadic code.

	Example usage:
	This function is for internal use only.

	Remarks:
	None.

    @name - The name to bind to @value.
    @value - The value to bind to @name.
    @rest - The remaining monadic code.
    @context - The values defined in the scope of the monadic code.
	@return - The monadic type value.
	*/
	/* private */ Monad.prototype.monad_let_helper = function (name /* : string */, value /* : any */, rest /* : Array */, context /* : object */) /* : monadic type */ {
		if (true === _reserved_words_arr.includes (name)) {
			throw new Error (`monad_let cannot bind any of the following reserved words: ${_reserved_words_str}.`);
		}
		else {
			context[name] = value;
			return this.monad_eval_helper (rest, context);
		}
	}

    /* Monad.unit_helper_2
    Processes the result of a call to Monad.unit () or Monad.unit2 ().

    Example usage:
    This function is for internal use only.

    Remarks:
    Raises an exception if the child class does not implement Monad.combine ().

    @value - The result returned from Monad.unit () or Monad.unit2 ().
    @rest - The remaining monadic code.
    @context - The values defined in the scope of the monadic code.
    @return - The result of running the rest of the monadic code.
    */
	Monad.prototype.unit_helper_2 = function (value /* : monadic type */, rest /* : Array */, context /* : object */) {
        if (false === this._is_combine_implemented) {
            throw new Error (`Either (1) your monadic code must call unit () or unit2 () only once, as the last expression, or (2) your monad must implement Monad.combine ().`);
        }
        else {
			var result;
            if (true === this._is_delay_implemented) {
				/* The this keyword is undefined inside the closure. */
				let t = this;
                result = this.delay (function () {
                    return t.monad_eval_helper (rest, context);
                });
            }
            else {
                result = this.monad_eval_helper (rest, context);
            }
// TODO1 Can this cause a stack overflow? Can we do this continuation-passing style and apply combine to a closure over the call to eval_helper instead of waiting for the return value from it?
            return this.combine (value, result);
        }
	}

    /* Monad.unit_helper
    Processes the result of a call to Monad.unit () or Monad.unit2 ().

    Example usage:
    This function is for internal use only.

    Remarks:
    None.
    
    @value - The result returned from Monad.unit () or Monad.unit2 ().
    @rest - The remaining monadic code.
    @context - The values defined in the scope of the monadic code.
    @return - The result of running the rest of the monadic code.
    */
	Monad.prototype.unit_helper = function (value /* : monadic type */, rest /* : Array */, context /* : object */) /* : monadic type */ {
		if (0 === rest.length) {
			return value;
		}
		else {
			return this.unit_helper_2 (value, rest, context);
		}
	}

    /* Monad.bind_helper
    When the monadic code calls bind (), this function maps the function call to the monad's implementation of Monad.bind ().

    Example usage:
    This function is for internal use only.

    Remarks:
    None.

    @name - The value name to bind.
    @value - The monadic type value whose contents should be bound to @name.
    @rest - The remaining monadic code.
    @context - The values defined in the scope of the monadic code.
    @return - The result of running the rest of the monadic code.
    */
	Monad.prototype.bind_helper = function (name /* : string */, value /* : monadic type */, rest /* : Array */, context /* : object */) /* : monadic type */ {
		/* The this keyword is undefined inside the closure. */
		let t = this;
		/* Monad.bind extracts the contents of @value and passes the contents as @bound_value to the anonymous function. */
		return this.bind (value, function (bound_value) {
			/* Add the value to the context. */
			context[name] = bound_value;
			return t.monad_eval_helper (rest, context);
		});
	}

    /* Monad.do_helper
    When the monadic code calls monad_do (), this function maps the function call to the monad's implementation of
    Monad.monad_do ().

    Example usage:
    This function is for internal use only.

    Remarks:
    None.

    @value - The input monadic type value.
    @rest - The remaining monadic code.
    @context - The values defined in the scope of the monadic code.
    @return - The result of running the rest of the monadic code.
    */
	Monad.prototype.monad_do_helper = function (value /* : monadic type */, rest /* : Array */, context /* : object */) /* : monadic type */ {
		/* The this keyword is undefined inside the closure. */
		let t = this;
		return this.monad_do (value, function () {
			return t.monad_eval_helper (rest, context);
		});
	}

    /* Monad.eval_dispatch
    Dispatches the result of evaluating an expression in the monadic code to the appropriate handler.
    
    Example usage:
    This function is for internal use only.
    
    Remarks:
    Raises an exception if @result type is unknown.
    
    @result - The result of evaluating an expression in the monadic code.
    @rest - The remaining monadic code.
    @context - The values defined in the scope of the monadic code.
    @return - The result of running the rest of the monadic code.
    */
	Monad.prototype.monad_eval_dispatch = function (result /* : EvalResult */, rest /* : Array */, context /* : object */) /* : monadic type */ {
/* Note instanceof returns true if the specified value is an instance of the specified class or of its parent classes.
Unit2Result derives from UnitResult, so we check Unit2Result first. */
		if (true === result instanceof Unit2Result) {
			return this.unit_helper (this.unit2 (result.value), rest, context);
		}
		else if (true === result instanceof UnitResult) {
			return this.unit_helper (this.unit (result.value), rest, context);
		}
		else if (true === result instanceof BindResult) {
			return this.bind_helper (result.name, result.value, rest, context);
		}
		else if (true === result instanceof DoResult) {
			return this.monad_do_helper (result.value, rest, context);
		}
		else if (true === result instanceof LetResult) {
			return this.monad_let_helper (result.name, result.value, rest, context);
		}
		else {
			return this.monad_eval_helper (rest, context);
		}
	}

    /* Monad.monad_eval_last_expression
    Dispatches the result of evaluating the last expression in the monadic code to the appropriate handler.

    Example usage:
    This function is for internal use only.

    Remarks:
    None.

    @result - The result of evaluating an expression in the monadic code.
    @return - The return value from the handler for @result.
    */
	Monad.prototype.monad_eval_last_expression = function (result /* : EvalResult */) /* : monadic type */ {
/* See the comment in Monad.monad_eval_dispatch. */
		if (true === result instanceof Unit2Result) {
			return this.unit_helper (this.unit2 (result.value), [], {});
		}
		else if (true === result instanceof UnitResult) {
			return this.unit_helper (this.unit (result.value), [], {});
		}
		else {
			return this.zero ();
		}
	}

/* Note previously in monad_eval_helper we did this:
			let head = `${extract (context)}${code[0]}`;
			let context = eval (head);
This somehow caused context to become undefined on the first line. The compiler should have raised the following error:
			SyntaxError: Identifier 'context' has already been declared
but it did not. We have not been able to reproduce this elsewhere.
*/
/* Note in strict mode, if we define new values in evaluated code, the values are in scope only for the evaluated code. However,
in evaluated code we can mutate values that were declared outside the evaluated code.
*/

    /* Monad.monad_eval_helper
    Returns the result of evaluating the specified monadic code.

    Example usage:
    This function is for internal use only.

    Remarks:
    We prefix our parameter and local value names with '_' to help avoid collisions with @_context and the values it contains.

    @_code - The monadic code to evaluate.
    @_context - The values defined in the scope of the monadic code.
    @_return - The result of evaluating the monadic code.
    */
	Monad.prototype.monad_eval_helper = function (_code /* : Array */, _context /* : object */) /* : monadic type */ {
		if (0 === _code.length) {
			throw new Error (`Monad.monad_eval_helper () was applied to an empty monadic code array.`);
		}
		else {
			let _head = `${extract_context (_context)}${_code[0]}`;
/* Note unlike in PHP, evaluating an expression returns a value even if the expression does not contain a return statement. */
			let _result = eval (_head);
			if (_code.length > 1) {
				return this.monad_eval_dispatch (_result, _code.slice (1), _context);
			}
			else {
				return this.monad_eval_last_expression (_result);
			}
		}
	}

    /* Monad.monad_eval
    Runs the specified monadic code and returns the result.

    Example usage:
		let m = new MaybeMonad.MaybeMonad ();
		let code = `unit (1);`;
		let result = m.monad_eval (code, { 'Option' : Option });
		// result ===  Option.Some (1);
	// Tested 20170424 2128

    Remarks:
    None.

    @code - The monadic code.
    @context - The values to be defined in the scope of the monadic code.
    @result - The result of running the monadic code.
    */
	/* Note you cannot create an associative array with []. Adding items to the array fails silently. */
	Monad.prototype.monad_eval = function (code /* : string */, context = {} /* : object */) /* : monadic type */ {
		let code_ = parser.parse (code);
		var result;

        if (false === this._is_delay_implemented) {
            result = this.monad_eval_helper (code_, context);
        }
        else {
			/* The this keyword is undefined inside the closure. */
			let t = this;
            result = this.delay (function () {
                return t.monad_eval_helper (code_, context);
            });
        }

        if (false === this._is_run_implemented) {
            return result;
        }
        else {
            return this.run (result);
        }
	}

module.exports = Monad;
