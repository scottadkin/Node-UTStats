const mysql = require("./database");
const Promise = require("promise");


class CTF{


    constructor(matchId){


        this.matchId = parseInt(matchId);
        this.flagCaptures = [];
    }


    getFlagEvents(){


       // matchId = parseInt(matchId);

        return new Promise((resolve, reject) =>{


            const query = "SELECT * FROM nutstats_flag_events WHERE match_id=? ORDER BY id ASC";

            mysql.query(query, [this.matchId], (err, result) =>{

                if(err) reject(err);

                this.flagEvents = result;


                resolve();
            });
        });
    }


    getFlagCaptures(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_flag_captures WHERE match_id=? ORDER BY grab_time ASC";


            mysql.query(query, [this.matchId], (err, result) =>{

                if(err) reject(err);

                this.flagCaptures = result;

                resolve();

            });
        });
    }


    deleteFlagCaptures(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_flag_captures WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }

    deleteFlagEvents(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_flag_events WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
                
            });
        });
    }

    async deleteMatchData(id){

        id = parseInt(id);

       // console.log("CTF.deleteMatchData("+id+")");

        await this.deleteFlagCaptures(id);
        await this.deleteFlagEvents(id);

    }

    getAdvancedFlagKills(){

        this.advancedFlagKills = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_flag_kills WHERE match_id=? ORDER BY time ASC";

            mysql.query(query, [this.matchId], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.advancedFlagKills = result;
                }
                
                resolve();
            });
        });
    }
}




module.exports = CTF;