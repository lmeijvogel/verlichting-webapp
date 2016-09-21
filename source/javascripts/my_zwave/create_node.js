var post = require('./post');

module.exports = function (data) {
  var node;
  switch (data.type) {
    case 'dim':
      node = createDimmableLight(data);
      break;
    case 'switch':
      node = createSwitch(data);
      break;
    default:
      throw("Unknown node type " + data.type + ", nodeId: " + data.node_id);
      break;
  }

  var nodeId = data.node_id;
  var type = data.type;
  var value = node.sanitizeValue(data.value);

  var changeHandler = function () { };

  function getValue() {
    return value;
  }

  function setValue(newValue) {
    var promise = node.postValue(newValue);

    return promise.then(function () {
      value = node.sanitizeValue(newValue);

      changeHandler(value);
      return value;
    });
  }

  function onChange(handler) {
    changeHandler = handler;
  }

  function setUnknown() {
    value = '?';
    changeHandler('?');
  }

  function createDimmableLight(data) {
    function sanitizeValue(newValue) {
      return parseInt(newValue, 10);
    }

    function postValue(newValue) {
      return post('/my_zwave/light/' + nodeId + '/level/' + newValue);
    }

    return {
      sanitizeValue: sanitizeValue,
      postValue: postValue,
    };
  }

  function createSwitch(data) {
    function sanitizeValue(newValue) {
      return newValue.toString() === 'true';
    }

    function postValue(newValue) {
      var onOff = newValue ? 'on' : 'off';

      return post('/my_zwave/light/' + nodeId + '/switch/' + onOff);
    }

    return {
      sanitizeValue: sanitizeValue,
      postValue: postValue,
    };
  };


  return {
    getValue: getValue,
    type: type,
    nodeId: nodeId,
    setValue: setValue,
    setUnknown: setUnknown,
    onChange: onChange
  };
}
