const mysql = require('./database');
const Message = require('./message');
const Promise = require("promise");
const config = require('./config');

class CTF{


    constructor(matchId, ctfData, players, mapId, flagKillData){


        this.matchId = matchId;
        this.data = ctfData;
        this.players = players;
        this.mapId = mapId;
        this.flagKillData = flagKillData;

        this.flagCaps = [];

        this.flags = [
            {
                "grabTime":0,
                //"bAssist":false,
                "players": [],
                "covers": []
            },
            {
                "grabTime":0,
                //"player":0,
                //"bAssist":false,
                "players": [],
                "covers": []
            },
             {
                "grabTime":0,
               // "bAssist":false,
                "players": [],
                "covers": []
            },
            {
                "grabTime":0,
                //"bAssist":false,
                "players": [],
                "covers": []
            }
        ];
        


        this.setPlayerData();
    }


    setPlayerData(){

        let d = 0;
        let p = 0;

        let capTime = 0;

        let currentTeam = 0;
        let currentAssistIds = [];
        let bCurrentAssist = false;
        let currentCapTime = 0;
        let currentCovers = [];
        

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];
            currentTeam = -1;



            // p = this.players.getPlayerByName(d.player);

            currentTeam = this.players.getPlayerTeamAt(d.player, d.time);

