
const mysql = require('./database');
const Gametype = require('./gametype');
const config = require('./config');
const Promise = require('promise');

class Rankings{


    constructor(){

        this.data = [];

        this.playerNames = [];

        this.playerPlaces = [];

        this.currentData = [];

        this.currentGametypes = [];

        this.gametypes = new Gametype();

    }




    getAllTopPlayers(){

        const promises = [];


        let d = 0;

        const query = "SELECT id,name,flag,total_matches,ranking,wins,ranking_change,ranking_diff FROM nutstats_player_totals WHERE gametype=? ORDER BY ranking DESC LIMIT ?";



        for(let i = 0; i < this.gametypes.data.length; i++){

            d = this.gametypes.data[i];

            promises.push(new Promise((resolve, reject) =>{

                (() =>{

                    const currentId = d.id;

                    mysql.query(query, [currentId, config.rankingsHomePerPage], (err, result) =>{

                        if(err) reject(err);
    
                        this.data.push({"id": currentId, "data": result});

                        if(result != undefined){

                            if(result.length > 0){

                                for(let i = 0; i < result.length; i++){

                                    result[i].flag = result[i].flag.toLowerCase();

                                    if(this.playerNames.indexOf(result[i].name) == -1){

                                        this.playerNames.push(result[i].name);
                                    }
                                }
                            }
                        }
    
                        resolve();
    
                    });

                })();
                

            }));

        }


        return Promise.all(promises);

    }


