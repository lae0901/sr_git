import simpleGit, { SimpleGit } from 'simple-git';
import * as vscode from 'vscode';
import { ifsMirror_appendActivityLog } from '../ifsMirror/ifsMirror_activityLog';

let git: SimpleGit | null = null ;
let git_rootPath = '' ;

// ---------------------------------- git_ensure ----------------------------------
// make sure global SimpleGit object is instantiated. 
// Connect to git repo found from root path of project opened in vscode.
function git_ensure( rootPath: string )
{
  // need new SimpleGit object if does not match the resolved to rootPath.
  if ( rootPath && git_rootPath && git_rootPath != rootPath)
  {
    git = null ;
    git_rootPath = '' ;
  }

  if ( !git )
  {
    if ( !rootPath )
    {
      const folders = vscode.workspace.workspaceFolders;
      if (folders && folders.length > 0)
      {
        rootPath = folders[0].uri.fsPath;
      }
    }

    if ( rootPath )
    {
      git_rootPath = rootPath ;
      ifsMirror_appendActivityLog(`workspace folder ${git_rootPath}`);
      git = simpleGit( git_rootPath );
    }
  }
}

// -------------------------------- git_listRemote --------------------------------
export async function git_listRemote( rootPath?: string )
{
  git_ensure( rootPath );
  if ( git )
  {
    try
    {
      const repo_url = await git.listRemote(['--get-url']);
      const symref = await git.listRemote(['--symref']);
      console.log('Remote url for repository at ' + __dirname + ':');
      console.log(`${repo_url}`)
    }
    catch (e)
    {
      console.log(`git_listRemote error: ${e}`);
    }
  }
}

// ----------------------------------- git_pull -----------------------------------
export async function git_pull( rootPath?:string )
{
  git_ensure(rootPath);
  if (git)
  {
    try
    {
      const rv = await git.pull('origin', 'master');
      ifsMirror_appendActivityLog(`git pull changes:${rv.summary.changes} insertions:${rv.summary.insertions}`);
    }
    catch (e)
    {
      console.log(`git pull error: ${e}`);
    }
  }
}

// -------------------------------- git_status --------------------------------
export async function git_status( rootPath?: string ):
  Promise<{ isBehind?: boolean, isAhead?: boolean, hasModified?: boolean }>
{
  let isBehind = false;
  let isAhead = false;
  let hasModified = false;
  git_ensure( rootPath ) ;
  if ( git )
  {
    try
    {
      const rv = await git.remote(['update']);

      const sr = await git.status(['-uno']);
      if (sr.behind > 0)
        isBehind = true;
      if (sr.ahead > 0)
        isAhead = true;
      if (sr.modified.length > 0)
        hasModified = true;
    }
    catch (e)
    {
      console.log(`git status error: ${e}`);
    }
  }

  return { isBehind, isAhead, hasModified };
}
