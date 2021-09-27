import HistoricalStockData from './HistoricalStockData';
export default class OptionsStrategy {
  constructor() {
    this.singleOptions = [];
    this.underlyingPrice = 0;
    this.underlyingShareCount = 0;
  }

  add = (singleOption, quantity) => {
    this.remove(singleOption);
    this.singleOptions.push({option: singleOption.copy(), quantity: quantity, historical: null});
  }

  loadHistorical = (apiKey, progressCallback, finishCallback) => {
    var loadCount = 0;
    var successForAll = true;

    for (var index in this.singleOptions) {
      if (this.singleOptions[index].historical == null) {
        var singleOption = this.singleOptions[index].option;

        // It seems a bit convoluted to make a separate function for Requests.makeAPIRequest, but
        // it's the only way to preserve the state of the index variable.
        getHistoricalData(singleOption, index, apiKey, (id, success, data, singleOptionIndex) => {

          if (success) {
            var historicalOptionsData = new HistoricalStockData(data);
            this.singleOptions[singleOptionIndex].historical = historicalOptionsData;
          } else {
            successForAll = false;
          }

          loadCount += 1;

          if (loadCount == this.singleOptions.length) {
            if (successForAll) {
              finishCallback(true);
            } else {
              finishCallback(false);
            }
          } else {
            progressCallback(loadCount);
          }
        });

      }
    }
  }

  historicalClosings = () => {
    var total = 0;
    var optionsCount = this.singleOptions.length;
    var dateCounts = {};
    var closings = {};
    var totalClosePoints = [];

    for (var index in this.singleOptions) {
      var historicalOptionsData = this.singleOptions[index].historical;
      if (historicalOptionsData != null) {
        console.log(historicalOptionsData.closings);
        for (var closeIndex in historicalOptionsData.closings) {
          var closePoint = historicalOptionsData.closings[closeIndex];
          if (dateCounts[closePoint[0].toString()] == null) {
            dateCounts[closePoint[0].toString()] = 1;
            closings[closePoint[0].toString()] = closePoint[1] * this.singleOptions[index].quantity;
          } else {
            dateCounts[closePoint[0].toString()] += 1;
            closings[closePoint[0].toString()] += closePoint[1] * this.singleOptions[index].quantity;
          }
        }
      }
    }

    for (var dateKey in closings) {
      if (dateCounts[dateKey] == optionsCount) {
        totalClosePoints.push([parseInt(dateKey), closings[dateKey]]);
      }
    }

    console.log(totalClosePoints);
    return totalClosePoints;
  }

  modifySingleOptionProperty = (singleOption, key, newValue) => {
    var indexIfAvailable = this.indexOf(singleOption);
    if (indexIfAvailable != null) {
      this.singleOptions[indexIfAvailable].option.set(key, newValue);
    }
  }

  modifySingleOptionQuantity = (singleOption, newQuantity) => {
    var indexIfAvailable = this.indexOf(singleOption);
    if (indexIfAvailable != null) {
      this.singleOptions[indexIfAvailable].quantity = newQuantity;
    }
  }

  remove = (singleOption) => {
    var indexIfAvailable = this.indexOf(singleOption);
    if (indexIfAvailable != null) {
      this.singleOptions.splice(indexIfAvailable, 1);
    }
  }

  indexOf = (singleOption) => {

    var singleOptionID = singleOption.get("id");
    for (var index in this.singleOptions) {
      if (this.singleOptions[index].option.get("id") == singleOptionID) {
        return index;
      }
    }
    return null;
  }

  setUnderlying = (price, shares) => {
    this.underlyingPrice = price;
    this.underlyingShareCount = shares;
    return this;
  }

  getTotal = (key) => {
    var total = 0;
    for (var index in this.singleOptions) {
      total += (this.singleOptions[index].option.get(key) * this.singleOptions[index].quantity);
    }
    return total;
  }

  getAdjustedTotal = (key) => {
    var total = 0;
    for (var index in this.singleOptions) {
      total += (this.singleOptions[index].option.get(key) * this.singleOptions[index].quantity * 100);
    }
    return total;
  }

  getAverage = (key) => {
    var sum = 0;
    var denominator = 0;
    for (var index in this.singleOptions) {
      sum += (this.singleOptions[index].option.get(key) * Math.abs(this.singleOptions[index].quantity));
      denominator += Math.abs(this.singleOptions[index].quantity)
    }
    return (sum / denominator);
  }

  getStrikes = () => {
    var strikesList = [];
    for (var index in this.singleOptions) {
      if (!strikesList.includes(this.singleOptions[index].option.get("strike"))) {
        strikesList.push(this.singleOptions[index].option.get("strike"));
      }
    }
    return strikesList;
  }

