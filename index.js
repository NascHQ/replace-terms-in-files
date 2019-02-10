const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');

async function replaceTermsInFiles (opts) {
    return new Promise(async (resolve, reject) => {

        try {
            const targets = Array.isArray(opts.targets) ? opts.targets : [opts.targets];
            const filePromises = [];

            targets.forEach(target => {
                let exts = '';
                if (opts.extensions) {
                    exts = '{'+opts.extensions.join(',')+'}';
                }
                filePromises.push(new Promise (resolve => {
                        glob(target + exts, function (er, files) {
                            resolve(files);
                        })
                    })
                );
            });

            const allFiles = [].concat.apply([], (await Promise.all(filePromises)));

            const replacePromises = [];
            allFiles.forEach(filePath => {
                replacePromises.push(new Promise(async (resolve, reject) => {
                    let content = await fs.readFile(filePath, 'utf8');
                    for(let term in opts.terms) {
                        let termId = (opts.termOpen || '') + term + (opts.termClose || '');
                        content = content.replace(new RegExp(termId, 'g'), opts.terms[term]);
                    }
                    await fs.writeFile(filePath, content, 'utf8');
                    resolve();
                }))
            });

            await Promise.all(replacePromises);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = replaceTermsInFiles;
