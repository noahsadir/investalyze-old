<?php

require_once('parse_options_dates.php');

//url parameters
$symbol = $_GET['symbol'];
$date = $_GET['date'];
$raw = $_GET['raw'];
$test = $_GET['test'];

$output = '';
if ($test == "true"){
  $output = file_get_contents('sampleOptionsData.json');
}else {
  $output = '{';
    if ($date != ""){
      getOptionsChainFromDate($date);
    }else{
      $dates = explode(',',getDates($symbol));

      foreach ($dates as $dateItem){

        getOptionsChainFromDate($dateItem);
        $output = $output.',';
      }
    }
}




function getOptionsChainFromDate($localDate){

  global $symbol, $output;

  //Get html from Yahoo Finance website
  $html = file_get_contents('https://finance.yahoo.com/quote/'.$symbol.'/options?p='.$symbol.'&date='.$localDate);

  //Separate call data from put data
  $optionTypes = explode('<section class="Mt(20px)"',$html);
  arrayValidityCheck($optionTypes,2);
  $callData = explode('<tr class="data-row',explode('<table class=',$optionTypes[1])[1]);
  $putData = explode('<tr class="data-row',explode('<table class=',$optionTypes[2])[1]);

  //Remove unneccessary first item from array
  array_shift($callData);
  array_shift($putData);

  //Start JSON file
  $output = $output.'"'.$localDate.'":{"calls":[';

  //Parse calls and add to output string
  foreach ($callData as $callItem){
    $output = $output.parseOptionData($callItem);
  }

  //Close out calls and prepare to parse puts
  if (substr($output,-1) == ","){
    $output = substr($output, 0, -1);
  }
  $output = $output.'],"puts":[';

  //Parse puts and add to output string
  foreach ($putData as $putItem){
    $output = $output.parseOptionData($putItem);
  }

  //Remove extra comma and close out JSON file
  if (substr($output,-1) == ","){
    $output = substr($output, 0, -1);
  }

  $output = $output.']}';


}

//Quickly checks if script can still parse site, give friendly error if not
function arrayValidityCheck($arrItem, $neededIndex){
  if (count($arrItem) <= $neededIndex){ //If the desired index is OOB, the data in the array is probably wrong
    if ($raw != "true"){
      header('Content-Type: application/json');
      echo('{"error":"Data could not be parsed; a breaking website change may have been made.","details":"'.implode($arrItem).'"}');
    }else{
      echo('error');
    }

    exit();
  }
}

/* Where the real work happens */
//Parses individual option data and returns json-formatted string
function parseOptionData($item){


  //Quick check to see if anything is wrong with data (NOT COMPREHENSIVE)
  arrayValidityCheck(explode('td class="data-col2',$item),1);
  arrayValidityCheck(explode('td class="data-col3',$item),1);
  arrayValidityCheck(explode('td class="data-col4',$item),1);
  arrayValidityCheck(explode('td class="data-col5',$item),1);
  arrayValidityCheck(explode('td class="data-col6',$item),1);
  arrayValidityCheck(explode('td class="data-col7',$item),1);
  arrayValidityCheck(explode('td class="data-col8',$item),1);
  arrayValidityCheck(explode('td class="data-col9',$item),1);
  arrayValidityCheck(explode('td class="data-col10',$item),1);
  arrayValidityCheck(explode('td class="data-col6',$item),1);
  arrayValidityCheck(explode('<span',explode('td class="data-col6',$item)[1]),1);
  arrayValidityCheck(explode('>',explode('<span',explode('td class="data-col6',$item)[1])[1]),1);



  //Parse html
  $id = makeNumerical(explode('</a',explode('>',explode('<a',explode('td class="data-col0',$item)[1])[1])[1])[0]);
  $lastTrade = explode('</td',explode('>',explode('td class="data-col1',$item)[1])[1])[0];
  $strike = makeNumerical(explode('</a',explode('>',explode('<a',explode('td class="data-col2',$item)[1])[1])[1])[0]);
  $lastPrice = makeNumerical(explode('</td',explode('>',explode('td class="data-col3',$item)[1])[1])[0]);
  $bid = makeNumerical(explode('</td',explode('>',explode('td class="data-col4',$item)[1])[1])[0]);
  $ask = makeNumerical(explode('</td',explode('>',explode('td class="data-col5',$item)[1])[1])[0]);
  $price_change = makeNumerical(explode('</span',explode('>',explode('<span',explode('td class="data-col6',$item)[1])[1])[1])[0]);
  $perc_change = makeNumerical(explode('</span',explode('>',explode('<span',explode('td class="data-col7',$item)[1])[1])[1])[0]);
  $volume = makeNumerical(explode('</td',explode('>',explode('td class="data-col8',$item)[1])[1])[0]);
  $open_interest = makeNumerical(explode('</td',explode('>',explode('td class="data-col9',$item)[1])[1])[0]);
  $implied_volatility = makeNumerical(explode('</td',explode('>',explode('td class="data-col10',$item)[1])[1])[0]);



  //Return string with proper JSON syntax
  return '{"id":"'.$id.'","strike":'.$strike.',"last_price":'.$lastPrice.',"last_trade":"'.$lastTrade.'","bid":'.$bid.',"ask":'.$ask.',"price_change":'.$price_change.',"percent_change":'.$perc_change.',"volume":'.$volume.',"open_interest":'.$open_interest.',"implied_volatility":'.$implied_volatility.'},';



  //return '{"strike":"'.$strike.'","last_price":"'.$lastPrice.'","bid":"'.$bid.'","ask":"'.$ask.'","price_change":"'.$price_change.'","percent_change":"'.$perc_change.'","volume":"'.$volume.'","open_interest":"'.$open_interest.'","implied_volatility":"'.$implied_volatility.'"},';

}

function makeNumerical($propertyValue){
  if ($propertyValue == "-"){
    $propertyValue = str_replace('-','0.00',$propertyValue);
  }
  $propertyValue = str_replace(',','',$propertyValue);
  $propertyValue = str_replace('+','',$propertyValue);
  $propertyValue = str_replace('%','',$propertyValue);
  return $propertyValue;
}

$output = substr($output, 0, -1);
$output = $output.'}';
//Output the result as JSON object, or plaintext if raw argument used
if ($raw != "true"){
  header('Content-Type: application/json');
}

echo($output);

?>
