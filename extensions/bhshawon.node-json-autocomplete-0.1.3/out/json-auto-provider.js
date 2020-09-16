"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path = require("path");
class JsonCompletionProvider {
    provideCompletionItems(document, position, _token, context) {
        const jsons = this.getImportedJsons(document);
        this.getJsonCompletionItems(document, position, jsons);
        return Promise.resolve(this.getJsonCompletionItems(document, position, jsons));
    }
    getJsonCompletionItems(document, position, jsons) {
        const jsonSequenceRegex = /(\s*\w[\w\d_-]+\.)+/;
        const jsonSequenceRange = document.getWordRangeAtPosition(position, jsonSequenceRegex);
        const jsonSequenceText = document.getText(jsonSequenceRange);
        const jsonSequence = jsonSequenceText.split('.').map(str => str.trim());
        const propertySequence = jsonSequence.slice(0, -1);
        let currentObject = jsons;
        for (const property of propertySequence) {
            if (!currentObject[property] || typeof currentObject[property] !== 'object') {
                return [];
            }
            else {
                currentObject = currentObject[property];
            }
        }
        const completionItems = Object
            .keys(currentObject)
            .map((key, index) => {
            const completionItem = new vscode_1.CompletionItem(key, vscode_1.CompletionItemKind.Property);
            // Make completion item top suggestion
            completionItem.sortText = '0' + key;
            return completionItem;
        });
        return completionItems;
    }
    getImportedJsons(document) {
        const jsons = {};
        const importRegexGlobal = /[\w_$]*[\w\d_\-$]+\s*=\s*require\s*\(\s*'.*\.json'\s*\)|import\s+[\w_$]*[\w\d_\-$]+\s+from\s+'.*\.json'/g;
        const importRegex = /([\w_$]*[\w\d_\-$]+)\s*=\s*require\s*\(\s*'(.*\.json)'\s*|import\s+([\w_$]*[\w\d_\-$]+)\s+from\s+'(.*\.json)'/;
        const documentText = document.getText();
        const importedJsons = documentText.match(importRegexGlobal);
        if (Array.isArray(importedJsons)) {
            importedJsons.forEach(importText => {
                const importTextMatch = importText.match(importRegex);
                const jsonName = importTextMatch[1] || importTextMatch[3];
                const jsonPath = importTextMatch[2] || importTextMatch[4];
                const jsonAbsolutePath = jsonPath.startsWith('.')
                    ? path.join(path.dirname(document.uri.fsPath), jsonPath)
                    : jsonPath;
                jsons[jsonName] = require(jsonAbsolutePath);
            });
        }
        return jsons;
    }
}
exports.JsonCompletionProvider = JsonCompletionProvider;
//# sourceMappingURL=json-auto-provider.js.map