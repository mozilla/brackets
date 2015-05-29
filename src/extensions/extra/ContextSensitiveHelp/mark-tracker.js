/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, document, Mustache*/

define(function (require, exports, module) {
    "use strict";

  return function markTracker(codeMirror) {
    var classNames = {};
    var marks = [];

    return {
      // Mark a given start/end interval in the CodeMirror, based on character
      // indices (not {line, ch} objects), with the given class name. If
      // an element is provided, give it the class name too.
      mark: function(start, end, className, element) {
        if (!(className in classNames))
          classNames[className] = [];
        if (element) {
          classNames[className].push(element);
          $(element).addClass(className);
        }
        start = codeMirror.posFromIndex(start);
        end = codeMirror.posFromIndex(end);
        var mark = codeMirror.markText(start, end, {
          className: className,
          inclusiveLeft: true,
          inclusiveRight: false
        });
        marks.push(mark);
        return mark;
      },
      // Clear all marks made so far and remove the class from any elements
      // it was previously given to.
      clear: function() {
        marks.forEach(function(mark) {
          // Odd, from the CodeMirror docs you'd think this would remove
          // the class from the highlighted text, too, but it doesn't.
          // I guess we're just garbage collecting here.
          mark.clear();
        });
        var wrapper = codeMirror.getWrapperElement(),
            removeClass = function(element) {
              $(element).removeClass(className);
            };
        for (var className in classNames) {
          classNames[className].forEach(removeClass);
          $("." + className, wrapper).removeClass(className);
        }

        marks = [];
        classNames = {};
      }
    };
  };
});
