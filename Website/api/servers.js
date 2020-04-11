const mysql = require('./database');
const config = require('./config');
const Promise = require('promise');


class Servers{

    constructor(){

        this.data = [];

    }

    getAllServers(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_servers ORDER BY last DESC";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                this.data = result;

                //console.table(result);

                resolve();
            });
        });
    }


    getServerId(name){

        this.serverId = -1;

        return new Promise((resolve, reject) =>{

            const query = "SELECT id FROM nutstats_servers WHERE server_name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result.length > 0){
                        this.serverId = result[0].id;
                    }
                }

                resolve();
            });
        });
    }

    reduceTotals(id, playtime){

       // id = parseInt(id);
        //playtime = parseFloat(playtime);

        return new Promise((resolve, reject) =>{

            if(id == undefined){
                resolve();
            }

            if(playtime == undefined){
                resolve();
            }
            const query = "UPDATE nutstats_servers SET matches=matches-1, playtime=playtime-? WHERE id=?";

            mysql.query(query, [playtime, id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });

    }

    getQueryServersPlayers(){


        return new Promise((resolve, reject) =>{

            this.queryPlayers = [];

            const query = "SELECT * FROM nutstats_server_query_players";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.queryPlayers = result;
                }
                resolve();
            });
        });
    }

    getQueryServers(){


        return new Promise((resolve, reject) =>{

            this.queryServers = [];
            this.mapNames = [];

            let serverNames = [];

            let query = "SELECT * FROM nutstats_server_query_servers WHERE max_players>0 ORDER BY current_players DESC, max_players DESC";

            if(arguments.length == 1){
                query = "SELECT * FROM nutstats_server_query_servers ORDER BY current_players DESC";
            }

            mysql.query(query, (err, result) =>{

                if(err) reject(err);


                if(result != undefined){
                  //  this.queryServers = result;

                  //console.table(result);

                    for(let i = 0; i < result.length; i++){

                        
                        if(serverNames.indexOf(result[i].name) == -1){
                            serverNames.push(result[i].name);

                            this.queryServers.push(result[i]);

                        }
                        if(result[i].map != undefined){
                            //console.log(result[i].map.toLowerCase());                 
                            
                            this.mapNames.push({"name": result[i].map.toLowerCase()});
                        }


                    }
                }

                //console.table(this.mapNames);

                resolve();
            });
        });
    }



    addServer(ip, port, hostname){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_server_query_servers VALUES(NULL,'',?,?,?,'',0,0,0)";

            mysql.query(query, [ip, port, hostname], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deleteServer(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_server_query_servers WHERE id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

}


module.exports = Servers;