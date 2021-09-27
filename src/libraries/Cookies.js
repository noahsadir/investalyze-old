var cookie = {};
var shouldSave = true;

checkAndLoad(true);
/**
 * Load cookie and attempt to parse data.
 *
 * @param {boolean} repeatOnError indicates whether function should call itself again if the operation fails
 */
function checkAndLoad(repeatOnError){
  if (document.cookie != null){
    if (document.cookie.split("data=").length >= 2){
      try{
        cookie = JSON.parse(getRawItem("data"));
      }catch{
        console.log("Error parsing JSON");
        document.cookie = "data={};";
        cookie = {preferences: {}};
        if (repeatOnError){
          checkAndLoad(false);
        }
      }
      //console.log(cookie);
    }
  }else{
    console.log("cookie is null");
  }
}

/**
 * Save cookie and reload
 */
export function save(){
  document.cookie = "data=" + JSON.stringify(cookie) + ";";
  checkAndLoad(true);
}

/**
 * Get value for cookie with specified key.
 * NOTE: get(key) function retrieves value at key from the JSON object stored in "data" cookie.
 *       This function returns the actual value of the cookie.
 *
 * @param {string} key the identifier of the cookie
 * @returns {string} the value of the cookie
 */
export function getRawItem(key){
  var splitCookie = document.cookie.split(";");
  for (var cookieIndex in splitCookie){
    var cookieVal = splitCookie[cookieIndex].split(key + "=");
    if (cookieVal.length === 2){
      return cookieVal[1];
    }
  }
  return "";
}

/**
 * Get storage preference. Important for privacy reasons and GDPR compliance.
 * If false, DO NOT STORE COOKIE!
 *
 * @param {string} key the key of the property to get preference for
 * @returns {boolean} a boolean indicating whether or not the value should be stored.
 */
export function getPref(key) {
  if (cookie.preferences == null) {
    cookie.preferences = {};
    save();
  }

  if (cookie.preferences[key] != null) {
    return cookie.preferences[key];
  }

  return null;
}

/**
 * Set cookie storage preference.
 *
 * @param {string} key the key of the property in "data" object
 * @param {boolean} value the storage preference for the specified property
 * @returns {boolean} the stored preference
 */
export function setPref(key, value) {
  if (cookie.preferences == null) {
    cookie.preferences = {};
  }

  cookie.preferences[key] = value;
  save();

  return value;
}

/**
 * Retrieve stored value for key.
 *
 * @param {string} key the key of the property in "data" object
 * @param defaultVal the default value which is returned if the property does not exist or storage is not permitted.
 * @returns either the stored value or the default value
 */
export function get(key, defaultVal) {
  if (getPref(key) && cookie[key] != null) {
    return cookie[key];
  }
  return defaultVal;
}

/**
 * Save stored value for key.
 *
 * @param {string} key the key of the property in "data" object
 * @param value the value to store for the property IF storage is permitted. If not, save request is ignored.
 */
export function set(key, value) {
  if (getPref(key)) {
    cookie[key] = value;
    save();
  }
}

/**
 * Get raw string value of entire cookie.
 *
 * @returns {string} the cookie value
 */
export function raw() {
  return cookie;
}
