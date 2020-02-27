const mysql = require('./database');
const Message = require('./message');
const Promise = require('promise');

class Domination{


    constructor(matchId, domData, players, domPositions){

        this.matchId = matchId;
        this.domData = domData;
        this.players = players;
        this.domPositions = domPositions;


        this.setDomData();
    }

    async insert(){

        try{
            await this.insertDomTeamScore();
            await this.insertDomPlayerScore();
            await this.insertDomCapData();
            //await this.insertDomPositions();
        }catch(err){

            console.trace(err);
            new Message("error", err);
        }

       
    }


    setDomData(){

        let instigator = 0;
        let victim = 0;

        this.domCaps = [];
        this.domPlayerScores = [];
        this.domTeamScores = [];


        let d = 0;

        for(let i = 0; i < this.domData.length; i++){


            d = this.domData[i];

            if(d.event == "playerScore"){

                this.players.updatePlayer(d.player, "points", d.value);

                this.domPlayerScores.push(d);

            }else if(d.event == "cap"){

                this.domCaps.push(d);

                this.players.updatePlayer(d.player, "domCaps", "++");

            }else if(d.event == "teamScore"){

                this.domTeamScores.push(d);
            }
        }
    }

    insertTeamScore(matchId, team, value, time){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_dom_teamscore VALUES(NULL,?,?,?,?)";

            mysql.query(query, [matchId, team, value, time], (err) =>{

                if(err) reject(err);

                resolve();
            });

        });
    }


    async insertDomTeamScore(){

        let d = 0;

        for(let i = 0; i < this.domTeamScores.length; i++){

            d = this.domTeamScores[i];

            await this.insertTeamScore(this.matchId, d.team, d.value, d.time);

        }

    }


    insertPlayerScore(matchId, player, value, time){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_dom_playerscore VALUES(NULL,?,?,?,?)";

            mysql.query(query, [matchId, player, value, time], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async insertDomPlayerScore(){

        let d = 0;

        for(let i = 0; i < this.domPlayerScores.length; i++){

            //console.log(i);

            d = this.domPlayerScores[i];

            await this.insertPlayerScore(this.matchId, d.player, d.value, d.time);
                
        }

      
    }


    insertDomCap(matchId, player, point, time){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_dom_captures VALUES(NULL,?,?,?,?)";

            mysql.query(query, [matchId, player, point, time], (err) =>{

                if(err) reject(err);

                resolve();
            });

        });
    }

    async insertDomCapData(){

        let d = 0;

        for(let i = 0; i < this.domCaps.length; i++){

            d = this.domCaps[i];

            await this.insertDomCap(this.matchId, d.player, d.pointName, d.time);
            
        } 
    }


    checkDomPositions(){

        this.bDomPositionsExist = false;

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_dom_positions WHERE map_id=?";

            mysql.query(query, [this.mapId], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result.length > 0){

                        if(result[0].total_rows > 0){
                            this.bDomPositionsExist = true;
                        }
                    }
                }
                resolve();
            });
        });
    }


    insertPosition(data){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_dom_positions VALUES(NULL,?,?,?,?,?)";

            const vars = [this.mapId, data.name, data.x, data.y, data.z];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });

        });
    }

    async insertPositions(mapId, mapName){

        this.mapId = mapId;

        //console.table(this.domPositions);
        await this.checkDomPositions();

        if(!this.bDomPositionsExist){

            new Message("note", "Importing Domination Control Points for "+mapName);

            for(let i = 0; i < this.domPositions.length; i++){

                await this.insertPosition(this.domPositions[i]);
            }

        }else{
            new Message("note", "Domiation Control Points have already been imported for "+mapName);
        }
    }
}




module.exports = Domination;