 /*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
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
/*global define, $, FileReader*/

define(function (require, exports, module) {
    "use strict";

    //pubSubService must implement:
    //sub(eventName, callback)   : subscribes, runs the callback when the named event is pub'd
    //pub(eventName, parameters) : publishes the parameters (must be JSON object or string) to
    //                             the specified event name
    //unsub(eventName)           : unsubscribes to the event
    function Collaborator(pubSubService){
        this._pubSub = pubSubService;
    }

    Collaborator.prototype.makeDocumentCollaborative = function(doc){
        doc._collab = this;

        this._pubSub.sub(documentChannel(doc, "change"), function(newText){
            doc.refreshText(newText, new Date());
        });

        doc.on("change", function(changedDoc){
            this._pubSub.pub(documentChannel(changedDoc, "change"), changedDoc.getText());
        });
    };

    Collaborator.prototype.makeFileSystemCollaborative = function(filesystem){
        var collab = this;
        var handleNewFileSystem = function(eventName){
            return function(newFileSystem){
                var index = newFileSystem._index._index; // TODO map over this and pull out names and IDs only
                collab._pubSub.pub(fileSystemChannel(newFileSystem, eventName), newFileSystem)
            };
        };

        filesystem.on("rename", function(oldName, newName){
            collab._pubSub.pub(fileSystemChannel(filesystem, "rename"), {
                oldName: oldName,
                newName: newName
            });
        });

        filesystem.on("change", function(entry, added, removed){
            collab._pubSub.pub(fileSystemChannel(filesystem, "rename"), {
                entry: entry,
                added: added,
                removed: removed
            });
        });

        collab._pubSub.sub(fileSystemChannel(newFileSystem, "rename"), function(filechange){
            filesystem._handleRename(filechange.oldName, filechange.newName);
        });

        collab._pubSub.sub(fileSystemChannel(newFileSystem, "change"), function(filechange){
            filesystem._enqueueExternalChange(filechange.entry, filechange.added, filechange.removed);
        });
    };

    function fileSystemChannel(filesystem, subEvent){
        return channelName() + (subEvent ? ":" + subEvent : "");
    };

    function documentChannel(doc, subEvent){
        return channelName(doc.file._path) + (subEvent ? ":" + subEvent : "");
    };

    function channelName(uniquePart){
        return "collab:" + uniquePart;
    }

    // Export public API
    exports = Collaborator;
});
