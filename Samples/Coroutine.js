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

let PauseMonad = require (`../Monads/PauseMonad.js`);

var result = ``;

function get_process_step (process_name /* : string */, process_step /* : int */) /* : void */ {
    result += `Process ${process_name}: ${process_step} step(s) remaining.\n`;
}

function get_last_process_step (process_name /* : string */) /* : void */ {
    result += `Process ${process_name} finished.\n`;
}

function get_process (process_name /* : string */, step /* : int */) /* : function */ {
    let m = new PauseMonad.PauseMonad ();
    let code =
        /* Yield to other processes. */
        `monad_do (pause (0));
        if (step === 0) {
            get_last_process_step (process_name);
            unit (process_name);
        }
        else {
            get_process_step (process_name, step);
            unit2 (get_process (process_name, (step - 1)));
        }
    `;
	/* Note it seems we cannot name object fields using template strings. */
    return m.monad_eval (code, {
		'get_process' : get_process,
		'get_process_step' : get_process_step,
		'get_last_process_step' : get_last_process_step,
		'pause' : PauseMonad.pause,
		'process_name' : process_name,
		'step' : step
	});
}

function race (p1 /* : function */, p2 /* : function */) /* : void */ {
    let p1_ = p1 ();
    let p2_ = p2 ();
    if (true === p1_.is_Done) {
        result += `Process ${p1_.value} finished first.\n`;
    }
    else if (true === p2_.is_Done) {
        result += `Process ${p2_.value} finished first.\n`;
    }
    else {
        return race (p1_.next, p2_.next);
    }
}

let p1 = get_process (`1`, 1);
let p2 = get_process (`2`, 2);
race (p1, p2);

let expected_result = `Process 1: 1 step(s) remaining.\nProcess 2: 2 step(s) remaining.\nProcess 1 finished.\nProcess 2: 1 step(s) remaining.\nProcess 1 finished first.\n`;

console.log (`Expected result:\n` + expected_result);
console.log (`Actual result:\n` + result);
