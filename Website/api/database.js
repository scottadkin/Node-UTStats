
const mysql = require('mysql');
const config = require('./config');


const connection = mysql.createPool({
    "host": config.mysqlHost, 
    "user": config.mysqlUser ,
    "password": config.mysqlPassword, 
    "database": config.mysqlDatabase, 
    "port": config.mysqlPort
});




module.exports = connection;