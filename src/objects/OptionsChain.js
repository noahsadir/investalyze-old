import SingleOption from './SingleOption';

/**
 * Stores and processes data for the options chain.
 */
export default class OptionsChain {
  constructor(rawData, spotPrice) {
    this.spot = spotPrice;
    this.rawData = rawData;
    this.currentTime = (new Date()).getTime();
    this.valueNames = getValueNamesForOption(rawData);
    this.dateSortedData = sortByDates(rawData, spotPrice);
    this.strikeSortedData = sortByStrikes(this.dateSortedData, spotPrice);
    this.dates = {calls: getAllKeys(this.dateSortedData.calls), puts: getAllKeys(this.dateSortedData.puts)};
    this.strikes = {calls: getAllKeys(this.strikeSortedData.calls), puts: getAllKeys(this.strikeSortedData.puts)};
  }

  //Get expiration dates for a given type ("calls" or "puts")
  //NOTE: Should be same regardless of type
  getDates = (type) => {
    return this.dates[type];
  }

  //Get strikes for a given type ("calls" or "puts")
  //NOTE: Should be same regardless of type
  getStrikes = (type) => {
    return this.strikes[type];
  }

  //Get chain for a given type and expiration date, sorted by strike
  forDate = (date, type) => {
    return this.dateSortedData[type][date];
  }

  //Get chain for a given type and strike, sorted by expiration date
  forStrike = (strike, type) => {
    return this.strikeSortedData[type][strike];
  }

  //Get the two options closest to the money for a given type and expiration date
  ntmForDate = (date, type, underlyingPrice) => {
    var chainForDate = this.forDate(date, type);
    var upperItem = null;
    var lowerItem = null;

    if (underlyingPrice == null) {
      underlyingPrice = this.spot;
    }

    for (var index in chainForDate) {
      if (chainForDate[index].get("strike") < underlyingPrice) {
        upperItem = chainForDate[index];
      } else if (lowerItem == null) {
        lowerItem = chainForDate[index];
      }
    }
    return {upper: upperItem, lower: lowerItem};
  }

  //Get the implied volatility for NTM options of specified type at the given date
  impliedVolatility = (date, type) => {

    if (type != "calls" && type != "puts") {
      var callIV = this.impliedVolatility(date, "calls");
      var putIV = this.impliedVolatility(date, "puts");
      if (callIV != null && putIV != null) {
        return (callIV + putIV) / 2;
      }
      return null;
    }

    //By now, it can be assured that type is either "calls" or "puts"
    if (date == null) {
      var ivSum = 0;
      //Get sum of IV values for each date
      for (var index in this.dates[type]) {
        var ivForDate = this.impliedVolatility(this.dates[type][index], type);
        if (ivForDate != null) {
          ivSum += ivForDate;
        }
      }

      //Get average (if array is populated)
      if (this.dates[type].length > 0) {
        return (ivSum /= this.dates[type].length);
      }
      return null;
    }

    var ntmChain = this.ntmForDate(date, type);

    //Get average of both IV values
    var iv = 0;
    iv += (ntmChain.upper != null ? ntmChain.upper.get("implied_volatility") : 0);
    iv += (ntmChain.lower != null ? ntmChain.lower.get("implied_volatility") : 0);
    if (ntmChain.upper != null && ntmChain.lower != null) {
      iv /= 2; //Both values were added; divide by 2 to get avg
    }

    return iv;
  }

  //Get the implied move based on NTM implied volatility
  impliedMove = (date, impliedVolatility) => {
    var iv = impliedVolatility;
    if (impliedVolatility == null) {
      iv = this.impliedVolatility(date);
    }

    return (this.spot * (iv / 100) * Math.sqrt(yearsBetweenMilliseconds(this.currentTime, date * 1000)));
  }

