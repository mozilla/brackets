# Bramble Extension Loading

Bramble extension loading is done by specifying extensions to be loaded in
[`src/extensions/bramble-extensions.json`](src/extensions/bramble-extensions.json).
This is an array of objects with the following form:

```
{
        "path": "extensions/default/InlineColorEditor",
        "copy": [
            "extensions/default/InlineColorEditor/css/main.css",
            "extensions/default/InlineColorEditor/img/*.png"
        ]
}
```

Here `path` refers to the path under `src/` where the extension's dir lives.
The optional `copy` array includes file path globs to be used when copying
files from `src/` to `dist/` for this extension at build time.  Many extensions
have no external dependencies, other than the `main.js` file and any modules it
loads.  If this is the case, you don't need to include `copy`.  It will typically
include things like stylesheets, images, and other resources that get loaded
dynamically at runtime and aren't packaged using requirejs.
