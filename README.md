# confit

@sesamecare-oss/confit is a modern rewrite of [confit](https://github.com/krakenjs/confit) in Typescript using Promises and bundling the standard shortstop handlers. The general approach of stackable environment-aware configurations is retained, but we add proper typing for key lookups and just generally modernize the build pipeline. We also bundle the shortstop infrastructure and the common shortstop handlers.

## env

The env shortstop handler accepts the following format specificiations:

* `env:SOMEVAR|u` - Return the variable if it exists and is non-empty, else undefined
* `env:SOMEVAR|ud` - Return the variable as a number if it exists, or undefined
* `env:SOMEVAR|d` - Return the value as a decimal, or NaN if not there
* `env:SOMEVAR|b` - Return the value as a boolean - empty, false, 0 and undefined will be false
* `env:SOMEVAR|!b` - Return the value as a boolean but inverted so that empty/undefined/0/false are true

## file

The file handler uses the pipe character to allow specifying the encoding with which to read the file. The valid encodings are
`base64|binary|hex|utf8|ucs2|utf16le|ascii`. If you somehow have a pipe with one of these values at the end your filename (wow), use `|binary` at the end to make it clearer and behave as normal.
