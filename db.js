/** Database setup for BizTime. */

const { Client } = require("pg");

const DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql://localhost/biztime_test"
    : "postgresql://egeiger:foofoo@localhost/biztime";

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;