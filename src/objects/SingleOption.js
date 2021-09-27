var Greeks = require('greeks');
var BlackScholes = require('black-scholes');
var ImpliedVolatility = require('implied-volatility');

/**
 * Store and process data for a single option contract.
 */
export default class SingleOption {
  constructor(rawData, spotPrice) {
    this.rawProps = rawData;
    this.spot = spotPrice;
    this.didCalculate = false;
    this.calcProps = {};

    this.propNames = {};
  }

  copy = () => {
    var newObject = new SingleOption(JSON.parse(JSON.stringify(this.rawProps)), this.spot);
    newObject.didCalculate = this.didCalculate ? true : false;
    newObject.calcProps = JSON.parse(JSON.stringify(this.calcProps));
    newObject.propNames = JSON.parse(JSON.stringify(this.propNames));
    return newObject;
  }

  //Can be a very time consuming process; should only be run if needed
  //TODO: Find a way to make async
  calculate = (calculateGreeksManually) => {
    var currentTime = (new Date()).getTime() - 86400000;
    var spotPrice = this.spot;
    this.calcProps.spot = spotPrice;
    this.calcProps.mark = (this.rawProps.bid + this.rawProps.ask) / 2;
    this.calcProps.bid_ask_spread = this.get("ask") - this.get("bid");
    this.calcProps.open_interest_value = this.get("mark") * this.get("open_interest");
    this.calcProps.time_to_expiration = roundFloat((this.get("expiration") - currentTime) / 1000 / 60 / 60 / 24, 2);
    //Calculate greeks manually. Slow & resource intensive,
    //but more accurate than 1-hr delayed values provided by Tradier
    if (calculateGreeksManually) {
      this.calcProps.implied_volatility = ImpliedVolatility.getImpliedVolatility(this.get("mark"), this.get("spot"), this.get("strike"), (this.get("expiration") - currentTime) / 31536000000, 0.0015, this.get("type")) * 100;
      this.calcProps.delta = Greeks.getDelta(this.get("spot"), this.get("strike"), (this.get("expiration") - currentTime) / 31536000000, this.get("implied_volatility"), 0.0015, this.get("type"));
      this.calcProps.gamma = Greeks.getGamma(this.get("spot"), this.get("strike"), (this.get("expiration") - currentTime) / 31536000000, this.get("implied_volatility"), 0.0015, this.get("type"));
      this.calcProps.theta = Greeks.getTheta(this.get("spot"), this.get("strike"), (this.get("expiration") - currentTime) / 31536000000, this.get("implied_volatility"), 0.0015, this.get("type"));
      this.calcProps.vega = Greeks.getVega(this.get("spot"), this.get("strike"), (this.get("expiration") - currentTime) / 31536000000, this.get("implied_volatility"), 0.0015, this.get("type"));
      this.calcProps.rho = Greeks.getRho(this.get("spot"), this.get("strike"), (this.get("expiration") - currentTime) / 31536000000, this.get("implied_volatility"), 0.0015, this.get("type"));
    }

    this.calcProps.intrinsic_value = calculateIntrinsicValue(this);
    this.calcProps.extrinsic_value = calculateExtrinsicValue(this);
    this.calcProps.open_interest_extrinsic = this.get("extrinsic_value") * this.get("open_interest");
    this.calcProps.open_interest_intrinsic = this.get("intrinsic_value") * this.get("open_interest");
    this.calcProps.annual_extrinsic_value = (this.get("extrinsic_value") / this.get("time_to_expiration")) * 365;
    this.calcProps.annual_extrinsic_percent = (this.get("annual_extrinsic_value") / this.get("spot")) * 100;
    this.calcProps.leverage_ratio = (this.get("spot") - this.get("mark")) / this.get("mark");
  }

  set = (key, value) => {
    this.calcProps[key] = value;
  }

  get = (key) => {
    if (this.didCalculate == false) {
      this.didCalculate = true;
      this.calculate(false);
    }
    //Return either a calculated or raw property, with priority for calc'd
    return (this.calcProps[key] != null) ? this.calcProps[key] : this.rawProps[key];
  }

