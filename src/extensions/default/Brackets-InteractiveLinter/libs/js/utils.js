/**
 * utils Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


(function (root, factory) {
  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    // CommonJS support
    module.exports = factory();
  }
  else if (typeof define === "function" && define.amd) {
    // Do AMD support
    define(factory);
  } else {
    // Non AMD loading
    root.utils = factory();
  }
}(this, function () {
  "use strict";

  function mixin(/*target, [source]+ */) {
    var sources = Array.prototype.slice.call(arguments),
        target  = sources.shift();

    for (var source in sources) {
      source = sources[source];

      // Copy properties
      for (var property in source) {
        target[property] = source[property];
      }
    }

    return target;
  }

  return {
    mixin: mixin
  };

}));

