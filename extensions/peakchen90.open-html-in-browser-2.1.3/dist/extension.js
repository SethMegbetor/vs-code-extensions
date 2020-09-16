'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var vscode = require('vscode');
var tslib = require('tslib');
var path = require('path');
var fs = require('fs');
var utils = require('./utils.js');
var http = require('http');
var express = _interopDefault(require('express'));

let locale = null;
function getLocale() {
    if (locale) {
        return locale;
    }
    let config = {};
    try {
        config = JSON.parse(process.env.VSCODE_NLS_CONFIG);
        locale = config.locale;
    }
    catch (e) {
        console.error(e);
    }
    return locale || 'en';
}
function showErrorMessage(message) {
    vscode.window.showErrorMessage(message);
}
function getConfiguration(section) {
    const conf = vscode.workspace.getConfiguration();
    return conf.get(section);
}
//# sourceMappingURL=vscode.js.map

let langData = null;
function readLangConfig() {
    try {
        const rootPath = utils.resolveRoot();
        fs.readdirSync(rootPath).forEach((item) => {
            const match = item.match(/^package\.nls(?:\.([\w-]+?))?\.json$/i);
            try {
                if (match && fs.statSync(path.resolve(rootPath, item))) {
                    let locale = match[1] || 'en';
                    locale = locale.toLowerCase();
                    const content = utils.parseJSONFile(path.resolve(rootPath, item));
                    if (langData && content) {
                        langData.set(locale, content);
                    }
                }
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    catch (e) {
        console.error(e);
    }
}
function langHelper(locale, key, defaultText = '') {
    if (!langData) {
        langData = new Map();
        readLangConfig();
    }
    const defaultLocale = 'en';
    let data = langData.get(locale);
    if (!data) {
        locale = String(locale).split(/[-_]/)[0].toLowerCase();
        data = langData.get(locale) || langData.get(defaultLocale) || {};
    }
    return (data && data[key]) || defaultText;
}
function $t(key) {
    const locale = getLocale();
    return langHelper(locale, key);
}
//# sourceMappingURL=lang-helper.js.map

class LocalServer {
    constructor(workspaceFolder) {
        this.server = null;
        this.workspaceFolder = workspaceFolder;
        this.rootPath = workspaceFolder.uri.fsPath;
        this.port = null;
        this.locale = getLocale();
        this._isDestroyed = false;
    }
    openBrowser(filename) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            if (this.isDestroyed()) {
                return;
            }
            if (!this.isReady()) {
                yield this.createServer().catch((err) => {
                    showErrorMessage(`${$t('run.localServer.createError')} ${err.message}`);
                    throw err;
                });
            }
            const relativePath = path.relative(this.rootPath, filename);
            const url = relativePath.split(path.sep).join('/');
            yield utils.openBrowser(`http://localhost:${this.port}/${url}`);
        });
    }
    createServer() {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            if (this.isDestroyed() || this.isReady()) {
                return;
            }
            const app = express();
            app.engine('html', require('express-art-template'));
            app.set('views', utils.resolveRoot('public/template'));
            app.set('view engine', 'html');
            app.use(require('serve-favicon')(utils.resolveRoot('public/favicon.ico')));
            app.use(require('compression')());
            app.use(this._handleRequest.bind(this));
            app.use(this._handleCatch.bind(this));
            this.port = yield utils.getPort(LocalServer.nextPort++);
            this.server = http.createServer(app);
            this.server.listen(this.port);
            return new Promise((resolve, reject) => {
                const server = this.server;
                server.on('listening', resolve);
                server.on('error', reject);
            });
        });
    }
    updateWorkspace(workspaceFolder) {
        this.workspaceFolder = workspaceFolder;
        this.rootPath = workspaceFolder.uri.fsPath;
    }
    destroy() {
        if (this.isDestroyed()) {
            return;
        }
        if (this.server && this.isReady()) {
            this.server.close();
        }
        this.server = null;
        this.port = null;
        this._isDestroyed = true;
    }
    isReady() {
        return !!this.server && this.server.listening;
    }
    isDestroyed() {
        return this._isDestroyed;
    }
    _handleRequest(req, res, next) {
        const relativePath = decodeURIComponent(req.url).replace(/^\//, '');
        const filename = path.resolve(this.rootPath, relativePath);
        utils.getStat(filename).then((stats) => {
            if (stats.isDirectory()) {
                utils.getIndexFilename(filename).then((indexFile) => {
                    res.sendFile(indexFile);
                }).catch(() => {
                    const error = new Error('404 Not Found');
                    error.name = '404';
                    next(error);
                });
            }
            else if (!stats.isFile()) {
                const err = new Error('404 Not Found');
                err.name = '404';
                next(err);
            }
            else {
                res.sendFile(filename);
            }
        }).catch((err) => {
            err.name = '404';
            next(err);
        });
    }
    _handleCatch(err, req, res, next) {
        if (err) {
            if (err.name === '404') {
                res.status(404);
            }
            else {
                res.status(500);
            }
            res.render('error', {
                lang: this.locale,
                title: err.message || 'Error Page',
                content: err.stack || err.message || '500 Error'
            });
        }
        else {
            res.end();
        }
    }
}
LocalServer.nextPort = 52330;
//# sourceMappingURL=LocalServer.js.map

