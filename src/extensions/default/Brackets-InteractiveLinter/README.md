## Brackets-InteractiveLinter
Brackets integration with linters such as JSHint, JSLint, ESLint, JSCS, CoffeeLint, and more! Interactive Linter runs linters as you work on your code and gives instant feedback right on your document. You can access the details of the lint report by clicking on the light bulbs on the line gutters to the right of the document, or by using the keyboard shortcut `Ctrl-Shift-E` on that line.

### Features
* Real time feedback
* Plugin system that runs plugins in a web worker
* Traverses up the directory tree to load the most appropriate linter settings file
* Let's you provide default linter settings that get mixed in with project specific ones.  Reduce duplication!
* Configure the linter settings file that gets loaded. Maybe you want to load `jshintrc.json` instead of `.jshintrc`
* Configuration files are hot reload. So if you adjust your beloved `.jshintrc`, Interactive Linter will automatically reload it
* Skips blocks of minified code to avoid cluttering your reports. (Minified code is determined by amount of characters per-line and simple heuristics)
* Provides panel with a table of all errors and warning for easy navigation
* Status indicator when your code is "happy", or when there are warnings and errors
* Configuration via Brackets preferences system, which take effect in real time

### Linters

A list of available linters can be found [here](https://github.com/MiguelCastillo/Brackets-InteractiveLinter/tree/master/plugins), along with information about authoring your own plugins.

#### coffeescript
- [coffeelint](http://www.coffeelint.org/)

#### css
- [csslint](http://csslint.net/)

#### html
- [htmlhint](http://htmlhint.com/)

#### javascript
- [eslint](http://eslint.org/)
- [jscs](http://jscs.info/)
- [jshint](http://jshint.com/)
- [jslint](http://www.jslint.com/)
- [jsx](https://www.npmjs.com/package/react-tools)

#### json
- [jsonlint](http://jsonlint.com/)


### Configuration

Interactive Linter can be configured via Brackets' preferences system. For details on the brackets preferences, please take a look [here](https://github.com/adobe/brackets/wiki/How-to-Use-Brackets#preferences).


#### Linter per language [run time]

You can specify which linter to run for each language independently, and changes are applied at run time. You can take a look at [this](https://github.com/MiguelCastillo/Brackets-InteractiveLinter/blob/master/.brackets.json) sample configuration.

To specify `eslint` as your javascript linter, you need the follow changes to your `.brackets.json`.

``` JSON
{
    "interactive-linter.javascript": ["eslint"]
}
```

If you actually want to disable interactive linter javascript linting, you can set the linter language to `null`.

``` JSON
{
    "interactive-linter.javascript": null
}
```

You can customize other linters the same way by following the convention `interactive-linter.[language]: ['linter-name']`.  For example, to disable linting for `coffeescript` you can do so with the following:

``` JSON
{
    "interactive-linter.javascript": ["eslint"],
    "interactive-linter.coffeescript": null
}
```

#### Delay [restart]

You can configure the delay for linting your documents. The value is specified in milliseconds, and by default it is `500`. In the example below, the delay is configured to 1000 milliseconds (1 second):

``` JSON
{
    "interactive-linter.delay": 1000
}
```


### JSHint/JSLint
Interactive Linter automatically loads `.jshintrc` and `.jslintrc` files in your project.

All JSHint settings that already exists inline in your JavaScript files will continue to work along side any `.jshintrc`/`.jslintrc` file.

Integration with <http://jslinterrors.com/> to find out details about what's reported by JSHint.

Inspired by Joachim's extensions [brackets-continuous-compilation](https://github.com/JoachimK/brackets-continuous-compilation).


### CoffeeLint
Support for loading `coffeelint.json` as defined [here](http://www.coffeelint.org/#usage).

### Screenshots

![jshint](https://raw.github.com/wiki/MiguelCastillo/Brackets-InteractiveLinter/images/jshint.png)

![coffeelint](https://raw.github.com/wiki/MiguelCastillo/Brackets-InteractiveLinter/images/coffeelint.png)

### Installation
Interactive Linter in available through Brackets extensions' registry.


### FAQ

#### Can I configure default linter settings?
- Yes you can. You will need to edit the `default.json` file located in the particular linter plugin's folder, and modify it with whatever default settings you desire. For example, if you want to set default settings for JSHint, you will need to navigate to the `extensions/user/interactive-linter/plugins/jshint/default.json` file and modify it accordingly. These settings are mixed in with any other settings found by Interactive Linter in your project.

#### Can I configure the settings file the linters load?
- Yes you can. You will need to find `settings.json` for the particular linter plugin, and change the `settingsFile` field. For example, if you want to configure JSHint to load `jshintrc.json` instead of the default `.jshintrc`, find the file `extensions/user/interactive-linter/plugins/jshint/settings.json` and modify the `settingsFile` value with the file name you prefer.

#### Do you support JSX linting??
- Yes. That's currently done via the `jsx` plugin. So you will need to set the `javascript` linter to `jsx` in your Brackets preferences file. The `jsx` linter will also lint your javascript document with `JSHint`. Good thing is that your `.jshintrc` will be used during the linting process. Bad thing is that you cannot specify another javascript linter besides `JSHint` to process your javscript document.

``` JSON
{
    "interactive-linter.javascript": ["jsx"]
}
```


### Links

 - Brackets: <http://brackets.io>
 - Brackets Github: <https://github.com/adobe/brackets>


### Contributors
* Miguel Castillo - (author) <a href="https://twitter.com/manchagnu">@manchagnu</a>
* Mark Simulacrum - <a href="https://twitter.com/MarkSimulacrum">@MarkSimulacrum</a>


### Contact me

If you have any issues or want to just drop in a line, you can use my personal email at <mailto:manchagnu@gmail.com>.


### License

Licensed under MIT
