import SingleOption from './SingleOption';

export default class OptionsChain {
  constructor(rawData, spotPrice) {
    this.spot = spotPrice;
    this.currentTime = (new Date()).getTime();
    this.valueNames = getValueNamesForOption(rawData);
    this.dateSortedData = sortByDates(rawData, spotPrice);
    this.strikeSortedData = sortByStrikes(this.dateSortedData, spotPrice);
    this.dates = {calls: getAllKeys(this.dateSortedData.calls), puts: getAllKeys(this.dateSortedData.puts)};
    this.strikes = {calls: getAllKeys(this.strikeSortedData.calls), puts: getAllKeys(this.strikeSortedData.puts)};
  }

  getDates = (type) => {
    return this.dates[type];
  }

  getStrikes = (type) => {
    return this.strikes[type];
  }

  forDate = (date, type) => {
    return this.dateSortedData[type][date];
  }

  forStrike = (strike, type) => {
    return this.strikeSortedData[type][strike];
  }

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

  impliedMove = (date, impliedVolatility) => {
    var iv = impliedVolatility;
    if (impliedVolatility == null) {
      iv = this.impliedVolatility(date);
    }

    return (this.spot * (iv / 100) * Math.sqrt(yearsBetweenMilliseconds(this.currentTime, date * 1000)));
  }

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

  get names() {
    return this.valueNames;
  }

}

/**
 * Get list of human-readable names for option values.
 *
 * @param rawValue the raw JSON returned by the API
 * @return a JSON object with format: {@code {bid: "Bid", ask: "Ask", volume: "Volume",...}}
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
 * @param rawData the JSON object loaded from the API
 * @return an object of format {@code {calls: {"date_1":[SingleOption], "date_2":[SingleOption],...}, puts:...}}
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
 * @param rawData the JSON object loaded from the API
 * @return an object of format {@code {calls: {"strike_1":[SingleOption], "strike_2":[SingleOption],...}, puts:...}}
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
 * @param rawData the JSON object loaded from the API
 * @return an object of format {@code {calls: {"strike_1":[SingleOption], "strike_2":[SingleOption],...}, puts:...}}
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
 * @param rawData the JSON object to get keys from
 * @return an array with only the keys for the top level of that object
 */
function getAllKeys(rawData) {
  var keys = [];
  for (var key in rawData) {
    keys.push(parseFloat(key));
  }
  keys.sort(function(a,b) { return a - b;});
  console.log(keys);
  return keys;
}

function yearsBetweenMilliseconds(start, end) {
  var difference = Math.abs(start - end);
  return (difference / 31536000000);
}
