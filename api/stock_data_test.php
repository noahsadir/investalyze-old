<?php
$symbol = $_GET['symbol'];
$test = $_GET['test'];
if ($test == "true"){
  echo('160.50');
}else {
  //Get html from Yahoo Finance website
  $html = file_get_contents('https://finance.yahoo.com/quote/'.$symbol);

  //Get content of select element for options date
  $stockPrice = explode(' ',explode('</span>',explode('>',explode('<span class="Trsdu(0.3s) Fw(500) Pstart(10px) Fz(24px) C($negativeColor)"',$html)[1])[1])[0])[0];

  echo($stockPrice);
}

function makeNumerical($propertyValue){
  if ($propertyValue == "-"){
    $propertyValue = str_replace('-','0.00',$propertyValue);
  }
  $propertyValue = str_replace('(','',$propertyValue);
  $propertyValue = str_replace(')','',$propertyValue);
  $propertyValue = str_replace(',','',$propertyValue);
  $propertyValue = str_replace('+','',$propertyValue);
  $propertyValue = str_replace('%','',$propertyValue);
  return $propertyValue;
}
?>
