import vscode from 'vscode';

class Configuration {
    enableMultiCopy = true;
    bufferSize = 10;
    formatAfterPaste = false;
    initializedMultiCopy = false;

    async update(context: vscode.ExtensionContext) {
        const latestConfiguration = vscode.workspace.getConfiguration('clipboardMaster');
        this.enableMultiCopy = latestConfiguration.get('enableMultiCopy')!;
        const enableMultiCopyBefore = this.enableMultiCopy;
        if (!this.initializedMultiCopy && this.enableMultiCopy) {
            const { multiCopyCommands } = await import('../features/multiCopy');
            context.subscriptions.push(...multiCopyCommands);
            vscode.commands.executeCommand('setContext', 'clipboardMaster.enableMultiCopy', true);
            this.initializedMultiCopy = true;
        }

        if (enableMultiCopyBefore && !this.enableMultiCopy) {
            vscode.commands.executeCommand('setContext', 'clipboardMaster.enableMultiCopy', false);
        }

        this.bufferSize = latestConfiguration.get('bufferSize')!;
        this.formatAfterPaste = latestConfiguration.get('formatAfterPaste')!;
    }
}

const configuration = new Configuration();
export default configuration;
