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
