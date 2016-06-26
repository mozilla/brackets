#!/bin/bash
set -e # exit with nonzero exit code if anything fails

args=("$@")
srcdir="$(pwd)/src"

BUILD="docker build --rm -t mozilla/brackets ."
RUN="docker run --name brackets -it --rm -p 8000:8000 -v ${srcdir}:/brackets/src mozilla/brackets npm start"
SHELL="docker exec -it brackets bash"

if [ ${#args[@]} == 0 ]
then
    eval $BUILD
    eval $RUN
else
    if [ ${args[0]} == "shell" ]
    then
        eval $SHELL
    else
        echo "ERROR: Unknown command"
    fi
fi
