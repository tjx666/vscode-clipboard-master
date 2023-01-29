/**
 * reference: https://github.com/bmaupin/vscode-copy-without-formatting/blob/master/src/extension.ts
 */
import type { TextEditor } from 'vscode';
import vscode from 'vscode';

export async function copyTextWithoutSyntax(editor: TextEditor): Promise<void> {
    if (editor.selections.length === 1) {
        const { document, selection } = editor;
        if (!document) return;

        const selectedText = document.getText(selection);
        if (!selectedText) return;

        await vscode.env.clipboard.writeText(selectedText);
    } else {
        // When there are multiple selections (due to multiple cursors), vscode doesn't seem to copy the formatting.
        // So just cheat and use the default built-in copy functionality.
        vscode.commands.executeCommand('editor.action.clipboardCopyAction');
    }
}
