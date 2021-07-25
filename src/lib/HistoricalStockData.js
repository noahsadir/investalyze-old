var Formats = require('./Formats');
export default class HistoricalStockData {
  constructor(rawData) {
    var points = getPoints(rawData["Time Series (Daily)"]);
    var dates = [];
    for (var index in points.close) {
      dates.push(points.close[index][0]);
    }

    this.dates = dates;
    this.closings = points.close;
    this.rawData = rawData;
    this.jsonData = formatDataAsJSON(this.dates, this.closings);
    this.csvData = formatDataAsCSV(this.jsonData);
  }

  get closingPrices() {
    return this.closings;
  }

}

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

function formatDataAsJSON(dates, closings) {
  var outputData = {};
  for (var dateIndex in dates) {
    var dateValue = dates[dateIndex];
    outputData[dateValue.toString()] = {};
  }

  for (var index in closings) {
    var closePoint = closings[index];
    if (outputData[closePoint[0].toString()] != null) {
      outputData[closePoint[0].toString()].close = closePoint[1];
    }
  }

  return outputData;
}

/**
 * Converts JSON data for historical stock data into 2D arrays
 * of points for each data type.
 *
 * NOTE: This currently handles data in the format provided by
 *       AlphaVantage. If another API is used, this code needs
 *       to be updated accordingly.
 *
 * @param {Object} seriesData the data to process
 * @returns {Object} an object containing 2D arrays for various data points.
 *         It should have the following format:
 *         {type_1: [[date_millis_1, value_1],[date_millis_2, value_2],...], type_2:...}
 */
function getPoints(seriesData) {
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
