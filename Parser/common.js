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

/* An if/else if/else branch. */
class Branch {
	constructor (predicate /* : string */, body /* : string */) {
		this.predicate = predicate;
		this.body = body;
	}
}

/* An if branch, followed by zero or more else if branches, followed by zero or one else branch. */
class IfGroup {
	constructor (if_branch /* : Branch */, else_if_branches /* : Array */, else_branch /* : Branch */) {
		this.if_branch = if_branch;
		this.else_if_branches = else_if_branches;
		if (undefined === else_branch || null === else_branch) {
			this.else_branch = Option.None;
		}
		else {
			this.else_branch = Option.Some (else_branch);
		}
	}
}

module.exports.Branch = Branch;
module.exports.IfGroup = IfGroup;
