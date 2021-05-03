<?php
require_once('parse_options_dates.php');
$test = $_GET['test'];
if ($test == "true"){
  echo("1603411200,1604016000,1604620800,1605225600,1605830400,1606435200,1608249600,1610668800,1616112000,1618531200,1623974400,1631836800,1642723200,1655424000,1663286400,1674172800");
}else{
  getDates($_GET['symbol']);//url parameter
  echo(substr($optionsTimestamps, 0, -1)); //remove extra comma
}


?>
