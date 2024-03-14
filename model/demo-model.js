const db = require("../data/database");

class Demo {
  static async insert(data) {
    const insertedData = await db.getDb().collection("users").insertOne(data);
    return insertedData;
  }
  static async find(id) {
    const user = await db.getDb().collection("users").findOne(id);
    return user;
  }
}

module.exports = Demo;
