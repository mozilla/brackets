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

    "GENERIC_ERROR": "(napaka {0})",
    "NOT_FOUND_ERR": "Datoteke /directory ni mogoče najti.",
    "NOT_READABLE_ERR": "Datoteke /directory ni mogoče prebrati.",
    "EXCEEDS_MAX_FILE_SIZE": "{APP_NAME} ne more odpreti datotek, večjih od {0} MB.",
    "FILE_EXISTS_ERR": "Datoteka ali mapa že obstaja.",
    "FILE": "datoteka",
    "FILE_TITLE": "Datoteka",
    "DIRECTORY": "mapa",
    "DIRECTORY_TITLE": "Mapa",
    "DIRECTORY_NAMES_LEDE": "Imena map",
    "FILENAMES_LEDE": "Imena datotek",
    "FILENAME": "Ime datoteke",
    "DIRECTORY_NAME": "Ime mape",
    "OPEN_DIALOG_ERROR": "Med prikazovanjem odprtega pogovornega okna je prišlo do napake. (napaka {0})",
    "READ_DIRECTORY_ENTRIES_ERROR": "Med branjem vsebine mape &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; je prišlo do napake. (napaka {1})",
    "ERROR_OPENING_FILE_TITLE": "Napaka pri odpiranju datoteke",
    "ERROR_OPENING_FILE": "Prišlo je do napake med odpiranjem datoteke &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt;. {1}",
    "ERROR_OPENING_FILES": "Prišlo je do napake med odpiranjem teh datotek:",
    "ERROR_SAVING_FILE_TITLE": "Napaka pri shranjevanju datoteke",
    "ERROR_SAVING_FILE": "Prišlo je do napake pri odpiranju datoteke &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt;. {1}",
    "ERROR_RENAMING_FILE_TITLE": "Napaka pri preimenovanju datoteke",
    "ERROR_RENAMING_DIRECTORY_TITLE": "Napaka pri preimenovanju mape",
    "ERROR_RENAMING_FILE": "Med poskusom preimenovanja datoteke &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; je prišlo do napake. {1}",
    "ERROR_RENAMING_DIRECTORY": "Med poskusom preimenovanja mape &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; je prišlo do napake. {1}",
    "ERROR_DELETING_FILE_TITLE": "Napaka pri brisanju datoteke",
    "ERROR_DELETING_DIRECTORY_TITLE": "Napaka pri brisanju mape",
    "ERROR_DELETING_FILE": "Med poskusom brisanja datoteke &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; je prišlo do napake. {1}",
    "ERROR_DELETING_DIRECTORY": "Med poskusom brisanja mape &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; je prišlo do napake. {1}",
    "INVALID_FILENAME_TITLE": "Neveljavno ime datoteke",
    "INVALID_DIRNAME_TITLE": "Neveljavno ime mape",
    "INVALID_FILENAME_MESSAGE": "Imena datotek ne morejo uporabljati besed, rezerviranih za sistem, ki se končajo s piko (.), ali uporabljati katerega od teh znakov: &lt;code class=&#39;emphasized&#39;&gt;{1}&lt;/code&gt;",
    "INVALID_DIRNAME_MESSAGE": "Imena map ne morejo uporabljati besed, rezerviranih za sistem, ki se končajo s piko (.), ali uporabljati katerega od teh znakov: &lt;code class=&#39;emphasized&#39;&gt;{1}&lt;/code&gt;",
    "ENTRY_WITH_SAME_NAME_EXISTS": "Datoteka ali mapa z imenom &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; že obstaja.",
    "ERROR_CREATING_FILE_TITLE": "Napaka pri ustvarjanju datoteke",
    "ERROR_CREATING_DIRECTORY_TITLE": "Napaka pri ustvarjanju mape",
    "ERROR_CREATING_FILE": "Med poskusom ustvarjanja datoteke &lt;span class=&#39;dialog-filename&#39;&gt;{1}&lt;/span&gt; je prišlo do napake. {2}",
    "ERROR_CREATING_DIRECTORY": "Med poskusom ustvarjanja mape &lt;span class=&#39;dialog-filename&#39;&gt;{1}&lt;/span&gt; je prišlo do napake. {2}",
    "ERROR_MAX_FILES_TITLE": "Napaka pri indeksiranju datotek",
    "EXT_MODIFIED_TITLE": "Zunanje spremembe",
    "EXT_MODIFIED_WARNING": "Datoteka &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; je bila spremenjena na disku zunaj aplikacije {APP_NAME}.&lt;br /&gt;&lt;br /&gt; Ali želite shraniti datoteko in prepisati te spremembe?",
    "EXT_MODIFIED_MESSAGE": "Datoteka &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; je bila spremenjena na disku zunaj aplikacije {APP_NAME}, ampak ima tudi neshranjene spremembe v aplikaciji {APP_NAME}.&lt;br /&gt;&lt;br /&gt; Katero različico želite obdržati?",
    "EXT_DELETED_MESSAGE": "Datoteka &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; je bila izbrisana z diska zunaj aplikacije {APP_NAME}, ampak ima neshranjene spremembe tudi v aplikaciji {APP_NAME}.&lt;br /&gt;&lt;br /&gt; Želite obdržati svoje spremembe?",
    "CONFIRM_FOLDER_DELETE_TITLE": "Potrdite brisanje",
    "CONFIRM_FOLDER_DELETE": "Ste prepričani, da želite izbrisati mapo &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt;?",
    "FILE_DELETED_TITLE": "Datoteka je izbrisana",
    "DONE": "Končano",
    "OK": "V redu",
    "CANCEL": "Prekliči",
    "SAVE_AND_OVERWRITE": "Prepiši",
    "DELETE": "Izbriši",
    "BUTTON_YES": "Da",
    "BUTTON_NO": "Ne",
    "ERROR_QUICK_EDIT_PROVIDER_NOT_FOUND": "Za trenutni položaj kazalca ni na voljo nobeno hitro urejanje",
    "ERROR_CSSQUICKEDIT_BETWEENCLASSES": "CSS Hitro urejanje: kazalec postavite na eno ime razreda",
    "ERROR_CSSQUICKEDIT_CLASSNOTFOUND": "CSS Hitro urejanje: nepopoln razredni atribut",
    "ERROR_CSSQUICKEDIT_IDNOTFOUND": "CSS Hitro urejanje: nepopoln atribut id",
    "ERROR_CSSQUICKEDIT_UNSUPPORTEDATTR": "CSS Hitro urejanje: kazalec postavite na oznako, razred ali id",
    "ERROR_TIMINGQUICKEDIT_INVALIDSYNTAX": "CSS Časovna funkcija hitrega urejanja: neveljavna sintaksa",
    "ERROR_JSQUICKEDIT_FUNCTIONNOTFOUND": "JS Hitro urejanje: postavite kazalec na ime funkcije",
    "BUTTON_NEW_RULE": "Novo pravilo",
    "ERROR_QUICK_DOCS_PROVIDER_NOT_FOUND": "Noben dokument za hitro urejanje ni na voljo za trenutni položaj kazalca",
    "CMD_FILE_NEW": "Nova datoteka",
    "CMD_FILE_NEW_FOLDER": "Nova mapa",
    "CMD_FILE_RENAME": "Preimenuj",
    "CMD_FILE_DELETE": "Izbriši",
    "CMD_CUT": "Izreži",
    "CMD_COPY": "Kopiraj",
    "CMD_PASTE": "Prilepi",
    "CMD_SELECT_ALL": "Izberi vse",
    "CMD_TOGGLE_QUICK_EDIT": "Hitro urejanje",
    "CMD_TOGGLE_QUICK_DOCS": "Hitri dokumenti",
    "DND_MAX_FILE_SIZE_EXCEEDED": "datoteka presega največjo dovoljeno velikost: 3 MB",
    "DND_UNSUPPORTED_FILE_TYPE": "nepodprta oblika datoteke",
    "DND_ERROR_UNZIP": "datoteke ni mogoče razširiti",
    "DND_ERROR_UNTAR": "datoteke ni mogoče razširiti",
    "DND_SUCCESS_UNZIP_TITLE": "Razširitev uspešno dokončana",
    "DND_SUCCESS_UNTAR_TITLE": "Razširitev uspešno dokončana",
    "DND_SUCCESS_UNZIP": "&lt;b&gt;{0}&lt;/b&gt; uspešno razširjen.",
    "DND_SUCCESS_UNTAR": "&lt;b&gt;{0}&lt;/b&gt; uspešno razširjen.",
    "COLOR_EDITOR_CURRENT_COLOR_SWATCH_TIP": "Trenutna barva",
    "COLOR_EDITOR_ORIGINAL_COLOR_SWATCH_TIP": "Izvirna barva",
    "COLOR_EDITOR_RGBA_BUTTON_TIP": "Format RGBa",
    "COLOR_EDITOR_HEX_BUTTON_TIP": "Format Hex",
    "COLOR_EDITOR_HSLA_BUTTON_TIP": "Format HSLa",
    "COLOR_EDITOR_USED_COLOR_TIP_SINGULAR": "{0} (Uporabljeno {1}-krat)",
    "COLOR_EDITOR_USED_COLOR_TIP_PLURAL": "{0} (Uporabljeno {1}-krat)",
    "CMD_JUMPTO_DEFINITION": "Pojdi na razlago",
    "CMD_SHOW_PARAMETER_HINT": "Prikaži namig parametrov",
    "NO_ARGUMENTS": "&lt;ni parametrov&gt;",
    "DETECTED_EXCLUSION_TITLE": "JavaScript Težava sklepanja datoteke",
    "CMD_ENABLE_QUICK_VIEW": "Hitri vplogled pri premiku kazalca nad elementom",
    "DOCS_MORE_LINK": "Preberite več",
    "UPLOAD_FILES_DIALOG_HEADER": "Prenesite datoteke",
    "DRAG_AREA_UPLOAD_FILES_DIALOG_TEXT": "... ali jih povlecite sem.",
    "DROP_AREA_UPLOAD_FILES_DIALOG_TEXT": "V redu, spustite datoteke!",
    "UPLOADING_INDICATOR": "Prenašanje ...",
    "BUTTON_FROM_YOUR_COMPUTER": "Iz vašega računalnika ...",
    "TAKE_A_SELFIE": "Naredite selfi ...",
    "CMD_MOVE_FILE": "Premakni ...",
    "PROJECT_ROOT": "Korenska mapa projekta",
    "PICK_A_FOLDER_TO_MOVE_TO": "Izberite mapo",
    "ERROR_MOVING_FILE_DIALOG_HEADER": "Napaka pri premikanju",
    "UNEXPECTED_ERROR_MOVING_FILE": "Med poskusom premikanja {0} v {1} je prišlo do nepričakovane napake",
    "ERROR_MOVING_FILE_SAME_NAME": "Datoteka ali mapa z imenom {0} že obstaja v {1}. Za nadaljevanje preimenujte eno ali drugo."
});
