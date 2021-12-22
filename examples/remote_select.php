<?php
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