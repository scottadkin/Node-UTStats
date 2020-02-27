const mysql = require('./database');
const Promise = require('promise');




class Weapons{


    constructor(){

    }


    getWeaponNames(data){

        this.weapons = [];

        return new Promise((resolve, reject) =>{


            let ids = [];


            for(let i = 0; i < data.length; i++){

                if(ids.indexOf(data[i].weapon_id) == -1){
                    ids.push(data[i].weapon_id);
                }
            }

            //console.log(ids);

            const query = "SELECT * FROM nutstats_weapons WHERE id IN(?)";

            if(ids.length == 0){
                resolve();
            }

            mysql.query(query, [ids], (err, result) =>{
                if(err) reject(err);

                this.weapons = result;


                resolve();
            });
        });

    }

    getWeaponMatchStats(matchId){

        matchId = parseInt(matchId);

        this.matchData = [];

        return new Promise((resolve, reject) =>{

            if(matchId !== matchId){
                reject("Matchid must be an integer");
            }

            const query = "SELECT * FROM nutstats_weapons_stats WHERE match_id=? ORDER BY kills DESC";

            mysql.query(query, [matchId], (err, result) =>{
                if(err) reject(err);

                this.matchData = result;

                this.getWeaponNames(this.matchData).then(() =>{

                    resolve();
                }).catch((message) =>{

                    reject("Failed to get weapon names ("+message+")");
                });
                

            });
        });
    }


    getPlayerWeaponStats(id){

        id = parseInt(id);

        this.playerWeaponStats = [];
        
        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_weapons_stats_total WHERE player_id=? ORDER BY kills DESC";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);


                this.playerWeaponStats = result; 
                resolve();
            });
        });
    }


    getAllWeapons(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,img FROM nutstats_weapons";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                this.weapons = result;

                resolve();
            });
        });
    }


    mergeStats(master, potato){

        master = parseInt(master);
        potato = parseInt(potato);
        

        //weapon stats to create if there wasnt data to merge
        this.toCreate = [];


            //console.log(this.currentPlayers);

            const promises = [];

            let d = 0;

            for(let i = 0; i < this.currentPlayers.length; i++){

                d = this.currentPlayers[i];

                promises.push(new Promise((resolve, reject) =>{

                    const query = "UPDATE nutstats_weapons_stats_total SET shots=shots+?, hits=hits+?, kills=kills+?, damage=damage+?, player_id = ? WHERE player_id = ? AND weapon_id= ?";

                    mysql.query(query, [d.shots, d.hits, d.kills, d.damage, master, potato, d.weapon_id], (err, result) =>{

                        if(err) reject(err);

                        //console.log(result);
                       
                        //console.log(result.affectedRows);
                        if(result.affectedRows == 0){

                            //console.log("NO ROWS CHANGED");
                            this.toCreate.push(this.currentPlayers[i]);
                        }else{
                            //console.log("ROWWWW CHANGED");
                        }

                        resolve();
                    });
                }));

            }


            return Promise.all(promises);

    }


    createNewStats(master){

        const promises = [];


        let d = 0;

        for(let i = 0; i < this.toCreate.length; i++){

            d = this.toCreate[i];

            promises.push(new Promise((resolve, reject) =>{

                const query = "INSERT INTO nutstats_weapons_stats_total VALUES(NULL,?,?,?,?,?,?)";

                if(d.player_id != master){

                    mysql.query(query, [master, d.weapon_id, d.shots, d.hits, d.kills, d.damage], (err) =>{

                        if(err) reject(err);

                        resolve();
                    });

                }else{
                    //console.log("CANT MERGE WITH SELF");
                    resolve();
                }
            }));
        }

        return Promise.all(promises);
    }


    mergePlayers(master, potato){

        return this.getPlayersToMerge(master, potato).then(() =>{

     
                return this.mergeStats(master, potato);
            
            
        }).then(() =>{

           // console.log(this.toCreate);
     
                return this.createNewStats(master);
            
            
        });

    }


    getPlayersToMerge(master, potato){


        this.currentPlayers = [];

        return new Promise((resolve, reject) =>{

            if(master != master){
                reject("master player is NaN");
            }

            if(potato != potato){
                reject("potato player is NaN");
            }

            const query = "SELECT * FROM nutstats_weapons_stats_total WHERE player_id IN (?)";

            const ids = [master, potato];

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                //onsole.log(result);

                if(result != undefined){
                    this.currentPlayers = result;
                }
                resolve();
            });
        });
    }


    deletePlayer(player){

        player = parseInt(player);

        return new Promise((resolve, reject) =>{


            const query = "DELETE FROM nutstats_weapons_stats_total WHERE player_id=?";

            mysql.query(query, [player], (err) =>{

                if(err) reject(err);
                //console.log("deleted player weapons");
                resolve();
            }); 
        });
    }


    getPlayerTotalStats(ids){

        return new Promise((resolve, reject) =>{


            this.playerTotals = [];

            const query = "SELECT * FROM nutstats_weapons_stats_total WHERE player_id in(?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.playerTotals = result;

                   // console.table(result);
                }

                resolve();
            });
        });
    }
}




module.exports = Weapons;