  //Retrieve the sum of a certain value (e.g. "open_interest") for all options of given type and/or expiration date
  //If no date is provided, the sum of values for all calls or puts is returned
  //If no type is provided, the sum of values for all calls and puts at the specified date is returned
  //If neither date nor type is provided, the sum of all options for the symbol is returned
  getTotal = (metric, date, type) => {
    if (type != "calls" && type != "puts") {
      var callTotal = this.getTotal(metric, date, "calls");
      var putTotal = this.getTotal(metric, date, "puts");
      return (callTotal != null ? callTotal : 0) + (putTotal != null ? putTotal : 0);
    }

    //By now, it can be assured that type is either "calls" or "puts"
    if (date == null) {
      var totalSum = 0;
      //Get sum of IV values for each date
      for (var index in this.dates[type]) {
        var sumForDate = this.getTotal(metric, this.dates[type][index], type);
        if (sumForDate != null) {
          totalSum += sumForDate;
        }
      }
      return totalSum;
    }

    //Go through each SingleOption for date and get sum of desired metric
    var chainForDate = this.forDate(date, type);
    var chainSum = 0;
    for (var index in chainForDate) {
      if (chainForDate[index].get(metric) != null) {
        chainSum += chainForDate[index].get(metric);
      }
    }

    return chainSum;
  }

  //Returns 1D array of SingleOption objects based on the following criteria
  // - comparisonType ("date" or "strike")
  // - comparisonValue (e.g. date "1619740800", strike "252.5")
  // - optionType ("calls" or "puts")
  filter = (comparisonType, comparisonValue, optionType) => {
    if (comparisonType == "date") {
      return this.forDate(comparisonValue, optionType);
    } else if (comparisonType == "strike") {
      return this.forStrike(comparisonValue, optionType);
    }
    return null;
  }

  //Find the strike at which losses for options buyers are maximized (sellers minimized) at a specified expirationd date
  maxPain = (date) => {
    var maxPainPrice = null;

    if (date != null) {
      var callsForDate = this.forDate(date, "calls");
      var putsForDate = this.forDate(date, "puts");
      var cumulativePain = {};
      var maxPainValue = 0;

      //Iterate through each strike value
      for (var index in callsForDate) {
        var strikePrice = callsForDate[index].get("strike");
        cumulativePain[strikePrice.toString()] = {calls: 0, puts: 0, total: 0};

        //For given strike value, calculate total value at expiration for all calls
        for (var callIndex in callsForDate) {
          if (callsForDate[callIndex].get("strike") < strikePrice) {
            cumulativePain[strikePrice.toString()].calls += (callsForDate[callIndex].get("open_interest") * (strikePrice - callsForDate[callIndex].get("strike")));
          }
        }

        //For given strike value, calculate total value at expiration for all puts
        for (var putIndex in putsForDate) {
          if (putsForDate[putIndex].get("strike") > strikePrice) {
            cumulativePain[strikePrice.toString()].puts += (putsForDate[putIndex].get("open_interest") * (putsForDate[putIndex].get("strike") - strikePrice));
          }
        }

        //Add the total put and call values to get total pain
        cumulativePain[strikePrice.toString()].total = cumulativePain[strikePrice.toString()].calls + cumulativePain[strikePrice.toString()].puts;
      }

      //Find strike with most pain to option buyers (least value at expiration)
      for (var strikeKey in cumulativePain) {
        if (maxPainPrice == null || maxPainValue > cumulativePain[strikeKey].total) {
          maxPainPrice = strikeKey;
          maxPainValue = cumulativePain[strikeKey].total;
        }
      }
    }

    return maxPainPrice;
  }

  get names() {
    return this.valueNames;
  }

}

/**
 * Get list of human-readable names for option values.
 *
 * @param {Object} rawValue the raw JSON returned by the API
 * @returns {Object} a JSON object with format: {@code {bid: "Bid", ask: "Ask", volume: "Volume",...}}
 */
function getValueNamesForOption(rawData) {
  for (var date in rawData) {
    //For each date, go through both types (calls, puts)
    for (var type in rawData[date]) {
      //Go through each call/put for this date
      for (var optionIndex in rawData[date][type]) {

        //Known name values
        var valueNames = {
          bid: "Bid",
          ask: "Ask",
          mark: "Mark",
          bid_ask_spread: "Bid-Ask Spread",
          intrinsic_value: "Intrinsic",
          extrinsic_value: "Extrinsic",
          open_interest_value: "Open Interest Value",
          open_interest_intrinsic: "Open Interest Intrinsic",
          open_interest_extrinsic: "Open Interest Extrinsic",
          volume: "Volume",
          open_interest: "Open Interest",
          strike: "Strike",
          last_price: "Last Price",
          last_trade: "Last Trade",
          price_change: "$ Change",
          percent_change: "% Change",
          time_to_expiration: "Days to Exp.",
          annual_extrinsic_value: "Annualized Extrinsic ($)",
          annual_extrinsic_percent: "Annualized Extrinsic (%)",
          leverage_ratio: "Leverage Ratio",
          delta: "Delta",
          gamma: "Gamma",
          theta: "Theta",
          vega: "Vega",
          rho: "Rho",
          implied_volatility: "Implied Volatility"
        };

        //Go through keys of first found option object and add remaining keys
        //Example format change: "implied_volatility" --> "implied volatility"
        for (var key in rawData[date][type][optionIndex]) {
          if (valueNames[key] == null) {
            valueNames[key] = key.replace("_"," ");
          }
        }
        return valueNames;
      }
    }
  }
  return null;
}

