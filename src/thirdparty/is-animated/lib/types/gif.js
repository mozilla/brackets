define(function (require, exports, module) {
  'use strict';
  
  /**
   * Returns total length of data blocks sequence
   *
   * @param {Buffer} buffer
   * @param {number} offset
   * @returns {number}
   */
  function getDataBlocksLength (buffer, offset) {
    var length = 0;
  
    while (buffer[offset + length]) {
      length += buffer[offset + length] + 1;
    }
  
    return length + 1;
  }
  
  /**
   * Checks if buffer contains GIF image
   *
   * @param {Buffer} buffer
   * @returns {boolean}
   */
  exports.isGIF = function (buffer) {
    var header = buffer.slice(0, 3).toString('ascii');
    return (header === 'GIF');
  };
  
  /**
   * Checks if buffer contains animated GIF image
   *
   * @param {Buffer} buffer
   * @returns {boolean}
   */
  exports.isAnimated = function (buffer) {
    var hasColorTable, colorTableSize, header;
    var offset = 0;
    var imagesCount = 0;
  
    // Check if this is this image has valid GIF header.
    // If not return false. Chrome, FF and IE doesn't handle GIFs with invalid version.
    header = buffer.slice(0, 3).toString('ascii');
  
    if (header !== 'GIF') {
      return false;
    }
  
    // Skip header, logical screen descriptor and global color table
  
    hasColorTable = buffer[10] & 0x80; // 0b10000000
    colorTableSize = buffer[10] & 0x07; // 0b00000111
  
    offset += 6;                                                              // skip header
    offset += 7;                                                              // skip logical screen descriptor
    offset += hasColorTable ? 3 * Math.pow(2, colorTableSize + 1) : 0;        // skip global color table
  
    // Find if there is more than one image descriptor
  
    while (imagesCount < 2 && offset < buffer.length) {
      switch (buffer[offset]) {
        // Image descriptor block. According to specification there could be any
        // number of these blocks (even zero). When there is more than one image
        // descriptor browsers will display animation (they shouldn't when there
        // is no delays defined, but they do it anyway).
        case 0x2C:
          imagesCount += 1;
  
          hasColorTable = buffer[offset + 9] & 0x80; // 0b10000000
          colorTableSize = buffer[offset + 9] & 0x07; // 0b00000111
  
          offset += 10;                                                       // skip image descriptor
          offset += hasColorTable ? 3 * Math.pow(2, colorTableSize + 1) : 0;  // skip local color table
          offset += getDataBlocksLength(buffer, offset + 1) + 1;              // skip image data
  
          break;
  
        // Skip all extension blocks. In theory this "plain text extension" blocks
        // could be frames of animation, but no browser renders them.
        case 0x21:
          offset += 2;                                                        // skip introducer and label
          offset += getDataBlocksLength(buffer, offset);                      // skip this block and following data blocks
  
          break;
  
        // Stop processing on trailer block,
        // all data after this point will is ignored by decoders
        case 0x3B:
          offset = buffer.length;                                             // fast forward to end of buffer
          break;
  
        // Oops! This GIF seems to be invalid
        default:
          offset = buffer.length;                                             // fast forward to end of buffer
          break;
      }
    }
  
    return (imagesCount > 1);
  };
});
