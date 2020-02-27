const mysql = require('./database');
const Promise = require('promise');

class PickUps{

    constructor(){

    }

    getMatchPickUps(id){


        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            this.matchPickups = [];

            const query = "SELECT player,time,type FROM nutstats_pickups WHERE match_id=? ORDER BY id ASC";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.matchPickups = result;
                }

               // console.table(this.matchPickups);

                resolve();
            });

        });
    }

}


module.exports = PickUps;