import vscode from 'vscode';

import configuration from './utils/configuration';

export async function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand(
            'clipboardMaster.copyWithLineNumber',
            (editor) => {
                import('./features/copyWithLineNumber').then((mod) =>
                    mod.copyWithLineNumber(editor),
                );
            },
        ),
        vscode.commands.registerTextEditorCommand(
            'clipboardMaster.copyTextWithoutSyntax',
            (editor) => {
                import('./features/copyTextWithoutSyntax').then((mod) =>
                    mod.copyTextWithoutSyntax(editor),
                );
            },
        ),
        vscode.commands.registerTextEditorCommand('clipboardMaster.smartCopy', (editor) => {
            import('./features/smartCopy').then((mod) => mod.smartCopy(editor));
        }),
        vscode.commands.registerTextEditorCommand(
            'clipboardMaster.copyAsMarkdownCodeBlock',
            (editor) => {
                import('./features/copyAsMarkdownCodeBlock').then((mod) =>
                    mod.copyAsMarkdownCodeBlock(editor),
                );
            },
        ),
    );

    configuration.update(context);
    vscode.workspace.onDidChangeConfiguration(() => {
        configuration.update(context);
    }, context.subscriptions);
}
