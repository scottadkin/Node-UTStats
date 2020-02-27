const mysql = require('mysql');
const config = require('./config');


const con = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port
});

module.exports = con;