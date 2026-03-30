require("dotenv").config();
postgres = require("postgres");

const url = process.env.DATABASE_URL

const sql = postgres(url);

module.exports = { sql }