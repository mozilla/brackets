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

    "GENERIC_ERROR": "(zmólka {0})",
    "NOT_FOUND_ERR": "Dataja/zarědnik njedajo se namakaś.",
    "NOT_READABLE_ERR": "Dataja/zapis njedajo se cytaś.",
    "EXCEEDS_MAX_FILE_SIZE": "Dataje, kótarež su wětše ako {0} MB njedaju se w {APP_NAME} wócyniś.",
    "FILE_EXISTS_ERR": "Dataja abo zarědnik južo eksistěrujo.",
    "FILE": "dataja",
    "FILE_TITLE": "Dataja",
    "DIRECTORY": "zarědnik",
    "DIRECTORY_TITLE": "Zarědnik",
    "DIRECTORY_NAMES_LEDE": "Mjenja zarědnikow",
    "FILENAMES_LEDE": "Datajowe mjenja",
    "FILENAME": "Datajowe mě",
    "DIRECTORY_NAME": "Mě zarědnika",
    "OPEN_DIALOG_ERROR": "Pśi pokazowanju dialoga wócynjanja datajow jo zmólka nastała. (zmólka {0})",
    "READ_DIRECTORY_ENTRIES_ERROR": "Pśi cytanju wopśimjeśa zarědnika &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; jo zmólka nastała. (zmólka {1})",
    "ERROR_OPENING_FILE_TITLE": "Zmólka pśi wócynjanju dataje",
    "ERROR_OPENING_FILE": "Pśi wopyśe dataju &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; wócyniś, jo zmólka nastała. {1}",
    "ERROR_OPENING_FILES": "Pśi wopyśe slědujuce dataje wócyniś, jo zmólka nastała:",
    "ERROR_SAVING_FILE_TITLE": "Zmólka pśi składowanju dataje",
    "ERROR_SAVING_FILE": "Pśi wopyśe dataju &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; składowaś, jo zmólka nastała. {1}",
    "ERROR_RENAMING_FILE_TITLE": "Zmólka pśi pśemjenjowanju dataje",
    "ERROR_RENAMING_DIRECTORY_TITLE": "Zmólka pśi pśemjenjowanju zarědnika",
    "ERROR_RENAMING_FILE": "Pśi wopyśe dataju &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; pśemjeniś, jo zmólka nastała. {1}",
    "ERROR_RENAMING_DIRECTORY": "Pśi wopyśe zapis &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; pśemjeniś, jo zmólka nastała. {1}",
    "ERROR_DELETING_FILE_TITLE": "Zmólka pśi lašowanju dataje",
    "ERROR_DELETING_DIRECTORY_TITLE": "Zmólka pśi lašowanju zarědnika",
    "ERROR_DELETING_FILE": "Pśi wopyśe dataju &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; lašowaś, jo zmólka nastała. {1}",
    "ERROR_DELETING_DIRECTORY": "Pśi wopyśe zarědnik &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; lašowaś, jo zmólka nastała. {1}",
    "INVALID_FILENAME_TITLE": "Njepłaśiwe datajowe mě",
    "INVALID_DIRNAME_TITLE": "Njepłaśiwe zarědnikowe mě",
    "INVALID_FILENAME_MESSAGE": "Datajowe mjenja njesměju rezerwěrowane systemowe słowa wužywaś, se z dypkami (.) kóńcyś abo slědujuce znamuška wužywaś: &lt;code class=&#39;emphasized&#39;&gt;{1}&lt;/code&gt;",
    "INVALID_DIRNAME_MESSAGE": "Zarědnikowe mjenja njesměju rezerwěrowane systemowe słowa wužywaś, se z dypkami (.) kóńcyś abo slědujuce znamuška wužywaś: &lt;code class=&#39;emphasized&#39;&gt;{1}&lt;/code&gt;",
    "ENTRY_WITH_SAME_NAME_EXISTS": "Dataja abo zarědnik z mjenim &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; južo eksistěrujo.",
    "ERROR_CREATING_FILE_TITLE": "Zmólka pśi napóranju dataje",
    "ERROR_CREATING_DIRECTORY_TITLE": "Zmólka pśi napóranju zarědnika",
    "ERROR_CREATING_FILE": "Pśi wopyśe dataju &lt;span class=&#39;dialog-filename&#39;&gt;{1}&lt;/span&gt; napóraś, jo zmólka nastała. {2}",
    "ERROR_CREATING_DIRECTORY": "Pśi wopyśe zarědnik &lt;span class=&#39;dialog-filename&#39;&gt;{1}&lt;/span&gt; napóraś, jo zmólka nastała. {2}",
    "ERROR_MAX_FILES_TITLE": "Zmólka pśi indicěrowanju datajow",
    "EXT_MODIFIED_TITLE": "Wenkowne změny",
    "EXT_MODIFIED_WARNING": "Dataja &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; jo se na plaśe zwenka {APP_NAME} změniła.&lt;br /&gt;&lt;br /&gt;Cośo dataju składowaś a te změny pśepisowaś?",
    "EXT_MODIFIED_MESSAGE": "Dataja &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; jo se na plaśei zwenka {APP_NAME} změniła, ale su teke njeskłaźone změny w {APP_NAME}.&lt;br /&gt;&lt;br /&gt;Kótaru wersiju cośo zachowaś?",
    "EXT_DELETED_MESSAGE": "Dataja &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; jo se na plaśe zwenka {APP_NAME} změniła, ale su teke njeskłaźone změny w {APP_NAME}.&lt;br /&gt;&lt;br /&gt;Kótaru wersiju cośo zachowaś?",
    "CONFIRM_FOLDER_DELETE_TITLE": "Lašowanje wobkšuśiś",
    "CONFIRM_FOLDER_DELETE": "Cośo napšawdu zarědnik &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; lašowaś?",
    "FILE_DELETED_TITLE": "Dataja jo se wulašowała",
    "DONE": "Dokóńcone",
    "OK": "W pórěźe",
    "CANCEL": "Pśetergnuś",
    "SAVE_AND_OVERWRITE": "Pśepisaś",
    "DELETE": "Lašowaś",
    "BUTTON_YES": "Jo",
    "BUTTON_NO": "Ně",
    "ERROR_QUICK_EDIT_PROVIDER_NOT_FOUND": "Žedna spěšna změna za aktualnu kursorowu poziciji k dispoziciji",
    "ERROR_CSSQUICKEDIT_BETWEENCLASSES": "Spěšna změna CSS: Placěrujśo kursor nad mjenim jadnotliweje klase",
    "ERROR_CSSQUICKEDIT_CLASSNOTFOUND": "Spěšna změna CSS: Njedopołny klasowy atribut",
    "ERROR_CSSQUICKEDIT_IDNOTFOUND": "Spěšna změna CSS: Njedopołny atribut ID",
    "ERROR_CSSQUICKEDIT_UNSUPPORTEDATTR": "Spěšna změna CSS: placěrujśo kursor w elemenśe, klasy abo ID",
    "ERROR_TIMINGQUICKEDIT_INVALIDSYNTAX": "Spěšna změna casoweje funkcije CSS: Njepłaśiwa syntaksa",
    "ERROR_JSQUICKEDIT_FUNCTIONNOTFOUND": "Spěšna změna JS: Placěrujśo kursor w funkciskem mjenju",
    "BUTTON_NEW_RULE": "Nowe pšawidło",
    "ERROR_QUICK_DOCS_PROVIDER_NOT_FOUND": "Žeden Quick Docs ta aktualnu kursorowu poziciju k dispoziciji",
    "CMD_FILE_NEW": "Nowa dataja",
    "CMD_FILE_NEW_FOLDER": "Nowy zarědnik",
    "CMD_FILE_RENAME": "Pśemjeniś",
    "CMD_FILE_DELETE": "Lašowaś",
    "CMD_CUT": "Wurězaś",
    "CMD_COPY": "Kopěrowaś",
    "CMD_PASTE": "Zasajźiś",
    "CMD_SELECT_ALL": "Wšykno wubraś",
    "CMD_TOGGLE_QUICK_EDIT": "Spěšna změna",
    "CMD_TOGGLE_QUICK_DOCS": "Quick Docs",
    "DND_MAX_FILE_SIZE_EXCEEDED": "dataja pśekšaca maksimalnu pódpěranu wjelikosć: 3 MB",
    "DND_UNSUPPORTED_FILE_TYPE": "njepódpěrany datajowy typ",
    "DND_ERROR_UNZIP": "zip-dataja njedajo se wupakowaś",
    "DND_ERROR_UNTAR": "tar-dataja njedajo se wupakowaś",
    "DND_SUCCESS_UNZIP_TITLE": "Zip-dataja jo se wuspěšnje wupakowała",
    "DND_SUCCESS_UNTAR_TITLE": "Tar-dataja jo se wuspěšnje wupakowała",
    "DND_SUCCESS_UNZIP": "Zip-dataja &lt;b&gt;{0}&lt;/b&gt; jo se wuspěšnje wupakowała.",
    "DND_SUCCESS_UNTAR": "Tar-dataja &lt;b&gt;{0}&lt;/b&gt; jo se wuspěšnje wupakowała.",
    "COLOR_EDITOR_CURRENT_COLOR_SWATCH_TIP": "Aktualna barwa",
    "COLOR_EDITOR_ORIGINAL_COLOR_SWATCH_TIP": "Originalna barwa",
    "COLOR_EDITOR_RGBA_BUTTON_TIP": "Format RGBa",
    "COLOR_EDITOR_HEX_BUTTON_TIP": "Heksadecimalny format",
    "COLOR_EDITOR_HSLA_BUTTON_TIP": "Format HSLa",
    "COLOR_EDITOR_USED_COLOR_TIP_SINGULAR": "{0} ({1} raz wužyty)",
    "COLOR_EDITOR_USED_COLOR_TIP_PLURAL": "{0} ({1} razow wužyte)",
    "CMD_JUMPTO_DEFINITION": "K definiciji skócyś",
    "CMD_SHOW_PARAMETER_HINT": "Parametrowy pokaz pokazaś",
    "NO_ARGUMENTS": "&lt;žedne parametry&gt;",
    "DETECTED_EXCLUSION_TITLE": "JavaScript: Problem datajoweje inference",
    "CMD_ENABLE_QUICK_VIEW": "Spěšny pśeglěd pśi pokazowanju z myšku",
    "DOCS_MORE_LINK": "Wěcej cytaś",
    "UPLOAD_FILES_DIALOG_HEADER": "Dataje nagraś",
    "DRAG_AREA_UPLOAD_FILES_DIALOG_TEXT": "...abo dataje sem śěgnuś.",
    "DROP_AREA_UPLOAD_FILES_DIALOG_TEXT": "W pórěźe, dataje wózjawiś!",
    "UPLOADING_INDICATOR": "Nagrawa so...",
    "BUTTON_FROM_YOUR_COMPUTER": "Z wašogo licadła...",
    "TAKE_A_SELFIE": "Selfie cyniś...",
    "CMD_MOVE_FILE": "Pśesunuś do...",
    "PROJECT_ROOT": "Kórjenjowy zarědnik projekta",
    "PICK_A_FOLDER_TO_MOVE_TO": "Zarědnik wubraś",
    "ERROR_MOVING_FILE_DIALOG_HEADER": "Zmólka pśi pśesuwanju",
    "UNEXPECTED_ERROR_MOVING_FILE": "Pśi přesuwanju dataje/zarědnika {0} do {1} jo njewótčakana zmólka nastała",
    "ERROR_MOVING_FILE_SAME_NAME": "Dataja abo zarědnik z mjenim {0} w {1} južo eksistěrujo. Pśemjeńśo pšosym jadnu dataju abo jaden zarědnik z njeju, aby pókšacował."
});
