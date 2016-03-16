import {workspace, window, Disposable} from 'vscode';
import * as utils from './utils';
import {exec} from 'child_process'

export class TfsCommand {

    private _disposable: Disposable;
    
    private _tfPath = "C:/Program Files (x86)/Microsoft Visual Studio 12.0/Common7/IDE/TF.exe"
    
    constructor() {
        let subscriptions: Disposable[] = [];

        workspace.onDidChangeTextDocument(this._onTextChange, this, subscriptions);

        this._disposable = Disposable.from(...subscriptions);

    }

    dispose() {
        this._disposable.dispose();
    }
    
    checkOut(filePath: string) {
        let cmd = `"${this._tfPath}" checkout "${filePath}"`;
        exec(cmd, (error, stdOut, stdErr) => {
            console.log(stdOut);
            window.showInformationMessage("File checked out.");
        });
    }

    private _onTextChange() {
        if (window.activeTextEditor.document.isDirty) {
            return;
        }

        if (!_.isEmpty(utils.getCurrentFilePath())) {
           this.checkOut(utils.getCurrentFilePath());
        }
    }

}