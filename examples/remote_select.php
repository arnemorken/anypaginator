<?php
/****************************************************************************************
 *
 * anyPaginator is copyright (C) 2021-2022 Arne D. Morken and Balanse Software.
 *
 * License: AGPLv3.0 for open source use or anyPaginator Commercial License for commercial use.
 * Get licences here: http://balanse.info/anypaginator/license/ (coming soon).
 *
 * See also the anyList project: https://github.com/arnemorken/anylist
 *
 ****************************************************************************************/

require_once "db/dbTable.php";

$con  = new dbConnection();
$tab  = new dbTable($con);

$from = $_GET["from"];
$to   = $_GET["to"];
if (isset($from) && isset($to)) {
  $num  = $to - $from + 1;
  $stmt = "SELECT * FROM anypaginator_example LIMIT ".$num." OFFSET ".$from;
  $data = array();
  if ($tab->query($stmt)) {
    while (($nextrow = $tab->getNext(true)) !== null) {
      $id   = $nextrow["id"];
      $name = $nextrow["name"];
      $data[$id] = $name;
    }
    header("Content-Type: application/json");
    echo json_encode($data);
  }
  else
    error_log("query failed:$stmt");
}
?>