import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import {testResults_append, testResults_consoleLog, testResults_new } from 'sr_test_framework';
import { git_status } from './index';

// run main function that is declared as async. 
async_main( ) ;

// ------------------------------- async_main ---------------------------------
async function async_main( )
{
  const results = testResults_new( ) ;

  // git_test
  {
    const res = git_test();
    results.push(...res);
  }

  testResults_consoleLog( results ) ;
}

// ---------------------------------- git_test ----------------------------------
function git_test()
{
  const results = testResults_new();
  // test the base64Builder function.
  {
    const method = 'git_status';
    const expected = { isRepo:true, isBehind:false, isAhead:false, hasModified:true };
    const testResult = git_status( undefined, activityLog_append ) ;
    const desc = 'get git status' ;
    testResults_append(results, { method, expected, testResult, desc } );
  }

  return results;
}

// ------------------------------ activityLog_append ------------------------------
function activityLog_append( text: string )
{
  console.log(`activity log: ${text}`);
}