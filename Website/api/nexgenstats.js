const mysql = require('./database');
const Promise = require('promise');
const Rankings = require('./rankings');
const Players = require('./players');
const config = require('./config');


class NexgenStats{


    constructor(res){

        this.res = res;

        this.playerIds = [];

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

    

    getData(){


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
}


module.exports = NexgenStats;