import {workspace, window, Disposable} from 'vscode';
import * as utils from './utils';
import {exec} from 'child_process';

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
        this.checkStatus(filePath).then(val => {
            if (val) {
                let cmd = `"${this._tfPath}" checkout "${filePath}"`;
                exec(cmd, (error, stdOut, stdErr) => {
                    window.showInformationMessage("File checked out.");
                });
            }
        });
    }

    checkStatus(filePath: string): Promise<Boolean> {
        let cmd = `"${this._tfPath}" status "${filePath}"`;

        let promise = new Promise((resolve, reject) => {
            exec(cmd, (error, stdOut, stdErr) => {
                if (error) {
                    reject(utils.getBufferContents(error));
                }
                if (stdErr && !stdOut) { // @note: stderr can be getted with stdout at one time!
                    reject(utils.getBufferContents(stdErr));
                }
                let responseString = stdOut.toString('utf8').replace(/\r?\n|\r/, '');
                if (responseString == "There are no pending changes.") {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });

        return promise;
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