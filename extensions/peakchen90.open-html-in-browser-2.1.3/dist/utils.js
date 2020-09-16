'use strict';

var tslib = require('tslib');
var path = require('path');
var fs = require('fs');

function getStat(filename) {
    return new Promise((resolve, reject) => {
        fs.stat(filename, (err, stats) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(stats);
            }
        });
    });
}
function resolveRoot(pathname = '') {
    return path.resolve(__dirname, '..', pathname);
}
function readTextFile(filename) {
    return fs.readFileSync(filename).toString();
}
function parseJSONFile(filename) {
    let data = null;
    try {
        data = JSON.parse(readTextFile(filename));
    }
    catch (e) {
        console.error(e);
    }
    return data;
}
function getIndexFilename(dirname, index = 'index') {
    return new Promise((resolve, reject) => {
        const indexFiles = [
            `${index}.html`,
            `${index}.htm`
        ];
        fs.readdir(dirname, (err, files) => {
            if (err) {
                reject(err);
            }
            else {
                const indexFile = files.find((file) => {
                    file = file.toLowerCase();
                    return indexFiles.some((item) => item === file);
                });
                if (indexFile) {
                    resolve(path.resolve(dirname, indexFile));
                }
                else {
                    reject(new Error(`file not found: ${dirname}`));
                }
            }
        });
    });
}
function getPort(start) {
    return new Promise((resolve, reject) => {
        require('getport')(start, (err, port) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(port);
            }
        });
    });
}
function openBrowser(url) {
    return tslib.__awaiter(this, void 0, void 0, function* () {
        const open = require('open');
        yield open(url);
    });
}
function getRelativePath(rootPath, filename) {
    const relativePath = path.relative(rootPath, filename);
    if (/^\.\./.test(relativePath)) {
        return null;
    }
    return relativePath;
}
//# sourceMappingURL=utils.js.map

exports.getIndexFilename = getIndexFilename;
exports.getPort = getPort;
exports.getRelativePath = getRelativePath;
exports.getStat = getStat;
exports.openBrowser = openBrowser;
exports.parseJSONFile = parseJSONFile;
exports.resolveRoot = resolveRoot;
//# sourceMappingURL=utils.js.map
