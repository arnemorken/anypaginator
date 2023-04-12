<?php
/****************************************************************************************
 *
 * dbConnection.php s part of the anyVista project.
 * anyVista is copyright (C) 2011-2023 Arne D. Morken and Balanse Software.
 *
 * License: AGPLv3.0 for open source use or anyVista Commercial License for commercial use.
 * Get licences here: http://anypaginator.balanse.info/
 *
 ****************************************************************************************/
require_once "dbDefs.php";

/**
 * __Abstract base class for a PDO database connection.__
 *
 * @class dbConnection
 * @constructor
 * @example
 *      new dbConnection()
 *
*/
class dbConnection
{
  var $mDBHandle = null;
  var $mError    = "";

  // Constructor: Connect to database
  public function __construct()
  {
    $dsn = ANY_DB_TYPE.":dbname=".ANY_DB_NAME.";host=".ANY_DB_HOST.";charset=".ANY_DB_CHARSET;
    try {
      $this->mDBHandle = new PDO($dsn, ANY_DB_USER, ANY_DB_PASS);
    }
    catch (PDOException $e) {
      $this->mError = $e->getMessage();
      error_log($this->mError);
      echo 'dbConnection: Connection failed: ' . $this->mError;
    }
  }

  function isError()
  {
    return isset($this->mError) && $this->mError !== "" && ($this->mDBHandle != null && $this->mDBHandle->errorCode() !== null);
  }

  function getError()
  {
    if ($this->mDBHandle == null)
      return "No connection. ";
    $err = $this->mDBHandle->errorInfo();
    return $this->mError.". Error ".$err[0].":".$err[2];
  }

} // class dbConnection
?>