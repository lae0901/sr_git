# base64 typescript functions
* rxp - regular expression constants
* core.ts - contains series of string_ and scan_ functions.

## usage
```
import { dir_mkdir, string_tail, string_contains } from 'sr_core_ts';

```

## base64 methods
* 
* array_compare<T>( arr1, arr2 )
* toarr = array_copyItems( arr, start, length )
* array_front<T>( arr: T[] ) : T | null
* boolean = stringArray_contains( arr, text )

## publish instructions
* increment version number in package.json
* make sure new functions are exported from base64.ts
* npm run build
* npm run test
* git add, commit, push to repo
* npm publish
* npm update in projects which use this package

## testing 
* npm run test
* or press F5, run task "run tester"
