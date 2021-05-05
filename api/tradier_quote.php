<?php
if (isset($_GET['symbol']) && isset($_GET['apikey'])) {
  $ch = curl_init();

  curl_setopt($ch, CURLOPT_URL, 'https://sandbox.tradier.com/v1/markets/quotes?symbols='.$_GET['symbol'].'&greeks=false');
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

  $headers = array();
  $headers[] = 'Authorization: Bearer '.$_GET['apikey'];
  $headers[] = 'Accept: application/json';

  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

  $result = curl_exec($ch);
  $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  if (curl_errno($ch)) {
    header('Content-Type: application/json');
    echo '{"message":"curl error"}';
      //echo 'Error:' . curl_error($ch);
  } else {
    header('Content-Type: application/json');
    echo $result;
  }
  curl_close ($ch);
  //echo $http_code;

} else {
  header('Content-Type: application/json');
  echo '{"message":"missing arguments';
  if (!isset($_GET['symbol'])) {
    echo ' symbol';
  }
  if (!isset($_GET['apikey'])) {
    echo ' apikey';
  }
  echo '"}';
}

?>
