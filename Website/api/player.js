
const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');
const Gametype = require('./gametype');
const Maps = require('./maps');
const Weapons = require('./weapons');
const config = require('./config');


class Player{

    constructor(id, page){

        this.id = parseInt(id);
        this.page = parseInt(page);

        if(this.page != this.page){
            this.page = 0;
        }

        this.page--;
        
        this.gametypeIds = [];

        if(this.page < 0){
            this.page = 0;
        }

        this.name = "";
        this.totalsData = [];
        this.flag = "xx";
        this.face = "";
        this.ids = [];

        this.ips = [];

        this.matchIds = [];
        this.mapIds = [];

        this.gametypeNames = [];
        this.matches = [];

        this.totalMatches = 0;
        this.totalWins = 0;

        this.weaponStats = [];

    }

    init(){


        this.weapons = new Weapons();

        return this.bPlayerExist().then(() =>{

            return this.getPlayerName();

                

        }).then(() =>{

            return this.getGametypeIds();

        }).then(() =>{

            const ids = [];

            for(let i = 0; i < this.gametypeIds.length; i++){

                ids.push(this.gametypeIds[i].id);
            }

            return this.weapons.getPlayerTotalStats(ids);
            
        }).then(() =>{

            return this.getTotalsData();

        }).then(() =>{

            return this.getRecentMatches();

        }).then(() =>{

            return this.getLatestPerformance();

        }).then(() =>{

            return this.weapons.getPlayerWeaponStats(this.id);

        });
        
    }


    getGametypeIds(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT id,gametype FROM nutstats_player_totals WHERE name=?";

            mysql.query(query, [this.name], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    for(let i = 0; i < result.length; i++){

                        this.gametypeIds.push(result[i]);
                    }
                }

                console.table(this.gametypeIds);

                resolve();
            });
        });
    }

    bPlayerExist(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_player_totals WHERE id=? AND gametype=0";


            mysql.query(query, [this.id], (err, result) =>{

                if(err) reject(err);

                if(result[0].total_rows === 0){
                    reject("A player with that id doesnt exist");
                }
                resolve();
            });
        });
    }


    getPlayerName(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,flag FROM nutstats_player_totals WHERE id=?";

            mysql.query(query, [this.id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    if(result.length > 0){
                        this.name = result[0].name;
                        this.flag = result[0].flag;
                    }
                }


                //console.log(this.name);
                resolve();


            });

        });

    }

    getTotalsData(){

        return new Promise((resolve, reject) =>{    

            const query = "SELECT * FROM nutstats_player_totals WHERE name LIKE(?) ORDER BY total_matches DESC";


            mysql.query(query, [this.name], (err, result) =>{

                if(err) reject(err);

                //console.log(result);

                for(let i = 0; i < result.length; i++){

                    if(result[i].gametype == 0){
                        this.totalMatches = result[i].total_matches;
                        this.totalWins = result[i].wins;
                        this.face = result[i].face;
                        this.flag = result[i].flag.toLowerCase();
                    }
                }

                this.totalsData = result;
                resolve();
            });
        });
    }


    setRecentMatchIds(){


        return new Promise((resolve, reject) =>{

            const perPage = config.matchesPerPage;

            const start = this.page * perPage;

            const query = "SELECT match_id, flag, winner  FROM nutstats_player WHERE player_id=? ORDER BY match_id DESC LIMIT ?, ?";
            mysql.query(query, [this.id, start, perPage], (err, result) =>{

                if(err) reject(err);

               // console.log(result);

                this.matchIds = result;
                
                resolve();
            });
        });
    }


    setRecentMatchData(){


        return new Promise((resolve, reject) =>{

            if(this.matchIds.length == 0){
                resolve();
            }

            const query = "SELECT * FROM nutstats_match WHERE id IN(?) ORDER BY date DESC";

            const perPage = config.matchesPerPage;

            const start = this.page * perPage;


            let ids = [];

            for(let i = 0; i < this.matchIds.length; i++){

                ids.push(this.matchIds[i].match_id);
            }

            this.ids = ids;

            //console.log(ids);

            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                //console.log(result);

                this.matches = result;

                resolve();
            });
        });

    }



    setMapIds(){


        let d = 0;

        let currentId = 0;

        for(let i = 0; i < this.matches.length; i++){

            d = this.matches[i];

            currentId = parseInt(d.map);

            if(this.mapIds.indexOf(currentId) == -1){
                this.mapIds.push(currentId);
            }
        }


    }


    getRecentMatches(){

        return this.setRecentMatchIds().then(() =>{

            return this.setRecentMatchData();

        }).then(() =>{

            this.setMapIds();

        });

        /*return new Promise((resolve, reject) =>{

            this.setRecentMatchIds().then(() =>{
                
                this.setRecentMatchData().then(() =>{

                    this.setMapIds();

                    resolve();

                    

                }).catch((message) =>{
                    reject("Failed to get player match data ("+message+")");
                });
                

            }).catch((message) =>{

                reject("Failed to set player match ids ("+message+")");
            });
        });*/
    }





    getLatestPerformance(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT points, kills, deaths, eff FROM nutstats_player WHERE player_id=? ORDER BY match_id DESC LIMIT 100";

            mysql.query(query, [this.id], (err, result) =>{
                
                if(err) reject(err);

               // console.log(result);

                this.performance = result;

                resolve();
            });
        });
    }

    getAllUsedIps(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,ip FROM nutstats_player WHERE name=? GROUP BY ip";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                   // console.table(result);

                    for(let i = 0; i < result.length; i++){
                        this.ips.push(result[i]);
                    }
                }
                resolve();
            });

        });
    }


    getNamesUsedByIps(ips){

        this.usedNames = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT player_id,name,flag,COUNT(*) as total_uses FROM nutstats_player WHERE ip IN (?) GROUP BY name";

            mysql.query(query, [ips], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                   // console.table(result);

                    this.usedNames = result;

                }
                resolve();
            });
        });
    }


}



module.exports = Player;