define(function(require,exports,module){"use strict";var SpecRunnerUtils=brackets.getModule("spec/SpecRunnerUtils"),FileUtils=brackets.getModule("file/FileUtils");describe("Quick View",function(){var testFolder=FileUtils.getNativeModuleDirectoryPath(module)+"/unittest-files/";var testWindow,brackets,extensionRequire,CommandManager,Commands,EditorManager,QuickView,editor,testFile="test.css",oldFile;beforeEach(function(){if(!testWindow){runs(function(){SpecRunnerUtils.createTestWindowAndRun(this,function(w){testWindow=w;brackets=testWindow.brackets;CommandManager=brackets.test.CommandManager;Commands=brackets.test.Commands;EditorManager=brackets.test.EditorManager;extensionRequire=brackets.test.ExtensionLoader.getRequireContextForExtension("QuickView");QuickView=extensionRequire("main")})});runs(function(){SpecRunnerUtils.loadProjectInTestWindow(testFolder)})}if(testFile!==oldFile){runs(function(){waitsForDone(SpecRunnerUtils.openProjectFiles([testFile]),"open test file: "+testFile)});runs(function(){editor=EditorManager.getCurrentFullEditor();oldFile=testFile})}});function getPopoverAtPos(lineNum,columnNum){var cm=editor._codeMirror,pos={line:lineNum,ch:columnNum},token;editor.setCursorPos(pos);token=cm.getTokenAt(pos,true);return QuickView._queryPreviewProviders(editor,pos,token)}function expectNoPreviewAtPos(line,ch){var popoverInfo=getPopoverAtPos(line,ch);expect(popoverInfo).toBeFalsy()}function checkColorAtPos(expectedColor,line,ch){var popoverInfo=getPopoverAtPos(line,ch);expect(popoverInfo._previewCSS).toBe(expectedColor)}function checkGradientAtPos(expectedGradient,line,ch){checkColorAtPos(expectedGradient,line,ch)}function checkImagePathAtPos(expectedPathEnding,line,ch){var popoverInfo=getPopoverAtPos(line,ch),imagePath=popoverInfo._imgPath;expect(imagePath.substr(imagePath.length-expectedPathEnding.length)).toBe(expectedPathEnding)}function checkImageDataAtPos(expectedData,line,ch){var popoverInfo=getPopoverAtPos(line,ch);expect(popoverInfo._imgPath).toBe(expectedData)}describe("Quick view colors",function(){it("should show preview of hex colors either in 3 digit hex or or 6-digit hex",function(){runs(function(){checkColorAtPos("#369",3,12);checkColorAtPos("#2491F5",4,13)})});it("should NOT show preview of color on words start with #",function(){runs(function(){expectNoPreviewAtPos(7,7);expectNoPreviewAtPos(8,15)})});it("should show preview of valid rgb/rgba colors",function(){runs(function(){checkColorAtPos("rgb(255,0,0)",12,12);checkColorAtPos("rgb(100%,   0%,   0%)",13,17);checkColorAtPos("rgb(50%, 75%, 25%)",14,24);checkColorAtPos("rgba(255, 0, 0, 0.5)",15,23);checkColorAtPos("rgba(255, 0, 0, 1)",16,22);checkColorAtPos("rgba(255, 0, 0, .5)",17,19);checkColorAtPos("rgba(100%, 0%, 0%, 0.5)",18,32);checkColorAtPos("rgba(80%, 50%, 50%, 1)",20,33);checkColorAtPos("rgba(50%, 75%, 25%, 1.0)",21,23)})});it("should NOT show preview of unsupported rgb/rgba colors",function(){runs(function(){expectNoPreviewAtPos(25,14);expectNoPreviewAtPos(26,15);expectNoPreviewAtPos(27,15)})});it("should show preview of valid hsl/hsla colors",function(){runs(function(){checkColorAtPos("hsl(0, 100%, 50%)",31,22);checkColorAtPos("hsla(0, 100%, 50%, 0.5)",32,23);checkColorAtPos("hsla(0, 100%, 50%, .5)",33,23);checkColorAtPos("hsl(390, 100%, 50%)",34,24)})});it("should NOT show preview of unsupported hsl/hsla colors",function(){runs(function(){expectNoPreviewAtPos(38,25);expectNoPreviewAtPos(39,24);expectNoPreviewAtPos(40,25)})});it("should show preview of colors with valid names",function(){runs(function(){checkColorAtPos("blueviolet",47,15);checkColorAtPos("darkgoldenrod",49,16);checkColorAtPos("darkgray",50,16);checkColorAtPos("firebrick",51,15);checkColorAtPos("honeydew",53,16);checkColorAtPos("lavenderblush",56,16);checkColorAtPos("salmon",61,16);checkColorAtPos("tomato",66,16)})});it("should NOT show preview of colors with invalid names",function(){runs(function(){expectNoPreviewAtPos(72,15);expectNoPreviewAtPos(73,16);expectNoPreviewAtPos(74,16);expectNoPreviewAtPos(75,18)})});describe("JavaScript file",function(){runs(function(){testFile="test.js"});it("should NOT show preview of color-named functions and object/array keys",function(){runs(function(){expectNoPreviewAtPos(2,12);expectNoPreviewAtPos(4,22);expectNoPreviewAtPos(5,14);expectNoPreviewAtPos(5,38)})});it("should not show preview of literal color names",function(){runs(function(){expectNoPreviewAtPos(2,36);expectNoPreviewAtPos(3,21);expectNoPreviewAtPos(4,11);expectNoPreviewAtPos(5,25);expectNoPreviewAtPos(7,1)})});it("should show preview of non-literal color codes",function(){runs(function(){checkColorAtPos("#123456",8,7);checkColorAtPos("rgb(65, 43, 21)",9,8)})})})});describe("Quick view gradients",function(){runs(function(){testFile="test.css"});it("Should show linear gradient preview for those with vendor prefix",function(){runs(function(){var expectedGradient1="-webkit-linear-gradient(top,  #d2dfed 0%, #c8d7eb 26%, #bed0ea 51%, #a6c0e3 51%, #afc7e8 62%, #bad0ef 75%, #99b5db 88%, #799bc8 100%)",expectedGradient2="-webkit-gradient(linear, left top, left bottom, color-stop(0%,#d2dfed), color-stop(26%,#c8d7eb), color-stop(51%,#bed0ea), color-stop(51%,#a6c0e3), color-stop(62%,#afc7e8), color-stop(75%,#bad0ef), color-stop(88%,#99b5db), color-stop(100%,#799bc8))",expectedGradient3="-webkit-linear-gradient(top,  #d2dfed 0%,#c8d7eb 26%,#bed0ea 51%,#a6c0e3 51%,#afc7e8 62%,#bad0ef 75%,#99b5db 88%,#799bc8 100%)",expectedGradient4="-webkit-gradient(linear, left top, left bottom, from(rgb(51,51,51)), to(rgb(204,204,204)))";checkGradientAtPos(expectedGradient1,80,36);checkGradientAtPos(expectedGradient2,81,36);checkGradientAtPos(expectedGradient3,82,36);checkGradientAtPos(expectedGradient3,83,36);checkGradientAtPos(expectedGradient3,84,36);checkGradientAtPos(expectedGradient4,90,36)})});it("Should show linear gradient preview for those with colon or space before",function(){runs(function(){var expectedGradient="linear-gradient(to bottom, black 0%, white 100%)";checkGradientAtPos(expectedGradient,169,25);checkGradientAtPos(expectedGradient,170,25);checkGradientAtPos(expectedGradient,171,25);checkGradientAtPos(expectedGradient,172,25)})});it("Should show radial gradient preview for those with colon or space before",function(){runs(function(){var expectedGradient="radial-gradient(red, white 50%, blue 100%)";checkGradientAtPos(expectedGradient,176,25);checkGradientAtPos(expectedGradient,177,25);checkGradientAtPos(expectedGradient,178,25);checkGradientAtPos(expectedGradient,179,25)})});it("Should show linear gradient preview for those with w3c standard syntax (no prefix)",function(){runs(function(){checkGradientAtPos("linear-gradient(#333, #CCC)",99,50);checkGradientAtPos("linear-gradient(135deg, #333, #CCC)",101,50);checkGradientAtPos("linear-gradient(to right, #333, #CCC)",98,50);checkGradientAtPos("linear-gradient(to bottom right, #333, #CCC)",100,50);checkGradientAtPos("linear-gradient(#333, #CCC, #333)",104,50);checkGradientAtPos("linear-gradient(#333 0%, #CCC 33%, #333 100%)",105,50);checkGradientAtPos("linear-gradient(yellow, blue 20%, #0f0)",106,50)})});it("Should show radial gradient preview for those with vendor prefix syntax",function(){runs(function(){var expectedGradient1="-webkit-gradient(radial, center center, 0, center center, 141, from(black), to(white), color-stop(25%, blue), color-stop(40%, green), color-stop(60%, red), color-stop(80%, purple))",expectedGradient2="-webkit-radial-gradient(center center, circle contain, black 0%, blue 25%, green 40%, red 60%, purple 80%, white 100%)";checkGradientAtPos(expectedGradient1,110,93);checkGradientAtPos(expectedGradient2,111,36);checkGradientAtPos(expectedGradient2,112,36);checkGradientAtPos(expectedGradient2,113,36);checkGradientAtPos(expectedGradient2,114,36)})});it("Should show radial gradient preview for those with w3c standard syntax (no prefix)",function(){runs(function(){checkGradientAtPos("radial-gradient(yellow, green)",118,35);checkGradientAtPos("radial-gradient(yellow, green)",118,40)})});it("Should show repeating linear gradient preview",function(){runs(function(){checkGradientAtPos("repeating-linear-gradient(red, blue 50%, red 100%)",122,50);checkGradientAtPos("repeating-linear-gradient(red 0%, white 0%, blue 0%)",123,50);checkGradientAtPos("repeating-linear-gradient(red 0%, white 50%, blue 100%)",124,50)})});it("Should show repeating radial gradient preview",function(){runs(function(){checkGradientAtPos("repeating-radial-gradient(circle closest-side at 20px 30px, red, yellow, green 100%, yellow 150%, red 200%)",128,40);checkGradientAtPos("repeating-radial-gradient(red, blue 50%, red 100%)",129,40)})});it("Should show comma-separated gradients",function(){runs(function(){checkGradientAtPos("linear-gradient(63deg, #999 23%, transparent 23%)",135,50);checkGradientAtPos("linear-gradient(63deg, transparent 74%, #999 78%)",136,50);checkGradientAtPos("linear-gradient(63deg, transparent 0%, #999 38%, #999 58%, transparent 100%)",136,100)})});it("Should convert gradients arguments from pixel to percent",function(){runs(function(){checkGradientAtPos("-webkit-linear-gradient(top, rgba(0,0,0,0) 0%, green 50%, red 100%)",163,40);checkGradientAtPos("repeating-linear-gradient(red, blue 50%, red 100%)",164,40);checkGradientAtPos("repeating-radial-gradient(red, blue 50%, red 100%)",165,40)})});it("Should not go into infinite loop on unbalanced parens",function(){runs(function(){expectNoPreviewAtPos(189,30);expectNoPreviewAtPos(190,40)})})});describe("Quick view display",function(){function showPopoverAtPos(line,ch){var popoverInfo=getPopoverAtPos(line,ch);QuickView._forceShow(popoverInfo)}function getBounds(object,useOffset){var left=useOffset?object.offset().left:parseInt(object.css("left"),10),top=useOffset?object.offset().top:parseInt(object.css("top"),10);return{left:left,top:top,right:left+object.outerWidth(),bottom:top+object.outerHeight()}}function boundsInsideWindow(object){var bounds=getBounds(object,false),editorBounds=getBounds(testWindow.$("#editor-holder"),true);return bounds.left>=editorBounds.left&&bounds.right<=editorBounds.right&&bounds.top>=editorBounds.top&&bounds.bottom<=editorBounds.bottom}function toggleOption(commandID,text){runs(function(){var promise=CommandManager.execute(commandID);waitsForDone(promise,text)})}it("popover is positioned within window bounds",function(){var $popover=testWindow.$("#quick-view-container");expect($popover.length).toEqual(1);runs(function(){showPopoverAtPos(3,12);expect(boundsInsideWindow($popover)).toBeTruthy();showPopoverAtPos(20,33);expect(boundsInsideWindow($popover)).toBeTruthy()});runs(function(){toggleOption(Commands.TOGGLE_WORD_WRAP,"Toggle word-wrap")});runs(function(){showPopoverAtPos(81,36);expect(boundsInsideWindow($popover)).toBeTruthy();var scrollX=editor._codeMirror.defaultCharWidth()*80,scrollY=editor._codeMirror.defaultTextHeight()*70;editor.setScrollPos(scrollX,scrollY);showPopoverAtPos(82,136);expect(boundsInsideWindow($popover)).toBeTruthy();toggleOption(Commands.TOGGLE_WORD_WRAP,"Toggle word-wrap")})});it("highlight matched text when popover shown",function(){showPopoverAtPos(4,14);var markers=editor._codeMirror.findMarksAt({line:4,ch:14});expect(markers.length).toBe(1);var range=markers[0].find();expect(range.from.ch).toBe(11);expect(range.to.ch).toBe(18)})});describe("Quick view images",function(){it("Should show image preview for file path inside url()",function(){runs(function(){checkImagePathAtPos("img/grabber_color-well.png",140,26);checkImagePathAtPos("img/Color.png",141,26);checkImagePathAtPos("img/throbber.gif",142,26);checkImagePathAtPos("img/update_large_icon.svg",143,26)})});it("Should show image preview for urls with http/https",function(){runs(function(){checkImagePathAtPos("https://raw.github.com/gruehle/HoverPreview/master/screenshots/Image.png",145,26)})});it("Should show image preview for file path inside single or double quotes",function(){runs(function(){checkImagePathAtPos("img/med_hero.jpg",147,26);checkImagePathAtPos("img/Gradient.png",148,26);checkImagePathAtPos("img/specials.jpeg",149,26)})});it("Should show image preview for subsequent images in a line",function(){runs(function(){checkImagePathAtPos("img/Gradient.png",153,80);checkImagePathAtPos("img/Gradient.png",154,80);checkImagePathAtPos("img/Gradient.png",155,80)})});it("Should show image preview for URIs containing quotes",function(){checkImagePathAtPos("img/don't.png",183,26);checkImagePathAtPos("img/don't.png",184,26);checkImageDataAtPos("data:image/svg+xml;utf8, <svg version='1.1' xmlns='http://www.w3.org/2000/svg'></svg>",185,26)});it("Should show image preview for a data URI inside url()",function(){runs(function(){checkImageDataAtPos("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAABq0lEQVQoU11RPUgcURD+Zt/unnrcCf4QIugRMcS7a2xjmmArRlRIFRBFgrVtGgmBRFCwTBoLsQiBGMxiJ4iksLRSFEzQRC2EAwm5g727feP3LpyFy1tm5s33zcz7RnDvG4x0zFgMJRY/jiewhy/w8FKSJkyaTuG7Fumvi+ARbQiLpcMDvH/Qj1S6Bf6vI5SxKPUG4fGm5kMf6wr08MKHILCKldoZlk0OIeuHjNuDBBcNAqvvENTLwKii1ZFoF/7G2PQDpNo8dFUt1AcSGfymz42PVfI8ghxht1bHh9MpucCiegMFdJoUOtSD+MxLPtI5T/GaHWhg+NjRk3G5utPikwb5bjzhq40JSChs6Sx1eOYAojg/fCFv7yvnBLGCLPMqxS2dZrtXnDthhySuYebnpFw3ST2RtmUVIx5z1sIKdX9qgDcOTJAj7WsNa8eTUhrY0Gwqg2FldeZiduH5r9JHvqEDigzDS/4VJvYJfMh9VLmbNO9+s9hNg5D/qjkJ8I6uW0yFtkrwHydCg+AhVgsp/8Pnu00XI+0jYJ7gjANRiEsmQ3aNOXuJhG035i1QA6g+uONCrgAAAABJRU5ErkJggg==",159,26)});runs(function(){this.after(function(){testWindow=null;brackets=null;CommandManager=null;Commands=null;EditorManager=null;extensionRequire=null;QuickView=null;SpecRunnerUtils.closeTestWindow()})})})})})});