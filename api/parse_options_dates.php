<?php
function getDates($symbol){
  global $optionsTimestamps;
  //Get html from Yahoo Finance website
  $html = file_get_contents('https://finance.yahoo.com/quote/'.$symbol.'/options?');

  //Get content of select element for options date
  $optionsSelectElement = explode('</select>',explode('<select class="Fz(s) H(25px) Bd Bdc($seperatorColor)" data-reactid="5">',$html)[1])[0];

  //Create array of <select> items
  $optionsDates = explode('<option',$optionsSelectElement);


  array_shift($optionsDates); //First item of array is empty; remove

  //Go through each item
  foreach ($optionsDates as $dateItem){
    $optionsTimestamps = $optionsTimestamps.explode('"',explode("value=",$optionsTimestamps.$dateItem)[1])[1].',';
  }
  return substr($optionsTimestamps, 0, -1);
}

?>
