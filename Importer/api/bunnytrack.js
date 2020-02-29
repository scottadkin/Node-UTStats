

const mysql = require('./database');
const Promise = require('promise');
const config = require('./config');
const fs = require('fs');
const Message = require('./message');
const Maps = require('./map');
const Players = require('./player');



class BunnyTrack{

    constructor(data, players, matchId, mapId){

        if(arguments.length != 4){
            this.lines = [];
            return;
        }
        this.data = data;
        this.players = players;
        this.matchId = matchId;
        this.mapId = mapId;

        this.mapRecord = -1;

        this.serverRecords = [];

        this.playerNames = [];
    
        this.caps = [];

       // this.lines = [];

       // console.log(this.data);

        
        this.parseData();
        

    }




    parseData(){


        const capReg = /^(\d+\.\d+)\tbtcap\t(.+?)\t(.+?)\t(.+)$/i;
        const recordReg = /^\d+\.\d+\tserver_record\t(.+?)\t(.+)$/i;

        let d = 0;

        let result = 0;
        let capTime = 0;

        let playerName = 0;

        let lastDate = -1;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(capReg.test(d)){

                result = capReg.exec(d);
                //console.log(result);

                capTime = config.btMaxCapTime - parseInt(result[3]);

                capTime = capTime * 0.01;
                //console.log("cap time = "+capTime);

                playerName = this.players.getPlayerName(this.players.getMasterId(parseInt(result[2])));

                if(this.playerNames.indexOf(playerName) == -1){

                    this.playerNames.push(playerName);
                }

                //console.log("PLAYER name is "+this.players.getPlayerName(this.players.getMasterId(parseInt(result[2]))));

               // console.log(playerName + " total id = "+this.players.getPlayerTotalIdByName(playerName));



                this.caps.push({
                    "player": this.players.getMasterId(parseInt(result[2])),
                    "playerName": playerName,
                    "time": capTime,
                    "date": parseInt(result[4])
                });

                lastDate = parseInt(result[4]);
                //captime = result[3] - config.btMaxCapTime
                
            }else if(recordReg.test(d)){

                result = recordReg.exec(d);

               // console.log(result);

               // if(this.serverRecords.length == 0){

                    this.serverRecords.push({
                        "player": this.players.getMasterId(parseInt(result[1])),
                        "time": (config.btMaxCapTime - parseInt(result[2])) * 0.01,
                        "date": parseInt(lastDate)
                    });
               // }
            }

        }

