<?php
/****************************************************************************************
 *
 * dbTable.php s part of the anyVista project.
 * anyVista is copyright (C) 2011-2023 Arne D. Morken and Balanse Software.
 *
 * License: AGPLv3.0 for open source use or anyVista Commercial License for commercial use.
 * Get licences here: http://balanse.info/anyvista/license/ (coming soon).
 *
 ****************************************************************************************/
require_once "dbConnection.php";

/**
 * __Abstract base class for a PDO database table.__
 * Manages the database connection and performs SQL queries.
 *
 * @class dbTable
 * @constructor
 * @param {dbConnection} connection Info about the database connection
 * @example
 *      new dbTable($dbconn);
 *
*/
class dbTable
{
  private   $mDBConnection   = null;
  private   $mDBResult       = null;
  private   $mNumRowsChanged = 0;
  private   $mHostTable      = null;
  protected $mError          = "";
  protected $mMessage        = "";

  //
  // Constructor
  //
  public function __construct($connection)
  {
    $this->mDBConnection = $connection;
    $this->mDBResult     = null;
    $this->mHostTable    = $this;
  } // constructor

  /////////////////////////
  // Abstract methods
  /////////////////////////

  public function    dbInsert()     {} // Abstract
  public function    dbUpdate()     {} // Abstract
  public function    dbAddLink()    {} // Abstract
  public function    dbRemoveLink() {} // Abstract
  public function    dbDelete()     {} // Abstract
  public function    dbSearch()     {} // Abstract
  protected function prepareData(&$inData) {} // Abstract

  /////////////////////////
  // Getters
  /////////////////////////

  /**
   * @method getConnection
   * @description Returns the database connection object.
   */
  public function getConnection() { return $this->mDBConnection; }

  /**
   * @method getResult
   * @description Returns the result object.
   */
  public function getResult() { return $this->mDBResult; }

  /**
   * @method getNumRows
   * @description Returns the number of rows in the result object.
   */
  public function getNumRows() { return $this->mDBResult != null ? $this->mDBResult->rowCount() : 0; }

  /**
   * @method getNumRowsChanged
   * @description Returns the number of rows affected by last query.
   */
  public function getNumRowsChanged() { return $this->mNumRowsChanged;  }

  /**
   * @method isError
   * @description Returns true if there is an error.
   */
  public function isError() { return $this->mError != "" && $this->mError != null; }

  /**
   * @method getError
   * @description Returns the current error message.
   */
  public function getError() { return $this->mError; }

  /**
   * @method getMessage
   * @description Returns the current message.
   */
  public function getMessage() { return $this->mMessage; }

  /////////////////////////
  // Setters
  /////////////////////////

  /**
   * @method setError
   * @description Sets the current error message and logs it to the PHP error log.
   */
  public function setError($err,$log=true)
  {
    $this->mError = $err;
    if ($this->mHostTable !== null)
      $this->mHostTable->mError = $err;
    if ($log)
      error_log($this->mError);
  } // setError

  /**
   * @method setMessage
   * @description Sets the current message and optionally logs it to the PHP error log.
   */
  public function setMessage($msg,$log=false)
  {
    $this->mMessage = $msg;
    if ($this->mHostTable !== null)
      $this->mHostTable->mMessage = $msg;
    if ($log)
      error_log($this->mMessage);
  } // setMessage

  public function setHostTable($tab) { $this->mHostTable = $tab; }

  /**
   * @method query
   * @description Execute a database query.
   * @param  {String}  stmt The query to execute.
   * @return {boolean} Returns true if the query was executed, false if it did not execute
   *                   or returned an error (in which case mError is set).
   */
  public function query($stmt)
  {
    $this->mDBResult = null;
    $this->mNumRowsChanged = 0;
    if ($this->mDBConnection == null || $this->mDBConnection->mDBHandle == null || $this->mDBConnection->isError()) {
      if ($this->mDBConnection == null)
        $this->mError = "dbTable::query1: No connection to database. ";
      else
        $this->mError = "dbTable::query2: ".$this->mDBConnection->getError();
      error_log($this->mError);
      return false;
    }
    //error_log("dbTable.query:".$stmt);
    if (substr($stmt,0,6) == "SELECT") {
      try {
        $this->mDBResult = $this->mDBConnection->mDBHandle->query($stmt);
        if (!$this->mDBResult) {
          $this->mError = "dbTable::query3: ".$this->mDBConnection->getError();
          $this->mError .= "<br/>\nQuery was: ".$stmt;
          error_log($this->mError);
        }
      }
      catch (Exception $e) {
        $this->mError = "dbTable::query4: Exception: ".$e->getMessage();
        $this->mError .= "\nQuery was: ".$stmt;
        error_log($this->mError);
      }
    }
    else {
      $this->mNumRowsChanged = $this->mDBConnection->mDBHandle->exec($stmt);
      if ($this->mNumRowsChanged === false) {
        $this->mError = "dbTable::query4: ".$this->mDBConnection->getError();
        $this->mError .= "\nQuery was: ".$stmt;
        error_log($this->mError);
      }
    }
    return !$this->isError(); // Return true if ok
  } // query

