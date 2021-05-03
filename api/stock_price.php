<?php
$symbol = $_GET['symbol'];
$test = $_GET['test'];
if ($test == "true"){
  echo('160.50');
}else {
  //Get html from Yahoo Finance website
  $html = file_get_contents('https://finance.yahoo.com/quote/'.$symbol);

  //Get content of select element for options date
  $stockPrice = explode('</span',explode('>',explode('<span class="Trsdu(0.3s) Fw(b) Fz(36px) Mb(-4px) D(ib)"',$html)[1])[1])[0];
  $stockChange = explode(' ',explode('</span',explode('>',explode('<span class="Trsdu(0.3s) Fw(500) Pstart(10px) Fz(24px)',$html)[1])[1])[0]);
  $companyName = explode('</h1>',explode('<h1 class="D(ib) Fz(18px)" data-reactid="7">',$html)[1])[0];

  $stockPrice = makeNumerical($stockPrice);
  $stockPriceChange = makeNumerical($stockChange[0]);
  $stockPercentChange = makeNumerical($stockChange[1]);
  header('Content-Type: application/json');
  $jsonOutput = '{"company":"'.$companyName.'","price":'.$stockPrice.',"price_change":'.$stockPriceChange.',"percent_change":'.$stockPercentChange.'}';
  if (json_decode($jsonOutput) == null){
    echo('{"company":"'.$companyName.'*","price":'.$stockPrice.',"price_change":0.00,"percent_change":0.00}');
  }else{
    echo($jsonOutput);
  }
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
