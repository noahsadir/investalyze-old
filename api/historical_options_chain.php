<?php
$symbol = $_GET['symbol'];
$date = $_GET['date'];

$result = file_get_contents('/var/www/historical_options/'.$symbol.'/'.$symbol.'_'.$date.'.json');
if ($result){
  header('Content-Type: application/json');
  echo($result);
}else{
  header('Content-Type: application/json');
  echo('{"error":400,"msg":"Cannot find "'.'/var/www/historical_options/'.$symbol.'/'.$symbol.'_'.$date.'.json'.'}');
}
 ?>
