# vscode extension boilerplate

<div align="center">

![test](https://github.com/tjx666/vscode-clipboard-master/actions/workflows/test.yml/badge.svg) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com) [![Percentage of issues still open](https://isitmaintained.com/badge/open/tjx666/vscode-clipboard-master.svg)](http://isitmaintained.com/project/tjx666/vscode-clipboard-master) [![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

</div>

## Features

- multiple copy and paste
- copy with line number
- copy text without syntax
- smart copy
- copy as markdown code block

### multiple copy and paste

I just migrate code from [Multiple clipboards for VSCode](https://github.com/stef-levesque/vscode-multiclip) and make some optimizations

### copy with line number

You can use command: `FE Helper: copy with line number` to copy some content with line number.

![copy with line number](https://github.com/tjx666/vscode-fe-helper/raw/master/images/copy_with_line_number.gif?raw=true)

### copy text without syntax

You can use command: `FE Helper: copy text without syntax` to copy selected text without syntax.

### smart copy

with command `FE Helper: Smart Copy`, you can:

- copy without syntax
- auto correct indent because some external editor can't deal with indent of paste code correctly

### copy as markdown code block

with command `FE Helper: Copy as Markdown Code Block`, you can:

- copy without syntax
- auto correct indent because some external editor can't deal with indent of paste code correctly
- detect the code language
- wrap code with markdown code block syntax
