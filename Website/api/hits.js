const mysql = require('./database');
const Promise = require('promise');



class Hits{


    constructor(){

    }


    bDateAlreadyExist(hour, day, month, year){

        this.bAlreadyExist = false;

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_hits WHERE hour=? AND day=? AND month=? AND year=?";

            mysql.query(query, [hour, day, month, year], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result.length > 0){

                        if(result[0].total_rows > 0){
                            this.bAlreadyExist = true;
                        }
                    }
                }

                resolve();
            });
        });

    }

    updateHits(){

        const now = new Date();

        const time = Math.floor(now.getTime() / 1000);


        const day = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const hour = now.getHours();

        return new Promise((resolve, reject) =>{

            this.bDateAlreadyExist(hour, day, month, year).then(() =>{

                if(!this.bAlreadyExist){
    
                    const query = "INSERT INTO nutstats_hits VALUES(NULL,?,?,?,?,1)";

                    mysql.query(query, [year, month, day, hour], (err) =>{

                        if(err) reject(err);

                        resolve();
                    });

                }else{

                    const query = "UPDATE nutstats_hits SET hits=hits+1 WHERE hour=? AND day=? AND month=? AND year=?";

                    mysql.query(query, [hour, day, month, year], (err) =>{

      
                        if(err) reject(err);

                        resolve();
                    });

                }
    
            }).catch((err) =>{
                console.trace(err);
                reject(err);
            });

        });

    
    }

    updatePlayerProfileViews(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_player_totals SET views=views+1 WHERE id=? LIMIT 1";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });

        });
    }


    updateMatchViews(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_match SET views=views+1 WHERE id=? LIMIT 1";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    getTotalHits(){


        this.totalHits = 0;

        return new Promise((resolve, reject) =>{

            const query = "SELECT SUM(hits) as total_hits FROM nutstats_hits";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    console.table(result);
                    this.totalHits = result[0].total_hits;
                }

                resolve();
            });

        });
    }
    
}

module.exports = Hits;