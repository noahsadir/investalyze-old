var cookie = {};
var shouldSave = true;

checkAndLoad(true);
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

export function save(){
  document.cookie = "data=" + JSON.stringify(cookie) + ";";
  checkAndLoad(true);
}

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

export function setPref(key, value) {
  if (cookie.preferences == null) {
    cookie.preferences = {};
  }

  cookie.preferences[key] = value;
  save();

  return value;
}

export function get(key, defaultVal) {
  if (getPref(key) && cookie[key] != null) {
    return cookie[key];
  }
  return defaultVal;
}

export function set(key, value) {
  if (getPref(key)) {
    cookie[key] = value;
    save();
  }
}

export function raw() {
  return cookie;
}
