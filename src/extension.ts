'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {TfsCommand} from './tfscommand'
import * as utils from './utils';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "TFS-VSC" is now active!');


    // // The command has been defined in the package.json file
    // // Now provide the implementation of the command with  registerCommand
    // // The commandId parameter must match the command field in package.json
    // let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
    // 	// The code you place here will be executed every time your command is executed

    // 	// Display a message box to the user
    // 	vscode.window.showInformationMessage('Hello World!');
    // });

    let tfsCommand = new TfsCommand();

    var disposables = [
        vscode.commands.registerCommand('tfs-vsc.checkIn', () => {
            tfsCommand.checkIn();
        }),
        vscode.commands.registerCommand('tfs-vsc.undo', () => {
            tfsCommand.undo(utils.getCurrentFilePath());
        }),
        vscode.commands.registerCommand('tfs-vsc.getLatest', () => {
            tfsCommand.getLatest();
        })
        // vscode.commands.registerCommand('tfs-vsc.list', tfsList),
        // vscode.commands.registerCommand('tfs-vsc.status', function() { tfsExec('status', true); })
    ];

    context.subscriptions.push(tfsCommand);
    context.subscriptions.concat(disposables);
}

// this method is called when your extension is deactivated
export function deactivate() {

}

