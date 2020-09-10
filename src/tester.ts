import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import {testResults_append, testResults_consoleLog, testResults_new } from 'sr_test_framework';
import { base64Builder_new, base64Builder_append, base64Builder_final } from './base64';

// run main function that is declared as async. 
async_main( ) ;

// ------------------------------- async_main ---------------------------------
async function async_main( )
{
  const results = testResults_new( ) ;

  // base64_test
  {
    const res = base64_test();
    results.push(...res);
  }

  testResults_consoleLog( results ) ;
}

// ---------------------------------- base64_test ----------------------------------
function base64_test()
{
  const results = testResults_new();
  let method = '';

  // test the base64Builder function.
  {
    method = 'base64Builder';
    let passText = '';
    let failText = '';
    const builder = base64Builder_new() ;
    base64Builder_append( builder, 'abc' ) ;
    base64Builder_append( builder, '123' ) ;
    const base64_text = base64Builder_final( builder ) ;
    const expected_text = 'YWJjMTIz';
    if ( base64_text != expected_text)
      failText = `base46 encode results do not match. ${base64_text} expected: ${expected_text}`;
    else
      passText = `base46 encode results match. ${base64_text}`;
    testResults_append(results, passText, failText, method);
  }

  return results;
}

