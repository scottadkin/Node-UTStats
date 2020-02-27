const Promise = require('promise');
const mysql = require('./database');
const config = require('./config');



class ACE{

    constructor(){


    }

    getRecentLogs(){

        this.currentLogs = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_ace_logs ORDER BY id DESC LIMIT "+config.maxAceLogs;

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.currentLogs = result;
                }

                resolve();

            });
        });
    }


    searchKickLogs(name, ip, mac1, mac2, hwid){

        this.currentLogs = [];

        return new Promise((resolve, reject) =>{

            const variables = [];
            const queryBits = [];


            if(name != '' && name != undefined){
                variables.push(name);
                queryBits.push('name=?');
            }

            if(ip != '' && ip != undefined){
                variables.push(ip);
                queryBits.push('ip=?');
            }

            if(mac1 != '' && mac1 != undefined){
                variables.push(" "+mac1);
                queryBits.push('mac1=?');
            }

            if(mac2 != '' && mac2 != undefined){
                variables.push(" "+mac2);
                queryBits.push('mac2=?');
            }

            if(hwid != '' && hwid != undefined){
                variables.push(hwid);
                queryBits.push('hwid=?');
            }


            let query = "SELECT * FROM nutstats_ace_logs WHERE ";

            for(let i = 0; i < queryBits.length; i++){

                query += queryBits[i];

                if(i < queryBits.length - 1){
                    query += " AND ";
                }

            }

            query += " ORDER BY ID DESC LIMIT "+config.maxAceLogs;

            if(queryBits.length == 0){
                reject("No data to search");
            }

            if(variables.length == 0){
                reject("No data to search");
            }
            console.log(query);

            mysql.query(query, variables, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.currentLogs = result;
                }

                resolve();
            });



        });

    }
}



module.exports = ACE;