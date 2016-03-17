import {workspace, window, Disposable, OutputChannel, StatusBarItem, StatusBarAlignment} from 'vscode';
import * as utils from './utils';
import {exec, spawnSync, spawn, execFile} from 'child_process';
import {resolve} from 'path';
import * as _ from 'lodash';

export class TfsCommand {

    private _disposable: Disposable;

    private _tasksPath: string;

    private _tfPath = '"C:/Program Files (x86)/Microsoft Visual Studio 12.0/Common7/IDE/TF.exe"';

    private _outputWindow: OutputChannel;

    private _statusBarItem: StatusBarItem;

    private _fileReverted = false;

    constructor() {

        this._outputWindow = window.createOutputChannel("TFS");

        let subscriptions: Disposable[] = [];
        workspace.onDidChangeTextDocument(this._onTextChange, this, subscriptions);

        window.onDidChangeActiveTextEditor(this._setStatus, this, subscriptions);

        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    getLatest() {
        let cmd = `${this._tfPath} get "${workspace.rootPath}" /recursive`;
        exec(cmd, (error, stdOut, stdErr) => {
            window.showInformationMessage("Latest files retrieved.");
            this._appendOutput("Finished getting all files from TFS");
        });

        this._appendOutput("Getting all files from TFS");
    }

    checkIn() {
        var child = exec(`start cmd.exe @cmd /k "${this._tfPath} checkin"`, function() { });
        this._appendOutput("Checking in files.");
    }

    checkOut(filePath: string) {
        this.isFileCheckedOut(filePath).then(checkedOut => {
            if (!checkedOut) {
                this._appendOutput("Checking out file: " + filePath);

                let cmd = `${this._tfPath} checkout "${filePath}"`;
                exec(cmd, (error, stdOut, stdErr) => {
                    window.showInformationMessage("File checked out.");
                    this._setStatus(true);
                    this._appendOutput("Checked out file: " + filePath);
                });
            }
        });
    }

    undo(filePath: string) {
        let cmd = `${this._tfPath} undo "${filePath}"`;
        this.isFileCheckedOut(filePath).then(checkedOut => {
            this._appendOutput("Undoing file: " + filePath);
            if (checkedOut) {
                exec(cmd, (error, stdOut, stdErr) => {
                    window.showInformationMessage("File reverted.");
                    this._appendOutput("File reverted: " + filePath);
                    this._fileReverted = true;
                    this._setStatus(false);
                });
            } else {
                window.showInformationMessage("This file has no pending changes.");
            }
        });
    }

    isFileCheckedOut(filePath: string): Promise<boolean> {
        let cmd = `${this._tfPath} status "${filePath}"`;

        let promise = new Promise((resolve, reject) => {
            exec(cmd, (error, stdOut, stdErr) => {
                if (error) {
                    reject(utils.getBufferContents(error));
                }
                if (stdErr && !stdOut) {
                    reject(utils.getBufferContents(stdErr));
                }
                let responseString = stdOut.toString('utf8').replace(/\r?\n|\r/, '');
                if (responseString == "There are no pending changes.") {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });

        return promise;
    }

    private _setStatus(event, out?: boolean) {

        function setStatusMessage(statusBarItem: StatusBarItem, checkedOut: boolean) {
            if (checkedOut) {
                statusBarItem.text = `$(check) File is checked out`
            } else {
                statusBarItem.text = `$(circle-slash) File is locked`
            }
            statusBarItem.show();
        }

        if (!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        }

        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }
        if (typeof out !== 'undefined') {
            setStatusMessage(this._statusBarItem, out);
        } else {
            if (utils.getCurrentFilePath()) {

                this.isFileCheckedOut(utils.getCurrentFilePath()).then(checkedOut => {
                      setStatusMessage(this._statusBarItem, checkedOut);
                })
            } else {
                this._statusBarItem.hide();
            }
        }
    }

    private _onTextChange() {
        // if (window.activeTextEditor.document.isDirty) {
        //     return;
        // }

        if (!_.isEmpty(utils.getCurrentFilePath())) {

            if (!this._fileReverted) {
                this.checkOut(utils.getCurrentFilePath());
            }

            this._fileReverted = false;
        }
    }

    private _appendOutput(value: string) {
        //this._outputWindow.appendLine(new Date().toLocaleString() + " " +value);
    }

}