require('dotenv').config()

const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host:process.env.host,
    user:process.env.user,
    password:process.env.password,
    database:process.env.database,
    connectionLimit:10
})


module.exports = mysqlConnection;

