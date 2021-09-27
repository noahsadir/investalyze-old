var Formats = require('../libraries/Formats');
/**
 * Stores and processes historical data for a given stock.
 */
export default class HistoricalStockData {
  constructor(rawData) {
    //var points = getPoints(rawData["Time Series (Daily)"]);
    var points = getPoints(rawData.history.day);
    var dates = [];
    for (var index in points.close) {
      dates.push(points.close[index][0]);
    }

    this.dates = dates;
    this.closings = points.close;
    this.rawData = rawData;
    this.jsonData = formatDataAsJSON(rawData.history.day);
    this.csvData = formatDataAsCSV(this.jsonData);
  }

  get closingPrices() {
    return this.closings;
  }

}

/**
 * Convert JSON data into a CSV format, typically for downloading.
 *
 * @param {Object} jsonData the historical stock data in human-readable JSON format
 * @returns {string} the underlying stock data in a CSV format
 */
function formatDataAsCSV(jsonData) {
  var csvData = "";
  for (var dateKey in jsonData) {
    if (csvData == "") {
      csvData = "date,";
      for (var pointType in jsonData[dateKey]) {
        csvData += pointType + ",";
      }
    }

    var formattedDate = Formats.time(parseInt(dateKey) / 1000);
    var csvLine = formattedDate + ",";
    for (var pointType in jsonData[dateKey]) {
      csvLine += jsonData[dateKey][pointType] + ",";
    }

    csvData += "\n" + csvLine;
  }

  return csvData;
}

/**
 * Convert fetched historical data (JSON) into a more human-readable JSON format, typically for downloading.
 *
 * @param {Object} seriesData the raw historical stock data
 * @returns {Object} the historical stock data in JSON format
 */
function formatDataAsJSON(seriesData) {
  var outputData = {};

  for (var index in seriesData) {
    outputData[Date.parse(seriesData[index].date).toString()] = {
      close: seriesData[index].close,
      open: seriesData[index].open,
      high: seriesData[index].high,
      low: seriesData[index].low,
      volume: seriesData[index].volume
    };
  }

  return outputData;
}

/**
 * Converts JSON data for historical stock data into 2D arrays
 * of points for each data type.
 *
 * NOTE: This currently handles data in the format provided by
 *       Tradier. If another API is used, this code needs
 *       to be updated accordingly.
 *
 * @param {Object} seriesData the data to process
 * @returns {Object} an object containing 2D arrays for various data points.
 *         It should have the following format:
 *         {type_1: [[date_millis_1, value_1],[date_millis_2, value_2],...], type_2:...}
 */
function getPoints(seriesData) {
  var pointData = {close: [], open: [], high: [], low: [], volume: []};

  for (var index in seriesData) {
    var date = seriesData[index]["date"];
    var dateInMilliseconds = Date.parse(date); //Convert human-readable date into millis since epoch
    var closePrice = parseFloat(seriesData[index]["close"]);
    var openPrice = parseFloat(seriesData[index]["open"]);
    var highPrice = parseFloat(seriesData[index]["high"]);
    var lowPrice = parseFloat(seriesData[index]["low"]);
    var volume = parseFloat(seriesData[index]["volume"]);

    pointData.close.push([dateInMilliseconds, closePrice]);
    pointData.open.push([dateInMilliseconds, openPrice]);
    pointData.high.push([dateInMilliseconds, highPrice]);
    pointData.low.push([dateInMilliseconds, lowPrice]);
    pointData.volume.push([dateInMilliseconds, volume]);
  }

  return pointData;
}

//Deprecated code for fetching historical data using AlphaVantage.
function getPointsAlphaVantage(seriesData) {
 var pointData = {close: []};
 console.log(seriesData);
 // Go through each date in series
 for (var date in seriesData) {
   var dateInMilliseconds = Date.parse(date); //Convert human-readable date into millis since epoch
   var closePrice = parseFloat(seriesData[date]["5. adjusted close"]);

   //Append a 2-point array which can be easily displayed as a point on a table or chart
   pointData.close.push([dateInMilliseconds, closePrice]);
 }
 return pointData;
}
