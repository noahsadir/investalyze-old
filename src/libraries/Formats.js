/**
 * Convert double into dollar amount, positive or negative.
 *
 * @param {number} val the value to convert
 * @returns {string} the value represented as a dollar amount
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
 * @param {number} s the time in seconds from epoch
 * @returns a Intl.DateTimeFormat object
 */
export function time(s) {
  const dtFormat = new Intl.DateTimeFormat('en-US', {timeZone: "UTC"});
  if (!isNaN(s)) {
    return dtFormat.format(new Date((s * 1000)));
  }
  return null;
}

/**
 * Get the time between two times.
 *
 * @param {number} firstTime the first time
 * @param {number} secondTime the second time
 * @returns {number} the time between the two times
 */
export function timeBetween(firstTime, secondTime) {
  return Math.abs(firstTime - secondTime);
}

/**
 * Convert a (likely large) dollar amount into a shorter, more easily understood value.
 * Example: 4578293619 can be expressed as $4.58B
 *
 * @param {number} rawValue the dollar value to truncate
 * @param {boolean} full indicates whether the value should be written out or expressed in a single character. Example: "Billion" vs "B"
 * @returns {string} a string representing the truncated dollar amount
 */
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
