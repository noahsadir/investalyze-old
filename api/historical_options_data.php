<?php
$symbol = $_GET['symbol'];
$id = $_GET['id'];
$format = $_GET['format'];

$dates = scandir('/var/www/historical_options/'.$symbol);
$output = '[';
$csvOutput = '';

if ($dates){
  $csvOutput = $csvOutput.'recorded,strike,last_price,bid,ask,price_change,percent_change,volume,open_interest,implied_volatility';

  //Go through the options chain of each RECORD date
  //Note that the dates array is actually all the files in the directory for that symbol,
  //irrelevant files must be filtered out.
  foreach ($dates as $item){

    //Ensure path is a file and not a directory (likely . or ..)
    if (filetype('/var/www/historical_options/'.$symbol.'/'.$item) == "file"){

      //Convert file to JSON object
     $contents = json_decode(file_get_contents('/var/www/historical_options/'.$symbol.'/'.$item));
     //Go through each the options of each *EXPIRATION* date
     foreach ($contents as $dateKey => $chainForDate){
       $type = "C";

       //Go through calls and puts in each expiration date
       foreach ($chainForDate as $optionType){
         //Go through all the options available for the specified type expiration date
         foreach ($optionType as $optionItem){

            if ($optionItem->id){
              if ($optionItem->id == $id){
                $optionItem->recorded = str_replace($symbol.'_','',str_replace('.json','',$item)); //Add the record date
                $output = $output.json_encode($optionItem).','; //Convert the JSON back to string and append to output

                //Also form CSV string in case such format is desired.
                $csvOutput = $csvOutput."\n".$optionItem->recorded.','.$optionItem->strike.','.$optionItem->last_price.','.$optionItem->bid.','.$optionItem->ask.','.$optionItem->price_change.','.$optionItem->percent_change.','.$optionItem->volume.','.$optionItem->open_interest.','.$optionItem->implied_volatility;
              }
            }else{
              //Option does not have a recorded id, so attempt to reconstruct it based on the available data.
              //This tends to be extremely reliable
              $dateValue = date('ymd',$dateKey); //Convert date string to YYYYMMDD (Ex: Jan 01, 1970 -> 19700101)
              $strikeLeading = sprintf('%05d', explode('.',$optionItem->strike)[0]); //Round integer part of strike to 5 sig figs
              $strikeTrailing = sprintf('%03d',explode('.',$optionItem->strike)[1]); //Round decimal part of strike to 3 sig figs

              //Construct the id using calculated values
              //Example: MSFT $217.5 Call exp. 12/24/2020 -> MSFT20201224C00217500
              $fallbackID = $symbol.$dateValue.$type.$strikeLeading.$strikeTrailing;
              //Now that we've inferred the ID from the option, we can check if it matches the
              //one requested by the user.
              if ($fallbackID == $id){
                //Add the option ID to the output JSON element so the program/user has info about the ID
                $optionItem->id = $fallbackID;
                $optionItem->recorded = str_replace($symbol.'_','',str_replace('.json','',$item)); //Add the record date
                $output = $output.json_encode($optionItem).','; //Convert the JSON back to string and append to output

                //Also form CSV string in case such format is desired.
                $csvOutput = $csvOutput."\n".$optionItem->recorded.','.$optionItem->strike.','.$optionItem->last_price.','.$optionItem->bid.','.$optionItem->ask.','.$optionItem->price_change.','.$optionItem->percent_change.','.$optionItem->volume.','.$optionItem->open_interest.','.$optionItem->implied_volatility;
              }
            }
         }
         $type = "P";
       }
     }
     //echo(file_get_contents('/var/www/historical_options/'.$symbol.'/'.$item));
    }
  }

  if (substr($output,-1) == ","){
    $output = substr($output, 0, -1);
  }

  $output = $output.']';

  if ($format == "csv"){
    echo($csvOutput);
  }else{
    header('Content-Type: application/json');
    echo($output);
  }


}else{
  header('Content-Type: application/json');
  echo('{"error":400}');
}

 ?>
