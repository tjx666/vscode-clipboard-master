import type { TextDocument } from 'vscode';
import vscode from 'vscode';

export function getEOL(document: TextDocument) {
    return document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n';
}

export function getIndentChar(text: string, eol: string) {
    return text.split(eol).some((line) => line.startsWith('\t')) ? '\t' : ' ';
}
