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
