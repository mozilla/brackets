define(function(require,exports,module){"use strict";var LanguageManager=brackets.getModule("language/LanguageManager");LanguageManager.defineLanguage("less",{name:"LESS",mode:["css","text/x-less"],fileExtensions:["less"],blockComment:["/*","*/"],lineComment:["//"]}).done(function(lessLanguage){lessLanguage._setLanguageForMode("css",lessLanguage)})});