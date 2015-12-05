module.exports = function (noticeElement, errorElement) {
  function setError(error) {
    errorElement.text(error).slideDown();
  }

  function setNotice(notice) {
    noticeElement.text(notice).slideDown();
  }

  function clearError() {
    errorElement.slideUp().text('');
  }

  function clearNotice() {
    noticeElement.slideUp().text('');
  }

  return {
    setError:    setError,
    clearError:  clearError,
    setNotice:   setNotice,
    clearNotice: clearNotice
  };
};
