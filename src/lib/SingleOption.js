var Greeks = require('greeks');
var BlackScholes = require('black-scholes');
var ImpliedVolatility = require('implied-volatility');

export default class SingleOption {
  constructor(rawData) {
    this.rawProps = rawData;
    this.calcProps = {};

    var currentTime = (new Date()).getTime();
    this.calcProps.mark = (this.rawProps.bid + this.rawProps.ask) / 2;

    this.propNames = {};
  }

  get = (key) => {
    return (this.rawProps[key] != null) ? this.rawProps[key] : this.calcProps[key];
  }

  name = (key) => {
    return (this.propNames[key] != null) ? this.propNames[key] : this.get(key);
  }

  formatted = (key) => {
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
      volume: "integer",
      open_interest: "integer",
      strike: "decimal_2",
      date: "integer",
      last_price: "dollar",
      price_change: "dollar",
      percent_change: "percent",
      implied_volatility: "percent",
      id: null,
    }

    //Format item based on valueFormats
    if (valueFormats[key] == "dollar") {
      return convertToMoneyValue(value);
    } else if (valueFormats[key] == "percent") {
      return value + "%";
    } else if (valueFormats[key] == "integer") {
      return parseInt(value);
    } else if (valueFormats[key] == "decimal_2") {
      return parseFloat(value.toFixed(2));
    } else if (valueFormats[key] == "decimal_4") {
      return parseFloat(value.toFixed(4));
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

/**
 * Convert double into dollar amount, positive or negative.
 *
 * @param val the value to convert
 * @return the value represented as a dollar amount
 */
function convertToMoneyValue(val){
  if (val < 0){
    return "-$" + Math.abs(val).toFixed(2);
  }else{
    return "$" + Math.abs(val).toFixed(2);
  }
}

/**
 * Convert time in seconds to formatted date.
 *
 * @param s the time in seconds from epoch
 * @return a Intl.DateTimeFormat object
 */
function time(s) {
  const dtFormat = new Intl.DateTimeFormat('en-US', {timeZone: "UTC"});
  return dtFormat.format(new Date((s * 1000)));
}