  name = (key) => {
    if (this.didCalculate == false) {
      this.didCalculate = true;
      this.calculate(false);
    }
    return (this.propNames[key] != null) ? this.propNames[key] : this.get(key);
  }

  blackScholesPrice = (daysToExpiration, spotPrice, impliedVolatility) => {
    if (daysToExpiration == null) {
      daysToExpiration = this.get("time_to_expiration");
    }

    if (spotPrice == null) {
      spotPrice = this.spot;
    }

    if (impliedVolatility == null) {
      impliedVolatility = this.get("implied_volatility");
    }

    return BlackScholes.blackScholes(spotPrice, this.get("strike"), daysToExpiration / 365, impliedVolatility / 100, 0.015, this.get("type"));
  }

  formatted = (key) => {
    if (this.didCalculate == false) {
      this.didCalculate = true;
      this.calculate(false);
    }
    var value = this.get(key);
    //Return string "null" if value is null
    if (value == null) {
      return "null";
    }

    //List of formats for recognized values
    var valueFormats = {
      bid: "dollar",
      ask: "dollar",
      mark: "dollar",
      spot: "dollar",
      bid_ask_spread: "dollar",
      intrinsic_value: "dollar",
      extrinsic_value: "dollar",
      open_interest_extrinsic: "dollar",
      open_interest_intrinsic: "dollar",
      open_interest_value: "dollar",
      annual_extrinsic_value: "dollar",
      annual_extrinsic_percent: "percent",
      volume: "integer",
      open_interest: "integer",
      strike: "decimal_2",
      expiration: "integer",
      last_price: "dollar",
      price_change: "dollar",
      percent_change: "percent",
      implied_volatility: "percent",
      smooth_implied_volatility: "percent",
      delta: "decimal_4",
      gamma: "decimal_4",
      theta: "decimal_4",
      vega: "decimal_4",
      rho: "decimal_4",
      leverage_ratio: "multiplier",
      id: null,
    }

    //Format item based on valueFormats
    if (valueFormats[key] == "dollar") {
      return convertToMoneyValue(value);
    } else if (valueFormats[key] == "percent") {
      return value.toFixed(2) + "%";
    } else if (valueFormats[key] == "multiplier") {
      return value.toFixed(2) + "x";
    } else if (valueFormats[key] == "integer") {
      return parseInt(value);
    } else if (valueFormats[key] == "decimal_2") {
      return value.toFixed(2);
    } else if (valueFormats[key] == "decimal_4") {
      return value.toFixed(4);
    }

    //Return the formatted value (or the unformatted value if format is unknown)
    return value;
  }

  get rawData() {
    console.log(this.rawProps);
    return this.rawProps;
  }

  get calcData() {
    return this.calcProps;
  }

  get allData() {
    var data = {};
    for (var key in this.rawProps) {
      data[key] = this.rawProps[key];
    }
    for (var key in this.calcProps) {
      data[key] = this.calcProps[key];
    }
    return data;
  }
}

function calculateIntrinsicValue(object) {
  var intrinsic = 0;

  if (object.get("type") == "call") {
    intrinsic = object.get("spot") - object.get("strike");
  } else if (object.get("type") == "put") {
    intrinsic = object.get("strike") - object.get("spot");
  }

  if (intrinsic < 0) {
    intrinsic = 0;
  }

  return roundFloat(intrinsic, 2);
}

function calculateExtrinsicValue(object) {
  var extrinsic = 0;

  extrinsic = object.get("mark") - object.get("intrinsic_value");

  if (extrinsic < 0) {
    extrinsic = 0;
  }

  return roundFloat(extrinsic, 2);
}

function yearsBetweenMilliseconds(start, end) {
  var difference = Math.abs(start - end);
  return (difference / 31536000000);
}

function convertToMoneyValue(val){
  if (val < 0){
    return "-$" + Math.abs(val).toFixed(2);
  }else{
    return "$" + Math.abs(val).toFixed(2);
  }
}

function roundFloat(value, roundInt) {
  return parseFloat(value.toFixed(roundInt));
}

function time(s) {
  const dtFormat = new Intl.DateTimeFormat('en-US', {timeZone: "UTC"});
  return dtFormat.format(new Date((s * 1000)));
}
