define(function (require, exports, module) {
  'use strict';
  exports.isPNG = function (buffer) {
    var header = buffer.slice(0, 8).toString('hex');
    return (header === '89504e470d0a1a0a'); // \211 P N G \r \n \032 'n
  };
  
  exports.isAnimated = function (buffer) {
    var hasACTL = false;
    var hasIDAT = false;
    var hasFDAT = false;
  
    var previousChunkType = null;
  
    var offset = 8;
  
    while (offset < buffer.length) {
      var chunkLength = buffer.readUInt32BE(offset);
      var chunkType = buffer.slice(offset + 4, offset + 8).toString('ascii');
  
      switch (chunkType) {
        case 'acTL':
          hasACTL = true;
          break;
        case 'IDAT':
          if (!hasACTL) {
            return false;
          }
  
          if (previousChunkType !== 'fcTL') {
            return false;
          }
  
          hasIDAT = true;
          break;
        case 'fdAT':
          if (!hasIDAT) {
            return false;
          }
  
          if (previousChunkType !== 'fcTL') {
            return false;
          }
  
          hasFDAT = true;
          break;
      }
  
      previousChunkType = chunkType;
      offset += 4 + 4 + chunkLength + 4;
    }
  
    return (hasACTL && hasIDAT && hasFDAT);
  };

});
