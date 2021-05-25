export default class OptionsStrategy {
  constructor() {
    this.singleOptions = [];
    this.underlyingPrice = 0;
    this.underlyingShareCount = 0;
  }

  add = (singleOption, quantity) => {
    this.remove(singleOption);
    this.singleOptions.push({option: singleOption.copy(), quantity: quantity});
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
    } else if (legsCount > 8) {
      return "What are you doing?";
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