  markDebitCredit = () => {
    return ((this.getTotal("mark") * 100) + (this.underlyingPrice * this.underlyingShareCount)) * -1;
  }

  predictedDebitCredit = (daysToExpiration, spotPrice, impliedVolatility) => {
    var total = 0;
    for (var index in this.singleOptions) {
      total += (this.singleOptions[index].option.blackScholesPrice(daysToExpiration, spotPrice, impliedVolatility) * this.singleOptions[index].quantity);
    }
    return ((total * 100) + (this.underlyingPrice * this.underlyingShareCount)) * -1;
  }

  blackScholesPrice = (daysToExpiration, spotPrice, impliedVolatility) => {
    var total = 0;
    for (var index in this.singleOptions) {
      var price = this.singleOptions[index].option.blackScholesPrice(daysToExpiration, spotPrice, impliedVolatility);
      if (!isNaN(price)) {
        total += (price * this.singleOptions[index].quantity);
      }
    }
    return total;
  }

  bidDebitCredit = () => {
    var total = 0;
    for (var index in this.singleOptions) {
      var key = "bid";
      if (this.singleOptions[index].quantity < 0) {
        key = "ask";
      }
      total += ((this.singleOptions[index].option.get(key) * 100) * this.singleOptions[index].quantity);
    }
    return total;
  }

  askDebitCredit = () => {
    var total = 0;
    for (var index in this.singleOptions) {
      var key = "ask";
      if (this.singleOptions[index].quantity < 0) {
        key = "bid";
      }
      total += ((this.singleOptions[index].option.get(key) * 100) * this.singleOptions[index].quantity);
    }
    return total;
  }

  identify = () => {
    var legsCount = this.singleOptions.length;
    if (legsCount == 0) {
      return zeroLegStrategy(this.underlyingShareCount);
    } else if (legsCount == 1) {
      return singleLegStrategy(this.underlyingShareCount, this.singleOptions[0]);
    } else if (legsCount == 2) {
      return twoLegStrategy(this.underlyingShareCount, this.singleOptions[0], this.singleOptions[1]);
    } else if (legsCount == 4) {
      return fourLegStrategy(this.underlyingShareCount, this.singleOptions[0], this.singleOptions[1], this.singleOptions[2], this.singleOptions[3]);
    } else if (legsCount > 8) {
      return "More legs than a spider";
    }
    return "Unknown Strategy";
  }

  expiration = () => {
    var nearestExpiration = null;
    for (var index in this.singleOptions) {
      if (nearestExpiration == null || nearestExpiration > this.singleOptions[index].option.get("expiration")) {
        nearestExpiration = this.singleOptions[index].option.get("expiration");
      }
    }
    return nearestExpiration;
  }

}

// Variables are not friendly with async tasks
function getHistoricalData(singleOption, index, apiKey, callback) {
  var Requests = require('../libraries/Requests');
  var startDate = (new Date((new Date()).getTime() - 94608000000)).toISOString().split("T")[0];
  Requests.makeAPIRequest("API_STOCK_HISTORICAL", {symbol: singleOption.get("id"), tradierKey: apiKey, start: startDate}, (shID, shSuccess, shData) => {
    callback(shID, shSuccess, shData, index);
  }, false);
}

function zeroLegStrategy(underlyingQuantity) {
  if (underlyingQuantity > 0) {
    return "Long Shares";
  } else if (underlyingQuantity < 0) {
    return "Short Shares";
  }
  return "No Position";
}

function singleLegStrategy(underlyingQuantity, firstLeg) {
  var firstSingleOption = firstLeg.option;
  if (underlyingQuantity > 0) { //Long shares
    if (firstSingleOption.get("type") == "call") {
      if (firstLeg.quantity > 0) {
        return "Long Call + Long Shares";
      } else if (firstLeg.quantity < 0) {
        if (underlyingQuantity >= Math.abs(firstLeg.quantity * 100)) {
          return "Covered Call";
        } else {
          return "Partially Covered Call";
        }
      }
    } else if (firstSingleOption.get("type") == "put") {
      if (firstLeg.quantity > 0) {
        if (underlyingQuantity >= Math.abs(firstLeg.quantity * 100)) {
          return "Protective Put";
        } else {
          return "Partially Protective Put";
        }
      } else if (firstLeg.quantity < 0) {
        return "Short Put + Long Shares";
      }
    }
  } else if (underlyingQuantity < 0) { //Short shares
    if (firstSingleOption.get("type") == "call") {
      if (firstLeg.quantity > 0) {
        if (underlyingQuantity <= Math.abs(firstLeg.quantity * 100)) {
          return "Protective Call";
        } else {
          return "Partially Protective Call";
        }
      } else if (firstLeg.quantity < 0) {
        return "Short Call + Short Shares"
      }
    } else if (firstSingleOption.get("type") == "put") {
      if (firstLeg.quantity > 0) {
        return "Long Put + Short Shares";
      } else if (firstLeg.quantity < 0) {
        if (underlyingQuantity <= Math.abs(firstLeg.quantity * 100)) {
          return "Covered Put";
        } else {
          return "Partially Covered Put";
        }
      }
    }
  } else if (underlyingQuantity == 0) { //No shares
    if (firstSingleOption.get("type") == "call") {
      if (firstLeg.quantity > 0) {
        return "Long Call";
      } else if (firstLeg.quantity < 0) {
        return "Short Call";
      }
    } else if (firstSingleOption.get("type") == "put") {
      if (firstLeg.quantity > 0) {
        return "Long Put";
      } else if (firstLeg.quantity < 0) {
        return "Short Put";
      }
    }
  }
  return "Unknown Strategy";
}