    getTotalMatches(){

        this.results = 0;

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as matches FROM nutstats_match";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    if(result.length > 0){
                        this.results = result[0].matches;
                    }
                }

                resolve();
            }); 
        });
    }

    getDefault(){

        

        return this.gametypes.getGametypesOrderByMatches().then(() =>{

            
            return this.getAllTopPlayers();

        }).then(() =>{

            return this.getTotalMatches();

        }).then(() =>{

            this.gametypeNames = this.gametypes.data;


            //console.log(this.playerNames);

            //console.log("Woof wooof owwwof woof woof woof");
        });
    }

    getGametypeRanking(gametypeId, page){

        gametypeId = parseInt(gametypeId);
        page = parseInt(page);

        page = page - 1;

        if(page < 0){
            page = 0;
        }

        this.gametypeId = gametypeId;
        
        return new Promise((resolve, reject) =>{

            const start = config.rankingsPerPage * page;
            const amount = config.rankingsPerPage;

            const query = "SELECT id,name,flag,total_matches,ranking,wins,ranking_change,ranking_diff FROM nutstats_player_totals WHERE gametype=? ORDER BY ranking DESC LIMIT ?, ?";

            mysql.query(query, [gametypeId, start, amount], (err, result) =>{

                if(err) reject(err);

                //console.log(result);

               // console.log(result);


                if(result != undefined){

                    for(let i = 0; i < result.length; i++){
                        
                        result[i].flag = result[i].flag.toLowerCase();
                        this.playerNames.push(result[i].name);
                    }

                    this.data.push(result);
                }

                resolve();
            });

        });
    }


    getRankingTotalResults(id){

        id = parseInt(id);


        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as totals FROM nutstats_player_totals WHERE gametype=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result == undefined || result == null){    
                    resolve();
                }
                //this.results = result[0].totals;
                this.results = result[0].totals;
                resolve();
            });
        });
    }

    getPlayerTotalIds(){

        this.rankingIds = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,flag,total_matches,ranking,gametype_postition FROM nutstats_player_totals WHERE id IN (?)";

           //.. console.log("SELECT id,name FROM nutstats_player_totals WHERE player_id IN ("+this.foundIds.join()+")");

            mysql.query(query, [this.foundIds], (err, result) =>{

                if(err) reject(err);

               // console.table(result);
                if(result != undefined){

                    for(let i = 0; i < result[i].length; i++){

                        result[i].flag = result[i].flag.toLowerCase();
                    }
                    this.rankingIds = result;
                }
                resolve();

            });
        });
    }


    getMatchRankingsChange(id){

        id = parseInt(id);

        this.matchRankings = [];

        this.foundIds = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_rankings WHERE match_id=? ORDER BY ranking_change";

            //console.log("SELECT * FROM nutstats_rankings WHERE match_id="+id+" ORDER BY ranking_change");

            mysql.query(query, [id], (err, result) =>{

               // console.table(result);

                if(err) reject(err);

                for(let i = 0; i < result.length; i++){

                    this.foundIds.push(result[i].player_id);

                }

                this.matchRankings = result;

                resolve();
            });
        });
    }
    

    getAllPlayersFromGametype(gametypeId){

        this.playerList = [];

        
        gametypeId = parseInt(gametypeId);


        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nutstats_player_totals WHERE gametype=? ORDER BY ranking DESC";

            mysql.query(query, [gametypeId], (err, result) =>{

                if(err) reject(err);

                //console.table(result);
                this.playerList = result;

                resolve();

            });
        });
    }

    updatePlayerPlaces(playersInMatch){

        for(let i = 0; i < this.playerList.length; i++){

            if(playersInMatch.indexOf(this.playerList[i].name) != -1){
                this.playerList[i].place = i+1;
            }else{
                this.playerList[i].place = -1;
            }
        }


        //console.table(this.playerList);

        this.playerList = this.playerList.filter((data) =>{

            if(data.place != -1){
                return data;
            }
        });

        //console.table(this.playerList);
        
    }

    getPlayerRankings(name){

        //..id = parseInt(id);
        this.rankings = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,gametype,flag,ranking,ranking_diff,total_matches,gametype_position FROM nutstats_player_totals WHERE gametype!=0 AND name=? ORDER BY total_matches DESC";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                //console.table(result);

                if(result != undefined){

                    for(let i = 0; i < result.length; i++){

                        result[i].flag = result[i].flag.toLowerCase();
                    }
                    this.rankings = result;

                }


                resolve();
            });
        });
    }

    /*getPlayerPositions(ids, gametypeId){


        const promises = [];

        const query = "SELECT COUNT(*) as position FROM nutstats_player_totals WHERE ranking > ? AND gametype=? ORDER BY ranking DESC";

        for(let i = 0; i < ids.length; i++){

            promises.push(new Promise((resolve, reject) =>{
                

                console.log(ids[i]);
                const currentPlayer = ids[i];

                mysql.query(query, [currentPlayer.ranking, gametypeId], (err, result) =>{

                    

                    if(err) reject(err);

                    if(typeof result != 'undefined'){

                        if(result.length > 0){
                            //console.log(result);
                            this.playerPlaces.push({"id": currentPlayer.player_id, "position": result[0]});
                        }

                    }

                    //console.table(this.playerPlaces);

                    resolve();
                });
            }));

        }

        return Promise.all(promises);
        
    }*/




    getRankingsForPlayers(gametype, players){


        gametype = parseInt(gametype);
        const names = [];
        
        for(let i = 0; i < players.length; i++){

            names.push(players[i].name);
        }

        this.playerRankings = [];

        return new Promise((resolve, reject) => {

            if(names.length > 0){
                const query = "SELECT id,name,flag,ranking,ranking_diff,gametype_position,total_matches FROM nutstats_player_totals WHERE gametype=? AND name IN(?)";

                mysql.query(query, [gametype, names], (err, result) =>{

                    if(err) reject(err);
                    //console.table(result);

                    if(result != undefined){

                        for(let i = 0; i < result.length; i++){

                            result[i].flag = result[i].flag.toLowerCase();
                        }
                        this.playerRankings = result;
                    }

                    resolve();
                });
            }else{
                resolve();
            }
        });

    }

    deleteMatchData(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_rankings WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
                
            });
        });

    }



    getTopPlayersGametype(gametype, amount){

        return new Promise((resolve, reject) =>{

            this.gametypes.getGametypeId(gametype).then(() =>{

                console.log("Current gametype is "+this.gametypes.currentGametypes[this.gametypes.currentGametypes.length - 1]);

                const query = "SELECT id,name,flag,ranking,ranking_diff FROM nutstats_player_totals WHERE gametype=? ORDER BY ranking DESC LIMIT ?";

                let currentGametype = this.gametypes.getCurrentGametype(gametype);

                if(currentGametype != null){
                    
                    mysql.query(query, [currentGametype.id, amount], (err, result) =>{

                        if(err) reject(err);

                        if(result != undefined){

                            this.currentGametypes.push(currentGametype.id);
                            this.currentData.push({"gametype": currentGametype.id, "gametypeName":gametype, "data": result});
                        }
                        resolve();
                    });
                }else{
                    console.trace("Gametype does not exist");

                    resolve();
                }
                

            }).catch((err) =>{
                reject(err);
            });

        });
        
    }


    deletePlayer(player){

        player = parseInt(player);


        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_rankings WHERE player_id=?";

            mysql.query(query, [player], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    

}


module.exports = Rankings;