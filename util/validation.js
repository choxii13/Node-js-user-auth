function validation(email, password, confirmEmail) {
  return (
    confirmEmail &&
    password &&
    password.trim() > 6 &&
    email === confirmEmail &&
    email.includes("@")
  );
}

module.exports = validation;
