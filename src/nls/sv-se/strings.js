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

    "GENERIC_ERROR": "(fel {0})",
    "NOT_FOUND_ERR": "Filen /directory kunde inte hittas.",
    "NOT_READABLE_ERR": "Filen /directory kunde inte läsas.",
    "EXCEEDS_MAX_FILE_SIZE": "Filer större än {0} MB kan inte öppnas i {APP_NAME}.",
    "FILE_EXISTS_ERR": "Filen eller mappen finns redan.",
    "FILE": "fil",
    "FILE_TITLE": "Fil",
    "DIRECTORY": "mapp",
    "DIRECTORY_TITLE": "Mapp",
    "DIRECTORY_NAMES_LEDE": "Mappnamn",
    "FILENAMES_LEDE": "Filnamn",
    "FILENAME": "Filnamn",
    "DIRECTORY_NAME": "Mappnamn",
    "OPEN_DIALOG_ERROR": "Ett fel inträffade vid öppning av fil-dialogen. (fel {0})",
    "READ_DIRECTORY_ENTRIES_ERROR": "Ett fel uppstod vid läsning av innehållet i mappen &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt;. (fel {1})",
    "ERROR_OPENING_FILE_TITLE": "Ett fel inträffade när filen öppnades",
    "ERROR_OPENING_FILE": "Ett fel uppstod vid försök att öppna filen &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt;. {1}",
    "ERROR_OPENING_FILES": "Ett fel inträffade vid försök att öppna följande filer:",
    "ERROR_SAVING_FILE_TITLE": "Fel när filen sparades",
    "ERROR_SAVING_FILE": "Ett fel inträffade vid försök att spara filen &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt;. {1}",
    "ERROR_RENAMING_FILE_TITLE": "Ett fel uppstod när en fil skulle byta namn",
    "ERROR_RENAMING_DIRECTORY_TITLE": "Ett fel uppstod när en mapp skulle byta namn",
    "ERROR_RENAMING_FILE": "Ett fel uppstod vid försök att byta namn på filen &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt;. {1}",
    "ERROR_RENAMING_DIRECTORY": "Ett fel uppstod vid försök att byta namn på mappen &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt;. {1}",
    "ERROR_DELETING_FILE_TITLE": "Fel vid borttagning av fil",
    "ERROR_DELETING_DIRECTORY_TITLE": "Fel vid borttagning av mapp",
    "ERROR_DELETING_FILE": "Ett fel uppstod vid försök att ta bort filen &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt;. {1}",
    "ERROR_DELETING_DIRECTORY": "Ett fel uppstod vid försök att ta bort mappen &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt;. {1}",
    "INVALID_FILENAME_TITLE": "Ogiltigt filnamn",
    "INVALID_DIRNAME_TITLE": "Ogiltigt mappnamn",
    "INVALID_FILENAME_MESSAGE": "Filnamn kan inte använda systemet reserverade ord, avslutas med punkter (.) eller använda någon av följande tecken: &lt;code class=&#39;emphasized&#39;&gt;{1}&lt;/code&gt;",
    "INVALID_DIRNAME_MESSAGE": "Mappnamn kan inte använda systemet reserverade ord, avslutas med punkter (.) eller använda någon av följande tecken: &lt;code class=&#39;emphasized&#39;&gt;{1}&lt;/code&gt;",
    "ENTRY_WITH_SAME_NAME_EXISTS": "En fil eller mapp med namnet &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; finns redan.",
    "ERROR_CREATING_FILE_TITLE": "Det gick inte att skapa fil",
    "ERROR_CREATING_DIRECTORY_TITLE": "Det gick inte att skapa mapp",
    "ERROR_CREATING_FILE": "Ett fel uppstod vid försök att skapa filen &lt;span class=&#39;dialog-filename&#39;&gt;{1}&lt;/span&gt;. {2}",
    "ERROR_CREATING_DIRECTORY": "Ett fel uppstod vid försök att skapa mappen &lt;span class=&#39;dialog-filename&#39;&gt;{1}&lt;/span&gt;. {2}",
    "ERROR_MAX_FILES_TITLE": "Det gick inte att indexera filer",
    "EXT_MODIFIED_TITLE": "Externa ändringar",
    "EXT_MODIFIED_WARNING": "&lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; har blivit modifierad på disk utanför {APP_NAME}.&lt;br /&gt;&lt;br /&gt;Vill du spara filen och skriva över ändringarna?",
    "EXT_MODIFIED_MESSAGE": "&lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; har blivit modifierad på disk utanför {APP_NAME}, men har också osparade ändringar i {APP_NAME}.&lt;br /&gt;&lt;br /&gt;Vilken version vill du spara?",
    "EXT_DELETED_MESSAGE": "&lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt; har blivit borttagen på disk utanför {APP_NAME}, men har osparade ändringar i {APP_NAME}.&lt;br /&gt;&lt;br /&gt;Vill du spara dina ändringar?",
    "CONFIRM_FOLDER_DELETE_TITLE": "Bekräfta borttagning",
    "CONFIRM_FOLDER_DELETE": "Är du säker på att du vill ta bort mappen &lt;span class=&#39;dialog-filename&#39;&gt;{0}&lt;/span&gt;?",
    "FILE_DELETED_TITLE": "Filen har tagits bort",
    "DONE": "Klar",
    "OK": "Ok",
    "CANCEL": "Avbryt",
    "SAVE_AND_OVERWRITE": "Skriv över",
    "DELETE": "Ta bort",
    "BUTTON_YES": "Ja",
    "BUTTON_NO": "Nej",
    "ERROR_QUICK_EDIT_PROVIDER_NOT_FOUND": "Ingen snabbredigering tillgänglig för nuvarande muspekarposition",
    "ERROR_CSSQUICKEDIT_BETWEENCLASSES": "CSS Snabbredigering: placera muspekare på ett klassnamn",
    "ERROR_CSSQUICKEDIT_CLASSNOTFOUND": "CSS Snabbredigering: ofullständigt klassattribut",
    "ERROR_CSSQUICKEDIT_IDNOTFOUND": "CSS Snabbredigering: ofullständigt id-attribut",
    "ERROR_CSSQUICKEDIT_UNSUPPORTEDATTR": "CSS Snabbredigering: placera muspekare i tagg, klass eller id",
    "ERROR_TIMINGQUICKEDIT_INVALIDSYNTAX": "CSS Timingfunktion Snabbredigering: ogiltig syntax",
    "ERROR_JSQUICKEDIT_FUNCTIONNOTFOUND": "JS Snabbredigering: placera muspekare i funktionens namn",
    "BUTTON_NEW_RULE": "Ny regel",
    "ERROR_QUICK_DOCS_PROVIDER_NOT_FOUND": "Inget Snabbdokument tillgängligt för nuvarande muspekarposition",
    "CMD_FILE_NEW": "Ny fil",
    "CMD_FILE_NEW_FOLDER": "Ny mapp",
    "CMD_FILE_RENAME": "Byt namn",
    "CMD_FILE_DELETE": "Ta bort",
    "CMD_CUT": "Klipp ut",
    "CMD_COPY": "Kopiera",
    "CMD_PASTE": "Klistra in",
    "CMD_SELECT_ALL": "Markera allt",
    "CMD_TOGGLE_QUICK_EDIT": "Snabbredigering",
    "CMD_TOGGLE_QUICK_DOCS": "Snabbdokument",
    "DND_MAX_FILE_SIZE_EXCEEDED": "fil överskrider maximal storlek som stöds: 3MB",
    "DND_UNSUPPORTED_FILE_TYPE": "filtypen stöds inte",
    "DND_ERROR_UNZIP": "det går inte att packa upp filen",
    "DND_ERROR_UNTAR": "det går inte att packa upp tar-filen",
    "DND_SUCCESS_UNZIP_TITLE": "Uppackning slutförd",
    "DND_SUCCESS_UNTAR_TITLE": "Uppackning slutförd",
    "DND_SUCCESS_UNZIP": "Lyckades packa upp &lt;b&gt;{0}&lt;/b&gt;.",
    "DND_SUCCESS_UNTAR": "Lyckades packa upp &lt;b&gt;{0}&lt;/b&gt;.",
    "COLOR_EDITOR_CURRENT_COLOR_SWATCH_TIP": "Nuvarande färg",
    "COLOR_EDITOR_ORIGINAL_COLOR_SWATCH_TIP": "Originalfärg",
    "COLOR_EDITOR_RGBA_BUTTON_TIP": "RGBa-format",
    "COLOR_EDITOR_HEX_BUTTON_TIP": "HEX-format",
    "COLOR_EDITOR_HSLA_BUTTON_TIP": "HSLA-format",
    "COLOR_EDITOR_USED_COLOR_TIP_SINGULAR": "{0} (Använd {1} gång)",
    "COLOR_EDITOR_USED_COLOR_TIP_PLURAL": "{0} (Använd {1} gånger)",
    "CMD_JUMPTO_DEFINITION": "Gå till definition",
    "CMD_SHOW_PARAMETER_HINT": "Visa parameterförslag",
    "NO_ARGUMENTS": "&lt;inga parametrar&gt;",
    "DETECTED_EXCLUSION_TITLE": "JavaScript-fil inferensproblem",
    "CMD_ENABLE_QUICK_VIEW": "Snabbtitt vid hovring",
    "DOCS_MORE_LINK": "Läs mer",
    "UPLOAD_FILES_DIALOG_HEADER": "Ladda upp filer",
    "DRAG_AREA_UPLOAD_FILES_DIALOG_TEXT": "...eller dra filer hit.",
    "DROP_AREA_UPLOAD_FILES_DIALOG_TEXT": "Ok, släpp filerna!",
    "UPLOADING_INDICATOR": "Laddar upp...",
    "BUTTON_FROM_YOUR_COMPUTER": "Från din dator...",
    "TAKE_A_SELFIE": "Ta en selfie...",
    "CMD_MOVE_FILE": "Flytta till...",
    "PROJECT_ROOT": "Projektets rot",
    "PICK_A_FOLDER_TO_MOVE_TO": "Välj en mapp",
    "ERROR_MOVING_FILE_DIALOG_HEADER": "Flyttfel",
    "UNEXPECTED_ERROR_MOVING_FILE": "Ett oväntat fel inträffade vid försök att flytta {0} till {1}",
    "ERROR_MOVING_FILE_SAME_NAME": "En fil eller mapp med namnet {0} finns redan i {1}. Överväg att byta namn på en av dem för att fortsätta."
});