            if(d.event == "grab"){


                this.players.updatePlayer(d.player,"flagGrabs","++");

                currentTeam = this.players.getPlayerTeamAt(d.player, d.time);

                //reset flag states here to prevent problems with flags that get automatically returned
                this.resetFlagState(this.players.getPlayerTeamAt(d.player, d.time));

                if(currentTeam != -1){

                    this.flags[currentTeam].grabTime = d.time;

         
                    this.flags[currentTeam].players.push(d.player);
                    
                }

            }else if(d.event == "capture"){

                this.players.updatePlayer(d.player,"flagCaps","++");

                capTime = parseFloat(d.time) - parseFloat(this.flagTakenTime);

                if(currentTeam != -1){

                    
                   // bCurrentAssist = this.flags[currentTeam].bAssist;

                   if(this.flags[currentTeam].players.length > 1){
                        bCurrentAssist = true;
                   }else{
                       bCurrentAssist = false;
                   }

                }else{

                    currentAssistIds = [];
                    bCurrentAssist = false;
                    currentCapTime = 0;

                }

                this.flagCaps.push({
                    "cap": d.player,
                    "team": currentTeam,
                    "players": this.flags[currentTeam].players,
                    "bAssist": (bCurrentAssist) ? 1 : 0,
                    "capTime": d.time - this.flags[currentTeam].grabTime,
                    "covers": this.flags[currentTeam].covers.length,
                    "coverIds": this.flags[currentTeam].covers,
                    "grabTime": this.flags[currentTeam].grabTime,
                    "grabId": this.flags[currentTeam].players[0]
                });

            }else if(d.event == "assist"){

                this.players.updatePlayer(d.player,"flagAssists","++");

            }else if(d.event == "cover"){

                this.players.updatePlayer(d.player, "flagCovers", "++");

                currentTeam = this.players.getPlayerTeamAt(d.player, d.time);

                if(currentTeam != -1){

                    this.flags[currentTeam].covers.push(d.player);
                }

            }else if(d.event == "kill"){

                this.players.updatePlayer(d.player, "flagKills", "++");
                
            }else if(d.event == "dropped"){

                this.players.updatePlayer(d.player, "flagDrops", "++");
                
            }else if(d.event == "return"){

                this.players.updatePlayer(d.player, "flagReturns", "++");
                
            }else if(d.event == "pickup"){

                this.players.updatePlayer(d.player, "flagPickups", "++");


                currentTeam = this.players.getPlayerTeamAt(d.player, d.time);

                if(currentTeam != -1){

                    this.flags[currentTeam].players.push(d.player);
                }


            }else if(d.event == "return_closesave"){

                this.players.updatePlayer(d.player, "flagSaves", "++");

                //need to find what team the flag belonged to

                //this.resetFlagState(this.players.getPlayerTeamAt(d.player, d.time));
            }else if(d.event == "return2"){

            }

        }

    }


    resetFlagState(team){

        if(team != -1){

            this.flags[team] = {
                "grabTime":0,
                "bAssist":false,
                "players": [],
                "covers": []
            };
        }
    }


    insertCap(matchId, mapId, grabId, grabTime, capId, capTime, assists, bAssist, covers, players, coverPlayers){


        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_flag_captures VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?)";


            mysql.query(query, 
                [
                    matchId, 
                    mapId, 
                    grabId, 
                    grabTime, 
                    capId, 
                    capTime, 
                    assists, 
                    bAssist, 
                    covers, 
                    players, 
                    coverPlayers

                ],(err) =>{

                    if(err) reject(err);

                    resolve();

                });
        });

    }

    async insertCaps(){

        let covers = "";
        let assists = "";

        for(let i = 0; i < this.flagCaps.length; i++){

            const d = this.flagCaps[i];

            covers = "";
            assists = "";

            for(let a = 0; a < d.players.length; a++){

                assists += this.players.getMasterId(d.players[a]);

                if(a < d.players.length - 1){
                    assists += ",";
                }
            }

            for(let a = 0; a < d.coverIds.length; a++){

                covers += this.players.getMasterId(d.coverIds[a]);

                if(a < d.coverIds.length - 1){
                    covers += ",";
                }
            }

            
            await this.insertCap(

                        this.matchId, 
                        this.mapId, 
                        this.players.getMasterId(d.grabId), 
                        d.grabTime, this.players.getMasterId(d.cap), 
                        d.capTime, 
                        "["+assists+"]", 
                        d.bAssist, 
                        "["+covers+"]", 
                        d.players.length - 1, 
                        d.coverIds.length
            );
        }

    }


    insertFlagEvent(matchId, playerId, eventType, time){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_flag_events VALUES(NULL,?,?,?,?)";

            mysql.query(query, [matchId, playerId, eventType, time], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }

    async insertCTFData(){   

        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            await this.insertFlagEvent(this.matchId, this.players.getMasterId(d.player), d.event, d.time);
                           
        }   
    }


    insertFlagKill(data){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_flag_kills VALUES(NULL,?,?,?,?,?,?,?)";

            const vars = [
                this.matchId,
                data.time,
                data.killer,
                data.victim,
                data.killDistance,
                data.distanceToCap,
                data.distanceToBase
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve(err);
            });
        });
    }

    async insertFlagKillData(){

        let d = 0;

        //console.table(this.flagKillData);

        for(let i = 0; i < this.flagKillData.length; i++){

            d = this.flagKillData[i];

            await this.insertFlagKill(d);

        }
    }

    checkFlagsData(){

        this.bFlagDataExist = false;

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_flag_positions WHERE map_id=?";

            mysql.query(query, [this.mapId], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result[0].total_rows > 0){
                        this.bFlagDataExist = true;
                    }
                }

                resolve();
            });
        });
    }


    insertFlagPosition(data){

        return new Promise((resolve, reject) =>{

            const vars = [
                this.mapId,
                data.team,
                data.x,
                data.y,
                data.z
            ];

            const query = "INSERT INTO nutstats_flag_positions VALUES(NULL,?,?,?,?,?)";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async insertFlagPositions(data, mapId, mapName){

        this.mapName = mapName;
        this.mapId = mapId;
       // console.log(data);
        await this.checkFlagsData();

        if(!this.bFlagDataExist){

            new Message("note", "Inserting flag position data for "+mapName+".");
            let d = 0;

            for(let i = 0; i < data.length; i++){

                d = data[i];

                await this.insertFlagPosition(d);
            }
        }else{
            new Message("note", "Flag positions for "+mapName+" already exist, skipping.");
        }
    }


    mergeFlagKillData(){

        for(let i = 0; i < this.flagKillData.length; i++){

            this.flagKillData[i].killer = this.players.getMasterId(this.flagKillData[i].killer);
            this.flagKillData[i].victim = this.players.getMasterId(this.flagKillData[i].victim);
        }
    }

}

module.exports = CTF;