const path = require("path");
const express = require("express");
const db = require("./data/database");
const demoRoutes = require("./routes/demo");
const session = require("express-session"); // for session na ginagamit sa web
const mongodbStore = require("connect-mongodb-session"); // connect mongodbto session
const MongoDbStore = mongodbStore(session); // connect mongodbto session
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const sessionStore = new MongoDbStore({
  uri: "mongodb://localhost:27017", // url of database
  databaseName: "auth-demo", // kung ano namne ng database kung san lalagay
  collections: "sessions", // folder name kung san lalagay
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    // dito yung isasave sa database may nakaalgay na id yung cookie at hindi yung galing sa mongodb. mismong cookie yung nakalagay
    // para sa authentication
    secret: "super-secret", // para di makaag create ng fake session yung client server
    resave: false, // maguuppdate lang to kapag nagupdate mismo yung sa database
    saveUninitialized: false, //the data will only store in the database
    store: sessionStore, // session will be stored // mongodb-connect // lahat ng ssion mapupunta sa mongodb
    // cookie: {
    //   // cookies are automatically sent by the browser
    //   // kapag di ka naglagay nito may automatic na expiration na ilalgay sa db mo
    //   // may ibang browser na nageexpire yung iba naman wala

    //   maxAge: 60 * 1000, // kung kelan mageexpire  yung sessions, milliseconds
    // },
  })
); // it will generate cookie session

app.use(async function (req, res, next) {
  // this middleware run in every other requesrt
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;

  if (!user || !isAuth) {
    return next(); // it will go to next middleware or routes.
  }
  const userDoc = db.getDb().collection("users").findOne({ _id: user.id });
  const isAdmin = userDoc.isAdmin;
  res.locals.isAuth = isAuth; // it helps to store data in global variable
  // dito  na store na yung isAuth sa res.locals
  // res.locals.isAuth // isAuth here is the varaible para maaccess mo yungdata
  res.locals.isAdmin = isAdmin; // same
  next();
});

app.use(demoRoutes);

app.use(function (error, req, res, next) {
  res.render("500");
});

db.connectToDatabase().then(function () {
  app.listen(3000);
});
