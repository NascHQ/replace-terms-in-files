const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');

async function replaceTermsInFiles (opts) {
    return new Promise(async (resolve, reject) => {

        if (opts.extensions) {
            // ensuring it is an array, just in case we received a simple string
            opts.extensions = Array.isArray(opts.extensions) ? opts.extensions : [opts.extensions];
        }

        if (opts.ignore) {
            // ensuring the ignored files are also an array, or undefined
            opts.ignore = Array.isArray(opts.ignore) ? opts.ignore : [opts.ignore];
        }

        try {
            const targets = Array.isArray(opts.targets) ? opts.targets : [opts.targets];
            const filePromises = [];

            targets.forEach(target => {
                let exts = '';
                if (opts.extensions) {

                    // globs will not work with a single extension if it is in a range
                    // so, we create a range only if there are more extensions to deal with
                    if (opts.extensions.length > 1) {
                        exts = '{'+opts.extensions.join(',')+'}';
                    } else {
                        exts = opts.extensions[0];
                    }
                }
                filePromises.push(new Promise (resolve => {
                        glob(target + exts, function (er, files) {
                            resolve(files);
                        })
                    })
                );
            });

            const allFiles = [].concat.apply([], (await Promise.all(filePromises)));
            const status = {
                files: [],
                replacements: 0,
                toString () {
                    return Object.keys(this.files).length + ' files changed, in a total of ' + this.replacements + ' replacements'
                }
            };

            const replacePromises = [];
            allFiles.forEach(filePath => {
                replacePromises.push(new Promise(async (resolve, reject) => {

                    if (!opts.extensions) {
                        // if we are not filtering by extensions, it might be a directory
                        // and we should verify it
                        if (!(await fs.lstat(filePath)).isFile()) {
                            // if it is not a file, we simply ignore it
                            resolve();
                            return;
                        }
                    }

                    // if it matches any ignored patterns, we simply skip it as well
                    if (opts.ignore) {
                        for (let i = 0; i < opts.ignore.length; i++) {
                            if (filePath.match(opts.ignore[i])) {
                                resolve();
                                return;
                            }
                        }
                    }

                    // now, it's time to make magic happen!
                    let content = await fs.readFile(filePath, 'utf8');
                    for(let term in opts.terms) {
                        let termId = (opts.termOpen || '') + term + (opts.termClose || '');
                        content = content.replace(new RegExp(termId, 'g'), mark => {
                            status.files[filePath] = status.files[filePath] || 0;
                            status.files[filePath]++;
                            status.replacements++;
                            return opts.terms[term]
                        });
                    }
                    await fs.writeFile(filePath, content, 'utf8');
                    resolve();
                }))
            });

            await Promise.all(replacePromises);
            resolve(status);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = replaceTermsInFiles;
