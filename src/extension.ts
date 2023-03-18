import vscode from 'vscode';

import configuration from './utils/configuration';

export async function activate(context: vscode.ExtensionContext) {
    const { commands } = vscode;

    const registerTextEditorCommand = (
        commandName: string,
        callback: (
            textEditor: vscode.TextEditor,
            edit: vscode.TextEditorEdit,
            ...args: any[]
        ) => void,
        thisArg?: any,
    ) => {
        const cmd = commands.registerTextEditorCommand(
            `clipboardMaster.${commandName}`,
            callback,
            thisArg,
        );
        context.subscriptions.push(cmd);
        return cmd;
    };

    registerTextEditorCommand('copyWithLineNumber', (editor) => {
        import('./features/copyWithLineNumber').then((mod) => mod.copyWithLineNumber(editor));
    });

    registerTextEditorCommand('copyTextWithoutSyntax', (editor) => {
        import('./features/copyTextWithoutSyntax').then((mod) => mod.copyTextWithoutSyntax(editor));
    });

    registerTextEditorCommand('smartCopy', (editor) => {
        import('./features/smartCopy').then((mod) => mod.smartCopy(editor));
    });

    registerTextEditorCommand('copyAsMarkdownCodeBlock', (editor) => {
        import('./features/copyAsMarkdownCodeBlock').then((mod) =>
            mod.copyAsMarkdownCodeBlock(editor),
        );
    });

    configuration.update(context);
    vscode.workspace.onDidChangeConfiguration(
        () => {
            configuration.update(context);
        },
        null,
        context.subscriptions,
    );
}
