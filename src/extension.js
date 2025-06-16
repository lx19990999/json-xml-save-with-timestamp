const vscode = require('vscode');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

function activate(context) {
    console.log('json-xml-save-with-timestamp extension activated');

    let disposable = vscode.commands.registerCommand('jsonXmlSaveWithTimestamp.saveWithTimestamp', async () => {
        console.log('jsonXmlSaveWithTimestamp.saveWithTimestamp command triggered');
        const editor = vscode.window.activeTextEditor;
        console.log('Active editor:', editor ? 'found' : 'not found');

        if (!editor) {
            vscode.window.showErrorMessage('No active editor!');
            return;
        }

        const doc = editor.document;
        const content = doc.getText();

        let fileType = '';

        if (content.trimStart().startsWith('{') || content.trimStart().startsWith('[')) {
            fileType = 'json';
        } else if (content.trimStart().startsWith('<?xml')) {
            fileType = 'xml';
        }

        if (!fileType) {
            vscode.window.showErrorMessage('File does not appear to be JSON or XML');
            return;
        }
        // 输出fileType
        console.log('Detected file type:', fileType);

        vscode.window.showInformationMessage(`Detected ${fileType.toUpperCase()} content, saving with timestamp...`);

        const config = vscode.workspace.getConfiguration('jsonXmlSaveWithTimestamp');
        console.log('Loaded configuration:', config);

        const savePath = config.get('savePath', '${workspaceFolder}');
        const filenameFormat = config.get('filenameFormat', 'YYYYMMDD_HHmmss');

        // Resolve workspace variables
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || '';
        const resolvedPath = savePath.replace('${workspaceFolder}', workspaceFolder);
        console.log('Resolved save path:', resolvedPath);


        // Create directory if not exists
        if (!fs.existsSync(resolvedPath)) {
            fs.mkdirSync(resolvedPath, { recursive: true });
        }

        // Generate filename with timestamp
        const timestamp = moment().format(filenameFormat);
        const filename = `${timestamp}.${fileType}`;
        const filePath = path.join(resolvedPath, filename);
        console.log('Target file path:', filePath);

        // Write to file
        try {
            console.log('Writing file content, length:', content.length);
            fs.writeFileSync(filePath, content);
            console.log('File saved successfully');

            vscode.window.showInformationMessage(`File saved to: ${filePath}`);
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to save file: ${err.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = { activate, deactivate };