const mysql = require('./database');
const Promise = require('promise');

const config = require('./config');
const Maps = require('./maps');
const Message = require('./message');
const Player = require('./player');
const Players = require('./players');
const Gametype = require('./gametype');
const Servers = require('./servers');
const Dom = require('./dom');
const Ctf = require('./ctf');
const Bunnytrack = require('./bunnytrack');
const Rankings = require('./rankings');


class Matches{


    constructor(){


        this.page = 1;

        if(arguments.length == 1){
            this.page = parseInt(arguments[0]);
        }

        this.mapNames = [];
        this.gametypeNames = [];

        this.mapIds = [];
        this.gametypeIds = [];

    }


    getHomeRecent(){


        return new Promise((resolve, reject) =>{

            this.recentMatches = [];

            const query = `SELECT id,date,ip,name,total_players,gametype,map,total_teams,total_bots,dm_winner,match_playtime,winning_team,teamscore_0,teamscore_1,teamscore_2,teamscore_3
             FROM nutstats_match WHERE total_players >= ? AND match_playtime >= ? AND winner_score >=? ORDER BY date DESC, id DESC LIMIT ?`;


            mysql.query(query, [config.minPlayers, config.minMatchLength, config.minTopScore, config.homeMaxMatches], (err, result) =>{

                if(err) reject(err);

                this.recentMatches = result;


                //this.setMapAndGametypeIdsHome();

                resolve();


                //resolve();
            });
        });
    }




    getTotalsMatches(){


        return new Promise((resolve, reject) =>{


            const query = "SELECT COUNT(*) as matches FROM nutstats_match WHERE total_players >= ? AND match_playtime >= ? AND winner_score >= ?";

            this.totalMatches = 0;

            mysql.query(query,[config.minPlayers, config.minMatchLength, config.minTopScore] ,(err, result) =>{
                if(err) reject(err);

                if(result != undefined){
                    if(result[0].matches != undefined){
                        this.totalMatches = result[0].matches;
                    }
                }

                resolve();
            });
        });
    }



    setPage(){

        const perPage = config.matchesPerPage;
        let pages = 0;
        const results = this.totalMatches;

        if(results > 0 && results == results){

            pages = Math.ceil(results / perPage);

            // console.log("pages = "+pages);
            
        }else{
            pages =  1;
        }

        this.pages = pages;


        if(this.pages < this.page){
            this.page = this.pages;
        }else if(this.page <= 0){
            this.page = 1;
        }

        this.page--;
    }



    setMapAndGametypeIds(){

        for(let i = 0; i < this.matches.length; i++){

            if(this.mapIds.indexOf(this.matches[i].map) == -1){
                this.mapIds.push(this.matches[i].map);
            }

            if(this.gametypeIds.indexOf(this.matches[i].gametype) == -1){
                this.gametypeIds.push(this.matches[i].gametype);
            }
        }
    }


    setMapNames(){

        return new Promise((resolve, reject) =>{

            const m = new Maps();

            m.getMapNames(this.mapIds).then(() =>{

                this.mapNames = m.mapNames;

                resolve();
                
            }).catch(() =>{
                reject("Failed to set map names");
            });

           /* if(this.mapIds.length == 0){
                resolve();
            }
            const query = "SELECT id,name FROM nutstats_map WHERE id IN(?)";
            mysql.query(query,[this.mapIds] ,(err, result) =>{

                if(err) reject(err);

                this.mapNames = result;
                resolve();
            });*/
        });
    }



    setGametypeNames(){


        return new Promise((resolve, reject) =>{

            if(this.gametypeIds.length == 0){
                resolve();
            }

            const query = "SELECT id,name FROM nutstats_gametype WHERE id IN(?)";


            mysql.query(query, [this.gametypeIds], (err, result) =>{
                if(err) reject(err);

                this.gametypeNames = result;
                resolve();
            });
        });
    }



    setData(){

        return new Promise((resolve, reject) =>{

            this.setMapNames().then(() =>{

                //(this.mapNames);

                this.setGametypeNames().then(() =>{
                   // console.log(this.gametypeNames);
                    resolve();
                }).catch(() =>{
                    reject();
                });
                

            }).catch(() =>{
                reject();
            });
        });
    }

