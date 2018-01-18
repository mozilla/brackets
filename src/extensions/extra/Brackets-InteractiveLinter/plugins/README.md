# Interactive Linter plugins

Interactive linter has a plugin system that allows you to integrate with customer linters.


## Current linters

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

They are all located in the [default](https://github.com/MiguelCastillo/Brackets-InteractiveLinter/tree/master/plugins/default) directory.


## What are all the different directories in the plugin folder??

- The [default](https://github.com/MiguelCastillo/Brackets-InteractiveLinter/tree/master/plugins/default) directory is where all plugins loaded from in a production environment.  If you make a pull request for a new plugin, this is where you would put it.
- The [dev](https://github.com/MiguelCastillo/Brackets-InteractiveLinter/tree/master/plugins/dev) directory content is loaded, along with `default` by interactive linter. Plugins in this directory are in `.gitignore` because they should not be commited to source control. This directory is primarly for authoring plugins before promoting them to the `default` directory, prior to making a PR (pull request) for your new linter plugin.
- The [disabled](https://github.com/MiguelCastillo/Brackets-InteractiveLinter/tree/master/plugins/disabled) directory is a convenience place to put your plugins you don't want interactive linter to load.


## Plugin anatomy and authoring

Plugins are automatically loaded and registered by interactive linter by reading the content of `default` and `dev` directories. Internally in interactive linter, plugins are loaded as requirejs [packages](http://requirejs.org/docs/api.html#packages). So, you need a directory which is used as the name of the plugin, and a `main.js` which is the entry point to your plugin code.

> Plugins execute in a web worker, so you need to be mindful of what features are available in a web worker environment.

The most basic main.js looks like this:

``` javascript
define(function() {
    function lint(text, options) {
        console.log("Run linting");
    }

    return {
        "language": "javascript",
        "lint": lint
    };
});
```

At the very minimum, the directory structure of a plugin looks like this:

- pluginname
    - main.js

Where the plugin will made available to interactive linter with the name `pluginname` and `main.js` is the entry point to your plugin.

Once the plugin is loaded by interactive linter, the `lint` method will be called when the time is right.  It will be called with the text content to be linted and the options loaded by interactive linter.  The call to `lint` returns an array of items to be processed by interactive linter.  Here is what a basic `lint` result looks like.

``` javascript
[{
    "type": "error",
    "reason": "more cowbell"
},{
    "type": "warning",
    "reason" "'brackets' is not defined."
}]
```

That basically tells interactive linter to display the first item in the array as an error with the `reason` in the inline widget added to the linted document.  And the second item as a warning, also displaying `reason` in an inline widget in the linted document.

This is what is looks like:

<img src="https://raw.githubusercontent.com/MiguelCastillo/Brackets-InteractiveLinter/master/plugins/img/warning.png" alt="Linter warning"></img>


You can also add a CodeMirror token that will be used by interactive linter reporter to decorate the document with *underlines*. This is a sample of a `lint` result with a CodeMirror token.

``` javascript
[{
    "type": "error",
    "reason": "more cowbell",
    "token": {
        "start": {
            "line": 21,
            "ch": 13
        },
        "end": {
            "line": 21,
            "ch": 23
        }
    }
},{
    "type": "warning",
    "reason" "'brackets' is not defined",
    "token": {
        "start": {
            "line": 12,
            "ch": 8
        },
        "end": {
            "line": 12,
            "ch": 9
        }
    }
}]
```

That adds the underline at the beginning of the word `brackets`, and this is what it looks like:

<img src="https://raw.githubusercontent.com/MiguelCastillo/Brackets-InteractiveLinter/master/plugins/img/underline.png" alt="Linter underline"></img>
