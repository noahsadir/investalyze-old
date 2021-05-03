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

//Generates somewhat nice error message
function reportError(type){
  return "Couldn't fetch data: ERROR_" + type;
}
