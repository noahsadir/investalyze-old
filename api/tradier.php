<?php
if (isset($_GET['calltype'])) {
  $callType = $_GET['calltype'];

  //Implementation of Tradier API is intentionally limited to ensure that Investalyze can handle each request properly.
  if ($callType == "options_chain") {
    if (isset($_GET['symbol']) && isset($_GET['apikey'])  && isset($_GET['expiration'])) {
      makeAuthorizedURLRequest('https://sandbox.tradier.com/v1/markets/options/chains?symbol='.$_GET['symbol'].'&expiration='.$_GET['expiration'].'&greeks=true', $_GET['apikey']);
    } else {
      outputMissingArgs();
    }
  } else if ($callType == "expirations") {
    if (isset($_GET['symbol']) && isset($_GET['apikey'])) {
      makeAuthorizedURLRequest('https://sandbox.tradier.com/v1/markets/options/expirations?symbol='.$_GET['symbol'].'&includeAllRoots=true&strikes=true', $_GET['apikey']);
    } else {
      outputMissingArgs();
    }
  } else if ($callType == "company_quote") {
    if (isset($_GET['symbol']) && isset($_GET['apikey'])) {
      makeAuthorizedURLRequest('https://sandbox.tradier.com/v1/markets/quotes?symbols='.$_GET['symbol'].'&greeks=false', $_GET['apikey']);
    } else {
      outputMissingArgs();
    }
  } else if ($callType = "historical") {
    if (isset($_GET['symbol']) && isset($_GET['apikey']) && isset($_GET['start'])) {
      makeAuthorizedURLRequest('https://sandbox.tradier.com/v1/markets/history?symbol='.$_GET['symbol'].'&start='.$_GET['start'], $_GET['apikey']);
    } else {
      outputMissingArgs();
    }
  } else {
    http_response_code(400);
    header('Content-Type: application/json');
    echo '{"message": "invalid calltype"}';
  }
} else {
  http_response_code(400);
  header('Content-Type: application/json');
  echo '{"message": "must specify calltype"}';
}

function outputMissingArgs() {
  http_response_code(400);
  header('Content-Type: application/json');
  echo '{"message": "missing arguments"}';
}

//The following code was adapted from Tradier docs: https://documentation.tradier.com/brokerage-api/markets/get-history
//Using curl, perform a GET request with the API Key passed as an authorization token.
//Returns a JSON object with response code 200 (success) or 500 (server error)
function makeAuthorizedURLRequest($url, $apiKey) {
  $ch = curl_init();

  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

  $headers = array();
  $headers[] = 'Authorization: Bearer '.$apiKey;
  $headers[] = 'Accept: application/json';

  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

  $result = curl_exec($ch);
  $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  if (curl_errno($ch)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo '{"message": "curl error"}';
  } else {
    http_response_code(200);
    header('Content-Type: application/json');
    echo $result;
  }
  curl_close ($ch);
}
?>
