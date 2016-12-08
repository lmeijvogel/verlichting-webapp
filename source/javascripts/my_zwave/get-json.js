module.exports = function (url) {
  return new Promise(function (resolve, reject) {
    var request = new window.XMLHttpRequest();

    request.open('GET', url, true);

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);

        resolve(data);
      } else {
        reject(request);
      }
    };

    request.onerror = function () {
      reject();
    };

    request.send();
  });
};
