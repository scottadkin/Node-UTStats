const mysql = require('./database');
const Promise = require('promise');
const Maps = require('./maps');
const config = require('./config');


class Bunnytrack{


    constructor(){

        this.data = [];
        this.mapNames = [];

        this.maps = [];

        this.mapIds = [];
        this.playerIds = [];

    }


    updateMapIds(id){

        if(this.mapIds.indexOf(id) == -1){
            this.mapIds.push(id);
            this.maps.push({"id": id, "value": 1});
            return;
        }

        this.maps[this.mapIds.indexOf(id)].value++;

    }

    updatePlayerIds(id){
       
        if(this.playerIds.indexOf(id) == -1){

            this.playerIds.push(id);
        }
    }

    getRecentTimes(){

        this.recentTimes = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_bunnytrack_caps ORDER BY date DESC LIMIT ?";

            mysql.query(query, [config.btRecentTimes], (err, result) =>{

                if(err) reject(err);

                this.recentTimes = result;


                for(let i = 0; i < result.length; i++){

                    this.updateMapIds(result[i].map_id);

                    this.updatePlayerIds(result[i].player_id);

                }

                resolve();

            });


        });
    }

    
    getRecentRecords(){


        this.recentRecords = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_bunnytrack_records ORDER BY date DESC LIMIT ?";

            mysql.query(query, [config.btRecentRecords], (err, result) =>{

                if(err) reject(err);

                this.recentRecords = result;

                for(let i = 0; i < result.length; i++){

                    this.updateMapIds(result[i].map_id);
                    this.updatePlayerIds(result[i].player_id);
                    
                }

                resolve();
            });
        });
    }

    
    getRecordStats(){

        this.totalRecords = [];
        
        const update = (id) =>{

            //let d = 0;

            for(let i = 0; i < this.totalRecords.length; i++){

               // ..d = this.totalRecords[i];

                if(this.totalRecords[i].id == id){
                    this.totalRecords[i].value++;
                    return;
                }
            }

            this.totalRecords.push({"id":id,"value":1});
        }

        return new Promise((resolve, reject) =>{

            const query = "SELECT player_id,map_id FROM nutstats_bunnytrack_records";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                for(let i = 0; i < result.length; i++){

                    update(result[i].player_id);

                    this.updateMapIds(result[i].map_id);
                    this.updatePlayerIds(result[i].player_id);
                }

                resolve();
            });


        });
    }

    getSummary(){
        
        this.summary = {"id":-1,"name":"","matches":0,"total_time":0,"last":0};

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_gametype WHERE name='Bunnytrack'";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result.length > 0){
                    this.summary = result[0];
                }

                resolve();

            });
        });
    }

    getAllRecords(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_bunnytrack_records";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                for(let i = 0; i < result.length; i++){

                    this.updateMapIds(result[i].map_id);
                    this.updatePlayerIds(result[i].player_id);
                }

                this.data = result;

                resolve();
            });
        });
    }



    getRecent(page){

        return new Promise((resolve, reject) =>{

            page--;

            const query = "SELECT * FROM nutstats_bunnytrack_caps ORDER BY date DESC LIMIT ?, ?";

            const start = config.btTimesPerPage * page;

            mysql.query(query, [start, config.btTimesPerPage], (err, result) =>{

                if(err) reject(err);

                this.data = result;

                for(let i = 0; i < result.length; i++){

                    this.updateMapIds(result[i].map_id);
                    this.updatePlayerIds(result[i].player_id);
                }

                resolve();

            });
        });
    }


    getTotalResults(){

        return new Promise((resolve, reject) =>{

            this.totalResults = 0;

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_bunnytrack_caps";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                this.totalResults = result[0].total_rows;
                
                resolve();
            });

        });
    }


    getMatchCaps(id){

        id = parseInt(id);

        this.matchCaps = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_bunnytrack_caps WHERE match_id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    if(result.length > 0){
                        this.matchCaps = result;
                    }
                }

              //  console.log(this.matchCaps);

                resolve();
            });
        });
    }

    getMapRecord(id){


        id = parseInt(id);

        this.mapRecord = [];


        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_bunnytrack_records WHERE map_id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    if(result.length > 0){
                        this.mapRecord = result;
                    }
                }

                resolve();
            });
        });
    }

    getPlayerRecords(mapId, players){

        mapId = parseInt(mapId);

        const ids = [];

        for(let i = 0; i < players.length; i++){

            if(ids.indexOf(players[i].id) == -1){

                ids.push(players[i].id);
            }
        }


        this.playerRecords = [];

        return new Promise((resolve, reject) =>{

            if(ids.length == 0){
                resolve();
            }

            const query = "SELECT * FROM nutstats_bunnytrack_player_records WHERE map_id=? AND player_id IN(?)";


            mysql.query(query, [mapId, ids], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result.length > 0){
                        this.playerRecords = result;
                    }

                }

                resolve();
            });
        });
    }


    getRecordHolder(){

        this.recordPlayer = [];

        return new Promise((resolve, reject) =>{

            if(this.mapRecord.length == 0){

                resolve();

            }else{

                const query = "SELECT * FROM nutstats_player_totals WHERE id=?";

                mysql.query(query, [this.mapRecord[0].player_id], (err, result) =>{

                    if(err) reject(err);

                    if(result != undefined){
                        if(result.length > 0){
                            
                            this.recordPlayer = result[0];
                        }
                    }
                    resolve();
                });

            }

        });
    }

    deleteMatchCaps(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_bunnytrack_caps WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }

    deleteMatchPlayerRecords(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_bunnytrack_player_records WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
                
            });
        });
    }

    deleteMatchRecords(id){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_bunnytrack_records WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
                
            });
        });
    }

    deleteMatchData(id){

        id = parseInt(id);

        return this.deleteMatchCaps(id).then(() =>{
            
            return this.deleteMatchPlayerRecords(id);
        }).then(() =>{

            return this.deleteMatchRecords(id);
        });
    }


    changeRecordHolderIds(master, potato){


        return new Promise((resolve,  reject) =>{

            if(master != master || master == null){
                reject("masterId is NaN or null");
            }

            if(potato != potato || potato == null){
                reject("potatoId is NaN or null");
            }   

            const query = "UPDATE nutstats_bunnytrack_records SET player_id=? WHERE player_id=?";

            mysql.query(query, [master, potato], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    changeCapPlayerIds(master, potato){

        return new Promise((resolve, reject) =>{

            if(master != master || master == null){
                reject("masterId is NaN or null");
            }

            if(potato != potato || potato == null){
                reject("potatoId is NaN or null");
            } 

            const query = "UPDATE nutstats_bunnytrack_caps SET player_id=? WHERE player_id=?";

            mysql.query(query, [master, potato], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    changePlayerRecords(master, potato){


        return new Promise((resolve, reject) =>{

            if(master != master || master == null){
                reject("masterId is NaN or null");
            }

            if(potato != potato || potato == null){
                reject("potatoId is NaN or null");
            } 

            const query = "UPDATE nutstats_bunnytrack_player_records SET player_id=? WHERE player_id=?";

            mysql.query(query, [master, potato], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    
    deletePlayerFromRecords(){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_bunnytrack_records WHERE player_id=?";


            mysql.query(query, [this.currentPlayer], (err) =>{

                if(err) reject(err);

                resolve();

            });


        });
    }


    deletePlayerRecords(){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_bunnytrack_player_records WHERE player_id=?";

            mysql.query(query, [this.currentPlayer], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deletePlayerCaps(){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_bunnytrack_caps WHERE player_id=?";

            mysql.query(query, [this.currentPlayer], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deletePlayer(player){

        player = parseInt(player);

        return new Promise((resolve, reject) =>{

            if(player != player){
                reject("player is NaN");
            }

            this.currentPlayer = player;

            return this.deletePlayerFromRecords().then(() =>{

                console.log("Player records deleted");
                return this.deletePlayerRecords();

            }).then(() =>{
                console.log("Deleted players own records");

                return this.deletePlayerCaps();
            }).then(() =>{

                console.log("Deleted players caps");

                resolve();
            });

        });
    }


    getMostPlayedRecords(){

        this.mostPlayedRecords = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_bunnytrack_records WHERE map_id IN(?)";

            if(this.mapIds == undefined){
                resolve();
            }
            if(this.mapIds.length == 0){
                resolve();
            }

            mysql.query(query, [this.mapIds], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.mostPlayedRecords = result;

                    for(let i = 0; i < result.length; i++){

                        this.updatePlayerIds(result[i].player_id);
                    }

                }
                

                resolve();
            });
        });
    }

    getAllPlayerRecords(id){

        this.playerRecords = [];

        this.mapIds = [];

        return new Promise((resolve, reject) =>{

            id = parseInt(id);

            if(id != id){
                reject("Id is NaN");
            }

            const query = "SELECT * FROM nutstats_bunnytrack_player_records WHERE player_id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    console.table(result);
                    this.playerRecords = result;

                    for(let i = 0; i < result.length; i++){

                        this.mapIds.push(result[i].map_id);
                    }
                }

                resolve();
            });
        });
    }

    getMapRecords(ids){


        if(ids == undefined){

            ids = [];

            if(this.playerRecords != undefined){

                for(let i = 0; i < this.playerRecords.length; i++){
                    ids.push(this.playerRecords[i].map_id);
                }
            }
        }

        return new Promise((resolve, reject) =>{

            this.mapRecords = [];

            if(!Array.isArray(ids)){
                resolve();
            }

            if(ids.length == 0){
                resolve();
            }
            

            const query = "SELECT map_id,time FROM nutstats_bunnytrack_records WHERE map_id IN(?)";

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.mapRecords = result;
                   // console.table(result);
                }
                resolve();
            });
        });
    }
}


module.exports = Bunnytrack;