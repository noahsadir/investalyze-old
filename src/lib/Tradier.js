export function formatSingleExpirationChain(rawData, dateMillis) {

  //If data is valid, convert chain into processable format
  if (rawData.options != null && rawData.options.option) {
    var optionsArray = rawData.options.option;
    var formattedData = {calls: [], puts: []};

    //Go through each option item
    for (var index in optionsArray) {
      var optionObject = optionsArray[index];

      //Cast values into recognizable format recognized by SingleOption
      var newObject = {
        id: optionObject.symbol,
        strike: optionObject.strike,
        date: dateMillis,
        bid: optionObject.bid,
        ask: optionObject.ask,
        last_price: optionObject.last,
        last_trade: optionObject.trade_date,
        price_change: optionObject.change,
        percent_change: optionObject.change_percentage,
        volume: optionObject.volume,
        open_interest: optionObject.open_interest,
      };

      //Get the option type and place into appropriate array
      var type = optionObject.option_type;
      if (type == "call") {
        formattedData.calls.push(newObject);
      } else if (type == "put") {
        formattedData.puts.push(newObject);
      }
    }
    return formattedData;
  }
  return null;
}
