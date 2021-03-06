# Replace multiple terms in multiple files

Yes, it's pretty straight forward...you can replace multiple terms within files matching a glob.  

It returns a promise you can await for, if you want to.

Very usefull when automating the creation or use of templates, or when you need to change some specific strings in many files and directories recursivelly.

## How to install

```sh
npm install replace-terms-in-files
```

## How to use it

```js

const replaceTermsInFiles = require('replace-terms-in-files');

const status = await replaceTermsInFiles({
    targets: [
        './a-deep-directory/**/*',
        './some-shallow-directory/*'
    ],
    // extensions are optional
    extensions: ['.js', '.txt'],
    // optionally, you can ignore matching files
    ignore: ['static', /\.old\.js$/],
    // these are optional too
    termOpen: '%__',
    termClose: '__%',
    // all the terms that will be replaced in any file
    // found in those directories matching those globs patterns
    terms: {
        // will replace %__PROJECT_NAME__% by Project\'s awesome name
        'PROJECT_NAME': 'Project\'s awesome name',
        // will replace %__DATE__% by (new Date()).toString()
        'DATE': new Date(),
        // will replace %__BUILD_VERSION__% by the number 123
        'BUILD_VERSION': 123
    }
});

console.log(status.toString());
// outputs something like:
// X files changed, in a total of Y replacements
```

> Note that we use Regular Expressions for the replacements, therfore, `%\__DATE__%` from the sample above, actually becomes `/%\__DATE__%/g`. If you have special characters in your key for replacement, you might have to scape it using a backslash `\`.

This module resolves to an `status object` containing all the files which suffered any change, and also a total number of changes applied to all of them.

## This is open source

Yes, please, feel free to help us out :)

This module is MIT licensed.
