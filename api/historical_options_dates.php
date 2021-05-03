<?php

$symbol = $_GET['symbol'];

$dates = scandir('/var/www/historical_options/'.$symbol);
$output = '{"dates":[';
if ($dates){
  foreach ($dates as $item){
    if (filetype('/var/www/historical_options/'.$symbol.'/'.$item) == "file"){
     $output = $output.'"'.str_replace($symbol.'_','',str_replace('.json','',$item)).'",';
    }
  }

  if (substr($output,-1) == ","){
    $output = substr($output, 0, -1);
  }

  $output = $output.']}';
  header('Content-Type: application/json');
  echo($output);
}else{
  header('Content-Type: application/json');
  echo('{"error":400}');
}

 ?>
