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

let Monad = require (`./Monad.js`);

/* A sequence item. @next is a delayed reference to an optional SeqItem. That is, valid values for @next are as follows.
	function () { return Option.Some (new SeqItem (...)); }
	function () { return Option.None; }
*/
class SeqItem {
	constructor (item /* : any */, next /* : function  */) {
		this.item = item;
		this.next = next;
	}
}

/* seq_unit
Creates a sequence from a value.

Example usage:
    let result = SeqMonad.seq_unit (1);
    let result_ = result ();
	let result__ = result_.value;
    // result__.item === 1
    // result__.next () === Option.None
// Tested 20170424 2147
    
Remarks:
None.

@value - The input value.
@return - The sequence.
*/
function seq_unit (value /* : any */) /* : function */ {
    return function () /* : option */ {
        return Option.Some (new SeqItem (value, function () { return Option.None; }));
    };
}

/* get_empty_seq
Returns an empty sequence.

Example usage:
    let result = SeqMonad.get_empty_seq ();
    let result_ = result ();
    // result_ === Option.None
// Tested 20170424 2150

Remarks:
None.

@return - An empty sequence.
*/
function get_empty_seq () /* : function */ {
    return function () {
        return Option.None;
    };
}

/* counter
Returns a sequence that contains the numbers from the start number to the end number.

Example usage:
    let m = new SeqMonad.SeqMonad ();
    let s = SeqMonad.counter (m, 0, 2);
    var result = ``;
    SeqMonad.seq_iter (function (x) { result += x + ` `; }, s);
    // result === `0 1 2 `
// Tested 20170424 2150

Remarks:
None.

@m - A SeqMonad instance.
@start - The number to start the sequence.
@end - The number to end the sequence.
@return - The sequence. If @start > @end, @return is an empty sequence.
*/
function counter (m /* : SeqMonad */, start /* : int */, end /* : int */) /* : function */ {
    let rec = function () { return Option.Some (new SeqItem (start, counter (m, start + 1, end))); };
    /* Note it is helpful to keep in mind that in the recursive case, Monad.unit2 () is applied to the result of a future call
    to Monad.combine (). */
    let code = `
        if (start > end) {
            unit2 (get_empty_seq ());
        }
        else if (start === end) {
            unit (start);
        }
        else {
            unit2 (rec);
        }
    `;
    return m.monad_eval (code, { 'rec' : rec, 'get_empty_seq' : get_empty_seq, 'start' : start, 'end' : end });
}

/* seq_iter
Applies the specified function to each item in the input sequence.

Example usage:
    let m = new SeqMonad.SeqMonad ();
    let s = SeqMonad.counter (m, 0, 2);
    var result = ``;
    SeqMonad.seq_iter (function (x) { result += x + ` `; }, s);
    // result === `0 1 2 `
// Tested 20170424 2151

Remarks:
None.

@f - The function to apply to each item in the sequence.
@seq - The input sequence.
@return - None.
*/
function seq_iter (f /* : function */, seq /* : function */) /* : void */ {
    let node = seq ();
	if (true === node.is_Some) {
		let node_ = node.value;
		f (node_.item);
        seq_iter (f, node_.next);
    }
    else {
        return;
    }
}

/* seq_take
Return a new sequence that contains the specified number of items from the input sequence. This is useful for dealing with
infinite sequences.

Example usage:
    function fibonacci (m, a, b) {
        let rec = function () { return Option.Some (new SeqMonad.SeqItem (a, fibonacci (m, b, a + b))); };
		let code = `unit2 (rec);`;
        return m.monad_eval (code, { 'rec' : rec });
    }

    let s = fibonacci (new SeqMonad.SeqMonad (), 1, 1);
    let s_ = SeqMonad.seq_take (10, s);
    var result = ``;
    SeqMonad.seq_iter (function (x) { result += x + ` `; }, s_);
    // result === `1 1 2 3 5 8 13 21 34 55 `
// Tested 20170424 2152

Remarks:
None.

@count - The number of items to take from the input sequence.
@seq - The input sequence.
@return - The new sequence.
*/
function seq_take (count /* : int */, seq /* : function */) /* : function */ {
    return function () {
        if (count === 0) {
            return Option.None;
        }
        else {
            let node = seq ();
            if (true === node.is_Some) {
				let node_ = node.value;
                return Option.Some (new SeqItem (node_.item, seq_take (count - 1, node_.next)));
            }
            else {
                return node;
            }
        }
    };
}


