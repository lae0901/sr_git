// @ts-nocheck
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as marked from 'marked';
import { str_head } from 'sr_core_ts';
import
{
  dir_ensureExists, file_readAllText, file_readFile, file_writeNew,
  file_writeText
} from '@steverichter/sr_node_core';
import { srsnip_appendActivityLog } from '../common/srsnip_activityLog';

// -------------------------- registerCommand_openInBrowser --------------------------
// open file as a text file in the browser.
// once file is open in the browser, use browser print option to print the text file.
// markdown files are first converted to HTML and rendered as html.
// otherwise, other file types, including .html, are rendered as text in the browser.
export function registerCommand_openInBrowser(context: vscode.ExtensionContext)
{
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('rock.openInBrowser', async () =>
  {

    const editor = vscode.window.activeTextEditor;
    if (editor)
    {
      try
      {
        let browserText = '';
        const doc_url = editor.document.uri.toString();
        const filePath = editor.document.uri.fsPath;

        // file is markdown file. convert to html.
        let toHtml: { tempDir: string, htmlPath: string } | undefined;
        const ext = path.extname(filePath);
        const basename = path.basename(filePath, ext);

        // document has current selection.  open only that selection text.
        let selection = editor.selection;
        if (!selection.isEmpty)
        {
          browserText = editor.document.getText(selection);
        }

        // no selection. 
        if (!browserText)
        {
          const { text, errmsg } = await file_readAllText(filePath);
          browserText = text;
          srsnip_appendActivityLog(`open-in-browser. errmsg:${errmsg} filePath:${filePath}`);
          srsnip_appendActivityLog(`open-in-browser. browserText:${str_head(browserText, 50)}`);
        }

        if (browserText)
        {
          let html = '';

          // replace tabs with spaces.
          browserText = browserText.replace(/\t/g, '  ');

          if (ext == '.md')
            html = markdown_toHtml(basename, browserText);
          else
          {
            const lines = browserText.split('\n');
            html = sourceFile_toHtml(filePath, lines)
          }

          // write the html of web page into file in temporary folder.
          const tempDir = path.join(os.tmpdir(), 'open-in-browser');
          const { created, errmsg } = await dir_ensureExists(tempDir);
          const htmlPath = path.join(tempDir, basename + '.html');
          const errmsg2 = await file_writeNew(htmlPath, html);
          toHtml = { tempDir, htmlPath };
          srsnip_appendActivityLog(`open-in-browser. htmlPath:${htmlPath} errmsg:${errmsg2}`);
        }

        const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
        if (toHtml)
        {
          const url = require('url');
          const file_url = url.pathToFileURL(toHtml.htmlPath).toString();

          if (process.platform == 'linux')
          {
            // const curPath = process.env.PATH;
            const wsl_file_url = 'file:////wsl$/Ubuntu-20.04/' + file_url.substr(8);
            srsnip_appendActivityLog(`open-in-browser. ${wsl_file_url} ${process.platform} `);
            cp.exec('chrome.exe ' + wsl_file_url);
            // cp.exec( 'xdg-open ' + file_url);
          }
          else 
          {
            srsnip_appendActivityLog(`open-in-browser. ${start} ${file_url} ${process.platform} `);
            cp.exec(start + ' chrome ' + file_url);
          }
        }
        else
        {
          cp.exec(start + ' chrome ' + doc_url);
        }
      }
      catch (err)
      {
        srsnip_appendActivityLog(`browser open error ${err}`);
        console.log(`${err}`);
      }
    }

  });
  context.subscriptions.push(disposable);
}

// ------------------------------- iFindReplaceItem -------------------------------
interface iFindReplaceItem
{
  find: string;
  replace: string;
}

// ------------------------------- htmlShell_insert -------------------------------
// apply find/replace instructions to an html shell script.
// Each instruction consists of text to find in the html script and the replace 
// text to insert in its place.
function htmlShell_insert(shell: string, findReplaceArr: iFindReplaceItem[])
{
  let result = shell;

  for (const item of findReplaceArr)
  {
    // $ char is special in replace pattern arg of replace function.
    // double up $ in replacement text.
    const rpl = item.replace.replace(/\$/g, '$$$$');
    result = result.replace(item.find, rpl);
  }
  return result;
}

