module.exports = function () {
  function fromServer(value, node) {
    if (node.type == 'switch') {
      switch (value) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        return value;
      }
    } else if (node.type == 'dim') {
      return parseInt(value, 10);
    } else {
      throw 'Unknown node type';
    }
  }

  function toServer(value, node) {
    if (node.type == 'switch') {
      if (value) {
        return 'on';
      } else {
        return 'off';
      }
    } else if (node.type == 'dim') {
      return value.toString();
    } else {
      throw 'Unknown node type';
    }
  }

  return {
    fromServer: fromServer,
    toServer: toServer
  };
};
