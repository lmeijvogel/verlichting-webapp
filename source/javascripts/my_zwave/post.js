module.exports = function (url, data) {
  return new Promise(function (resolve, reject) {
    var request = new window.XMLHttpRequest();

    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var result = request.responseText;

        resolve(result);
      } else {
        reject(request);
      }
    };

    request.onerror = function () {
      reject();
    };

    request.send(JSON.stringify(data));
  });
};
