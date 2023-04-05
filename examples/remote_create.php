<?php
/****************************************************************************************
 *
 * anyPaginator is copyright (C) 2021-2023 Arne D. Morken and Balanse Software.
 *
 * License: AGPLv3.0 for open source use or anyPaginator Commercial License for commercial use.
 * Get licences here: http://balanse.info/anypaginator/license/ (coming soon).
 *
 * See also the anyVista project: https://github.com/arnemorken/anyvista
 *
 ****************************************************************************************/

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