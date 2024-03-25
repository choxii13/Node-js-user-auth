const Demo = require("../model/demo-model");

async function guardRoutes(req, res, next) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;
  if (!user || !isAuth) {
    return next();
  }
  const userDoc = await Demo.find({ email: user.email }); // find user
  const isAdmin = userDoc.isAdmin;
  res.locals.isAuth = isAuth;
  res.locals.isAdmin = isAdmin;
  console.log()
  next();
}

module.exports = guardRoutes;
