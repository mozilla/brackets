/*
 * Copyright (c) 2013 - present Adobe Systems Incorporated. All rights reserved.
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

/*eslint-env node */
/*jslint node: true */
'use strict';

var Path = require('path');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');

module.exports = function (grunt) {
    var swPrecache = require('sw-precache');

    // load dependencies
    require('load-grunt-tasks')(grunt, {
        pattern: [
            'grunt-*',
            '!grunt-cli',
            '!grunt-lib-phantomjs',
            '!grunt-template-jasmine-requirejs',
            'grunt-contrib-*',
            'grunt-targethtml',
            'grunt-usemin',
            'grunt-cleanempty',
            'grunt-exec',
            'grunt-newer'
        ]
    });

    grunt.loadTasks('tasks');

    // Project configuration.
    var config = {
        pkg  : grunt.file.readJSON("package.json"),
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        'dist',
                        'src/.index.html',
                        'src/styles/brackets.css'
                    ]
                }]
            }
        },
        uglify: {
            options: {
                mangle: false,
                compress: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: [
                        '**/*.js',
                        '!**/extensions/extra/PDFView/thirdparty/**/*',
                    ],
                    dest: 'dist/'
                }]
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        'dist/index.html': 'src/.index.html'
                    },
                    /* static files */
                    {
                        expand: true,
                        dest: 'dist/',
                        cwd: 'src/',
                        src: [
                            'nls/{,*/}*.js',
                            'thirdparty/github-markdown.css',
                            'thirdparty/bitjs/bitjs-untar.min.js',
                            'hosted.*',
                            // XXXBramble: we don't use src/config.json like Brackets does,
                            // but it needs to exist in dist/ so copy it
                            'config.json',
                            'bramble-live-dev-cache-sw.js'
                        ]
                    },
                    /* extensions and CodeMirror modes */
                    {
                        expand: true,
                        dest: 'dist/',
                        cwd: 'src/',
                        src: [
                            '!extensibility/node/spec/**',
                            '!extensibility/node/node_modules/**/{test,tst}/**/*',
                            '!extensibility/node/node_modules/**/examples/**/*',
                            '!filesystem/impls/appshell/**/*',
                            // We deal with extensions dynamically below in build-extensions
                            '!extensions/**/*',
                            'thirdparty/i18n/*.js',
                            'thirdparty/text/*.js'
                        ]
                    },
                    /* styles, fonts and images - XXXBramble: we skip the fonts */
                    {
                        expand: true,
                        dest: 'dist/styles',
                        cwd: 'src/styles',
                        src: ['jsTreeTheme.css', 'images/**/*']
                    }
                ]
            },
            thirdparty: {
                files: [
                    {
                        expand: true,
                        dest: 'src/thirdparty/CodeMirror',
                        cwd: 'src/node_modules/codemirror',
                        src: [
                            'addon/{,*/}*',
                            'keymap/{,*/}*',
                            'lib/{,*/}*',
                            'mode/{,*/}*',
                            'theme/{,*/}*',
                        ]
                    },
                    {
                        expand: true,
                        flatten: true,
                        dest: 'src/thirdparty',
                        cwd: 'src/node_modules',
                        src: [
                            'less/dist/less.min.js'
                        ]
                    }
                ]
            }
        },
        cleanempty: {
            options: {
                force: true,
                files: false
            },
            src: ['dist/**/*'],
        },
        less: {
            dist: {
                paths: [
                    "src",
                    "src/styles"
                ],
                files: {
                    // XXXBramble: if you change this, change configureExtensions() below too.
                    "dist/styles/brackets.min.css": [
                        "src/thirdparty/CodeMirror/lib/codemirror.css",
                        "src/styles/bramble.less"
                    ]
                },
                options: {
                    compress: true,
                    plugins: [
                        new LessPluginAutoPrefix({
                            browsers: [
                                "Explorer >= 10",
                                "Firefox >= 26",
                                "Chrome >= 31",
                                "Safari >= 7",
                                "Opera >= 19",
                                "iOS >= 3.2",
                                "Android >= 4.4"
                            ]
                        })
                    ]
                }
            }
        },
        requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    // Disable module loading timeouts, due to the size of what we load
                    waitSeconds: 0,
                    // `name` and `out` is set by grunt-usemin
                    baseUrl: 'src',
                    optimize: 'uglify2',
                    paths: {
                        // In various places in the code, it's useful to know if this is a dev vs. prod env.
                        // See src/main.js default dev loading in src/ builds.
                        "envConfig": "bramble/config/config.prod",
                        "Pica": "../node_modules/pica/dist/pica.min",
                        "yjs": "../node_modules/yjs/dist/y",
                        "y-text": "../node_modules/y-text/dist/y-text",
                        "y-array": "../node_modules/y-array/dist/y-array"
                    },
                    // brackets.js should not be loaded until after polyfills defined in "utils/Compatibility"
                    // so explicitly include it in main.js
                    include: [
                        "utils/Compatibility",
                        "brackets"
                    ],
                    // required to support SourceMaps
                    // http://requirejs.org/docs/errors.html#sourcemapcomments
                    preserveLicenseComments: false,
                    useStrict: true,
                    // Disable closure, we want define/require to be globals
                    wrap: false,
                    exclude: ["text!config.json"],
                    uglify2: {} // https://github.com/mishoo/UglifyJS2
                }
            },
            iframe: {
                // Define files involved, so grunt-newer knows whether to re-build or not
                files: {
                    'dist/bramble.js': [
                        'src/bramble/client/**/*.js',
                        'src/bramble/thirdparty/**/*.js',
                        'src/bramble/ChannelUtils.js',
                        'thirdparty/filer/dist/filer.min.js',
                    ]
                },
                // Standalone, minified dist/bramble.js iframe api
                options: {
                    name: 'thirdparty/almond',
                    baseUrl: 'src',
                    paths: {
                        "EventEmitter": "../node_modules/wolfy87-eventemitter/EventEmitter.min"
                    },
                    optimize: 'uglify2',
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: {
                        startFile: 'src/bramble/client/bramble-start.frag',
                        endFile: 'src/bramble/client/bramble-end.frag'
                    },
                    include: ['bramble/client/main'],
                    out: 'dist/bramble.js',
                    uglify2: {}
                }
            }
        },
        targethtml: {
            dist: {
                files: {
                    'src/.index.html': 'src/index.html'
                }
            }
        },
        useminPrepare: {
            options: {
                dest: 'dist'
            },
            html: 'src/.index.html'
        },
        usemin: {
            options: {
                dirs: ['dist']
            },
            html: ['dist/{,*/}*.html']
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: '*.html',
                    dest: 'dist'
                }]
            }
        },
        meta : {
            src   : [
                'src/**/*.js',
                '!src/thirdparty/**',
                '!src/widgets/bootstrap-*.js',
                '!src/extensions/default/brackets-show-whitespace/**',
                '!src/extensions/**/unittest-files/**/*.js',
                '!src/extensions/**/thirdparty/**/*.js',
                '!src/extensions/dev/**',
                '!src/extensions/extra/brackets-cdn-suggestions/**',
                '!src/extensions/extra/HTMLHinter/**',
                '!src/extensions/extra/MDNDocs/**',
                '!**/extensions/extra/PDFView/thirdparty/**/*',
                '!src/bramble/thirdparty/**/*',
                '!src/extensions/disabled/**',
                '!**/node_modules/**/*.js',
                '!src/**/*-min.js',
                '!src/**/*.min.js'
            ],
            test : [
                'test/**/*.js',
                '!test/perf/*-files/**/*.js',
                '!test/spec/*-files/**/*.js',
                '!test/spec/*-known-goods/**/*.js',
                '!test/spec/FindReplace-test-files-*/**/*.js',
                '!test/smokes/**',
                '!test/temp/**',
                '!test/thirdparty/**',
                '!test/**/node_modules/**/*.js'
            ],
            grunt: [
                'Gruntfile.js',
                'tasks/**/*.js'
            ],
            /* specs that can run in phantom.js */
            specs : [
                'test/spec/CommandManager-test.js',
                //'test/spec/LanguageManager-test.js',
                //'test/spec/PreferencesManager-test.js',
                'test/spec/ViewUtils-test.js'
            ]
        },
        watch: {
            all : {
                files: ['**/*', '!**/node_modules/**'],
                tasks: ['eslint']
            },
            grunt : {
                files: ['<%= meta.grunt %>', 'tasks/**/*'],
                tasks: ['eslint:grunt']
            },
            src : {
                files: ['<%= meta.src %>', 'src/**/*'],
                tasks: ['eslint:src']
            },
            test : {
                files: ['<%= meta.test %>', 'test/**/*'],
                tasks: ['eslint:test']
            }
        },
        /* FIXME (jasonsanjose): how to handle extension tests */
        jasmine : {
            src : 'undefined.js', /* trick the default runner to run without importing src files */
            options : {
                junit : {
                    path: 'test/results',
                    consolidate: true
                },
                specs : '<%= meta.specs %>',
                /* Keep in sync with test/SpecRunner.html dependencies */
                vendor : [
                    // For reference to why this polyfill is needed see Issue #7951.
                    // The need for this should go away once the version of phantomjs gets upgraded to 2.0
                    'test/polyfills.js',

                    'src/thirdparty/jquery-2.1.3.min.js',
                    'src/thirdparty/less.min.js'
                ],
                helpers : [
                    'test/spec/PhantomHelper.js'
                ],
                template : require('grunt-template-jasmine-requirejs'),
                templateOptions: {
                    requireConfig : {
                        baseUrl: 'src',
                        paths: {
                            'test' : '../test',
                            'perf' : '../test/perf',
                            'spec' : '../test/spec',
                            'text' : 'thirdparty/text/text',
                            'i18n' : 'thirdparty/i18n/i18n'
                        }
                    }
                }
            }
        },
        'jasmine_node': {
            projectRoot: 'src/extensibility/node/spec/'
        },
        eslint: {
            grunt:  '<%= meta.grunt %>',
            src:    '<%= meta.src %>',
            test:   '<%= meta.test %>',
            options: {
                quiet: true
            }
        },
        compress: {
            dist: {
                options: {
                    mode: "gzip"
                },
                expand: true,
                cwd: 'dist/',
                src: ['**/*'],
                dest: 'dist/'
            },
            // We need to compress the bramble-sw.js service worker file after compressing dist/
            sw: {
                options: {
                    mode: "gzip"
                },
                expand: true,
                cwd: 'dist/',
                src: 'bramble-sw.js',
                dest: 'dist'
            }
        },

        exec: {
            'localize': 'npm run localize',
            'localize-dist': 'npm run localize-dist',
            'unlocalize': 'npm run unlocalize'
        },

        swPrecache: {
            dist: {
                rootDir: 'dist'
            }
        }
    };

    // Dynamically add requirejs, less, and copy configs for all extensions
    function configureExtensions(config) {
        var extensions = grunt.file.readJSON("src/extensions/bramble-extensions.json");

        // Write a requirejs config for each included extension
        extensions.forEach(function(extension) {
            config.requirejs[extension.path] = {
                options: {
                    name: 'main',
                    baseUrl: 'src/' + extension.path,
                    paths: {
                        'text' : '../../../thirdparty/text/text',
                        'i18n' : '../../../thirdparty/i18n/i18n'
                    },
                    optimize: 'uglify2',
                    preserveLicenseComments: false,
                    useStrict: true,
                    uglify2: {},
                    out: 'dist/' + extension.path + '/main.js'
                }
            };
        });

        // Copy any LESS/CSS files from extensions to the less task file list.
        extensions.forEach(function(extension) {
            if(extension.less) {
                config.less.dist.files = Object.assign(config.less.dist.files, extension.less);
            }
        });

        // Also copy each extension's files across to dist/
        var extensionGlobs = [];
        extensions.forEach(function(extension) {
            // First, copy the dir itself.  The main.js will get built below.
            extensionGlobs.push(extension.path.replace(/\/?$/, "/"));

            // If there are any globs defined for extra paths to copy, add those too.
            if(extension.copy) {
                extensionGlobs = extensionGlobs.concat(extension.copy);
            }
        });

        config.copy.dist.files.push({
            expand: true,
            dest: 'dist/',
            cwd: 'src/',
            src: extensionGlobs
        });

        // Add a task for building all requirejs bundles for each extension
        var tasks = extensions.map(function(extension) {
            return 'requirejs:' + extension.path;
        });
        grunt.registerTask('build-extensions', tasks);

        return config;
    }

    grunt.initConfig(configureExtensions(config));

    grunt.registerMultiTask('swPrecache', function() {
        var done = this.async();
        var rootDir = this.data.rootDir;

        var config = {
            cacheId: 'bramble',
            logger: grunt.log.writeln,
            staticFileGlobs: [
                // Avoid caching dist/nls/**/* and dist/extensions/extra/**/*,
                // but take everything else in dist/
                'dist/{styles,thirdparty}/**/*',
                'dist/extensions/default/**/*',
                'dist/*.*'
            ],
            runtimeCaching: [{
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/css/,
                handler: 'fastest'
            }, {
                urlPattern: /\/dist\/nls\//,
                handler: 'fastest'
            }, {
                urlPattern: /\/dist\/extensions\/extra\//,
                handler: 'fastest'
            }],
            stripPrefix: 'dist/',
            importScripts: [
                "bramble-live-dev-cache-sw.js"
            ],
            ignoreUrlParametersMatching: [/./]
        };

        swPrecache.write(Path.join(rootDir, 'bramble-sw.js'), config, function(err) {
            if(err) {
                grunt.fail.warn(err);
            }
            done();
        });
    });

    // task: install
    grunt.registerTask('install', ['write-config', 'less', 'npm-install-source']);

    // task: test
    grunt.registerTask('test', ['eslint', 'jasmine', 'nls-check']);