class Manage {
    constructor() {
        this.map = new Map();
        this._resolveWorkspaceMap();
        this.cancelListening = this._listenWorkspaceFoldersChange();
    }
    add(workspaceFolder) {
        const dirname = workspaceFolder.uri.fsPath;
        if (this.has(dirname)) {
            const data = this.map.get(dirname);
            data.workspaceFolder = workspaceFolder;
            data.server.updateWorkspace(workspaceFolder);
            return data;
        }
        const server = new LocalServer(workspaceFolder);
        const data = { workspaceFolder, dirname, server };
        this.map.set(dirname, data);
        return data;
    }
    remove(dirname) {
        const target = this.get(dirname);
        if (target) {
            target.server.destroy();
        }
        this.map.delete(dirname);
    }
    get(dirname) {
        return this.map.get(dirname) || null;
    }
    getByFilename(filename) {
        let target = null;
        let relativeLength = 0;
        this.map.forEach((data) => {
            const relativePath = utils.getRelativePath(data.dirname, filename);
            if (relativePath == null) {
                return;
            }
            if (!target) {
                target = data;
                relativeLength = relativePath.length;
            }
            else if (relativePath.length > relativeLength) {
                target = data;
                relativeLength = relativePath.length;
            }
        });
        return target;
    }
    has(dirname) {
        return this.map.has(dirname);
    }
    destroy() {
        this.workspaceFolders = undefined;
        this.map.forEach((item) => {
            item.server.destroy();
        });
        this.map.clear();
        this.cancelListening();
    }
    openBrowser(filename) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            const workspaceData = this.getByFilename(filename);
            if (!workspaceData) {
                yield utils.openBrowser(filename);
                return true;
            }
            yield workspaceData.server.openBrowser(filename);
            return true;
        });
    }
    _listenWorkspaceFoldersChange() {
        const disposable = vscode.workspace.onDidChangeWorkspaceFolders(() => {
            this._resolveWorkspaceMap();
        });
        return () => {
            try {
                disposable.dispose();
            }
            catch (e) {
            }
        };
    }
    _resolveWorkspaceMap() {
        this.workspaceFolders = vscode.workspace.workspaceFolders;
        if (Array.isArray(this.workspaceFolders)) {
            this.workspaceFolders.forEach((workspaceFolder) => {
                const dirname = workspaceFolder.uri.fsPath;
                if (!this.get(dirname)) {
                    this.add(workspaceFolder);
                }
            });
            const removed = [];
            this.map.forEach((data) => {
                if (!this.workspaceFolders.find((item) => item.uri.fsPath === data.dirname)) {
                    removed.push(data.dirname);
                }
            });
            removed.forEach((item) => this.remove(item));
        }
    }
}
//# sourceMappingURL=Manage.js.map

let manage = null;
function initLocalServerManage() {
    manage = new Manage();
}
function destroyLocalServerManage() {
    if (manage) {
        manage.destroy();
    }
}
function openBrowserByServer(filename) {
    if (!manage) {
        initLocalServerManage();
    }
    return manage.openBrowser(filename);
}
//# sourceMappingURL=index.js.map

const COMMAND = {
    OPEN_IN_BROWSER: 'openInDefaultBrowser.openInDefaultBrowser'
};
const CONFIGURATION = {
    OPEN_WITH_HTTP_SERVER: 'openInDefaultBrowser.run.openWithLocalHttpServer'
};
//# sourceMappingURL=config.js.map

function registerOpenInBrowserCommand(context) {
    const disposable = vscode.commands.registerCommand(COMMAND.OPEN_IN_BROWSER, (evt) => {
        let filename = '';
        if (evt && typeof evt.path === 'string') {
            const match = evt.path.match(/\.(\w+)$/);
            if (match) {
                filename = evt.fsPath;
            }
        }
        else {
            const activeTextEditor = vscode.window.activeTextEditor;
            const document = activeTextEditor.document;
            filename = document.fileName;
        }
        const useHttpServer = getConfiguration(CONFIGURATION.OPEN_WITH_HTTP_SERVER);
        if (useHttpServer) {
            openBrowserByServer(filename);
        }
        else {
            utils.openBrowser(filename);
        }
    });
    context.subscriptions.push(disposable);
}
//# sourceMappingURL=command.js.map

function activate(context) {
    initLocalServerManage();
    registerOpenInBrowserCommand(context);
}
function deactivate() {
    destroyLocalServerManage();
}
//# sourceMappingURL=index.js.map

exports.activate = activate;
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
