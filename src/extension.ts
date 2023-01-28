/* eslint-disable unicorn/no-array-push-push */
import type { QuickPickItem } from 'vscode';
import vscode, { window as Window, Range } from 'vscode';

function sleep(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

export async function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('clipboardMaster');
    const formatAfterPaste = config.get('formatAfterPaste', false);
    const bufferSize = config.get('bufferSize', 10);
    const systemClipboardText = await vscode.env.clipboard.readText();
    // read system clipboard text
    let copyBuffer: string[] = [systemClipboardText];
    let pasteIndex = 0;
    let lastRange: Range | undefined;

    function newCopyBuffer(e: vscode.TextEditor, merge = false): string {
        const { document, selection } = e;
        let text: string = document.getText(new Range(selection.start, selection.end));

        // A copy of a zero length line means copy the whole line.
        if (text.length === 0) {
            const eol = document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n';
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

    const disposables = [];
    disposables.push(
        vscode.commands.registerTextEditorCommand('clipboardMaster.clearBuffer', () => {
            copyBuffer = [];
            pasteIndex = 0;
        }),
    );
    disposables.push(
        vscode.commands.registerTextEditorCommand('clipboardMaster.copyMerge', (editor) => {
            newCopyBuffer(editor, true);
            vscode.commands.executeCommand('editor.action.clipboardCopyAction');
        }),
    );
    disposables.push(
        vscode.commands.registerTextEditorCommand('clipboardMaster.copy', (editor) => {
            newCopyBuffer(editor);
            vscode.commands.executeCommand('editor.action.clipboardCopyAction');
        }),
    );
    disposables.push(
        vscode.commands.registerTextEditorCommand('clipboardMaster.cutMerge', (editor) => {
            newCopyBuffer(editor, true);
            vscode.commands.executeCommand('editor.action.clipboardCutAction');
        }),
    );
    disposables.push(
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
        await sleep(100);

        // Grab a copy of the current selection array
        const originSelections = editor.selections;

        // Grab the current primary selection
        const sel = originSelections[0];

        // Change the current selection array to contain a single item
        // that encompasses the entire pasted block.
        editor.selections = [sel];

        // Send the pasted value to the system clipboard.
        await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
        await sleep(100);
        // Restore the previous selection(s)
        editor.selections = originSelections;

        // Format the selection, if enabled
        if (formatAfterPaste) {
            await vscode.commands.executeCommand('editor.action.formatSelection');
            await sleep(100);
        }
        lastRange = new Range(editor.selection.start, editor.selection.end);
    }

    disposables.push(
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

    disposables.push(
        vscode.commands.registerTextEditorCommand(
            'clipboardMaster.regularPaste',
            async (editor) => {
                await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
                if (formatAfterPaste) {
                    const start = editor.selection.anchor;
                    const end = editor.selection.anchor;
                    const selection = new vscode.Selection(
                        start.line,
                        start.character,
                        end.line,
                        end.character,
                    );
                    editor.selection = selection;
                    await vscode.commands.executeCommand('editor.action.formatSelection');
                    await sleep(100);
                    const newPos = editor.selection.active;
                    editor.selection = new vscode.Selection(newPos, newPos);
                }
            },
        ),
    );

    disposables.push(
        vscode.commands.registerTextEditorCommand('clipboardMaster.list', async (editor) => {
            if (copyBuffer.length === 0) {
                Window.setStatusBarMessage('Clipboard Master: Nothing to paste', 3000);
                return;
            }

            const items: QuickPickItem[] = [];
            for (const [i, element] of copyBuffer.entries()) {
                items.push({ label: (i + 1).toString(), description: element });
            }

            const item = await Window.showQuickPick(items);
            if (!item) {
                return;
            }

            doPaste(editor, item.description!);
        }),
    );

    // eslint-disable-next-line unicorn/prefer-spread
    context.subscriptions.concat(disposables);
}
