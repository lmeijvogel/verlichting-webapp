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
    hideMessage();
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
    element.text(message).slideDown();

    setTimeout(hideAndShowNextMessage, 3000);
  }

  function hideAndShowNextMessage() {
    return hideMessage().then(function () {
      showNextMessage();
    });
  }

  function hideMessage() {
    return element.slideUp().promise().then(function () {
      element.text('');
    });
  }

  return {
    addMessage: addMessage
  };
};

module.exports = userFeedback;
