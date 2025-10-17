// Simple AJAX utility used by the starter files
(function (global) {
  var ajaxUtils = {};

  // Returns an HTTP request object
  function getRequestObject() {
    if (window.XMLHttpRequest) {
      return new XMLHttpRequest();
    } else {
      // IE fallback
      return new ActiveXObject("Microsoft.XMLHTTP");
    }
  }

  // Makes an AJAX GET request to 'requestUrl'
  // If 'responseJson' is true the responseText will be parsed as JSON
  ajaxUtils.sendGetRequest = function (requestUrl, responseHandler, responseJson) {
    var request = getRequestObject();
    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
        if (responseJson === true) {
          responseHandler(JSON.parse(request.responseText));
        } else {
          responseHandler(request.responseText);
        }
      } else if (request.readyState === 4) {
        console.error("AJAX error: status " + request.status);
      }
    };
    request.open("GET", requestUrl, true);
    request.send(null);
  };

  global.$ajaxUtils = ajaxUtils;
})(window);
