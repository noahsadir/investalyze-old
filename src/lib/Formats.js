/**
 * Convert double into dollar amount, positive or negative.
 *
 * @param val the value to convert
 * @return the value represented as a dollar amount
 */
export function convertToMoneyValue(val){
  if (val < 0){
    return "-$" + Math.abs(val).toFixed(2);
  }else{
    return "$" + Math.abs(val).toFixed(2);
  }
}

export function percentChange(initialVal, newVal) {
  return ((newVal / initialVal) - 1) * 100;
}

/**
 * Convert time in seconds to formatted date.
 *
 * @param s the time in seconds from epoch
 * @return a Intl.DateTimeFormat object
 */
export function time(s) {
  const dtFormat = new Intl.DateTimeFormat('en-US', {timeZone: "UTC"});
  return dtFormat.format(new Date((s * 1000)));
}

export function timeBetween(firstTime, secondTime) {
  return Math.abs(firstTime - secondTime);
}

export function convertToTruncatedMoneyValue(rawValue, full){
  var ending = "";
  var object = rawValue;
  if (object > 100000 && object < 1000000){
    object /= 1000;
    ending = full ? " Thousand" : "K";
  }else if (object > 1000000 && object < 1000000000){
    object /= 1000000;
    ending = full ? " Million" : "M";
  }else if (object > 1000000000 && object < 1000000000000){
    object /= 1000000000;
    ending = full ? " Billion" : "B";
  }else if (object > 1000000000000){
    object /= 1000000000000;
    ending = full ? " Trillion" : "T";
  }

  if (object < 0){
    return "-$" + Math.abs(object).toFixed(ending === "" ? 2 : 1) + ending;
  }else{
    return "$" + Math.abs(object).toFixed(ending === "" ? 2 : 1) + ending;
  }
}