function twoLegStrategy(underlyingQuantity, firstLeg, secondLeg) {
  var firstSingleOption = firstLeg.option;
  var secondSingleOption = secondLeg.option;
  var sharePosition = "";
  if (underlyingQuantity > 0) {
    sharePosition = " + Long Shares";
  } else if (underlyingQuantity < 0) {
    sharePosition = " + Short Shares";
  }

  if (firstSingleOption.get("type") == secondSingleOption.get("type")) { //Both calls or both puts
    //One short leg and one long leg
    var type = firstSingleOption.get("type");
    if ((firstLeg.quantity > 0 && secondLeg.quantity < 0) || (firstLeg.quantity < 0 && secondLeg.quantity > 0)) {
      var shortLeg = firstLeg.quantity < 0 ? firstLeg : secondLeg;
      var longLeg = firstLeg.quantity < 0 ? secondLeg : firstLeg;

      if (type == "call") {
        if (shortLeg.option.get("strike") > longLeg.option.get("strike")) { //Vertical/Diagonal
          if (shortLeg.option.get("expiration") == longLeg.option.get("expiration")) {
            return "Vertical Call Debit Spread" + sharePosition;
          } else {
            return "Diagonal Call Spread" + sharePosition;
          }
        } else if (shortLeg.option.get("strike") < longLeg.option.get("strike")) { //Vertical/Diagonal
          if (shortLeg.option.get("expiration") == longLeg.option.get("expiration")) {
            return "Vertical Call Credit Spread" + sharePosition;
          } else {
            return "Diagonal Call Spread" + sharePosition;
          }
        } else if (shortLeg.option.get("strike") == longLeg.option.get("strike")) { //Presumably calendar
          if (shortLeg.option.get("expiration") > longLeg.option.get("expiration")) {
            return "Calendar Call Credit Spread" + sharePosition;
          } else if (shortLeg.option.get("expiration") < longLeg.option.get("expiration")) {
            return "Calendar Call Debit Spread" + sharePosition;
          }
        }
      } else if (type == "put") {
        if (shortLeg.option.get("strike") < longLeg.option.get("strike")) { //Vertical/Diagonal
          if (shortLeg.option.get("expiration") == longLeg.option.get("expiration")) {
            return "Vertical Put Debit Spread" + sharePosition;
          } else {
            return "Diagonal Put Spread" + sharePosition;
          }
        } else if (shortLeg.option.get("strike") > longLeg.option.get("strike")) { //Vertical/Diagonal
          if (shortLeg.option.get("expiration") == longLeg.option.get("expiration")) {
            return "Vertical Put Credit Spread" + sharePosition;
          } else {
            return "Diagonal Put Spread" + sharePosition;
          }
        } else if (shortLeg.option.get("strike") == longLeg.option.get("strike")) { //Presumably calendar
          if (shortLeg.option.get("expiration") > longLeg.option.get("expiration")) {
            return "Calendar Put Credit Spread" + sharePosition;
          } else if (shortLeg.option.get("expiration") < longLeg.option.get("expiration")) {
            return "Calendar Put Debit Spread" + sharePosition;
          }
        }
      }
    } else if (firstLeg.quantity > 0 && secondLeg.quantity > 0) {
      if (type == "call") {
        return "Long Calls" + sharePosition;
      } else if (type == "put") {
        return "Long Puts" + sharePosition;
      }
    } else if (firstLeg.quantity < 0 && secondLeg.quantity < 0) {
      if (type == "call") {
        return "Short Calls" + sharePosition;
      } else if (type == "put") {
        return "Short Puts" + sharePosition;
      }
    }
  } else { //Call with a put
    var callLeg = firstLeg.option.get("type") == "call" ? firstLeg : secondLeg;
    var putLeg = firstLeg.option.get("type") == "call" ? secondLeg : firstLeg;

    if ((firstLeg.quantity > 0 && secondLeg.quantity < 0) || (firstLeg.quantity < 0 && secondLeg.quantity > 0)) {
      if (callLeg.quantity < 0 && putLeg.quantity > 0 && underlyingQuantity > 0) {
        return "Long Collar";
      } else if (callLeg.quantity > 0 && putLeg.quantity < 0 && underlyingQuantity < 0) {
        return "Short Collar";
      }
    } else if (firstLeg.quantity > 0 && secondLeg.quantity > 0) {
      if (callLeg.option.get("strike") == putLeg.option.get("strike")) {
        if (callLeg.option.get("expiration") == putLeg.option.get("expiration")) {
          return "Long Straddle" + sharePosition;
        } else {
          return "Long Calendar Straddle" + sharePosition;
        }
      } else {
        if (callLeg.option.get("expiration") == putLeg.option.get("expiration")) {
          return "Long Strangle" + sharePosition;
        } else {
          return "Long Calendar Strangle" + sharePosition;
        }
      }
    } else if (firstLeg.quantity < 0 && secondLeg.quantity < 0) {
      if (callLeg.option.get("strike") == putLeg.option.get("strike")) {
        if (callLeg.option.get("expiration") == putLeg.option.get("expiration")) {
          return "Short Straddle" + sharePosition;
        } else {
          return "Short Calendar Straddle" + sharePosition;
        }
      } else {
        if (callLeg.option.get("expiration") == putLeg.option.get("expiration")) {
          return "Short Strangle" + sharePosition;
        } else {
          return "Short Calendar Strangle" + sharePosition;
        }
      }
    }
  }
  return "Unknown Strategy";
}

