// Jonathan Reimer
// 2021-10-12

/*
This file is a wrapper for parseq.js to curry the requestors and the factories.
New versions of parseq.js may be used as long as the factory parameters
remain unchanged.
*/

/*jslint
    fudge
*/

import parseq from "./parseq.js";

// simplified version of function in esFunctions
const is_object = function (a) {
    return ((typeof a === "object") && (a !== null) && !Array.isArray(a));
};

// Take a curried requestor and allow it to be called in the original format
const uncurried_requestor = function (requestor) {
    return function uncurried_requestor(callback, initial_value) {
        return requestor(callback)(initial_value);
    };
};

// Take a list or object of curried requestors and un-curry them for parseq.js
const uncurry_requestors = function (requestor_list) {
    if (Array.isArray(requestor_list)) {
        return requestor_list.map(uncurried_requestor);
    }

    if (is_object(requestor_list)) {
        return Object.fromEntries(
            Object.entries(requestor_list).map(
                function ([key, curried_requestor]) {
                    return [
                        key,
                        uncurried_requestor(curried_requestor)
                    ];
                }
            )
        );
    }

    return requestor_list;
};

// Each original factory is curried to take first an options object,
// then the array(s) of requestors
const parallel = function (options = {}) {
    return function (required_array, optional_array) {

        if (!is_object(options)) {
            throw "Invalid options object";
        }

        const {
            time_limit,
            time_option,
            throttle
        } = options;

        return function parallel_requestor(callback) {
            return function (initial_value) {
                return parseq.parallel(
                    uncurry_requestors(required_array),
                    uncurry_requestors(optional_array),
                    time_limit,
                    time_option,
                    throttle
                )(
                    callback,
                    initial_value
                );
            };
        };
    };
};

const parallel_object = function (options = {}) {
    return function (required_object, optional_object) {

        if (!is_object(options)) {
            throw "Invalid options object";
        }

        const {
            time_limit,
            time_option,
            throttle
        } = options;

        return function parallel_object_requestor(callback) {
            return function (initial_value) {
                return parseq.parallel_object(
                    uncurry_requestors(required_object),
                    uncurry_requestors(optional_object),
                    time_limit,
                    time_option,
                    throttle
                )(
                    callback,
                    initial_value
                );
            };
        };
    };
};

const race = function (options = {}) {
    return function (requestor_array) {

        if (!is_object(options)) {
            throw "Invalid options object";
        }

        const {
            time_limit,
            throttle
        } = options;

        return function race_requestor(callback) {
            return function (initial_value) {
                return parseq.race(
                    uncurry_requestors(requestor_array),
                    time_limit,
                    throttle
                )(
                    callback,
                    initial_value
                );
            };
        };
    };
};

const fallback = function (options = {}) {
    return function (requestor_array) {

        if (!is_object(options)) {
            throw "Invalid options object";
        }

        const {time_limit} = options;

        return function fallback_requestor(callback) {
            return function (initial_value) {
                return parseq.fallback(
                    uncurry_requestors(requestor_array),
                    time_limit
                )(
                    callback,
                    initial_value
                );
            };
        };
    };
};

const sequence = function (options = {}) {
    return function (requestor_array) {

        if (!is_object(options)) {
            throw "Invalid options object";
        }

        const {time_limit} = options;

        return function sequence_requestor(callback) {
            return function (initial_value) {
                return parseq.sequence(
                    uncurry_requestors(requestor_array),
                    time_limit
                )(
                    callback,
                    initial_value
                );
            };
        };
    };
};

export default Object.freeze({
    fallback,
    parallel,
    parallel_object,
    race,
    sequence
});