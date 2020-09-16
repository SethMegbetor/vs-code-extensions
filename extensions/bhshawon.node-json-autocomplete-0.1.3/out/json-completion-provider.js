"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const utils_1 = require("./utils");
const lodash_1 = require("lodash");
const fs_1 = require("fs");
class JsonCompletionProvider {
    provideCompletionItems(document, position, _token, context) {
        const jsons = this.getImportedJsons(document);
        this.getJsonCompletionItems(document, position, jsons);
        return Promise.resolve(this.getJsonCompletionItems(document, position, jsons));
    }
    getJsonCompletionItems(document, position, jsons) {
        const jsonSequenceRegex = /([\w\d-_$]+(\s*\.\s*[\w\d-_$]+\s*)*)\s*\.$/;
        const rangeFromStart = new vscode_1.Range(new vscode_1.Position(0, 0), position);
        const textFromStart = document.getText(rangeFromStart);
        const jsonSequenceMatch = textFromStart.match(jsonSequenceRegex);
        if (!jsonSequenceMatch) {
            return null;
        }
        const jsonSequenceText = jsonSequenceMatch[0];
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
        const jsonPaths = utils_1.getImportedJsonPaths(document);
        return lodash_1.mapValues(jsonPaths, value => {
            const jsonString = fs_1.readFileSync(value, 'utf-8');
            return JSON.parse(jsonString);
        });
    }
}
exports.JsonCompletionProvider = JsonCompletionProvider;
//# sourceMappingURL=json-completion-provider.js.map