<?php
header("Content-type: text/javascript; charset=utf-8;");

// pull all input parameters from request body. content type of request is json.
$postContents = file_get_contents('php://input') ;
$postObject = json_decode( $postContents ) ;
$action = isset($postObject->action) ? $postObject->action : '' ;

// templates_select - return list of template files in the templates directory.
if ( $action == 'templates_select')
{
  $dirPath = __DIR__ . '/../templates/' ;
  $files = array_diff(scandir($dirPath), array('.', '..')); // get all files, excluding . and ..
  $templateFiles = array_filter($files, function($file) {
    return pathinfo($file, PATHINFO_EXTENSION) === 'txt'; // filter for .json files
  });
  $rv = (object)['files' => array_values($templateFiles)];
  echo json_encode( $rv ) ;
  exit ;
}

else if ($action == 'template_select')
{
  $fileName = isset($postObject->templateName) ? $postObject->templateName : '' ;
  $filePath = __DIR__ . '/../templates/' . $fileName ;
  $errmsg = '' ;
  $text = '' ;

  if ( !file_exists($filePath) )
  {
    $errmsg = 'File not found: ' . $filePath;
  }
  else
  {
    $text = file_get_contents( $filePath ) ;
  }

  $rv = (object)['errmsg' => $errmsg, 'templateText' => $text] ;
  echo json_encode( $rv ) ;
  exit ;
}

// read contents of existing markdown file and return its contents.
else if ($action == "markdownFile_read")
{
  $fileName = isset($postObject->fileName) ? $postObject->fileName : '' ;
  $fileName = fileName_applyDefaultExt( $fileName, '.md' ) ; // ensure it has a .md extension
  $filePath = __DIR__ . '/stored_markdown/' . $fileName ;
  $errmsg = '' ;
  $text = '' ;

  if ( !file_exists($filePath) )
  {
    $errmsg = 'File not found: ' . $filePath;
  }
  else
  {
    $text = file_get_contents( $filePath ) ;
  }

  $rv = (object)['errmsg' => $errmsg, 'text' => $text] ;
  echo json_encode( $rv ) ;
  exit ;
}

else if ($action == "markdownFile_exists")
{
  $fileName = isset($postObject->fileName) ? $postObject->fileName : '' ;
  $fileName = fileName_applyDefaultExt( $fileName, '.md' ) ; // ensure it has a .md extension
  $filePath = __DIR__ . '/stored_markdown/' . $fileName ;
  $errmsg = '' ;
  $exists = false ;

  if ( file_exists($filePath) )
  {
    $exists = true;
  }
  else
  {
    $errmsg = 'File not found: ' . $filePath;
  }

  $rv = (object)['exists' => $exists, 'errmsg' => $errmsg] ;
  echo json_encode( $rv ) ;
  exit ;
}

// return a list of all markdown files in the stored_markdown directory.
else if ($action == "markdownFile_list")
{
  $dirPath = __DIR__ . '/stored_markdown/' ;
  $files = array_diff(scandir($dirPath), array('.', '..')); // get all files, excluding . and ..
  $markdownFiles = array_filter($files, function($file) {
    return pathinfo($file, PATHINFO_EXTENSION) === 'md'; // filter for .md files
  });

  $rv = (object)['files' => array_values($markdownFiles)];
  echo json_encode( $rv ) ;
  exit ;
}


/**
 * Apply a default file extension if none is provided.
 * @param string $fileName The fileName to check.
 * @param string $defaultExt The default extension to apply if none exists.
 * @return string The fileName with the default extension applied if necessary.
 */
function fileName_applyDefaultExt( $fileName, $defaultExt = '.md' )
{
  $ext = pathinfo($fileName, PATHINFO_EXTENSION);
  if ( !$ext )
  {
    $fileName .= $defaultExt ;
  }
  return $fileName ;
}
?>
