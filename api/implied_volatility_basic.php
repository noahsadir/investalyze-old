<?php
$symbol = $_GET['symbol'];
$date = $_GET['date'];
$format = $_GET['format'];

$dates = scandir('/var/www/historical_options/'.$symbol);
$output = '{';
$csvOutput = '';

if ($dates){
  $csvOutput = $csvOutput.'recorded,strike,last_price,bid,ask,price_change,percent_change,volume,open_interest,implied_volatility';

  //Go through the options chain of each RECORD date
  //Note that the dates array is actually all the files in the directory for that symbol,
  //irrelevant files must be filtered out.
  foreach ($dates as $item){

    $spotPrice = 0;
    $ivForRecordedDate = 0;



    //Ensure path is a file and not a directory (likely . or ..)
    if (filetype('/var/www/historical_options/'.$symbol.'/'.$item) == "file"){
      $expirationDateCount = 0;

      //Convert file to JSON object
     $contents = json_decode(file_get_contents('/var/www/historical_options/'.$symbol.'/'.$item));
     //Go through each the options of each *EXPIRATION* date
     foreach ($contents as $dateKey => $chainForDate){
       $expirationDateCount = $expirationDateCount + 1;
       $type = "C";
       $ivForExpirationDate = 0;
       $avgCallIV = 0;
       $avgPutIV = 0;

       //Go through each option type (two) within each expiration date
       foreach ($chainForDate as $optionType){
         $strikeAboveSpot = false;
         $belowIV = 0;
         $aboveIV = 0;
         $belowStrike = 0;
         $aboveStrike = 0;

         //Go through all the options available for the specified type expiration date
         foreach ($optionType as $optionItem){




           //Set spot price if not found yet
           if ($optionItem->spot && $spotPrice == 0){
             $spotPrice = $optionItem->spot;
           }

           if ($optionItem->strike >= $spotPrice && $strikeAboveSpot == false){

             $strikeAboveSpot = true;
           }

           if ($strikeAboveSpot == false){
             $belowIV = $optionItem->implied_volatility;
             $belowStrike = $optionItem->strike;
           }else if ($aboveIV == 0){
             $aboveIV = $optionItem->implied_volatility;
             $aboveStrike = $optionItem->strike;
           }

            if ($optionItem->id){
              if ($optionItem->id == $id){
                $optionItem->recorded = str_replace($symbol.'_','',str_replace('.json','',$item)); //Add the record date
                //$output = $output.json_encode($optionItem).','; //Convert the JSON back to string and append to output

                //Also form CSV string in case such format is desired.
                $csvOutput = $csvOutput."\n".$optionItem->recorded.','.$optionItem->strike.','.$optionItem->last_price.','.$optionItem->bid.','.$optionItem->ask.','.$optionItem->price_change.','.$optionItem->percent_change.','.$optionItem->volume.','.$optionItem->open_interest.','.$optionItem->implied_volatility;
              }
            }
         }

         //$output = $output.'('.$spotPrice.':'.$belowIV.' / '.$aboveIV.')';
         if ($type == "C"){
           $avgCallIV = ($belowIV + $aboveIV) / 2;
         }else{
           $avgPutIV = ($belowIV + $aboveIV) / 2;
         }

         $type = "P";
       }

       //$output = $output.$avgCallIV.'C'.$avgPutIV.'P'.'-';

       $ivForExpirationDate = ($avgCallIV + $avgPutIV) / 2;

       $ivForRecordedDate = $ivForRecordedDate + $ivForExpirationDate;

     }
     if (is_numeric($ivForRecordedDate) && $expirationDateCount > 0){
       $output = $output.'"'.str_replace($symbol.'_','',str_replace('.json','',$item)).'":'.round($ivForRecordedDate / $expirationDateCount,2).',';
     }

    }

  }

  if (substr($output,-1) == ","){
    $output = substr($output, 0, -1);
  }

  $output = $output.'}';

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
