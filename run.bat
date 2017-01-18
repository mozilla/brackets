SETLOCAL ENABLEEXTENSIONS

SET "srcdir=%~dp0src"
:: Extract the drive from the source directory
SET "drive=%srcdir:~0,1%"
:: Replace all back slashes with forward slashes
SET "srcdir=%srcdir:\=/%"
:: Combine the drive with the forward slashed path without the colon
SET "srcdir=%drive%%srcdir:~2%"

SET "build=docker build --rm -t mozilla/brackets"
SET "run=docker run --name brackets -it --rm -p 8000:8000 -v %srcdir%:/brackets/src mozilla/brackets npm start"
SET "shell=docker exec -it brackets bash"

IF "%1"=="" (
    %build%
    %run%
) ELSE (
    IF "%1"=="shell" (
        %shell%
    ) ELSE (
        ECHO ERROR: Unknown command
    )
)
