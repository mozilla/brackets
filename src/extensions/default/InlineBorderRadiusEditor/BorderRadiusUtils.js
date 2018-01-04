/*
 * Copyright (c) 2013 - present Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/**
 *  Utilities regular expressions related to border-radius rule matching
 *
 */
define(function (require, exports, module) {
    "use strict";
    /**
     * Regular expression that matches the css rule for border-radius values after the
     * colon is optional
     * @const @type {RegExp}
     */
    var BORDER_RADIUS_REGEX = new RegExp('.*border-radius:.*');

    /**
     * Regular expression that matches the reasonable format of css value for border-radius,
     * starting with a number or decimal followed by any scalable units listed in the
     * expression. Such pattern may occur up to 4 times since maximum of 4 corners can be used.
     * We use a regex as detailed below:
     * (\d+\.?\d*) matches a decimal or integer number
     * (px|em|%)? matches the unit which is optional (mainly for 0)
     * {1,4} makes sure that the above two groups together are only present
     * between 1 to 4 times (both inclusive).
     * @const @type {RegExp}
     */
    var BORDER_RADIUS_VALUE_REGEX = new RegExp(/((\d+\.?\d*)(px|em|%)?){1,4}.*/);
    // Matches a single value and captures the number and unit. Use it with exec()
    // to find successive values in a valid border radius value string.
    var BORDER_RADIUS_SINGLE_VALUE_REGEX = new RegExp(/(\d+\.?\d*)(px|em|%)?/, "g");

    // Define public API
    exports.BORDER_RADIUS_REGEX = BORDER_RADIUS_REGEX;
    exports.BORDER_RADIUS_VALUE_REGEX = BORDER_RADIUS_VALUE_REGEX;
    exports.BORDER_RADIUS_SINGLE_VALUE_REGEX = BORDER_RADIUS_SINGLE_VALUE_REGEX;
});
