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

    "GENERIC_ERROR": "(gabim {0})",
    "NOT_FOUND_ERR": "S’u gjet dot kartelë/drejtori.",
    "NOT_READABLE_ERR": "S’u lexua dot kartelë/drejtori.",
    "EXCEEDS_MAX_FILE_SIZE": "Kartelat më të mëdha se {0} MB s’mund të hapen me {APP_NAME}.",
    "FILE_EXISTS_ERR": "Kartela ose drejtoria ekziston tashmë.",
    "FILE": "kartelë",
    "FILE_TITLE": "Kartelë",
    "DIRECTORY": "drejtori",
    "DIRECTORY_TITLE": "Drejtori",
    "DIRECTORY_NAMES_LEDE": "Emra drejtorish",
    "FILENAMES_LEDE": "Emra kartelash",
    "FILENAME": "Emër kartele",
    "DIRECTORY_NAME": "Emër Drejtorie",
    "OPEN_DIALOG_ERROR": "Ndodhi një gabim teksa shfaqej dialogu i hapjes së kartelës. (gabim {0})",
    "READ_DIRECTORY_ENTRIES_ERROR": "Ndodhi një gabim kur po lexohej lënda e drejtorisë <span class='dialog-filename'>{0}</span>. (gabim {1})",
    "ERROR_OPENING_FILE_TITLE": "Gabim Në Hapje Kartele",
    "ERROR_OPENING_FILE": "Ndodhin një gabim kur po provohej të hapej kartela <span class='dialog-filename'>{0}</span>. {1}",
    "ERROR_OPENING_FILES": "Ndodhi një gabim kur po provohej të hapeshin kratelat vijuese:",
    "ERROR_SAVING_FILE_TITLE": "Gabim Në Ruajtjen e Kartelës",
    "ERROR_SAVING_FILE": "Ndodhi një gabim kur po provohej të ruhej kartela <span class='dialog-filename'>{0}</span>. {1}",
    "ERROR_RENAMING_FILE_TITLE": "Gabim Në Riemërtimin e Kartelës",
    "ERROR_RENAMING_DIRECTORY_TITLE": "Gabim Në Riemërtimin e Drejtorisë",
    "ERROR_RENAMING_FILE": "Ndodhi një gabim kur po provohej të riemërtohej kartela <span class='dialog-filename'>{0}</span>. {1}",
    "ERROR_RENAMING_DIRECTORY": "Ndodhi një gabim kur po provohej të riemërtohej drejtoria <span class='dialog-filename'>{0}</span>. {1}",
    "ERROR_DELETING_FILE_TITLE": "Gabim Në Fshirje Kartele",
    "ERROR_DELETING_DIRECTORY_TITLE": "Gabim Në Fshirje Drejtorie",
    "ERROR_DELETING_FILE": "Ndodhi një gabim kur po provohej të fshihej kartela <span class='dialog-filename'>{0}</span>. {1}",
    "ERROR_DELETING_DIRECTORY": "Ndodhi një gabim kur po provohej të fshihej drejtoria <span class='dialog-filename'>{0}</span>. {1}",
    "INVALID_FILENAME_TITLE": "Emër i Pavlefshëm Kartele",
    "INVALID_DIRNAME_TITLE": "Emër i Pavlefshëm Drejtorie",
    "INVALID_FILENAME_MESSAGE": "Emrat e kartelave s’mund të përdorin fjalë të rezervuara për sistemin, të përfundojnë me pika (.) ose të përdorin shenjat vijuese: <code class='emphasized'>{1}</code>",
    "INVALID_DIRNAME_MESSAGE": "Emrat e drejtorive s’mund të përdorin fjalë të rezervuara për sistemin, të përfundojnë me pika (.) ose të përdorin shenjat vijuese: <code class='emphasized'>{1}</code>",
    "ENTRY_WITH_SAME_NAME_EXISTS": "Ka tashmë një kartelë apo drejtori me emrin <span class='dialog-filename'>{0}</span>.",
    "ERROR_CREATING_FILE_TITLE": "Gabim Në Krijim Kartele",
    "ERROR_CREATING_DIRECTORY_TITLE": "Gabim Në Krijim Drejtorie",
    "ERROR_CREATING_FILE": "Ndodhi një gabim kur po provohej të krijohej kartela <span class='dialog-filename'>{1}</span>. {2}",
    "ERROR_CREATING_DIRECTORY": "Ndodhi një gabim kur po provohej të krijohej drejtoria <span class='dialog-filename'>{1}</span>. {2}",
    "ERROR_MAX_FILES_TITLE": "Gabim Në Indeksim Kartelash",
    "EXT_MODIFIED_TITLE": "Ndryshime të Jashtme",
    "EXT_MODIFIED_WARNING": "<span class='dialog-filename'>{0}</span> është ndryshuar në disk jashtë {APP_NAME}.<br /><br />Doni të ruhet kartela dhe të mbishkruhen këto ndryshime?",
    "EXT_MODIFIED_MESSAGE": "<span class='dialog-filename'>{0}</span> është ndryshuar në disk jashtë {APP_NAME}, por ka edhe ndryshime të paruajtura në {APP_NAME}.<br /><br />Cilin version doni të mbani?",
    "EXT_DELETED_MESSAGE": "<span class='dialog-filename'>{0}</span> është fshirë në disk jashtë {APP_NAME}, por në {APP_NAME} ka ndryshime të paruajtura.<br /><br />Doni të mbahen ndryshimet tuaja?",
    "CONFIRM_FOLDER_DELETE_TITLE": "Ripohojeni Fshirjen",
    "CONFIRM_FOLDER_DELETE": "Jeni i sigurt se doni të fshihet dosja <span class='dialog-filename'>{0}</span>?",
    "FILE_DELETED_TITLE": "Kartela u Fshi",
    "DONE": "U krye",
    "OK": "OK",
    "CANCEL": "Anuloje",
    "SAVE_AND_OVERWRITE": "Mbishkruaje",
    "DELETE": "Fshije",
    "BUTTON_YES": "Po",
    "BUTTON_NO": "Jo",
    "ERROR_QUICK_EDIT_PROVIDER_NOT_FOUND": "Për pozicionin e tanishëm të kursorit s’ka Përpunim të Shpejtë",
    "ERROR_CSSQUICKEDIT_BETWEENCLASSES": "Përpunim i Shpejtë CSS: vendoseni kursorin në një emër klase njëshe",
    "ERROR_CSSQUICKEDIT_CLASSNOTFOUND": "Përpunim i Shpejtë CSS: atribut klase jo i plotë",
    "ERROR_CSSQUICKEDIT_IDNOTFOUND": "Përpunim i Shpejtë CSS: atribut id-je jo i plotë",
    "ERROR_CSSQUICKEDIT_UNSUPPORTEDATTR": "Përpunim i Shpejtë CSS: vendoseni kursorin në etiketë, klasë ose id",
    "ERROR_TIMINGQUICKEDIT_INVALIDSYNTAX": "Përpunim i Shpejtë Funksioni Kohësh CSS: sintaksë e pavlefshme",
    "ERROR_JSQUICKEDIT_FUNCTIONNOTFOUND": "Përpunim i Shpejtë JS: vendoseni kursorin mbi emër funksioni",
    "BUTTON_NEW_RULE": "Rregull i Ri",
    "ERROR_QUICK_DOCS_PROVIDER_NOT_FOUND": "S’ka dokumentim Përpunimesh të Shpejta për pozicionin e tanishëm të kursorit",
    "CMD_FILE_NEW": "Kartelë e Re",
    "CMD_FILE_NEW_FOLDER": "Dosje e Re",
    "CMD_FILE_RENAME": "Riemërtoje",
    "CMD_FILE_DELETE": "Fshije",
    "CMD_FILE_DOWNLOAD": "Shkarkoje",
    "CMD_CUT": "Prije",
    "CMD_COPY": "Kopjoje",
    "CMD_PASTE": "Ngjite",
    "CMD_SELECT_ALL": "Përzgjidhi Krejt",
    "CMD_TOGGLE_QUICK_EDIT": "Përpunim i Shpejtë",
    "CMD_TOGGLE_QUICK_DOCS": "Dokumentim Përpunimesh të Shpejta",
    "DND_MAX_SIZE_EXCEEDED": "kartela tejkalon madhësinë maksimum të mbuluar: {0} MB.",
    "DND_UNSUPPORTED_FILE_TYPE": "lloj i pambuluar kartele",
    "DND_ERROR_UNZIP": "s’arrihet të shpaketohet kartela zip",
    "DND_ERROR_UNTAR": "s’arrihet të shpaketohet kartela tar",
    "DND_SUCCESS_UNZIP_TITLE": "Shpaketimi zip u Plotësua me Sukses",
    "DND_SUCCESS_UNTAR_TITLE": "Shpaketimi tar u Plotësua me Sukses",
    "DND_SUCCESS_UNZIP": "U shpaketua me sukses nga zip-i <b>{0}</b>.",
    "DND_SUCCESS_UNTAR": "U shpaketua me sukses nga tar-i <b>{0}</b>.",
    "IMAGE_DIMENSIONS": "{0} (width) &times; {1} (height) piksel",
    "COLOR_EDITOR_CURRENT_COLOR_SWATCH_TIP": "Ngjyra e Tanishme",
    "COLOR_EDITOR_ORIGINAL_COLOR_SWATCH_TIP": "Ngjyra Origjinale",
    "COLOR_EDITOR_RGBA_BUTTON_TIP": "Format RGBa",
    "COLOR_EDITOR_HEX_BUTTON_TIP": "Format Hex",
    "COLOR_EDITOR_HSLA_BUTTON_TIP": "Format HSLa",
    "COLOR_EDITOR_USED_COLOR_TIP_SINGULAR": "{0} (Përdorur {1} herë)",
    "COLOR_EDITOR_USED_COLOR_TIP_PLURAL": "{0} (Përdorur {1} herë)",
    "CMD_JUMPTO_DEFINITION": "Hidhu te Përkufizimi",
    "CMD_SHOW_PARAMETER_HINT": "Shfaq Ndihmëz Parametri",
    "NO_ARGUMENTS": "<s’ka parametra>",
    "CMD_ENABLE_QUICK_VIEW": "Shikim i Shpejtë kur i Kalohet Kursori Përsipër",
    "DOCS_MORE_LINK": "Lexoni më tepër",
    "UPLOAD_FILES_DIALOG_HEADER": "Ngarkoni Kartela",
    "DRAG_AREA_UPLOAD_FILES_DIALOG_TEXT": "…ose tërhiqni kartelat këtu.",
    "DROP_AREA_UPLOAD_FILES_DIALOG_TEXT": "OK, hidhi në qarkullim kartelat!",
    "UPLOADING_INDICATOR": "Po ngarkohet…",
    "BUTTON_FROM_YOUR_COMPUTER": "Nga Kompjuteri juaj…",
    "TAKE_A_SELFIE": "Bëni një <em>Selfie</em>…",
    "CMD_MOVE_FILE": "Shpjereni Te…",
    "PROJECT_ROOT": "Rrënjë Projekti",
    "PICK_A_FOLDER_TO_MOVE_TO": "Zgjidhni një dosje",
    "ERROR_MOVING_FILE_DIALOG_HEADER": "Gabim Lëvizjeje",
    "UNEXPECTED_ERROR_MOVING_FILE": "Ndodhi një gabim i papritur kur po provohej të shpihej {0} te {1}",
    "ERROR_MOVING_FILE_SAME_NAME": "Ka tashmë një kartelë ose dosje me emrin {0} te {1}. Që të vazhdohet, shihni mundësinë e riemërtimit të njërës prej tyre."
});
