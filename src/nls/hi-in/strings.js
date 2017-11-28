/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define({

    "GENERIC_ERROR": "(त्रुटि {0})",
    "FILE": "फ़ाइल",
    "FILE_TITLE": "फाइल",
    "DIRECTORY": "निर्देशिका",
    "DIRECTORY_TITLE": "निर्देशिका",
    "DIRECTORY_NAMES_LEDE": "निर्देशिका नाम",
    "FILENAMES_LEDE": "फ़ाइलनाम",
    "FILENAME": "फाइलनाम",
    "DIRECTORY_NAME": "निर्देशिका नाम",
    "INVALID_FILENAME_TITLE": "अमान्य फ़ाइल नाम",
    "INVALID_DIRNAME_TITLE": "अमान्य निर्देशिका नाम",
    "ERROR_CREATING_FILE_TITLE": "फ़ाइल बनाने में त्रुटि",
    "EXT_MODIFIED_TITLE": "बाह्य परिवर्तन",
    "EXT_MODIFIED_WARNING": "<span class='dialog-filename'>{0}</span>को {APP_NAME} के बाहर डिस्क पर संशोधित किया गया है.<br /><br />क्या आप फ़ाइल को सहेजना और उन परिवर्तनों का उपरिलेखन करना चाहते हैं?",
    "EXT_MODIFIED_MESSAGE": "<span class='dialog-filename'>{0}</span>को {APP_NAME} के बाहर डिस्क पर संशोधित किया गया है, लेकिन {APP_NAME} में नहीं सहेजे गए परिवर्तन भी हैं.<br /><br />आप किस संस्करण को रखना चाहते हैं?",
    "EXT_DELETED_MESSAGE": "<span class='dialog-filename'>{0}</span>को {APP_NAME} के बाहर डिस्क पर से हटा दिया गया है, लेकिन {APP_NAME} में नहीं सहेजे गए परिवर्तन हैं.<br /><br />क्या आप अपना परिवर्तन रखना चाहते हैं?",
    "CONFIRM_FOLDER_DELETE_TITLE": "हटाने की पुष्टि करें",
    "CONFIRM_FOLDER_DELETE": "आप सुनिश्चित हैं कि आप फ़ोल्डर <span class='dialog-filename'>{0}</span>को हटाना चाहते हैं?",
    "FILE_DELETED_TITLE": "फ़ाइल हटायी गई",
    "DONE": "समाप्त",
    "OK": "ठीक",
    "CANCEL": "रद्द करें",
    "SAVE_AND_OVERWRITE": "अधिलेखित करें",
    "DELETE": "मिटाएँ",
    "BUTTON_YES": "हाँ",
    "BUTTON_NO": "नहीं",
    "ERROR_QUICK_EDIT_PROVIDER_NOT_FOUND": "वर्तमान कर्सर स्थिति के लिए कोई त्वरित संपादन उपलब्ध नहीं है",
    "ERROR_CSSQUICKEDIT_BETWEENCLASSES": "CSS त्वरित संपादन: एक एकल वर्ग के नाम पर कर्सर रखें",
    "ERROR_CSSQUICKEDIT_CLASSNOTFOUND": "CSS त्वरित संपादन: अपूर्ण वर्ग विशेषता",
    "ERROR_CSSQUICKEDIT_IDNOTFOUND": "CSS त्वरित संपादन: अधूरी आईडी विशेषता",
    "ERROR_CSSQUICKEDIT_UNSUPPORTEDATTR": "CSS त्वरित संपादन: टैग, वर्ग या आईडी में कर्सर रखें",
    "ERROR_TIMINGQUICKEDIT_INVALIDSYNTAX": "CSS समय फ़ंक्शन त्वरित संपादन: अमान्य वाक्य - विन्यास",
    "ERROR_JSQUICKEDIT_FUNCTIONNOTFOUND": "JS त्वरित संपादन: फ़ंक्शन नाम में कर्सर रखें",
    "BUTTON_NEW_RULE": "नया नियम",
    "ERROR_QUICK_DOCS_PROVIDER_NOT_FOUND": "वर्तमान कर्सर स्थिति के लिए कोई त्वरित दस्तावेज़ उपलब्ध नहीं है",
    "CMD_FILE_NEW": "नई फ़ाइल",
    "CMD_FILE_NEW_FOLDER": "नया‌ फ़ोल्डर",
    "CMD_FILE_RENAME": "नाम बदलें",
    "CMD_FILE_DELETE": "मिटाएँ",
    "CMD_FILE_DOWNLOAD": "डाउनलोड",
    "CMD_CUT": "काटें",
    "CMD_COPY": "प्रतिलिपि बनाएँ",
    "CMD_PASTE": "चिपकाएँ",
    "CMD_SELECT_ALL": "सभी चुनें",
    "CMD_TOGGLE_QUICK_EDIT": "त्वरित संपादन",
    "CMD_TOGGLE_QUICK_DOCS": "त्‍वरित दस्तावेज़",
    "DND_MAX_SIZE_EXCEEDED": "फ़ाइल अधिकतम समर्थित आकार से बड़ा है: {0} MB.",
    "DND_UNSUPPORTED_FILE_TYPE": "असमर्थित फ़ाइल प्रकार",
    "DND_ERROR_UNZIP": "फ़ाइल को खोलने में असमर्थ",
    "DND_ERROR_UNTAR": "फ़ाइल को अनवरोधित करने में असमर्थ",
    "DND_SUCCESS_UNZIP_TITLE": "अनज़िप सफलतापूर्वक पूरा हुआ",
    "DND_SUCCESS_UNTAR_TITLE": "अनटार सफलतापूर्वक पूरा हुआ",
    "DND_SUCCESS_UNZIP": "सफलतापूर्वक अनज़िप किया गया <b>{0}</b>.",
    "DND_SUCCESS_UNTAR": "सफलतापूर्वक अनटार किया गया <b>{0}</b>.",
    "IMAGE_DIMENSIONS": "{0} (चौड़ाई) &times; {1} (ऊँचाई) पिक्सेल",
    "IMAGE_FILTERS_TITLE": "छवि फ़िल्टर",
    "IMAGE_FILTER_PINHOLE": "पिनहोल",
    "IMAGE_FILTER_SEPIA": "सेपिया",
    "IMAGE_FILTER_CONTRAST": "असादृश्य",
    "IMAGE_FILTER_VINTAGE": "विशिष्ट",
    "IMAGE_FILTER_SUNRISE": "सूर्योदय",
    "IMAGE_FILTER_EMBOSS": "अलंकृत",
    "IMAGE_FILTER_GLOWING_SUN": "चमकीला सूर्य",
    "IMAGE_SAVE_WITH_FILTERS": "लागू करें",
    "IMAGE_RESET_FILTERS": "रद्द करें",
    "COLOR_EDITOR_CURRENT_COLOR_SWATCH_TIP": "वर्तमान रंग",
    "COLOR_EDITOR_ORIGINAL_COLOR_SWATCH_TIP": "मूल रंग",
    "COLOR_EDITOR_RGBA_BUTTON_TIP": "RGBa प्रारूप",
    "COLOR_EDITOR_HEX_BUTTON_TIP": "हेक्स प्रारूप",
    "COLOR_EDITOR_HSLA_BUTTON_TIP": "HSLa प्रारूप",
    "COLOR_EDITOR_USED_COLOR_TIP_SINGULAR": "{0} ({1} बार उपयोग किया गया)",
    "COLOR_EDITOR_USED_COLOR_TIP_PLURAL": "{0} ({1} बार उपयोग किया गया)",
    "CMD_JUMPTO_DEFINITION": "परिभाषा पर जाएँ",
    "CMD_SHOW_PARAMETER_HINT": "पैरामीटर संकेत दिखाएँ",
    "NO_ARGUMENTS": "<कोई मापदण्ड नहीं>",
    "DETECTED_EXCLUSION_TITLE": "JavaScript फ़ाइल निष्कर्षण समस्या",
    "CMD_ENABLE_QUICK_VIEW": "हॉवर पर त्वरित दृश्य",
    "DOCS_MORE_LINK": "और पढ़ें",
    "UPLOAD_FILES_DIALOG_HEADER": "फ़ाइलें अपलोड करें",
    "DRAG_AREA_UPLOAD_FILES_DIALOG_TEXT": "...या फ़ाइलें यहाँ खींचें.",
    "DROP_AREA_UPLOAD_FILES_DIALOG_TEXT": "ठीक है, फ़ाइलें जारी करें!",
    "UPLOADING_INDICATOR": "अपलोड हो रहा है...",
    "BUTTON_FROM_YOUR_COMPUTER": "अपने कंप्यूटर से...",
    "TAKE_A_SELFIE": "सेल्फ़ी ले...",
    "CMD_MOVE_FILE": "इस पर जाएँ...",
    "PROJECT_ROOT": "परियोजना आधार",
    "PICK_A_FOLDER_TO_MOVE_TO": "एक फ़ोल्डर चुनें",
    "ERROR_MOVING_FILE_DIALOG_HEADER": "त्रुटि हटाएँ",
    "UNEXPECTED_ERROR_MOVING_FILE": "{0} से {1} को स्थानांतरित करने का प्रयास करते समय एक अनपेक्षित त्रुटि हुई",
    "ERROR_MOVING_FILE_SAME_NAME": "{0} नाम वाली फ़ाइल या फ़ोल्डर पहले से ही {1} में मौजूद है. जारी रखने हेतु किसी एक का नाम बदलें.",
    "CONSOLE_TITLE": "नियंत्रक पट",
    "CONSOLE_TOOLTIP": "JavaScript नियंत्रक पट खोलें",
    "CONSOLE_CLEAR": "खाली करें",
    "CONSOLE_CLEAR_TOOLTIP": "नियंत्रक पट साफ करें",
    "CONSOLE_CLOSE_TOOLTIP": "नियंत्रक पट बंद करें",
    "CONSOLE_EMPTY_STRING": "रिक्त स्ट्रिंग"
});
