import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import {testResults_append, testResults_consoleLog, testResults_new } from 'sr_test_framework';
import { git_free, git_resolveRootPath, git_status } from './index';
import { object_properties } from 'sr_core_ts';

// run main function that is declared as async. 
async_main( ) ;

// ------------------------------- async_main ---------------------------------
async function async_main( )
{
  const results = testResults_new( ) ;

  // git_test
  {
    const res = await git_test();
    results.push(...res);
  }

  testResults_consoleLog( results ) ;
}

// ---------------------------------- git_test ----------------------------------
async function git_test()
{
  const results = testResults_new();

  // git_status.
  {
    const method = 'git_status';
    const expected = { isRepo:true, isBehind:false, isAhead:false, isModified:true };
    const actual = await git_status( undefined, activityLog_append ) ;
    const desc = 'get git status' ;
    testResults_append(results, { method, expected, actual, desc } );
  }

  // git_resolveRootPath.
  {
    const method = 'git_resolveRootPath';
    const dirPath = process.cwd( ) ;
    const expected = dirPath ;
    const actual = await git_resolveRootPath( dirPath );
    const desc = 'get git root path';
    testResults_append(results, { method, expected, actual, desc });
  }

  // git status when not a repo folder
  {
    git_free( ) ;  
    const method = 'git_status' ;
    const aspect = 'git status in folder not a repo' ;
    const save_cwd = process.cwd( ) ;
    process.chdir('c:\\Users\\srich');
    const status = await git_status(undefined, activityLog_append) ;
    const actual = object_properties(status, ['isRepo']);
    testResults_append( results, { method, aspect, expected:{isRepo:false}, actual })
    process.chdir(save_cwd) ;
  }

  return results;
}

// ------------------------------ activityLog_append ------------------------------
function activityLog_append( text: string )
{
  console.log(`activity log: ${text}`);
}