  /**
   * @method getNext
   * @description Gets next row in result set.
   * @param  {Boolean} removeEmpty If true, remove empty rows.
   * @return {Object}  The next row.
   */
  public function getNext($removeEmpty=false)
  {
    return $this->getIt(false,$removeEmpty);
  } // getNext

  /**
   * @method getAll
   * @description Gets all rows in result set.
   * @param  {Boolean} removeEmpty If true, remove empty rows.
   * @return {Object}  All rows.
   */
  public function getAll($removeEmpty=false)
  {
    return $this->getIt(true,$removeEmpty);
  } // getAll

  // Get one or all rows, optionally purging empty rows.
  private function getIt($getAll,$removeEmpty=false)
  {
    if ($this->mDBConnection == null || $this->mDBConnection->isError() || $this->mDBResult == null) {
      $this->mDBResult = null;
      return null;
    }
    if ($this->mDBConnection->isError()) {
      $this->mError = $this->mDBConnection->getError();
      error_log($this->mError);
      return null;
    }
    $row = $getAll ? $this->mDBResult->fetchAll(PDO::FETCH_ASSOC)
                   : $this->mDBResult->fetch(PDO::FETCH_ASSOC);
    if ($row == null || $this->mDBConnection->isError()) {
      if ($this->mDBConnection->isError())
        $this->mDBResult = null;
      return null;
    }
    if ($removeEmpty)
      $this->purgeNull($row);
    return $row;
  } // getIt

  // Purge null entries from data array
  protected function purgeNull(&$data)
  {
    if ($data != null)
      foreach ($data as $id => $val)
        if (is_array($data[$id]))
          $this->purgeNull($data[$id]);
        else
        if ($data[$id] === null)
          unset($data[$id]);
  } // purgeNull

  /**
   * @method getLastInsertID
   * @description Returns the id of the last item inserted in the table.
   * @param  {String}  tableName Name of table to check.
   * @return {integer} Id of last item.
   */
  public function getLastInsertID($tableName)
  {
    if ($this->mDBConnection == null) {
      $this->mError = "dbTable::getLastInsertID: No connection to database. ";
      error_log($this->mError);
      return false;
    }
    return $this->mDBConnection->mDBHandle->lastInsertId($tableName);
  } // getLastInsertID

  /**
   * @method idExists
   * @description Returns true if an id in a table has given value, false otherwise.
   * @param  {String} tableName Name of table to check.
   * @param  {String} idName    Name of id to check.
   * @param  {String} id        Value of id to check.
   * @return true | false
   */
  public function idExists($tableName,$idName,$id)
  {
      $stmt = "SELECT count(*) as num_obj FROM ".$tableName." WHERE ".$idName."='".$id."'";
      if (!$this->query($stmt))
        return false;
      $row = $this->getNext();
      return ($row != null && $row['num_obj'] > 0);
  } // idExists

  /**
   * @method tableExists
   * @description Returns true if table exists, false otherwise.
   * @param  {String} tableName Name of table to check.
   * @return true | false
   */
  public function tableExists($tableName)
  {
    if ($tableName == null || $tableName == "")
      return false;
    $stmt = "show tables like '".$tableName."'";
    if ($this->mDBConnection == null || $this->mDBConnection->isError())
      $res = null;
    else
      $res = $this->mDBConnection->mDBHandle->query($stmt);
    if($res == null) {
      if ($this->mDBConnection == null)
        $this->mError = "dbTable::tableExists($tableName): No connection to database. ";
      else
        $this->mError = "dbTable::tableExists($tableName): Error:".$this->mDBConnection->getError()." Query was:".$stmt;
      error_log($this->mError);
      return false;
    }
    $row = $res->fetch(PDO::FETCH_ASSOC);
    if (!$row || count($row) == 0 || $this->mDBConnection->isError()) { // TODO Error checking
      if ($this->mDBConnection->isError()) {
        $this->mError = "dbTable::tableExists($tableName): Error fetching data:".$res->getMessage();
        $res->free();
        $res = null;
      }
      $this->mError = "";
      return false;
    }
    return true;
  } // dbTableExists

} // class dbTable
?>