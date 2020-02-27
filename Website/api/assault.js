const mysql = require('./database');
const Promise = require('promise');




class Assault{

    constructor(matchId, mapId){

        this.matchId = parseInt(matchId);
        this.mapId = parseInt(mapId);
    }


    getData(){

        return new Promise((resolve, reject) =>{

            this.getAttackingTeam().then(() =>{

                this.getObjectiveNames().then(() =>{

                    this.getEvents().then(() =>{

                        resolve();
                    }).catch(() =>{

                        reject("Failed to get events");
                    });
                    
                }).catch(() =>{

                    reject("Failed to get objective names");
                });

            }).catch(() =>{
                reject("Failed to get attacking team");
            });
        });
    }


    getEvents(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_assault_events WHERE match_id=? ORDER BY time ASC";


            mysql.query(query, [this.matchId], (err, result) =>{

                if(err) reject(err);

                this.events = result;

                resolve();
            });
        });
    }


    getObjectiveNames(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,obj_id,obj_name FROM nutstats_assault_objectives WHERE map_id=?";


            mysql.query(query, [this.mapId], (err, result) =>{

                if(err) reject(err);

                this.objNames = result;
                resolve();
            });
        });
    }

    getAttackingTeam(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT attacking_team FROM nutstats_assault WHERE match_id=?";

            mysql.query(query, [this.matchId], (err, result) =>{
                if(err) reject(err);

                this.attackingTeam = result[0].attacking_team;

                resolve();
            }); 
        });
    }
}



module.exports = Assault;