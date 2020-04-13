const mysql = require('./database');
const Promise = require('promise');
const Rankings = require('./rankings');
const Players = require('./players');
const Gametype = require('./gametype');
const config = require('./config');


class NexgenStats{


    constructor(res){

        this.res = res;

        this.playerIds = [];

        this.topPlayers = [];

        this.rankings = new Rankings();
        this.players = new Players();

    }

    getPlayer(id){


       // console.log(this.players);

        console.log("getPlayer");
        
        for(let i = 0; i < this.players.players.length; i++){

            console.log("LOOKING FOR ID = "+id+" DOUND = "+this.players.players[i].id);

            if(this.players.players[i].id == id){
                return this.players.players[i];
            }
        }

        return  {"name": "Not found!", "flag": "xx", "id": 0, "total_matches": 0};
    }


    displayData(){

        let string = "";

        let d = 0;
        let currentPlayer = null;

        let arrowString = "";

        //console.log(this.rankings.currentData);

        for(let i = 0; i < this.rankings.currentData.length; i++){

            d = this.rankings.currentData[i];
            

            for(let x = 0; x < d.data.length; x++){

                if(x == 0){
                    string += 'beginlist "Top '+d.gametypeName+' players"\n';
                }

                if(d.data[x].ranking_diff > 0){
                    arrowString = "up";
                }else if(d.data[x].ranking_diff < 0){
                    arrowString = "down";
                }else{
                    arrowString = "nc";
                }

                //currentPlayer = this.getPlayer(d.data[x].player_id);
                string += 'addplayer "'+d.data[x].name+'" '+d.data[x].ranking+' '+d.data[x].flag+' '+arrowString+'\n';
                
            }

        }

        this.res.send(string);
    }

    getPlayerIds(){


        let d = 0;

        //console.log(this.rankings.currentData[0].data);

        for(let i = 0; i < this.rankings.currentData.length; i++){

            for(let x = 0; x < this.rankings.currentData[i].data.length; x++){
                
                d = this.rankings.currentData[i].data[x];

                //console.log(d);

                if(this.playerIds.indexOf(d.player_id) == -1){
                    this.playerIds.push(d.player_id);
                }
            }
        }

        console.log("this.playerIds");
        console.log(this.playerIds);
        console.log("this.playerIds");
    }

    

    getData_old(){


        const promises = [];

        for(let i = 0; i < config.nexgenStatsGametypes.length; i++){

            promises.push(this.rankings.getTopPlayersGametype(config.nexgenStatsGametypes[i], 5));

        }


        Promise.all(promises).then(() =>{
            
            this.getPlayerIds();




            return this.players.getPlayersByIdsGametype(this.playerIds, this.rankings.currentGametypes);

        }).then(() =>{

            this.displayData();

        }).catch((err) =>{
            console.trace(err);
        });

        /*this.rankings.getTopPlayersGametype("capture the flag", 5).then(() =>{
            console.log("fffffffffffff");

            let potato = this.rankings.gametypes.getCurrentGametype("capture the flag");

            if(potato != null){

                return this.rankings.getTopPlayersGametype(potato.name, 5);

            }

        }).then(() =>{


            this.getPlayerIds();
            console.log("oooooooooooooo");
            return this.players.getPlayersByIdsGametype(this.playerIds, 5);
            //this.displayData();

        }).then(() =>{

            this.displayData();

        }).catch((err) =>{
            console.log(err);
        });*/
    }


    /*getRankingCategory(category, players){

        return new Promise((resolve, reject) =>{

            return this.rankings.getTopPlayersGametype(category, players)
        });
    }*/


    getTopPlayers(gametype, category, players, name){

        gametype = parseInt(gametype);

        switch(category){

            case 2: { category = "kills"; } break;
            case 3: { category = "deaths"; } break;
            case 4: { category = "headshots"; } break;
            case 5: { category = "flag_caps"; } break;
            case 6: { category = "flag_kills"; } break;
            case 7: { category = "flag_covers"; } break;
            case 8: { category = "flag_saves"; } break;
            case 9: { category = "flag_returns"; } break;
            case 10: { category = "total_time"; } break;
            case 11: { category = "total_matches"; } break;
            case 12: { category = "spawn_kills"; } break;
            case 13: { category = "dom_caps"; } break;
            case 14: { category = "assault_caps"; } break;
            case 15: { category = "monster_kills"; } break;
            default: { category = "kills" } break;
        }
        

        const query = "SELECT name,flag,"+category+" as value FROM nutstats_player_totals WHERE gametype=? ORDER BY "+category+" DESC LIMIT ?";


        return new Promise((resolve, reject) =>{

            mysql.query(query, [gametype, players], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.topPlayers.push(
                        {
                            "name": name,
                            "type:": category,
                            "gametype": gametype,
                            "data": result
                        }
                    );
                    console.log(this.topPlayers);
                }

                resolve();
            });
        });
    }

    getGametypeName(g,id){

        for(let i = 0; i < g.gametypeNames.length; i++){

            if(g.gametypeNames[i].id == id){
                return g.gametypeNames[i].name;
            }
        }

        return null;
    }

    getTopRankings(gametype, players, name){


        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,flag,ranking as value,ranking_diff FROM nutstats_player_totals WHERE gametype=? ORDER BY ranking DESC LIMIT ?";

            mysql.query(query, [gametype, players], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.topPlayers.push(
                        {
                        "name": name,
                        "data": result
                        }
                    );
                }
                resolve();
            });
        });
    }

    async getData(){

        const g = new Gametype();

        await g.getGametypeNames();
        await this.getSettings();

         

        let d = 0;
        let currentGametypeName = "";

        for(let i = 0; i < this.settings.length; i++){

            d = this.settings[i];

            console.log("type = "+d.type);
            if(parseInt(d.type) == 1){

                currentGametypeName = this.getGametypeName(g, d.gametype_id)

                if(currentGametypeName != null){
                    await this.getTopRankings(d.gametype_id, d.players, d.name);
                }else{
                    console.log("currentGametypeName is NULL");
                }
               // console.log("this.rankings.data");
               // console.table(this.rankings.currentData[0].data);

            }else{

                await this.getTopPlayers(d.gametype_id, d.type, d.players, d.name)

            }

        }

    }

    async setDataString(){
        
        let string = "";
        let arrowString = "nc";

        let d = 0;


       //console.table(this.topPlayers);

        let currentRankingDiff = 0;

        for(let i = 0; i < this.topPlayers.length; i++){

            for(let x = 0; x < this.topPlayers[i].data.length; x++){

                d = this.topPlayers[i].data[x];

                if(x == 0){
                    string += 'beginlist "'+this.topPlayers[i].name+'"\n';
                }

                if(d.ranking_diff != undefined){

                    currentRankingDiff = parseInt(d.ranking_diff);

                    if(currentRankingDiff == 0){
                        arrowString = "nc";
                    }else if(currentRankingDiff > 0){
                        arrowString = "up";
                    }else{
                        arrowString = "down";
                    }
                }else{
                    arrowString = "nc";
                }
                
                string += 'addplayer "'+d.name+'" '+d.value+' '+d.flag+' '+arrowString+'\n';
                //string += 'addplayer "'+d.data[x].name+'" '+d.data[x].ranking+' '+d.data[x].flag+' '+arrowString+'\n';
            }

        }


        this.dataString = string;
    }


    getSettings(){


        return new Promise((resolve, reject) =>{
        
            this.settings = [];

            const query = "SELECT * FROM nutstats_nexgen_stats ORDER BY order_position";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.settings = result;
                }

                resolve();
            });
        });
    }
}


module.exports = NexgenStats;