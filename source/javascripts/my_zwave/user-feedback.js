var userFeedback = function (element) {
  var messages   = [];
  var displaying = false;

  function addMessage(message) {
    messages.push(message);

    startDisplaying();
  }

  function startDisplaying() {
    if (displaying) {
      return;
    }

    displaying = true;

    showNextMessage();
  }

  function stopDisplaying() {
    displaying = false;
  }

  function showNextMessage() {
    var message = messages.shift();

    if (message) {
      showMessageAndScheduleNext(message);
    } else {
      stopDisplaying();
    }
  }

  function showMessageAndScheduleNext(message) {
    element.MaterialSnackbar.showSnackbar({
      message: message,
      timeout: 3000
    });

    setTimeout(showNextMessage, 3000);
  }

  return {
    addMessage: addMessage
  };
};

module.exports = userFeedback;
