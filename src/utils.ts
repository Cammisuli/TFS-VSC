import * as vscode from 'vscode';

export function getCurrentFilePath(): string {
    if (!vscode.window.activeTextEditor) {
        return '';
    }

    var currentFilePath = vscode.window.activeTextEditor.document.uri.toString();

    if (currentFilePath.substr(0, 8) !== 'file:///') {
        return '';
    }

    currentFilePath = decodeURIComponent(currentFilePath).substr(8);

    return currentFilePath;
}