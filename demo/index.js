const replaceTermsInFiles = require('../index.js');
const fs = require('fs-extra');

async function init () {
    await fs.copy('./demo/test-from/', './demo/test-to');

    const status = await replaceTermsInFiles({
        targets: [
            './demo/test-to/**/*'
        ],
        extensions: ['.js', '.txt'],
        termOpen: '%__',
        termClose: '__%',
        terms: {
            'PROJECT_NAME': 'Project\'s awesome name',
            'DATE': new Date(),
            'BUILD_VERSION': 123
        },
        ignore: [/static/]
    });
    console.log('Done :)');
    console.log(status.toString());
}

init();