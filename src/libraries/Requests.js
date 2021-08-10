/*-------------------------------- *
* Requests.js                      *
* -------------------------------- *
* Helper class which fetches data  *
* from various souces and prepares *
* it for processing.               *
* -------------------------------- */

/*        pain         */
export default function JSON_RETRIEVE(urlValue, callback) {
  console.log("fetching data from " + urlValue);

  var fetchDetails = {};

  //Fetch is not as intuitive as you would think
  fetch(urlValue,fetchDetails)
  .then(function(promise) {
    //Get the type of content
    const contentType = promise.headers.get("content-type");

    if (contentType && contentType.indexOf("application/json") !== -1) {
      //Wait for promise to be fulfilled, then return valid JSON
      return promise.json().then(data => {
        callback(urlValue,true,data);
      }).catch(function(error) {
        //Notify listener that request failed with error
        callback(urlValue,false,reportError("PROMISE_BROKEN"));
        console.log(error);
      });
    } else {
      return promise.text().then(text => {
        //The request worked, but the data is invalid. Should be JSON.
        //Notify listener that request failed with error
        callback(urlValue,false,reportError("NOT_JSON"));

      }).catch(function(error) {

        //Notify listener that request failed with error
        callback(urlValue,false,reportError("PROMISE_BROKEN"));
        console.log(error);
      });
    }
  })
  .catch(function(error) {
    //Data couldn't be fetched. Probably a network or config error
    callback(urlValue,false,reportError("NO_FETCH"));
    console.log(error);
  });
}

/**
 * Perform a preset GET request to a RESTful API.
 *
 * @param {string} jobID the preset request to make
 * @param {Object} args the arguments accepted by the API, expressed as a JSON object
 * @param {function} the function to call when the request is finished; accepts three params {@code (jobID (string), success (bool), data (json))}
 * @param {boolean} testMode a boolean indicating whether to make an actual request or just fetch sample data
 */
export function makeAPIRequest(jobID, args, callback, testMode) {
  if (testMode){
    //Retrieve sample data if API is not available
    callback(jobID,true,require('../../api/test/' + jobID + '.json'));
  }else{
    //Make request to API for JSON
    var urlValue = "";
    var fetchDetails = {};

    var baseUrl = "../../";

    //Converts API job ID to fetch-able URL
    var urlBindings = {
      API_TRADIER_EXPIRATIONS: (baseUrl + "api/tradier.php?calltype=expirations&symbol=" + args.symbol + "&apikey=" + args.tradierKey),
      API_TRADIER_CHAIN: (baseUrl + "api/tradier.php?calltype=options_chain&symbol=" + args.symbol + "&expiration=" + args.expiration + "&apikey=" + args.tradierKey),
      API_TRADIER_QUOTE: (baseUrl + "api/tradier.php?calltype=company_quote&symbol=" + args.symbol + "&apikey=" + args.tradierKey),
      API_STOCK_HISTORICAL: (baseUrl + "api/tradier.php?&calltype=historical&symbol=" + args.symbol + "&apikey=" + args.tradierKey + "&start=" + args.start)
    };

    //Ensure job ID exists, otherwise initiate callback indicating failure.
    if (urlBindings[jobID] != null) {
      urlValue = urlBindings[jobID];
    } else {
      callback(jobID, false, {});
    }

    //Attempt to fetch JSON data from URL and callback with the result
    JSON_RETRIEVE(urlValue, (url, success, data) => {
      callback(jobID, success, data);
    });
  }
}

//Generates somewhat nice error message
function reportError(type){
  return "Couldn't fetch data: ERROR_" + type;
}