    getRecentMatches(){

        return new Promise((resolve, reject) =>{

            this.getTotalsMatches().then(() =>{

                
                this.setPage();
                
                const start = this.page * config.matchesPerPage;


                const query = `SELECT id,name,ip,date,gametype,map,total_players,total_bots,total_teams,teamscore_0,teamscore_1,
                                teamscore_2,teamscore_3,dm_winner,dm_winner_score,match_playtime,winning_team
                                FROM nutstats_match WHERE total_players >= ? AND match_playtime >= ? AND winner_score >= ? ORDER BY date DESC, id DESC LIMIT ?, ?`;
                
                this.matches = [];

                



                mysql.query(query, [config.minPlayers, config.minMatchLength, config.minTopScore, start, config.matchesPerPage], (err, result) =>{

                    if(err) reject(err);
                    //console.log(result);
                    this.matches = result;


                    for(let i = 0; i < result.length; i++){

                        if(this.mapIds.indexOf(result[i].map) == -1){
                            this.mapIds.push(result[i].map);
                        }
                    }

                    this.setMapAndGametypeIds();

                    this.setData().then(() =>{
                        resolve();
                    }).catch(() =>{
                        reject("Failed to set map names and gametype ids");
                    });
                    
                });
                
            
                //resolve();

            }).catch(() =>{
    
                reject();
            });


        });    
    }


    getMapIdsByMatchIds(ids){


        this.mapData = [];
        this.mapIds = [];

        this.dates = [];

        return new Promise((resolve, reject) =>{

            if(ids.length == 0){
                resolve();
            }

            const query = "SELECT id,map,date FROM nutstats_match WHERE id IN(?)";

            mysql.query(query, [ids], (err, result)=>{

                if(err) reject(err);


                this.mapData = result;

                if(Array.isArray(result)){
                    for(let i = 0; i < result.length; i++){

                        this.mapIds.push(parseInt(result[i].map));
                        this.dates.push({"id": result[i].id, "date": result[i].date});
                    }
                }


                resolve();

            });
        });
    }


    getMatchesByMap(id, page){

        id = parseInt(id);
        page = parseInt(page);

        page--;
        //move this variable in config file
        const perPage = config.mapsResultsPerPage;
        const start = page * perPage;


        this.mapMatches = [];

        return new Promise((resolve, reject) =>{

            const query = `SELECT id,ip,name,date,gametype,map,total_players,total_teams,teamscore_0,teamscore_1,
            teamscore_2,teamscore_3,dm_winner,dm_winner_score,match_playtime,winning_team
            FROM nutstats_match WHERE map=? AND total_players >= ? AND match_playtime >= ? ORDER BY date DESC  LIMIT ?, ?`;

            /*console.log(`SELECT id,name,date,gametype,map,total_players,total_teams,teamscore_0,teamscore_1,
            teamscore_2,teamscore_3,dm_winner,dm_winner_score,match_playtime,winning_team
            FROM nutstats_match WHERE map=? ORDER BY date DESC  LIMIT ${start}, ${perPage}`);*/

            mysql.query(query, [id, config.minPlayers, config.minMatchLength, start, perPage], (err, result) =>{

                if(err) reject(err);

                this.mapMatches = result;
                //console.table(result);
                resolve();
            });

        });
    }