//    grunt.registerTask('test', ['eslint', 'jasmine', 'jasmine_node', 'nls-check']);

    // task: set-release
    // Update version number in package.json and rewrite src/config.json
    grunt.registerTask('set-release', ['update-release-number', 'write-config']);

    // task: build
    grunt.registerTask('build', [
        'eslint:src',
        'clean',
        'less',
        'targethtml',
        'useminPrepare',
        'htmlmin',
        'exec:localize',
        'requirejs:dist',
        'concat',
        /*'cssmin',*/
        /*'uglify',*/
        'copy:dist',
        /* XXXBramble: we skip this, since we don't use any of the node_modules in Bramble.
         'npm-install', */
        'cleanempty',
        'exec:unlocalize',
        'usemin'
        /* XXXBramble: we skip this, since we don't bother with its info, and copy it in copy:dist
        'build-config' */
    ]);

    // task: build for development, skipping most steps: only build iframe API if needed.
    grunt.registerTask('build-browser-dev', [
        'newer:requirejs:iframe'
    ]);

    // task: build dist/ for browser
    grunt.registerTask('build-browser', [
        'build',
        'requirejs:iframe',
        'exec:localize-dist',
        'build-extensions',
        'uglify'
    ]);

    // task: build dist/ for browser, pre-compressed with gzip and SW precache
    grunt.registerTask('build-browser-compressed', [
        'build-browser',
        'compress:dist',
        'swPrecache',
        'compress:sw'
    ]);

    // Default task.
    grunt.registerTask('default', ['test']);
};
