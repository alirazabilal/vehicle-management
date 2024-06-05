const sql_connecting = require("mysql2");

const configuring = {
  host: "localhost",
  user: "root",
  password: "ali123",
  database: "vehicles",
  authPlugin: "ali123",
};

const connectdb = sql_connecting.createConnection(configuring);

connectdb.connect((err) => {
  if (err) {
    console.error("NO DATABASE LINKING " + err.stack);
    return;
  }
  console.log("CONNECTION SUCCESS WITH DB AND ID IS : " + connectdb.threadId);
});

module.exports = connectdb;
