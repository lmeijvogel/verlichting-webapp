var post = require('./post');

module.exports = function (data) {
  var nodeId = data.node_id;
  var type  = data.type;
  var value = sanitizeValue(data.value);

  function getValue() {
    return value;
  }

  function sanitizeValue(value) {
    if (type === 'dim') {
      return parseInt(value, 10);
    } else {
      return value.toString() === 'true';
    }
  }

  function updateValue(newValue) {
    var promise;

    if (type === 'dim') {
      promise = post('/my_zwave/light/' + nodeId + '/level/' + newValue);
    } else {
      var onOff = newValue ? 'on' : 'off';

      promise = post('/my_zwave/light/' + nodeId + '/switch/' + onOff);
    }

    return promise.then(function () {
      value = sanitizeValue(newValue);

      return value;
    });
  }

  return {
    getValue: getValue,
    type: type,
    nodeId: nodeId,
    updateValue: updateValue
  };
};
