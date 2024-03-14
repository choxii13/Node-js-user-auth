const session = require("express-session");
const { sessionConfig, sessionDetails } = require("./config/session-config");
const sessionStore = sessionConfig(session); // session

const express = require("express");
const path = require("path");
const db = require("./data/database");
const demoRoutes = require("./routes/demo");
const Demo = require("./model/demo-model");
const app = express(); // express

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(session(sessionDetails(sessionStore)));

app.use(demoRoutes);

app.use(function (error, req, res, next) {
  res.render("500");
});

db.connectToDatabase().then(function () {
  app.listen(3000);
});
