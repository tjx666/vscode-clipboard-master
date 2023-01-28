import vscode from 'vscode';

import copyAsMarkdownCodeBlock from './features/copyAsMarkdownCodeBlock';
import copyTextWithoutSyntax from './features/copyTextWithoutSyntax';
import copyWithLineNumber from './features/copyWithLineNumber';
import { multiCopyCommands } from './features/multiCopy';
import smartCopy from './features/smartCopy';

export async function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        ...multiCopyCommands,
        vscode.commands.registerTextEditorCommand(
            'clipboardMaster.copyWithLineNumber',
            copyWithLineNumber,
        ),
        vscode.commands.registerTextEditorCommand(
            'clipboardMaster.copyTextWithoutSyntax',
            copyTextWithoutSyntax,
        ),
        vscode.commands.registerTextEditorCommand('clipboardMaster.smartCopy', smartCopy),
        vscode.commands.registerTextEditorCommand(
            'clipboardMaster.copyAsMarkdownCodeBlock',
            copyAsMarkdownCodeBlock,
        ),
    );
}