/* A Sequence monad, which can be used to create a lazily evaluated sequence.

Example usage:
    function fibonacci (m, a, b) {
        let rec = function () { return Option.Some (new SeqMonad.SeqItem (a, fibonacci (m, b, a + b))); };
		let code = `unit2 (rec);`;
        return m.monad_eval (code, { 'rec' : rec });
    }

    let s = fibonacci (new SeqMonad.SeqMonad (), 1, 1);
    let s_ = SeqMonad.seq_take (10, s);
    var result = ``;
    SeqMonad.seq_iter (function (x) { result += x + ` `; }, s_);
    // result === `1 1 2 3 5 8 13 21 34 55 `
// Tested 20170424 2152
*/
class SeqMonad extends Monad {
	constructor () {
/* Note we must call super () to use the this keyword. */
		super (`function`);
	}
}

    /* SeqMonad.unit
    Creates a sequence from a value.

    Example usage:
        let m = new SeqMonad.SeqMonad ();
        let code = `unit (1);`;
        let result = m.monad_eval (code);
        let result_ = result ();
		let result__ = result_.value;
        // result__.item === 1
        // result__.next () === Option.None
	// Tested 20170424 2153

    Remarks:
    None.
    
    @value - The input value.
    @return - The sequence.
    */
	SeqMonad.prototype.unit = function (value /* : any */) /* : function */ {
        return seq_unit (value);
    }

/* We want to combine the first and second sequences. The naive way to do this is to evaluate the first sequence to the last
node, then set its next field to the first node of the second sequence. However, we do not want to evaluate the first sequence.
Instead, we return a node whose item field is copied from the current node of the first sequence, but whose next field points
to a closure. The closure checks to see if there are any more nodes in the first sequence. If so, it recursively calls combine
with the next node in the first sequence, and does not evaluate the second sequence. This recursion continues until we finish
evaluating the first sequence. At that point, the closure simply returns the second sequence.
See the implementation of combine here:
http://tryjoinads.org/docs/computations/layered.html
*/
    /* SeqMonad.combine
    Combines two sequences.
    
    Example usage:
        let m = new SeqMonad.SeqMonad ();
        let s1 = SeqMonad.counter (m, 0, 1);
        let s2 = SeqMonad.counter (m, 2, 3);
        let code = `
            unit2 (s1);
            unit2 (s2);
        `;
        let s3 = m.monad_eval (code, { 's1' : s1, 's2' : s2 });
        var result = ``;
        SeqMonad.seq_iter (function (x) { result += x + ` `; }, s3);
        // result === `0 1 2 3 `
	// Tested 20170424 2154
    
    Remarks:
    None.
    
    @value1 - The first sequence.
    @value2 - The second sequence.
    @return - The combined sequence.
    */
    SeqMonad.prototype.combine = function (value1 /* : function */, value2 /* : function */) /* : function */ {
		/* The this property is undefined inside the closure. */
		let t = this;
        return function () {
            let value1_ = value1 ();
            if (true === value1_.is_Some) {
				let value1__ = value1_.value;
                return Option.Some (new SeqItem (value1__.item, t.combine (value1__.next, value2)));
            }
            else {
                return value2 ();
            }
        };
    }

    /* We implement Monad.combine (), so we must implement Monad.delay (). */
    /* SeqMonad.delay
    Runs a delayed sequence.
    
    Example usage:
    This function is for internal use only.
    
    Remarks:
    None.
    
    @f - The delayed sequence.
    @return - The sequence.
    */
    SeqMonad.prototype.delay = function (f /* : function */) /* : function */ {
        return f ();
    }

	/* SeqMonad.monad_eval_2
	Calls Monad.monad_eval with the specified code and context. Adds the option module alias to the context.

    Example usage:
	// TODO2

    Remarks:
    None.

    @code - The monadic code.
    @context - The values to be defined in the scope of the monadic code.
    @result - The result of running the monadic code.
    */
	/* Note you cannot create an associative array with []. Adding items to the array fails silently. */
	SeqMonad.prototype.monad_eval_2 = function (code /* : string */, context = {} /* : object */) /* : option */ {
		return this.monad_eval (code, context);
	}

/* We do not implement Monad.bind (), Monad.monad_do (), Monad.zero (), or Monad.run (). */

module.exports.SeqItem = SeqItem;
module.exports.seq_unit = seq_unit;
module.exports.counter = counter;
module.exports.seq_iter = seq_iter;
module.exports.seq_take = seq_take;
module.exports.get_empty_seq = get_empty_seq;
module.exports.SeqMonad = SeqMonad;
