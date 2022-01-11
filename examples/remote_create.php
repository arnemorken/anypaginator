<?php
require_once "db/dbTable.php";

$con  = new dbConnection();
$tab  = new dbTable($con);

$num  = $_GET["num"];

$stmt = "DROP TABLE IF EXISTS `anypaginator_example`;".
        "CREATE TABLE `anypaginator_example` (".
        "`id` bigint(20) unsigned NOT NULL,".
        "`name` varchar(50) NOT NULL DEFAULT '',".
        "PRIMARY KEY (`id`)".
        ");";
if ($tab->query($stmt))  {
 for ($i=1; $i<=$num; ++$i) {
   $stmt = "INSERT INTO `anypaginator_example` VALUES ('$i', 'Remote row $i');";
   $tab->query($stmt);
  }
  header("Content-Type: application/json");
  echo json_encode("{}");
}
?>