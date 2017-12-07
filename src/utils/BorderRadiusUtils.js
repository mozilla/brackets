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
 *  Utilities functions related to color matching
 *
 */
define(function (require, exports, module) {
    "use strict";
    // use RegExp.source of the RegExp literal to avoid doubled backslashes
    var BORDER_RADIUS_REGEX = new RegExp('.*border-radius:.*');
    var BORDER_RADIUS_VALUE_REGEX = new RegExp('([0-9]{1,3}(px|em|ex|%|in|cm|mm|pt|pc)?){1,4}.*');
    
     // Define public API
    exports.BORDER_RADIUS_REGEX = BORDER_RADIUS_REGEX;
    exports.BORDER_RADIUS_VALUE_REGEX = BORDER_RADIUS_VALUE_REGEX;
});
