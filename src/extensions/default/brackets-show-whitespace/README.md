# Show Whitespace

> A [Brackets](http://brackets.io/) extension to visualize whitespace (both spaces and tabs) in the same style as [Sublime Text](http://www.sublimetext.com/).

## Usage

Activate using `View > Show Whitespace` or by using the shortcut `Ctrl-Alt-W` (`Command-Shift-W` on Mac OS X). The extension state is remembered across Brackets launches. Whitespace in all editor windows are visualized, including inline editors.

## Technical Details

This extension uses [CodeMirror](http://codemirror.net/) overlays to construct and render whitespace for both spaces and tabs. Each individual character is wrapped in a `<span></span>` with an appropriate denoting class. The following are all the classes this extension uses and their purpose. Do note that tabs follow this same structure, with the word `space` replaced with `tab`.

* `.cm-dk-whitespace-space`: Whitespace between any characters
* `.cm-dk-whitespace-leading-space`: Whitespace that makes up any indentation
* `.cm-dk-whitespace-empty-line-space`: Any lines that consist solely of whitespace
* `.cm-dk-whitespace-trailing-space`: Whitespace at the end of a line after any characters
* `.cm-dk-whitespace-*-nonbrk-space`: A [non-breaking space](https://en.wikipedia.org/wiki/Non-breaking_space), which can be classed with any location (such as `.cm-dk-whitespace-empty-line-nonbrk-space`). This is the only class that does not have a tab counterpart.

The primary extension styling is defined in `styles/main.less`, which is compiled into CSS, while whitespace colors are defined in Brackets preferences and rendered into `styles/whitespace-colors-css.tmpl`. Both files are then loaded into Brackets on startup.

## Install

Method 1: Open the Brackets Extension Manager and search for "show whitespace"

Method 2: Download the [latest revision](https://github.com/DennisKehrig/brackets-show-whitespace/archive/master.zip) in `.zip` archive directly from GitHub and drag it onto the "Drag .zip here" area in the Extension Manager. Alternatively, use the "Install from URL..." link also in the Extension Manager.

## Known Issues

* CodeMirror overlays have a side effect of slowing down the editor in many aspects, including typing and scrolling. If the slowdown is too unbearable, it may be worthwhile to disable the extension except when required.

## Brackets Wishlist

What I wish Brackets would provide:

- An API to remove a command
- An API to remove a menu item

## License

[MIT](LICENSE)
