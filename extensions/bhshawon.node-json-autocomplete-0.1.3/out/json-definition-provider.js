"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const utils_1 = require("./utils");
const fs_1 = require("fs");
const json_source_map_1 = require("json-source-map");
class JsonDefinitionProvider {
    provideDefinition(document, position, token) {
        const jsonSequence = this.getJsonSequence(document, position);
        if (!jsonSequence || !jsonSequence.length) {
            return null;
        }
        const importedJsonPaths = utils_1.getImportedJsonPaths(document);
        const jsonPath = importedJsonPaths[jsonSequence[0]];
        if (!jsonPath) {
            return null;
        }
        try {
            const json = fs_1.readFileSync(jsonPath, 'utf-8');
            const parsedJson = json_source_map_1.parse(json);
            const pointerPath = '/' + jsonSequence
                .slice(1)
                .join('/');
            const definitionPointer = parsedJson.pointers[pointerPath];
            if (!definitionPointer) {
                return null;
            }
            const jsonFileUri = vscode_1.Uri.file(jsonPath);
            const definitionPosition = new vscode_1.Position(definitionPointer.key.line, definitionPointer.key.column);
            return [new vscode_1.Location(jsonFileUri, definitionPosition)];
        }
        catch (error) {
            console.error(error);
        }
        return null;
    }
    getJsonSequence(document, position) {
        const wordRange = document.getWordRangeAtPosition(position);
        const rangeFromStart = new vscode_1.Range(new vscode_1.Position(0, 0), wordRange.end);
        const textFromStart = document.getText(rangeFromStart);
        const jsonSequenceRegex = /[\w\d-_$]+(\s*\.\s*[\w\d-_$]+)*$/;
        const jsonSequenceMatch = textFromStart.match(jsonSequenceRegex);
        if (!jsonSequenceMatch) {
            return null;
        }
        const jsonSequenceText = jsonSequenceMatch[0];
        const jsonSequence = jsonSequenceText
            .split('.')
            .filter(word => word)
            .map(word => word.trim());
        return jsonSequence;
    }
}
exports.JsonDefinitionProvider = JsonDefinitionProvider;
//# sourceMappingURL=json-definition-provider.js.map