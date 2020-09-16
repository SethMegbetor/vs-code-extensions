"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path = require("path");
class JsonDefinitionProvider {
    provideDefinition(document, position, token) {
        console.log('position', position, 'context', context);
        return [
            new vscode_1.Location(vscode_1.Uri.file(path.join(path.dirname(document.uri.fsPath), './data.json')), new vscode_1.Position(0, 0))
        ];
    }
}
exports.JsonDefinitionProvider = JsonDefinitionProvider;
//# sourceMappingURL=json-reference-provider.js.map