function fourLegStrategy(underlyingQuantity, firstLeg, secondLeg, thirdLeg, fourthLeg) {
  var legs = [firstLeg, secondLeg, thirdLeg, fourthLeg];
  var longCalls = [];
  var shortCalls = [];
  var longPuts = [];
  var shortPuts = [];

  for (var index in legs) {
    var option = legs[index];
    if (option.option.get("type") == "call") {
      if (option.quantity > 0) {
        longCalls.push(option);
      } else if (option.quantity < 0) {
        shortCalls.push(option);
      }
    } else if (option.option.get("type") == "put") {
      if (option.quantity > 0) {
        longPuts.push(option);
      } else if (option.quantity < 0) {
        shortPuts.push(option);
      }
    }
  }

  if (longCalls.length == 1 && shortCalls.length == 1 && longPuts.length == 1 && shortPuts.length == 1) {
    var underlyingPosition = underlyingQuantity > 0 ? " + Long Shares" : (underlyingQuantity < 0 ? " + Short Shares" : "");
    if (longCalls[0].option.get("strike") > shortCalls[0].option.get("strike")) {
      //Call Credit Spread
      if (longPuts[0].option.get("strike") > shortPuts[0].option.get("strike")) {
        //Put Debit Spread
        return "Bear Spreads";
      } else if (longPuts[0].option.get("strike") < shortPuts[0].option.get("strike")) {
        //Put Credit Spread
        if ((longPuts[0].option.get("strike") == shortCalls[0].option.get("strike")) && (shortPuts[0].option.get("strike") == longCalls[0].option.get("strike"))) {
          return "Short Box Spread";
        } else if (shortPuts[0].option.get("strike") != shortCalls[0].option.get("strike")) {
          return "Short Iron Condor" + underlyingPosition;
        } else if (shortPuts[0].option.get("strike") == shortCalls[0].option.get("strike")) {
          return "Short Iron Butterfly" + underlyingPosition;
        }
      }
    } else if (longCalls[0].option.get("strike") < shortCalls[0].option.get("strike")) {
      //Call Debit Spread
      if (longPuts[0].option.get("strike") > shortPuts[0].option.get("strike")) {
        //Put Debit Spread
        if ((longPuts[0].option.get("strike") == shortCalls[0].option.get("strike")) && (shortPuts[0].option.get("strike") == longCalls[0].option.get("strike"))) {
          return "Long Box Spread";
        } else if (longPuts[0].option.get("strike") != longCalls[0].option.get("strike")) {
          return "Long Iron Condor" + underlyingPosition;
        } else if (longPuts[0].option.get("strike") == longCalls[0].option.get("strike")) {
          return "Long Iron Butterfly" + underlyingPosition;
        }
      } else if (longPuts[0].option.get("strike") < shortPuts[0].option.get("strike")) {
        //Put Credit Spread
        return "Bull Spreads";
      }
    }
  }

  return "Unknown Strategy";
}
