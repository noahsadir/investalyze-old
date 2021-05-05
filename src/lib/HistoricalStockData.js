export default class HistoricalStockData {
  constructor(rawData) {
    var points = getPoints(rawData["Time Series (Daily)"]);
    this.closings = points.close;
  }

  get closingPrices() {
    return this.closings;
  }

}

/**
 * Converts JSON data for historical stock data into 2D arrays
 * of points for each data type.
 *
 * NOTE: This currently handles data in the format provided by
 *       AlphaVantage. If another API is used, this code needs
 *       to be updated accordingly.
 *
 * @param seriesData the data to process
 * @return an object containing 2D arrays for various data points.
 *         It should have the following format:
 *         {@code {type_1: [[date_millis_1, value_1],[date_millis_2, value_2],...], type_2:...}}
 */
function getPoints(seriesData) {
  var pointData = {close: []};
  
  // Go through each date in series
  for (var date in seriesData) {
    var dateInMilliseconds = Date.parse(date); //Convert human-readable date into millis since epoch
    var closePrice = parseFloat(seriesData[date]["5. adjusted close"]);

    //Append a 2-point array which can be easily displayed as a point on a table or chart
    pointData.close.push([dateInMilliseconds, closePrice]);
  }
  return pointData;
}
