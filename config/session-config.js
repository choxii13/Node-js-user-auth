const mongodbStore = require("connect-mongodb-session");

function sessionConfig(session) {
  const MongoDbStore = mongodbStore(session);
  const sessionStore = new MongoDbStore({
    uri: "mongodb://localhost:27017",
    databaseName: "auth-demo",
    collections: "sessions",
  });

  return sessionStore;
}

function sessionDetails(sessionStore) {
  return {
    secret: "super-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  };
}

module.exports = { sessionConfig, sessionDetails };
