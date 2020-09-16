'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const json_completion_provider_1 = require("./json-completion-provider");
const json_definition_provider_1 = require("./json-definition-provider");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const jsonAutoProviderJS = vscode.languages.registerCompletionItemProvider('javascript', new json_completion_provider_1.JsonCompletionProvider(), '.');
    const jsonAutoProviderTS = vscode.languages.registerCompletionItemProvider('typescript', new json_completion_provider_1.JsonCompletionProvider(), '.');
    const jsonDefinitionProviderJS = vscode.languages.registerDefinitionProvider('javascript', new json_definition_provider_1.JsonDefinitionProvider());
    const jsonDefinitionProviderTS = vscode.languages.registerDefinitionProvider('typescript', new json_definition_provider_1.JsonDefinitionProvider());
    context.subscriptions.push(jsonAutoProviderJS, jsonAutoProviderTS, jsonDefinitionProviderJS, jsonDefinitionProviderTS);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map