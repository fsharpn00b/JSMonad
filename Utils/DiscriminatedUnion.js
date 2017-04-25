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

/* add_case_predicates
Add properties that each indicate whether the case instance is of a given case.

Example usage:
This function is for internal use only.

Remarks:
None.

@case_instance - The case instance.
@case_name - The name of the case of this instance.
@case_names - The names of all cases for the discriminated union type.
@return - The updated case instance.
*/
function add_case_predicates (case_instance /* object */, case_name /* string */, case_names /* Array */) /* : object */ {
	case_names.forEach (function (name) {
		/* Case.is_<case>
		Returns true if the case instance is of case <case>; otherwise, returns false.

		Example usage:
		See comments for make_discriminated_union_type.

		Remarks:
		None.

		@return - True if the case instance is of case <case>.
		*/
		Object.defineProperty (case_instance, `is_${name}`, {
			value : (name === case_name),
			writable : false,
			enumerable : true
		});
	});

	return case_instance;
}

/* get_case_constructor
Returns a constructor for a discriminated union case.

Example usage:
This function is for internal use only.

Remarks:
None.

@case_name - The case name.
@case_fields - The data fields associated with the case.
@case_names - The names of all cases for the discriminated union type.
@return - The case constructor.
*/
function get_case_constructor (case_name /* : string */, case_fields /* : Array */, case_names /* : Array */) /* : function */ {
	/* The constructor for this case.

	Example usage:
	This function is for internal use only.

	Remarks:
	None.

	@values - The values for the case's data fields.
	@return - An instance of this case.
	*/
	return function () {
		/* The case instance. */
		let result = {};

		/* Case.case_name
		The case name for this case instance.
		*/
		Object.defineProperty (result, `case_name`, {
			value : case_name,
			writable : false,
			enumerable : true
		});

		/* Add the values to the case's data fields. */
		/* It seems there is no built-in JavaScript equivalent to PHP's array_combine (). */
		let length = Math.min (arguments.length, case_fields.length);
		for (i = 0; i < length; i++) {
			Object.defineProperty (result, case_fields[i], {
				value : arguments[i],
				writable : false,
				enumerable : true
			});
		}

		/* Add properties that each indicate whether the case instance is of a given case. */
		return add_case_predicates (result, case_name, case_names);
	}
}

/* make_discriminated_union_type
Returns a new discriminated union type.

Example usage:
	let YesNo = make_discriminated_union_type (`YesNo`, {
		'Yes' : [`value`],
		'No' : 0
	});
	
	let no = YesNo.No;
	// no === 0
	// no === YesNo.No
	let no_ = YesNo.No;
	// no === no_

	let yes = YesNo.Yes (1);
	// yes.is_Yes === true;
	// yes.is_No === false;
	// yes.value === 1

Remarks:
None.

@type_name - The name of the discriminated union type.
@case_names - The names of all cases for the discriminated union type. 
@return - The discriminated union type.
*/
function make_discriminated_union_type (type_name /* : string */, cases /* : object */) /* : object */ {
	if (0 === cases.length) {
		throw new Error (`Tried to create a discriminated union type with an empty case list.`);
	}
	else {
		let du = {};

		let case_names = Object.keys (cases);

		/* DiscriminatedUnionType.type_name
		The name of the discriminated union type.
		*/
		Object.defineProperty (du, `type_name`, {
			value : type_name,
			writable : false,
			enumerable : true
		});

		/* DiscriminatedUnionType.case_names
		The names of all cases for the discriminated union type.
		*/
		Object.defineProperty (du, `case_names`, {
			value : case_names,
			writable : false,
			enumerable : true
		});

		/* Add constructors for each case. */
		for (let case_name in cases) {
			let case_fields = cases[case_name];
			/* If case_fields is an array, make a constructor for this case. The constructor takes an array of values that it
			binds to the case fields. */
			if (Array.isArray (case_fields)) {
				Object.defineProperty (du, case_name, {
					value : get_case_constructor (case_name, case_fields, case_names),
					writable : false,
					enumerable : true
				});
			}
			/* If case_fields is not an array, simply make it the value for this case. */
			else {
				Object.defineProperty (du , case_name, {
					value : case_fields,
					writable : false,
					enumerable : true
				});
			}
		};

		return du;
	}
}

/* An option type. */
let Option = make_discriminated_union_type (`Option`, {
	'Some' : [`value`],
	'None' : 0
});

/* An Either type. */
let Either = make_discriminated_union_type (`Either`, {
	'Left' : [`left_value`],
	'Right' : [`right_value`]
});

module.exports.make_discriminated_union_type = make_discriminated_union_type;
module.exports.Option = Option;
module.exports.Either = Either;
