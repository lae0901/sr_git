import simpleGit, { SimpleGit } from 'simple-git';
import * as path from 'path';
import { dir_containsItem } from 'sr_core_ts';

let git: SimpleGit | null = null ;
let git_rootPath = '' ;
let git_isRepo = false ;

type AppendActivityLog = (text: string) => void ;

// ---------------------------------- git_ensure ----------------------------------
// make sure global SimpleGit object is instantiated. 
// Connect to git repo found from root path of project opened in vscode.
async function git_ensure(rootPath: string | undefined, 
                    appendActivityLog : AppendActivityLog )
{
  if ( !rootPath )
  {
    rootPath = process.cwd( ) ;
  }

  // need new SimpleGit object if does not match the resolved to rootPath.
  if (git_rootPath && git_rootPath != rootPath)
  {
    git = null;
    git_rootPath = '';
    git_isRepo = false ;
  }

  if (!git)
  {
    try
    {
      git_rootPath = rootPath ;
      git = simpleGit(rootPath);
      const sr = await git.status(['-uno']);      
      git_isRepo = true ;
    }
    catch(e)
    {
      git = null ;
      git_isRepo = false ;
      if (e.message.indexOf('fatal: not a git repository') == -1)
      {
        appendActivityLog(e.message) ;
        appendActivityLog(`${rootPath} is not a git folder`);
      }
    }
    if ( git )
    {
      appendActivityLog(`git folder ${git_rootPath}`);
    }
  }

  return { rootPath, isRepo:git_isRepo} ;
}

// ----------------------------------- git_free -----------------------------------
export function git_free( )
{
  git_rootPath = '' ;
  git = null ;
}

// -------------------------------- git_listRemote --------------------------------
export async function git_listRemote(
                        rootPath: string | undefined,
                        appendActivityLog: (text: string) => void)
{
  await git_ensure(rootPath, appendActivityLog);
  if (git)
  {
    try
    {
      const repo_url = await git.listRemote(['--get-url']);
      const symref = await git.listRemote(['--symref']);
      appendActivityLog('Remote url for repository at ' + __dirname + ':');
      appendActivityLog(`${repo_url}`)
    }
    catch (e)
    {
      appendActivityLog(`git_listRemote error: ${e}`);
    }
  }
}

// ----------------------------------- git_pull -----------------------------------
// run git pull origin master.
// return text of error message.
export async function git_pull(  
  rootPath: string | undefined,
  appendActivityLog: (text: string) => void)
{
  let errmsg = '' ;
  await git_ensure(rootPath, appendActivityLog );
  if (git)
  {
    try
    {
      const rv = await git.pull('origin', 'master');
      appendActivityLog(`git pull changes:${rv.summary.changes} insertions:${rv.summary.insertions}`);
    }
    catch (e)
    {
      errmsg = e.toString( ) ;
      appendActivityLog(`git pull error: ${e}`);
    }
  }
  return errmsg ;
}

// ------------------------------ git_resolveGitPath ------------------------------
// look for .git folder in the hierarchy of the specified directory path.
export async function git_resolveGitPath(dirPath: string): Promise<string>
{
  // starting from dirPath, check for .git sub folder.
  while (true)
  {
    const exists = await dir_containsItem(dirPath, ['.git']);
    if (exists)
      break;
    const parent_dirPath = path.dirname(dirPath);
    if (!parent_dirPath || parent_dirPath == dirPath)
    {
      dirPath = '';
      break;
    }
    else
      dirPath = parent_dirPath;
  }
  return dirPath;
}

// -------------------------------- git_status --------------------------------
export async function git_status(
        rootPath: string | undefined, 
        appendActivityLog: (text: string) => void )
{
  let isBehind = false;
  let isAhead = false;
  let isModified = false;

  await git_ensure(rootPath, appendActivityLog);
  if (git)
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
        isModified = true;
    }
    catch (e)
    {
      appendActivityLog(`git status error: ${e}`);
    }
  }

  return { rootPath:git_rootPath, isRepo:git_isRepo, isBehind, isAhead, isModified };
}
