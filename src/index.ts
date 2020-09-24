import simpleGit, { SimpleGit } from 'simple-git';

let git: SimpleGit | null = null ;
let git_rootPath = '' ;

// ---------------------------------- git_ensure ----------------------------------
// make sure global SimpleGit object is instantiated. 
// Connect to git repo found from root path of project opened in vscode.
function git_ensure(rootPath: string | undefined, 
                    appendActivityLog : (text:string) => void )
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
  }

  if (!git)
  {
    git = simpleGit(rootPath);
    if ( git )
    {
      git_rootPath = rootPath;
      appendActivityLog(`git folder ${git_rootPath}`);
    }
  }
}

// -------------------------------- git_listRemote --------------------------------
export async function git_listRemote(
                        rootPath: string | undefined,
                        appendActivityLog: (text: string) => void)
{
  git_ensure(rootPath, appendActivityLog);
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
export async function git_pull(  
  rootPath: string | undefined,
  appendActivityLog: (text: string) => void)
{
  git_ensure(rootPath, appendActivityLog );
  if (git)
  {
    try
    {
      const rv = await git.pull('origin', 'master');
      appendActivityLog(`git pull changes:${rv.summary.changes} insertions:${rv.summary.insertions}`);
    }
    catch (e)
    {
      appendActivityLog(`git pull error: ${e}`);
    }
  }
}

// -------------------------------- git_status --------------------------------
export async function git_status(
        rootPath: string | undefined, 
        appendActivityLog: (text: string) => void ):
  Promise<{ isRepo:boolean, isBehind?: boolean, isAhead?: boolean, hasModified?: boolean }>
{
  let isBehind = false;
  let isAhead = false;
  let hasModified = false;
  let isRepo = false ;

  git_ensure(rootPath, appendActivityLog);
  if (git)
  {
    isRepo = true ;
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
      appendActivityLog(`git status error: ${e}`);
    }
  }

  return { isRepo, isBehind, isAhead, hasModified };
}
