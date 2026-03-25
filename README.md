# git typescript functions

## usage
```
import { dir_mkdir, string_tail, string_contains } from 'sr_core_ts';

```

## git methods
* const { rootPath, isRepo, isBehind, isAhead, hasModified } = git_status( path, appendActivityLog )
* gitPath = await git_resolveGitPath( dirPath )
* errmsg = await git_pull( rootPath, appendActivityLog )

## publish this sr_git package
* increment version number in package.json
* make sure new functions are exported from index.ts
* npm run build
* npm run test
* git add, commit, push to repo
* npm publish
* npm update in projects which use this package

## testing 
* npm run test
* or press F5, run task "run tester"

## todo 

2026-03-25
planning to separate out snippets into standalone files. The `assist-prompt.json` file will then only contain the prompt templates and the references to the snippet files.  Will have a "snippet name" section of the prompt .json file which will specify the name of the snippet and the path to the snippet .json file. 

An additional benefit of this separation is that the snippet .json files can be loaded into vscode and used as standalone snippets. The benefit being that as snippets are added to the repo, they are automatically added to vscode ( as long as the assist-prompt snippet is active. )

## snippets 

Since this repo is public it is used as storage location of various snippets.json files.

Look to SR-SNIPPET-PROMPT project for code which fetches snippet .json files from this SR-GIT repo. 

## shells 

when shell assist is selected, the named shell is either a single file or a folder.
* a file shell is copied into the current document.
* a folder shell, all the files of the shell are copied into the folder of the current document.
  * any existing files are replaced. Including the current document.

```
    "vue-boot-shell": {
      "folder": "./shells/vue-boot-shell",
      "file": "path to the shell file",    // either file or folder is specified.
      "description": "shell of web project which uses vue.js and bootstrap to render a basic web page."
    }
```