/* eslint-disable unicorn/no-array-push-push */
import type { QuickPickItem } from 'vscode';
import vscode, { window as Window, Range } from 'vscode';

import { getEOL } from '../utils/editor';

const config = vscode.workspace.getConfiguration('clipboardMaster');
const formatAfterPaste = config.get('formatAfterPaste', false);
const bufferSize = config.get('bufferSize', 10);
let copyBuffer: string[] = [];
let pasteIndex = 0;
let lastRange: Range | undefined;

function newCopyBuffer(editor: vscode.TextEditor, merge = false): string {
    const { document, selection } = editor;
    let text: string = document.getText(new Range(selection.start, selection.end));

    // A copy of a zero length line means copy the whole line.
    if (text.length === 0) {
        const eol = getEOL(document);
        text = document.lineAt(selection.start.line).text + eol;
    }

    if (merge) {
        if (copyBuffer.length === 0) {
            copyBuffer.push('');
        }
        copyBuffer[0] += text;
    } else {
        if (text.trim().length > 0 && !copyBuffer.includes(text)) {
            copyBuffer.unshift(text);
            if (copyBuffer.length > bufferSize) {
                copyBuffer = copyBuffer.slice(0, bufferSize);
            }
        }
    }
    pasteIndex = 0;
    return text;
}

const multiCopyCommands: { dispose(): any }[] = [];
multiCopyCommands.push(
    vscode.commands.registerTextEditorCommand('clipboardMaster.clearBuffer', () => {
        copyBuffer = [];
        pasteIndex = 0;
    }),
);
multiCopyCommands.push(
    vscode.commands.registerTextEditorCommand('clipboardMaster.copyMerge', (editor) => {
        newCopyBuffer(editor, true);
        vscode.commands.executeCommand('editor.action.clipboardCopyAction');
    }),
);
multiCopyCommands.push(
    vscode.commands.registerTextEditorCommand('clipboardMaster.copy', (editor) => {
        newCopyBuffer(editor);
        vscode.commands.executeCommand('editor.action.clipboardCopyAction');
    }),
);
multiCopyCommands.push(
    vscode.commands.registerTextEditorCommand('clipboardMaster.cutMerge', (editor) => {
        newCopyBuffer(editor, true);
        vscode.commands.executeCommand('editor.action.clipboardCutAction');
    }),
);
multiCopyCommands.push(
    vscode.commands.registerTextEditorCommand('clipboardMaster.cut', (editor) => {
        newCopyBuffer(editor);
        vscode.commands.executeCommand('editor.action.clipboardCutAction');
    }),
);

async function doPaste(editor: vscode.TextEditor, text: string) {
    await editor.edit((editBuilder) => {
        for (const selection of editor.selections) {
            editBuilder.replace(selection, text);
        }
    });

    // Grab a copy of the current selection array
    const originSelections = editor.selections;

    // Grab the current primary selection
    const sel = originSelections[0];

    // Change the current selection array to contain a single item
    // that encompasses the entire pasted block.
    editor.selections = [sel];

    // Send the pasted value to the system clipboard.
    await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
    // Restore the previous selection(s)
    editor.selections = originSelections;

    // Format the selection, if enabled
    if (formatAfterPaste) {
        await vscode.commands.executeCommand('editor.action.formatSelection');
    }
    lastRange = new Range(editor.selection.start, editor.selection.end);
}

multiCopyCommands.push(
    vscode.commands.registerTextEditorCommand('clipboardMaster.paste', (editor) => {
        if (copyBuffer.length === 0) {
            Window.setStatusBarMessage('Clipboard Master: Nothing to paste', 3000);
            return;
        }

        const newRange = new Range(editor.selection.start, editor.selection.end);
        // paste at same selection multiple times will paste previous item
        if (lastRange && newRange.isEqual(lastRange)) {
            pasteIndex = ++pasteIndex < copyBuffer.length ? pasteIndex : 0;
        }

        doPaste(editor, copyBuffer[pasteIndex]);
    }),
);

multiCopyCommands.push(
    vscode.commands.registerTextEditorCommand('clipboardMaster.regularPaste', async () => {
        await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
    }),
);

multiCopyCommands.push(
    vscode.commands.registerTextEditorCommand('clipboardMaster.list', async (editor) => {
        if (copyBuffer.length === 0) {
            Window.setStatusBarMessage('Clipboard Master: Nothing to paste', 3000);
            return;
        }

        const items: QuickPickItem[] = [];
        for (const [i, element] of copyBuffer.entries()) {
            items.push({ label: (i + 1).toString(), description: element });
        }

        const selectedItems = await Window.showQuickPick(items, { canPickMany: true });
        if (!selectedItems?.length) {
            return;
        }

        doPaste(
            editor,
            selectedItems
                .reverse()
                .map((i) => i.description!)
                .join(''),
        );
    }),
);

export { multiCopyCommands };