       // console.log(this.caps);
        //console.log(this.serverRecords);
    }


    async insertCap(matchId, mapId, playerId, date, capTime){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_bunnytrack_caps VALUES(NULL,?,?,?,?,?)";

            mysql.query(query, [matchId, mapId, playerId, date, capTime], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }

    async insertData(){

        let d = 0;

        for(let i = 0; i < this.caps.length; i++){

            d = this.caps[i];

            await this.insertCap(this.matchId, this.mapId, this.players.getTotalId(this.players.getPlayerName(d.player)), d.date, d.time);
        }

    }

    getCurrentMapRecord(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT time FROM nutstats_bunnytrack_records WHERE map_id=? ORDER BY time ASC LIMIT 1";

            mysql.query(query, [this.mapId], (err, result) =>{

                if(err) reject(err);

                if(result.length > 0){

                    this.mapRecord = result[0].time;
                }
                
                resolve();

            });
        });
    }

    updateServerRecords(){


        return new Promise((resolve, reject) =>{

           // console.log("this.serverRecords");
           // console.table(this.serverRecords);
           // console.log("this.serverRecords");
            if(this.serverRecords.length == 0){
                resolve();
            }

            this.serverRecords.sort((a,b) =>{

                a = a.time;
                b = b.time;

                if(a > b){
                    return 1;
                }else if(a < b){
                    return -1;
                }

                return 0;
            });


            const query = "INSERT INTO nutstats_bunnytrack_records VALUES(NULL,?,?,?,?,?,0)";
            const updateQuery = "UPDATE nutstats_bunnytrack_records SET player_id=?, match_id=?, date=?, time=?, improvement=? WHERE map_id=? LIMIT 1";

            const p = this.players.getTotalId(this.players.getPlayerName(this.serverRecords[0].player));

            if(this.mapRecord == -1){

                

                mysql.query(query, [this.mapId, p, this.matchId, this.serverRecords[0].date, this.serverRecords[0].time], (err) =>{

                    if(err) reject(err);


                    resolve();
                });

            }else{
               
                if(this.serverRecords[0].time < this.mapRecord){



                    const offset = this.mapRecord - this.serverRecords[0].time;

                    mysql.query(updateQuery, [p, this.matchId, this.serverRecords[0].date, this.serverRecords[0].time, offset, this.mapId], (err) =>{

                        if(err) reject(err);               

                        resolve();

                    });

                }else{

                    resolve();
                }
            }

        });
    }



    async getPlayerCurrentRecords(){

        this.playerRecords = [];

        this.playerTotalIds = [];

        let playerList = [];

        let d = 0;

        let currentId = 0;

        if(this.players.players.length == 0){

            return;
        }

        for(let i = 0; i < this.players.players.length; i++){

            d = this.players.players[i];

            currentId = this.players.getTotalId(d.name);

            if(playerList.indexOf(currentId) == -1){

                this.playerTotalIds.push(currentId);
                playerList.push(currentId);
            }
        }

        return new Promise((resolve, reject) =>{

            if(this.players.players.length == 0){
                resolve();
            }
            const query = "SELECT player_id,time FROM nutstats_bunnytrack_player_records WHERE player_id IN (?)";

            //console.log("SELECT player_id,time FROM nutstats_bunnytrack_player_records WHERE player_id IN ("+playerList+")");
            mysql.query(query, [playerList], (err, result) =>{

                if(err) reject(err);

               // console.log(result);

                this.playerRecords = result;

                resolve();

            });
        });
    }


    getPlayerRecord(id){

        let d = 0;

        for(let i = 0; i < this.playerRecords.length; i++){

            d = this.playerRecords[i];

           // console.log("d");
           // console.log(d);
           // console.log(" looking for "+id);
            //console.log("d");

            if(d.player_id == id){

                return d.time;
            }

        }

        return null;
    }

    getPlayerBestCapTime(name){

        let bestTime = 99999999;

        let returnData = null;

        let d = 0;

        for(let i = 0; i < this.caps.length; i++){

            d = this.caps[i];


            if(d.playerName == name){
                if(d.time < bestTime){
                   // bestTime = d.time;
                    bestTime = d.time;
                    returnData = d;
                    //return d;
                }
            }
            
        }

        return returnData;
    }


    updatePlayerCurrentRecord(matchId, playerId, date, time, improvement){

       // console.log("updateplayercurrentreocrd");

        //console.log("UPDATE nutstats_bunnytrack_player_records SET time="+time+", date="+date+" WHERE match_id="+matchId+" AND player_id="+playerId);

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_bunnytrack_player_records SET time=?, date=?, match_id=?, improvement=? WHERE player_id=?";

            mysql.query(query, [time, date, matchId, improvement, playerId], (err) =>{

                if(err) reject(err);

                resolve();

            });

        });
    }

    updatePlayerRecord(vars){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_bunnytrack_player_records VALUES(NULL,?,?,?,?,?,0)";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async updatePlayerRecords(){

        let currentTime = 0;

        if(this.playerTotalIds == undefined)
            return;
        

        if(this.playerTotalIds.length == 0)
            return; 
        

        let playerId = 0;
        let time = 0;
        let oldRecord = 0;
        let improvement = 0;


        for(let i = 0; i < this.playerTotalIds.length; i++){

            currentTime = this.getPlayerBestCapTime(this.players.getTotalName(this.playerTotalIds[i]));


            playerId = this.playerTotalIds[i];
            time = currentTime;

            if(time != null){

                oldRecord = this.getPlayerRecord(playerId);

                if(oldRecord == null){

                    await this.updatePlayerRecord([this.mapId, playerId, this.matchId, time.date, time.time]);

                }else{

                    if(oldRecord > time.time){

                        improvement = oldRecord - time.time;

                        await this.updatePlayerCurrentRecord(this.matchId, playerId, time.date, time.time, improvement);
                    }
                }
            }
        }
       
    }


    readBtIni(bAlt){


        return new Promise((resolve, reject) =>{

           // this.lines = [];

            let fileLocation = "BT/"+config.btPlusPlusIni;

            if(bAlt != undefined){
                if(bAlt){
                    fileLocation = "BT/"+config.btGameIni;
                }
            }

            fs.readFile(fileLocation, 'utf8', (err, data) =>{
                
                if(err){
                    
                    new Message("warning", "Failed to import BT records from "+fileLocation);
                    //new Message("warning", err);
                    console.trace(err);
                    resolve();
                }

                const lineReg = /(Records\[\d+\]=\(M="CTF-BT-.*",C=\d+,T=\d+,P=".*"\))\r\n/gi;

                let result = "";

                while(result != null){
                
                    result = lineReg.exec(data);

                    if(result != null){

                        this.lines.push(result[1]);
                    }
                }

                new Message("pass","Found "+this.lines.length+" bunnytrack map records to import, from "+fileLocation+".");

                resolve();
            });

        });
        
    }

    createRecordObjects(){

        this.records = [];

        this.foundMaps = [];

        const reg = /^Records\[\d+\]=\(M="(CTF-BT-.+?)",C=(\d+),T=(\d+),P="(.*)"\)$/i;

        let result = "";

        this.playerNames = [];

        for(let i = 0; i < this.lines.length; i++){

            result = reg.exec(this.lines[i]);

            if(result != null){

               // console.table(result);

                if(this.playerNames.indexOf(result[4]) == -1){

                    this.playerNames.push(result[4]);
                }

                this.records.push(
                    {
                        "map": result[1]+".unr",
                        "capTime": parseFloat(((config.btMaxCapTime / 100) - parseFloat(result[2] / 100)).toFixed(2)),
                        "date": parseInt(result[3]),
                        "player": result[4]
                    }
                );

                this.foundMaps.push(result[1]+".unr");
            }
        }

      this.p = new Players();

    }

    checkWhatMapsExists(){

        this.m = new Maps();

        return this.m.getMapIds(this.foundMaps);
    }

    insertNewMapBlank(name){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_map VALUES(NULL,?,'','','',0,0,0,0,0)";

            mysql.query(query, [name], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });

    }

    async insertNewMaps(){


        const newMaps = [];

        const bMapExist = (name) =>{

            for(let i = 0; i < this.m.maps.length; i++){

                if(this.m.maps[i].name == name){
                    return true;
                }

            }

            return false;
        }


        for(let i = 0; i < this.foundMaps.length; i++){

            if(!bMapExist(this.foundMaps[i])){
                newMaps.push(this.foundMaps[i]);
            }

        }


        for(let i = 0; i < newMaps.length; i++){

            await this.insertNewMapBlank(newMaps[i]);
        }

    }


    deleteOldRecords(){


        const maps = [];

        let currentMap = "";

        for(let i = 0; i < this.records.length; i++){

            currentMap = this.getMapId(this.records[i].map);

            if(currentMap != null){

                maps.push(currentMap);

            }else{

                new Message("warning", "CurrentMap is null (deleteOldRecords)");
            }
        }

        const query = "DELETE FROM nutstats_bunnytrack_records WHERE map_id IN(?)";
        

        return new Promise((resolve, reject) =>{

            if(maps.length == 0){
                resolve();
            }

            mysql.query(query, [maps], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });


    }


    getMapId(name){

        for(let i = 0; i < this.m.maps.length; i++){

            //console.log("looking for "+name+" found "+this.m.maps[i].name);
            if(this.m.maps[i].name == name){
                return this.m.maps[i].id;
            }
        }

        return null;

    }

    insertRecord(mapId, playerId, date, capTime){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_bunnytrack_records VALUES(NULL,?,?,-1,?,?,0)";

            mysql.query(query, [mapId, playerId, date, capTime], (err) =>{

                if(err) reject(err);

                new Message("pass", "Inserted record for map "+mapId);

                resolve();

            });

        });
        
    }

    async insertRecords(){
   
        let d = 0;
        let currentMapId = 0;
        let currentPlayerId = 0;

        for(let i = 0; i < this.records.length; i++){

            d = this.records[i];

            currentMapId = this.getMapId(this.records[i].map);

            currentPlayerId = this.getPlayerIndex(this.records[i].player);

            if(currentMapId != null){
                
                await this.insertRecord(currentMapId, currentPlayerId, d.date, d.capTime);

            }else{
                new Message("warning","CurrentMapId is null");
            }
        }

    }

    getPlayerIndex(name){

        let d = 0;


        if(this.p.totalIds == null){
            return null;
        }

        for(let i = 0; i < this.p.totalIds.length; i++){

            d = this.p.totalIds[i];

            if(d.name == name){
                return d.id;
            }
        }

        return null;
    }


    insertBlankGametype(playerId){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_player_totals (name, flag, ip) VALUES(?,'xx','')";

            mysql.query(query, [playerId], (err, result) =>{

                if(err) reject(err);

                //console.log("INSERT ID is = "+result.insertId);
                if(result != undefined){
                    this.p.totalIds.push(result.insertId);
                }

                resolve();
            });

        });
    }

    async insertBlankGametypeData(){

        //check this.p.totalIds with this.playerNames then insert new data if taht player doesnt exist

        const alreadyImported = [];
    
        let currentTotalId = -1;

        for(let i = 0; i < this.records.length; i++){

            currentTotalId = this.getPlayerIndex(this.records[i].player);

            if(currentTotalId == null && alreadyImported.indexOf(this.records[i].player) == -1){

                alreadyImported.push(this.records[i].player);

                await this.insertBlankGametype(this.records[i].player);
                
            }
        }    
    }


    moveInis(newDir){

        fs.rename("BT/"+config.btPlusPlusIni, newDir +"/"+ config.btPlusPlusIni, (err) =>{

            if(err) throw err;
            new Message("pass", "Moved BT/BTPlusPlus.ini to "+newDir+config.btPlusPlusIni);
        });

        fs.rename("BT/"+config.btGameIni, newDir + "/" + config.btGameIni, (err) =>{

            if(err) throw err;

            new Message("pass", "Moved BT/BTGame.ini to "+newDir+config.btGameIni);
        });
    }

    moveImportedInis(){

        const now = new Date();

        const day = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const newDir = config.btIniImportDir+day+"-"+month+"-"+year;

        fs.stat(newDir, (err, stats) =>{

            if(err) new Message("warning", err);

            if(stats != undefined){

                if(stats.isDirectory()){
                    this.moveInis(newDir);
                }else{

                    fs.mkdir(newDir, (err) =>{

                        if(err) throw err;
            
                        this.moveInis(newDir);
            
                    });
                }

            }else{
       
                fs.mkdir(newDir, (err) =>{

                    if(err) throw err;
        
                    this.moveInis(newDir);
        
                });
                
            }
        });

        

        
    }
}




module.exports = BunnyTrack;