// // -------------------------------- str_replace --------------------------------
// function str_replace( str:string, find:string, replace:string)
// {
//   const fx = str.indexOf(find) ;
//   if ( fx >= 0 )
//   {
//     const beforeText = ( fx > 0 ) ? str.substr(0, fx ) : '' ;
//     const afterBx = fx + find.length ;
//     const afterText = str.substr(afterBx) ;
//     str = beforeText + replace + afterText ;
//   }
//   return str ;
// }

// ------------------------------ htmlShell_bootstrap ------------------------------
function htmlShell_bootstrap()
{
  const shell = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <link rel="stylesheet" 
    href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
    integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" 
    crossorigin="anonymous">

<style>{{style text}}</style>

  <title>{{page title}}</title>
</head>
<body>
  <div class="container mt-3">
    {{body html}}
  </div>

  <br>
  <br>
  <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
    integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" 
    crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
    integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" 
    crossorigin="anonymous"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
    integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" 
    crossorigin="anonymous"></script>
  </body>
  </html>
  `;
  return shell;
}

// ------------------------------- sourceFile_toHtml -------------------------------
function sourceFile_toHtml(filePath: string, lines: string[])
{
  const basename = path.basename(filePath);
  const styleText =
    `
div#lineNumberedCode span {
  font-family:"Lucida Console";
  font-size:0.9em;
  line-height:1.35em;
  display: block;
  white-space: pre;
}

div#lineNumberedCode span:before
{
  content: attr(xsrcseq) ;
  margin-right:2.2em;
  line-height:1.35em;
  width:4em;
  text-align:right;
  display: inline-block;
  font-size:0.9em;
  xfont-family:'Lucida Console';
}
  `;

  // body html - will be inserted into html shell.
  let body_html = `<h5>${filePath} <span class="ml-3">${new Date().toLocaleString()}</span></h5><hr>`;

  // build html from source lines.
  body_html += `<div id="lineNumberedCode">`;
  let seqnbr = 0;
  for (const line of lines)
  {
    seqnbr += 1;
    const line_html = `<span xsrcseq="${seqnbr}">${htmlEncode(line)}</span>`;
    body_html += line_html;
  }
  body_html += `</div>`;

  // insert markdown converted html into html of  shell web page.
  const shell = htmlShell_bootstrap();
  const findReplaceArr: iFindReplaceItem[] = [
    { find: '{{style text}}', replace: styleText },
    { find: '{{page title}}', replace: basename },
    { find: '{{body html}}', replace: body_html }
  ];
  const html = htmlShell_insert(shell, findReplaceArr);

  return html;
}

// -------------------------------- markdown_toHtml --------------------------------
function markdown_toHtml(basename: string, markdown_text: string)
{
  // convert markdown to html.
  const markdown_html = marked(markdown_text);

  const styleText =
    `
pre {
    padding:.5em;
    background-color: rgb(236, 225, 225);
  }

code:not(pre) {
      background-color:lightgrey;
      padding-left:5px; padding-right:5px;
}

  @media print {
    code { 
      background-color:grey;
    }
  }

            `;

  // insert markdown converted html into html of  shell web page.
  const shell = htmlShell_bootstrap();
  const findReplaceArr: iFindReplaceItem[] = [
    { find: '{{style text}}', replace: styleText },
    { find: '{{page title}}', replace: basename },
    { find: '{{body html}}', replace: markdown_html }
  ];
  const html = htmlShell_insert(shell, findReplaceArr);

  return html;
}

// ---------------------------------- htmlEncode ----------------------------------
function htmlEncode(text: string)
{
  text = text.replace(/&/g, '&amp;');
  text = text.replace(/</g, '&lt;');
  text = text.replace(/>/g, '&gt;');

  // replace single quote with &#39;. not needed.
  // text = text.replace(/'/g, '&#39;'); 

  return text;
}