    getMapMatchCount(id){

        id = parseInt(id);

        this.mapMatchCount = 0;

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as matches FROM nutstats_match WHERE map=? AND total_players >= ? AND match_playtime >= ?";

            mysql.query(query, [id, config.minPlayers, config.minMatchLength] , (err, result) =>{

                if(err) throw err;

                if(result != undefined){
                    this.mapMatchCount = result[0].matches;

                }

                resolve();
            });

        });
    }


    getMatchDetails(id){

        return new Promise((resolve, reject) =>{


            this.matchGametype = -1;

            const query = "SELECT name,gametype,map,match_playtime FROM nutstats_match WHERE id=? LIMIT 1";

            id = parseInt(id);

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    if(result.length > 0){
                        this.matchGametype = result[0].gametype;
                        this.matchMap = result[0].map;
                        this.matchPlaytime = result[0].match_playtime;
                        this.matchServerName = result[0].name;
                    }
                }
                resolve();
            });
        });
    }

    getPlayersInMatch(id){

        id = parseInt(id);

        this.playersInMatch = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_player WHERE match_id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.playersInMatch = result;
                }

                //console.table(this.playersInMatch);
                resolve();
            });

        });
    }

    deletePlayersFromMatch(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_player WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deleteKills(id){


        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_kills WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deleteMonsterKills(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_monster_kills WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deletePickups(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_pickups WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deleteHeadshots(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_headshots WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });

        });
    }

    deleteMatch(id){

        id = parseInt(id);

        const servers = new Servers();


        return this.getMatchDetails(id).then(() =>{

            console.log("The match gametype is = "+this.matchGametype);

            return this.getPlayersInMatch(id);
            
        }).then(() =>{

            

            return new Promise((resolve, reject) =>{

                console.log("DELETLELTELTELTELTELTLETLELETLETELTELTLETL");

                const query = "DELETE FROM nutstats_match WHERE id=? LIMIT 1";
                
                console.log("DELETE FROM nutstats_match WHERE id="+id+" LIMIT 1");
                mysql.query(query,[id], (err) =>{
    
                    if(err){
                        console.log(err);
                        reject(err);
                    }
    
                    resolve();
                });
            });

        }).then(() =>{

            return this.deletePlayersFromMatch(id);

            //return Promise.resolve(0);
        }).then(() =>{

            const players = new Players();

            return players.removeMatchData(this.matchGametype, this.playersInMatch);

        }).then(() =>{

            return this.deleteKills(id);

        }).then(() =>{

            return this.deleteMonsterKills(id);

        }).then(() =>{

            return this.deleteHeadshots(id);

        }).then(() =>{

            const rankings = new Rankings();

            return rankings.deleteMatchData(id);
            
        }).then(() =>{

            return this.deletePickups(id);

        }).then(() =>{

            const dom = new Dom();

            return dom.deleteMatchData(id);

        }).then(() =>{

            const ctf = new Ctf();

            return ctf.deleteMatchData(id);

        }).then(() =>{

            const bt = new Bunnytrack();

            return bt.deleteMatchData(id);

        }).then(() =>{

            const maps = new Maps();

            return maps.reduceMapPlayCount(this.matchMap, this.matchPlaytime);

        }).then(() =>{

            const gametype = new Gametype();

            return gametype.reduceTotals(this.matchGametype, this.matchPlaytime);

        }).then(() =>{

            return servers.getServerId(this.matchServerName);

        }).then(() =>{

            

            return servers.reduceTotals(servers.serverId, this.matchPlaytime);
        });
        
    }

    getAdminRecentMatches(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_match ORDER BY id DESC LIMIT 25";

            this.data = [];

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.data = result;
                }

                resolve();
            });

        });
    }


    searchMatches(gametype, map, timeFrame){


        this.matches = [];

        return new Promise((resolve, reject) =>{

            const now = new Date();
            const timeStamp = Math.floor(now.getTime() / 1000);
            //console.log("now is "+timeStamp);

            if(gametype == null){
                gametype = '%';
            }

            if(map == null){
                map = '%';
            }

            if(timeFrame == null){
                timeFrame = 0;
            }else{

                let offset = 0;

                switch(timeFrame){
                    case 0: {  offset = 60 * 60; } break;
                    case 1: {  offset = (60 * 60) * 24; } break;
                    case 2: {  offset = ((60 * 60) * 24) * 31; } break;
                    case 3: {  offset = ((60 * 60) * 24) * 365; } break;
                    default: {  offset = timeStamp; } break;
                }

                timeFrame = timeStamp - offset;
            }

            const query = "SELECT * FROM nutstats_match WHERE gametype LIKE ? AND map LIKE ? AND date>=? LIMIT 100";

            console.log("SELECT name FROM nutstats_match WHERE gametype LIKE "+gametype+" AND map LIKE "+map+" AND date>="+timeFrame+" LIMIT 100");

            mysql.query(query, [gametype, map, timeFrame], (err,result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.matches = result;

                    console.table(this.matches);
                }

                resolve();
            });
        });
    }
}






module.exports = Matches;