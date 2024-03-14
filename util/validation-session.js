function validationSession(req) {
  let sessionInputData = req.session.inputData;
  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: "",
      confirmEmail: "",
      password: "",
    };
  }
  req.session.inputData = null;
  return sessionInputData;
}

function flashErrorsToSession(req, res, errors, redirectTo) {
  req.session.inputData = {
    hasError: true,
    ...errors,
  };
  req.session.save(function () {
    return res.redirect(redirectTo);
  });
}

module.exports = { validationSession, flashErrorsToSession };