/**
 * Separates data by calls and puts, then sorts by date.
 *
 * @param {Object} rawData the JSON object loaded from the API
 * @returns {Object} an object of format {@code {calls: {"date_1":[SingleOption], "date_2":[SingleOption],...}, puts:...}}
 */
function sortByDates(rawData, spotPrice) {
  var datesList = {calls: {}, puts: {}};

  //Go through every date in rawData
  for (var date in rawData) {

    //For each date, go through both types (calls, puts)
    for (var type in rawData[date]) {

      //Check if this date is missing from datesList, create a new key with an empty array if so.
      if (datesList[type][date] == null) {
        datesList[type][date] = [];
      }

      //Convert each option object into a SingleOption and add to datesList
      for (var optionIndex in rawData[date][type]) {
        datesList[type][date].push(new SingleOption(rawData[date][type][optionIndex], spotPrice));
      }

    }
  }

  return datesList;
}

/**
 * Separates data by calls and puts, then sorts by strike.
 *
 * @param {Object} rawData the JSON object loaded from the API
 * @returns {Object} an object of format {@code {calls: {"strike_1":[SingleOption], "strike_2":[SingleOption],...}, puts:...}}
 */
function sortByStrikes(dateSortedData, spotPrice) {
  var strikesList = {calls: {}, puts: {}};

  //For each date, go through both types (calls, puts)
  for (var type in dateSortedData) {

    //Go through every date in rawData
    for (var date in dateSortedData[type]) {
      //Go through each call/put for this date
      for (var optionIndex in dateSortedData[type][date]) {
        var optionObject = dateSortedData[type][date][optionIndex];

        //Register new strike if it wasn't already
        if (strikesList[type][optionObject.get("strike")] == null) {
          strikesList[type][optionObject.get("strike")] = [];
        }

        //Convert each option object into a SingleOption and add to strikesList
        strikesList[type][optionObject.get("strike")].push(optionObject);
      }
    }
  }

  return strikesList;
}

/**
 * Separates data by calls and puts, then sorts by strike.
 *
 * @param {Object} rawData the JSON object loaded from the API
 * @returns {Object} an object of format {@code {calls: {"strike_1":[SingleOption], "strike_2":[SingleOption],...}, puts:...}}
 */
function sortByStrikesFromRaw(rawData, spotPrice) {
  var strikesList = {calls: {}, puts: {}};

  //Go through every date in rawData
  for (var date in rawData) {

    //For each date, go through both types (calls, puts)
    for (var type in rawData[date]) {

      //Go through each call/put for this date
      for (var optionIndex in rawData[date][type]) {
        var optionObject = rawData[date][type][optionIndex];

        //Register new strike if it wasn't already
        if (strikesList[type][optionObject.strike] == null) {
          strikesList[type][optionObject.strike] = [];
        }

        //Convert each option object into a SingleOption and add to strikesList
        strikesList[type][optionObject.strike].push(new SingleOption(optionObject, spotPrice));
      }
    }
  }

  return strikesList;
}

/**
 * Retreives all of the keys (non-recursively) in a JSON object.
 *
 * @param {Object} rawData the JSON object to get keys from
 * @returns {string[]} an array with only the keys for the top level of that object
 */
function getAllKeys(rawData) {
  var keys = [];
  for (var key in rawData) {
    keys.push(parseFloat(key));
  }
  keys.sort(function(a,b) { return a - b;});
  return keys;
}

function yearsBetweenMilliseconds(start, end) {
  var difference = Math.abs(start - end);
  return (difference / 31536000000);
}
