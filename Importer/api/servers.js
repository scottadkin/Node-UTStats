const mysql = require('./database');
const Promise = require('promise');


class Servers{

    constructor(){

        this.previousData = -1;
    }


    getPreviousStats(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_servers WHERE server_name=?";

            mysql.query(query, [this.name], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result.length > 0){
                        this.previousData = result;
                    }
                }

                resolve();

            });
        });
    }


    createNewServerStats(){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_servers VALUES(NULL,?,?,?,?,?,?,?)";

            mysql.query(query, [this.name, this.ip, this.port, this.date, this.date, 1, this.playtime], (err) =>{

                if(err) reject(err);
                console.log(err);

                resolve();

            });
        });
    }


    updateServer(){


        return new Promise((resolve, reject) =>{

            if(this.previousData == -1){

                const query = "INSERT INTO nutstats_servers VALUES(NULL,?,?,?,?,?,?,?)";

                mysql.query(query, [this.name, this.ip, this.port, this.date, this.date, 1, this.playtime], (err) =>{

                    if(err) reject(err);
                    console.log(err);

                    resolve();

                });

            }else{

                const query = "UPDATE nutstats_servers SET last=?, matches=matches+1, playtime=playtime+? WHERE server_name=?";

                mysql.query(query, [this.date, this.playtime, this.name], (err) =>{

                    if(err) reject(err);

                    resolve();
                });


            }

        });
    }

    async init(name, ip, port, date, playtime){

        this.name = name;
        this.ip = ip;
        this.port = port;
        this.date = date;
        this.playtime = playtime;

        await this.getPreviousStats();
        await this.updateServer();

    }
}


module.exports = Servers;