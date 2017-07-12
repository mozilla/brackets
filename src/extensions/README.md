# Bramble Extension Loading

Bramble extension loading is done by specifying extensions to be loaded in
[`src/extensions/bramble-extensions.json`](src/extensions/bramble-extensions.json).
This is an array of objects with the following form:

```
{
        "path": "extensions/default/InlineColorEditor",
        "less": {
            "dist/extensions/default/InlineColorEditor/css/main.css": [
                "src/extensions/default/InlineColorEditor/css/main.less"
            ]
        },
        "copy": [
            "extensions/default/InlineColorEditor/img/*.png"
        ]
}
```

Here `path` refers to the path under `src/` where the extension's dir lives.
The optional `less` object includes LESS or CSS file paths to be built. NOTE: the
destination key should include `dist/` as a path prefix, and all source files `src/`.
The optional `copy` array includes file path `globs` to be used when copying files from `src/`
to `dist/` for this extension at build time.  Some extensions have no external
dependencies, other than the `main.js` file.  If this is the case, you don't need
to include `copy`.  However, most have some secondary resources, including things
images, etc.  These need to get included in the `copy` array.

Bramble runs and loads extensions in one of two ways:

* `extensions/default/*` these extensions are bundled in the Service Worker precache.
Put extensions here that you need/want to load and run by default and must be available
for the app to function (offline).

* `extensions/extra/*` these extensions are *not* bundled in the Service Worker precache,
but are instead dynamically cached at runtime.  This means that we will try to download them,
and then cache for offline use, but we won't block initial loading to seed the cache with
the extension's files.  Place any extensions that are truly optional, and have lots of
dependencies you don't want to cache (e.g., localization files, images, extra scripts).