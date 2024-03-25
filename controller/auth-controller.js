const Demo = require("../model/demo-model");
const bcrypt = require("bcryptjs");
const validation = require("../util/validation");
const {
  validationSession,
  flashErrorsToSession,
} = require("../util/validation-session");

function getSignUp(req, res) {
  const sessionInputData = validationSession(req);
  res.render("signup", { inputData: sessionInputData });
}

async function postSignUp(req, res) {
  const { email, password } = req.body;
  const confirmEmail = req.body["confirm-email"];
  const inputData = { email, password, confirmEmail };

  if (!validation(email, password, confirmEmail)) {
    flashErrorsToSession(
      req,
      res,
      {
        message: "Invalid input - please check your data",
        ...inputData,
      },
      "/signup"
    );
    return;
  }

  const existingUser = await Demo.find({ email: email });

  // user exists
  if (existingUser) {
    flashErrorsToSession(
      req,
      res,
      {
        message: "User Exists Already",
        ...inputData,
      },
      "/signup"
    );
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await Demo.insert({
    email: email,
    password: hashedPassword,
  }); // insert data to database

  res.redirect("/login");
}

function getLogin(req, res) {
  const sessionInputData = validationSession(req);
  res.render("login", { inputData: sessionInputData });
}

async function postLogin(req, res) {
  const { email, password } = req.body;
  const inputData = { email, password };
  const existingUser = await Demo.find({ email: email });
  if (!existingUser) {
    flashErrorsToSession(
      req,
      res,
      {
        message: "User does not exists",
        ...inputData,
      },
      "/login"
    );
    return;
  }

  const passwordsAreEqual = await bcrypt.compare(
    password,
    existingUser.password
  );

  if (!passwordsAreEqual) {
    return res.redirect("/login");
  }

  req.session.isAuthenticated = true;
  req.session.user = { email: existingUser.email };
  //   req.session.user = { email: existingUser.email,  id: existingUser._id }  not working why??
  req.session.save(function () {
    res.redirect("/profile");
  });
}

function postLogOut(req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect("/signup");
}

module.exports = { getSignUp, postSignUp, getLogin, postLogin, postLogOut };
