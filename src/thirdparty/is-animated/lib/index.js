define(function (require, exports, module) {
  'use strict';
  
  var gif = require('thirdparty/is-animated/lib/types/gif');
  var png = require('thirdparty/is-animated/lib/types/png');
  
  /**
   * Checks if buffer contains animated image
   *
   * @param {Buffer} buffer
   * @returns {boolean}
   */
  function isAnimated (buffer) {
    if (gif.isGIF(buffer)) {
      return gif.isAnimated(buffer);
    }
  
    if (png.isPNG(buffer)) {
      return png.isAnimated(buffer);
    }
  
    return false;
  }
  
  module.exports = isAnimated;
});
