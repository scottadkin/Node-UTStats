const Match = require('./match');
const fs = require('fs');
const config = require('./config');
const mysql = require('./database');
const NLog = require('./log');
const Tmp = require('./tmp');
const PlayerManager = require('./playermanager');
const Message = require('./message');
const Weapons = require('./weapons');
const Stats = require('./stats');
const ACE = require('./ace');
//const ftp = require('ftp');
const Importer = require('./ftpimporter');


class LogParser{

    constructor(){

        this.files = [];
        this.logs = [];
        this.tmps = [];
        //this.dir = "../Logs/";
        this.currentLog = 0;
        this.currentTmp = 0;
        this.bReimport = false;

        if(arguments.length == 1){
            this.bReimport = true;
        }

        this.startTime = process.hrtime();
        this.endTime = 0;
        this.nodeStatsData = [];
        this.weaponNames = [];
        this.killData = [];
        this.kills = [];
        this.currentFile = 0;
        this.bCompleted = true;
        this.playerNames = [];
        this.humanPlayers = [];
        this.botPlayers = [];
        this.bFinished = false;
        this.bBTGame = false;
        this.bCTFGame = false;
        this.totalCaps = 0;
        this.distanceData = [];
        this.flagKillData = [];

        this.ace = new ACE();


        this.ftpConnections = [];

        this.init();

    }
    
    async init(){

        try{

            if(!this.bReimport){

                this.getFileNames();
                await this.main();
                //return;

            }else{

                await this.getFileNamesReimport();

                await this.main();    
                return;         

            }

        }catch(e){
            console.trace(e);
            new Message("error",e);   
        }

    }

    reset(){

        this.gameInfo = [];
        this.serverInfo = [];
        this.mapData = [];
        this.kills = [];
        this.weapons = [];
        this.playerData = [];
        this.teamScores = [];
        this.headshotData = [];
        this.ctfData = [];
        this.domData = [];
        this.playerNames = [];
        this.nodeStatsData = [];
        this.humanPlayers = [];
        this.totalCaps = 0;
        this.bCTFGame = false;
        this.bBTGame = false;
        this.botPlayers = [];
        this.distanceData = [];
        this.flagKillData = [];

    }


    async main(){

        

        this.reset();
        
        let d = 0;

        for(let i = 0; i < config.ftpServers.length; i++){

            d = config.ftpServers[i];

            this.ftpConnections.push(new Importer(d.host, d.port, d.user, d.password));
            //new Message("note", "Connecting to ftp "+config.ftpServers[i].host+":"+config.ftpServers[i].port);
        }
       
    }

    /*async main(){
    

        try{

        
            this.reset();
            
            if(this.logs.length > 0){

                await this.importLog();

                if(this.currentLog < this.logs.length){

                    this.main();

                }else{

                    new Message("pass","Imported all logs");

                    let now = process.hrtime();

                    let a = parseFloat(now[0]+"."+now[1]);
                    let b = parseFloat(this.startTime[0]+"."+this.startTime[1]);

                    let diff = a-b;

                    new Message("note","Imported "+this.logs.length+" files in "+diff+" seconds!");

                    await this.ace.import();

                    this.bFinished = true;
            
                }

                await this.importTmpFiles();


            }else{

                await this.ace.import();
                this.bFinished = true;
    
                new Message("pass","No logs found to import.");
            }

        }catch(error){

            console.trace(error);
            new Message("error", error);
            //new Message("error", "Failed to recover from previous error.");
           // throw new Error("FART");
           //process.exit(1);
        }
        
    }*/

    importTmpFile(){

        //return new Promise();
    }

    /*async importTmpFiles(){


        if(config.bMoveTmpFiles){
            
            const now = Date.now() / 1000;

            let stats = 0;
            let d = 0;

            for(let i = 0; i < this.tmps.length; i++){
         
                d = this.tmps[i];

                try{

                    stats = fs.statSync(this.dir+d);//, (err, stats) =>{

                    if(stats != undefined){

                        const aT = stats.atimeMs / 1000;

                        if(now - aT >= config.tmpFileTimeMoveLimit){
                            
                            const t = new Tmp(d);
                            await t.moveFile();
                            
                        }

                    }else{
                        new Message("warning", "fs.stat stats was undefined");
                    } 

                }catch(err){

                    new Message("warning", "Failed to move .tmp file: "+err);
                }
            }
        }
    }*/

    sortFilesByExt(){


        const logFileReg = /^Unreal.ngLog.+\.log$/i;
        const tmpFileReg = /^.+\.tmp$/i;

        let f = 0;

        for(let i = 0; i < this.files.length; i++){

            f = this.files[i];

            if(logFileReg.test(f)){

                this.logs.push(f);

            }else if(tmpFileReg.test(f)){

               // new Message("error", "is a tmp file");

                this.tmps.push(f);

            }
        }


        new Message("pass","Found "+this.logs.length+" log files to import.");
        new Message("pass","Found "+this.tmps.length+" tmp files to import.");
        console.log("------------------------Log files----------------------");
        console.log(this.logs);
        console.log("--------------------- Log files end -------------------");

        console.log("------------------------tmp files----------------------");
        console.log(this.tmps);
        console.log("--------------------- tmp files end -------------------");
    }


    getFileNames(){

       

        if(fs.existsSync(this.dir)){
            new Message("note","Looking for logs in "+this.dir);

            this.files = fs.readdirSync(this.dir,"utf8", (err) =>{
                if(err) new Message("error",err);         
            });
            this.sortFilesByExt();

        }else{
            new Message("error","Failed to read directory "+this.dir);
        }
    }


    async importLog(){

        let current = 0;

        current = fs.readFileSync(this.dir+this.logs[this.currentLog], "utf8",(err) =>{
            if(err) reject(err);
        });

        new Message("note","Starting import for "+this.dir+this.logs[this.currentLog]);

        current = current.replace(/\0/g,'');

        if(current.length >= 1024*1024){
            new Message("Warning", "This log is pretty big, it may take more than a few seconds to import, please don't stop this service if it looks frozen.");
        }

        const log = new NLog(this.logs[this.currentLog]);

        await log.bAlreadyImported();

        if(log.bCanImport){

            this.parseFileData(current);

            if(this.humanPlayers.length >= config.minPlayers){
                
                if(this.bValidCTFGame()){

                    this.weapons = new Weapons(this.killData);

                    await this.weapons.setWeapons();
                    
                    this.parseKillData();
                    this.mergeDistanceAndKills();
                    this.mergeKillsAndLocations();

                    //console.log(this.logs[this.currentLog]);

                    const m = new Match(
                        this.logs[this.currentLog],
                        this.gameInfo,
                        this.serverInfo,
                        this.mapData, 
                        this.kills, 
                        this.weapons, 
                        this.weaponData,
                        this.playerData, 
                        this.playerNames,
                        this.teamScores,
                        this.headshotData,
                        this.connectData,
                        this.teamChangeData,
                        this.parsedPickupData,
                        this.ctfData,
                        this.domData,
                        this.assaultData,
                        this.nodeStatsData,
                        this.bunnyTrackData,
                        this.humanPlayers.length,
                        this.botPlayers.length,
                        this.distanceData, 
                        this.flagKillData,
                        this.spawnData,
                        this.flagPositionData,
                        this.domPositionData,
                        this.itemPositionData
                    );

                    await m.import();

                    const s = new Stats(this.logs[this.currentLog]);

                    await s.updateDayStats();

                    this.currentLog++;

                    await log.updateImportLogDatabase();


                    new Message("pass", "Finished importing file "+this.logs[this.currentLog-1]);

                    if(!this.bReimport){
                        await log.moveLog();
                    }


                }else{

                    await log.updateImportLogDatabase();

                    if(!this.bReimport){
                        await log.moveLog();
                    }

                    this.currentLog++;
                    new Message("warning","There was no flag caps for this match, skipping. You can change this setting in config.js (minCaps)");
             
                }

            }else{

                await log.updateImportLogDatabase();

                if(!this.bReimport){
                    await log.moveLog();
                }    

                this.currentLog++;

                new Message("warning","There was not enough human players in the match, skipping. You can change this setting in config.js (minPlayers)");         
            }

        }else{
            this.currentLog++;
        }
        
    }
    

    bValidCTFGame(){

        if(this.bCTFGame){

            if(this.totalCaps >= config.minCaps){

                return true;

            }

            return false;
        }

        if(this.bBTGame){

            if(this.totalCaps >= config.minCaps){

                return true;

            }

            return false;
        }

        return true;
    }


    //first pass
    parseFileData(file){

        const lineReg = /^(.+)$/img;
        const playerReg = /^\d+\.\d+\tplayer\t.+$/i;
        const gameReg = /^\d+\.\d+\tgame.+$/i;
        const infoReg = /^\d+\.\d+\tinfo.+$/i;
        const mapReg = /^\d+\.\d+\tmap.+$/i;
        const killReg = /^\d+\.\d+\t(kill|teamkill|first_blood).+$/i;
        const distanceReg = /^\d+\.\d+\tnstats\tkill_distance\t.+?\t.+?\t.+$/i;
        const flagReg = /^\d+\.\d+\tflag.+$/i;
        const suicideReg = /^\d+\.\d+\tsuicide\t(.+)\t.+$/i;
        const statPlayerReg = /^\d+\.\d+\tstat_player\t.+$/i;
        const weaponDataReg = /^\d+\.\d+\t(weap_.+?)\t(.+?)\t(.+?)\t(.+)$/;
        const teamScoreReg = /\d+\.\d+\tteamscore.+$/i;
        const pickUpReg = /^\d+\.\d+\titem_get\t.+$/i;
        const pickUpActiveReg = /^\d+\.\d+\t(item_activate)|(item_deactivate)\t.+$/i;
        const headshotReg = /^\d+\.\d+\theadshot\t.+$/i;
        const spawnKillReg = /^\d+\.\d+\tspawnkill\t(.+?)\t(.+?).+$/i;
        const assaultReg = /^\d+\.\d+\tassault.+$/i;
        const domReg = /^\d+\.\d+\t(controlpoint_capture)|(dom_playerscore_update)|(dom_score_update)\t.+?\t.+$/i;
        const nodeStatsReg = /^\d+\.\d+\tnstats\t.+$/i;
        const gameEndReg = /^\d+\.\d+\tgame_end\t.+$/i;
        const btCapReg = /^\d+\.\d+\tbtcap\t.+$/i;
        const btRecordReg = /^\d+\.\d+\tserver_record\t.+$/i;
        const killLocationReg = /^(\d+\.\d+)\tnstats\tkill_location\t(.+?)\t(.+?),(.+?),(.+?)\t(.+?)\t(.+?),(.+?),(.+?)$/i;
        const flagKillReg = /^\d+\.\d+\tnstats\tflag_kill\t.+?\t.+?\t.+?\t.+$/i;
        const spawnReg = /^\d+\.\d+\tnstats\tspawn_point\t(.+?)\t(.+?)\t(.+?),(.+?),(.+?)$/i;
        const flagPositionReg = /^\d+\.\d+\tnstats\tflag_location\t.+$/i;
        const domPositionReg = /^\d+\.\d+\tnstats\tdom_point\t.+$/i;
        const itemPositionReg = /^\d+\.\d+\tnstats\t(ammo|pickup|weapon)_location\t.+$/i;


        const lines = file.match(lineReg);
        
        let playerData = [];
        let gameData = [];
        let infoData = [];
        let mapData = [];
        let killData = [];
        let flagData = [];
        let pickupData = [];
        let headshotData = [];
        let weaponData = [];
        let assaultData = [];
        let domData = [];
        let teamScoreData = [];
        let nodeStatsData = [];
        let bunnyTrackData = [];
        let distanceData = [];
        let killLocationData = [];
        let flagKillData = [];
        let spawnData = [];
        let flagPositionData = [];
        let domPositionData = [];
        let itemPositionData = [];


        for(let i = 0; i < lines.length; i++){

            if(teamScoreReg.test(lines[i])){

                teamScoreData.push(lines[i]);

            }else if(playerReg.test(lines[i])){

                playerData.push(lines[i]);

            }else if(gameReg.test(lines[i]) || teamScoreReg.test(lines[i])){

                gameData.push(lines[i]);

                if(gameEndReg.test(lines[i])){
                    nodeStatsData.push(lines[i]);
                }

            }else if(infoReg.test(lines[i])){

                infoData.push(lines[i]);

            }else if(mapReg.test(lines[i])){

                mapData.push(lines[i]);

            }else if(killReg.test(lines[i]) || suicideReg.test(lines[i])){

                killData.push(lines[i]);

            }else if(flagReg.test(lines[i])){

                flagData.push(lines[i]);

            }else if(statPlayerReg.test(lines[i])){

                playerData.push(lines[i]);

            }else if(pickUpReg.test(lines[i]) || pickUpActiveReg.test(lines[i])){

                pickupData.push(lines[i]);

            }else if(headshotReg.test(lines[i])){

                headshotData.push(lines[i]);

            }else if(weaponDataReg.test(lines[i])){

                weaponData.push(lines[i]);

            }else if(assaultReg.test(lines[i])){

                assaultData.push(lines[i]);

            }else if(domReg.test(lines[i])){

                domData.push(lines[i]);

            }else if(spawnKillReg.test(lines[i])){

                killData.push(lines[i]);

            }else if(distanceReg.test(lines[i])){

                distanceData.push(lines[i]);

            }else if(killLocationReg.test(lines[i])){
                
                killLocationData.push(lines[i]);
                
            }else if(spawnReg.test(lines[i])){
                
                spawnData.push(lines[i]);

            }else if(flagKillReg.test(lines[i])){
                
                flagKillData.push(lines[i]);

            }else if(flagPositionReg.test(lines[i])){
                
                flagPositionData.push(lines[i]);

            }else if(domPositionReg.test(lines[i])){
                
                domPositionData.push(lines[i]);
                
            }else if(itemPositionReg.test(lines[i])){

                itemPositionData.push(lines[i]);

            }else if(nodeStatsReg.test(lines[i])){
       
                nodeStatsData.push(lines[i]);

            }else if(btCapReg.test(lines[i]) || btRecordReg.test(lines[i])){

                this.bBTGame = true;
                bunnyTrackData.push(lines[i]);

            }
        }

        this.itemPositionData = itemPositionData;
        this.domPositionData = domPositionData;
        this.flagPositionData = flagPositionData;
        this.spawnData = spawnData;
        this.flagKillData = flagKillData;
        this.killLocationData = killLocationData;
        this.distanceData = distanceData;
        this.killData = killData;
        this.gameInfo = gameData;
        this.serverInfo = infoData;
        this.playerData = playerData;
        this.mapData = mapData;
        this.flagData = flagData;
        this.domData = domData;
        this.teamScoreData = teamScoreData;
        this.headshotData = headshotData;
        this.pickupData = pickupData;
        this.assaultData = assaultData;
        this.weaponData = weaponData;
        this.nodeStatsData = nodeStatsData;
        this.bunnyTrackData = bunnyTrackData;

        this.parseItemLocationData();
        //this.parsePickupPositionData();
       // this.parseAmmoPositionData();
        this.parseDomPositionData();
        this.parseFlagPositionData();
        this.parseSpawnData();
        this.parseHeadshotData();
        this.parseCTFData();
        this.parseTeamScores();
        this.parseDomData();
        this.parseConnectionData();
        this.parseTeamChanges();
        this.parsePickupData();
        this.parseAssaultData();
        this.findHumanPlayers();
        this.parseDistanceData();
        this.parseKillLocationData();

       // this.mergeDistanceAndKills();

        if(this.humanPlayers.length >= config.minPlayers){

            return true;

        }else{

            new Message("warning", "Player count is less then the minimum specified amount (config.minPlayers = "+config.minPlayers+")");

            return false;
        }

    }

    parseItemLocationData(){

        const data = [];
        const reg = /^\d+\.\d+\tnstats\t(pickup|weapon|ammo)_location\t(.+?)\t(.+?)\t(.+?),(.+?),(.+)$/i;

        let d = 0;
        let result = 0;

        for(let i = 0; i < this.itemPositionData.length; i++){

            d = this.itemPositionData[i];

            result = reg.exec(d);

            data.push({
                "type": result[2],
                "name": result[3],
                "x": parseFloat(result[4]),
                "y": parseFloat(result[5]),
                "z": parseFloat(result[6])
            });
            
        }

        this.itemPositionData = data;
    }


    parseDomPositionData(){

        const data = [];

        const reg = /^\d+\.\d+\tnstats\tdom_point\t(.+?)\t(.+?),(.+?),(.+?)$/i;
        let d = 0;
        let result = 0;

        for(let i = 0; i < this.domPositionData.length; i++){

            d = this.domPositionData[i];

            result = reg.exec(d);

            data.push({
                "name": result[1],
                "x": parseFloat(result[2]),
                "y": parseFloat(result[3]),
                "z": parseFloat(result[4]),
            });
        }

        //console.table(data);
        this.domPositionData = data;
    }

    parseFlagPositionData(){

        const data = [];

        const reg = /^\d+\.\d+\tnstats\tflag_location\t(.+?)\t(.+?)\t(.+?)\t(.+)$/i;

        let d = 0;
        let result = 0;

        for(let i = 0; i < this.flagPositionData.length; i++){

            d = this.flagPositionData[i];

            result = reg.exec(d);

            data.push({
                "team": parseInt(result[1]),
                "x": parseFloat(result[2]),
                "y": parseFloat(result[3]),
                "z": parseFloat(result[4]),
            });
        }


        //console.table(data);
        this.flagPositionData = data;
    }
    parseSpawnData(){

        const data = [];

        const reg = /^\d+\.\d+\tnstats\tspawn_point\t(.+?)\t(.+?)\t(.+?),(.+?),(.+?)$/i;

        let d = 0;
        let result = null;
    
        for(let i = 0; i < this.spawnData.length; i++){

            d = this.spawnData[i];

            result = reg.exec(d);

            data.push({
                "name": result[1],
                "team": parseInt(result[2]),
                "x": parseFloat(result[3]),
                "y": parseFloat(result[4]),
                "z": parseFloat(result[5])
            });
        }

        this.spawnData = data;
    }

    //find the correct stamp for thre kill data
    getMatchingDistance(time, killer, victim){

        let d = 0;

        for(let i = 0; i < this.distanceData.length; i++){

            d = this.distanceData[i];

            if(d.time == time && d.killer == killer && d.victim == victim){
                return d;
            }
        }

        return null;
    }

    mergeDistanceAndKills(){

        let currentData = null;

        let d = 0;

        //console.table(this.kills);

        for(let i = 0; i < this.kills.length; i++){

            d = this.kills[i];

            if(d.type == "spawnKill"){
               // console.log("type == spawnkill");
                continue;
            }

            currentData = this.getMatchingDistance(d.time, d.killer, d.victim);

           // console.log("currentData = "+currentData);
            if(currentData != null){

                this.kills[i].distance = currentData.distance;
            }else{
                //new Message("warning", "Failed to get matching distance data.");
                //console.log(d);
                new Message("warning", "d.time = "+d.time+" d.killer = "+d.killer+" d.victim = "+d.victim);
            }
        }

       // console.table(this.kills);

    }

    parseDistanceData(){

        const reg = /^(\d+\.\d+)\tnstats\tkill_distance\t(.+?)\t(.+?)\t(.+)$/i;

        let result = 0;
        let d = 0;

        const parsedData = [];

        for(let i = 0; i < this.distanceData.length; i++){

            d = this.distanceData[i];

            if(reg.test(d)){

                result = reg.exec(d);

                parsedData.push({
                    "time": parseFloat(result[1]),
                    "distance": parseFloat(result[2]),
                    "killer": parseInt(result[3]),
                    "victim": parseInt(result[4])
                });
            }
        }

        this.distanceData = parsedData;
    }

    parseKillLocationData(){


        const reg = /^(\d+\.\d+)\tnstats\tkill_location\t(.+?)\t(.+?),(.+?),(.+?)\t(.+?)\t(.+?),(.+?),(.+?)$/i;

        let result = 0;
        let d = 0;

        const parsedData = [];

        for(let i = 0; i < this.killLocationData.length; i++){

            d = this.killLocationData[i];

            if(reg.test(d)){

                result = reg.exec(d);

                parsedData.push({
                    "time": parseFloat(result[1]),
                    "killer": parseInt(result[2]),
                    "killerLocation": {"x": parseFloat(result[3]), "y": parseFloat(result[4]), "z": parseFloat(result[5])},
                    "victim": parseInt(result[6]),
                    "victimLocation": {"x": parseFloat(result[7]), "y": parseFloat(result[8]), "z": parseFloat(result[9])}
                });
            }
        }

        //console.table(parsedData);

        this.killLocationData = parsedData;
    }

    setMatchingLocation(input){


        let d = 0;

        for(let i = 0; i < this.kills.length; i++){

            d = this.kills[i];

            if(d.time == input.time && d.killer == input.killer && d.victim == input.victim){

                d.killerLocation = input.killerLocation;
                d.victimLocation = input.victimLocation;

                return;
            }
        }

        new Message("warning", "Could not find match kill to location data!");
    }

    mergeKillsAndLocations(){


        for(let i = 0; i < this.killLocationData.length; i++){

            this.setMatchingLocation(this.killLocationData[i]);
        }
    }

    getPlayerName(id){

        //console.table(this.playerNames);

        let d = 0;

        for(let i = 0; i < this.playerNames.length; i++){

            d = this.playerNames[i];

            //if(d.event == 'connect'){
                if(d.id == id){
                    return d.name;
                }
            //}
        }

        return null;
    }


    findHumanPlayers(){

        const reg = /^\d+\.\d+\tplayer\tisabot\t(.+?)\t(.+)$/i;

        let d = 0;

        let result = 0;

        let bCurrentBot = false;
        let currentId = 0;

        let currentResult = "";

        let currentName = "";

        const alreadyJoined = [];

        this.botPlayers = [];

        for(let i = 0; i < this.playerData.length; i++){

            d = this.playerData[i];

            if(reg.test(d)){

                result = reg.exec(d);

                currentId = parseInt(result[1]);

                currentResult = result[2].toLowerCase();

                currentName = this.getPlayerName(currentId);

                if(currentResult == "true"){
                    //console.log(" is a bot");
                    bCurrentBot = true;
                }else{
                    //console.log(" is not a bot");
                    bCurrentBot = false;
                }

                
                if(currentName != null){

                    if(alreadyJoined.indexOf(currentName) == -1){

                        alreadyJoined.push(currentName);

                        if(!bCurrentBot){

                            if(this.humanPlayers.indexOf(currentId) == -1){  
                                this.humanPlayers.push(currentId);
                            }

                        }else{

                            if(this.botPlayers.indexOf(currentId) == -1){  
                                this.botPlayers.push(currentId);
                            }

                        }
                    }
                }        
            }
        }
    }

    parseWeaponData(){

        const shotReg = /^\d+\.\d+\tweap_shotcount\t(.+?)\t(.+?)\t(.+?)$/i;
        const hitReg = /^\d+\.\d+\tweap_hitcount\t(.+?)\t(.+?)\t(.+?)$/i;
        const damageReg = /^\d+\.\d+\tweap_damagegiven\t(.+?)\t(.+?)\t(.+?)$/i;
        const accuracyReg = /^\d+\.\d+\tweap_accuracy\t(.+?)\t(.+?)\t(.+?)$/i;

        let data = [];

        let result = 0;
        let d = 0;

        const createDataIfNotExist = (player, weapon) =>{


            for(let i = 0; i < data.length; i++){

                if(data[i].player == player && data[i].weapon == weapon){

                    return;
                }
            }

            data.push({"player": player, "weapon": weapon,"kills":0, "shots": 0, "hits": 0, "damage": 0, "accuracy": 0});
        }

        const getDataIndex = (player) =>{

            for(let i = 0; i < data.length; i++){

                if(data[i].player == player){
                    return i;
                }
            }

            return -1;
        }


        let playerIndex = 0;

        for(let i = 0; i < this.weaponData.length; i++){

            d = this.weaponData[i];

            if(shotReg.test(d)){

                result = shotReg.exec(d); 


                createDataIfNotExist(parseInt(result[2]), this.weapons.getIdByName(result[1]));

                playerIndex = getDataIndex(parseInt(result[2]));

                if(playerIndex != -1){
                    data[playerIndex].shots = parseFloat(result[3]);
                }
               
            }else if(hitReg.test(d)){

                result = hitReg.exec(d);

                createDataIfNotExist(parseInt(result[2]), this.weapons.getIdByName(result[1]));

                playerIndex = getDataIndex(parseInt(result[2]));

                if(playerIndex != -1){
                    data[playerIndex].hits = parseFloat(result[3]);
                }
               
            }else if(damageReg.test(d)){

                result = damageReg.exec(d);
                createDataIfNotExist(parseInt(result[2]), this.weapons.getIdByName(result[1]));

                playerIndex = getDataIndex(parseInt(result[2]));

                if(playerIndex != -1){
                    data[playerIndex].damage = parseFloat(result[3]);
                }
                
            }else if(accuracyReg.test(d)){

                result = accuracyReg.exec(d);
                createDataIfNotExist(parseInt(result[2]), this.weapons.getIdByName(result[1]));

                playerIndex = getDataIndex(parseInt(result[2]));

                if(playerIndex != -1){
                    data[playerIndex].accuracy = parseFloat(result[3]);
                }
            }
        }


        this.weaponData = data;

        this.parseWeaponKillData();
    }

    parseWeaponKillData(){

        const reg = /^\d+\.\d+\tkill\t(.+?)\t(.+?)\t.+$/i;

        let result = 0;
        let d = 0;
        
        const getIndex = (player, weapon) =>{

            player = parseInt(player);
            weapon = this.weapons.getIdByName(weapon);

            for(let i = 0; i < this.weaponData.length; i++){

                d = this.weaponData[i];

                if(d.player == player && d.weapon == weapon){

                    return i;
                }
            }
            return -1;
        }


        let currentPlayerId = 0;

        for(let i = 0; i < this.killData.length; i++){

            d = this.killData[i];

            if(reg.test(d)){
                result = reg.exec(d);
                //console.log(result);

                currentPlayerId = getIndex(result[1], result[2]);

                if(currentPlayerId == -1){
                    //new Message("warning", "Failed to find player id that used that weapon id");
                }else{
                    
                    this.weaponData[currentPlayerId].kills++;
                }
            }
        }

    }

    parseAssaultData(){


        const objReg = /^(\d+\.\d+)\tassault_obj\t(.+)\t.+\t(.+)$/i;
        const objNameReg = /^\d+\.\d+\tassault_objname\t(.+)\t(.+)$/i;
        const attackerReg = /^\d+\.\d+\tassault_attacker\t(.+)$/i;

        let d = 0;
        let result = 0;

        let data = [];

        for(let i = 0; i < this.assaultData.length; i++){

            d = this.assaultData[i];

            if(objReg.test(d)){

                result = objReg.exec(d);
                //console.log(result);

                data.push({"type":"cap", "player": parseInt(result[2]), "capId": parseInt(result[3]), "time":parseFloat(result[1])});

            }else if(objNameReg.test(d)){

                result = objNameReg.exec(d);

                data.push({"type":"objName", "id": parseInt(result[1]), "name": result[2]});

            }else if(attackerReg.test(d)){

                result = attackerReg.exec(d);

                data.push({"type":"attackingTeam", "id":parseInt(result[1])});
            }
        }


        this.assaultData = data;
       // console.log(data);
    }


    parsePickupData(){

        const pickupReg = /^(\d+\.\d+)\titem_get\t(.+)\t(.+)$/i;
        const pickupActiveReg = /^(\d+\.\d+)\t(item_activate)|(item_deactivate)\t.+$/i;


        this.parsedPickupData = [];
       // console.log(this.pickupData);

        let d = 0;
        let result = 0;

        let data = [];

        for(let i = 0; i < this.pickupData.length; i++){

            d = this.pickupData[i];

            if(pickupReg.test(d)){

                result = pickupReg.exec(d);


                data.push({"player":parseInt(result[3]), "item": result[2], "time":parseFloat(result[1])});
            }
        }

       //console.log(data);

        this.parsedPickupData = data;
       // console.log(this.parsedPickupData);


    }


    parseTeamChanges(){


        const reg = /^(\d+\.\d+)\tplayer\tteamchange\t(.+)\t(.+)$/i;



        let d = 0;
        let result = 0;


        this.teamChangeData = [];


        for(let i = 0; i < this.playerData.length; i++){

            d = this.playerData[i];

            if(reg.test(d)){
                result = reg.exec(d);

                this.teamChangeData.push({"player":parseInt(result[2]), "newTeam": parseInt(result[3]), "time": parseFloat(result[1])});
                //console.log(result);
            }
        }



       // console.log(this.teamChangeData);

    }

    parseConnectionData(){

        let data = [];

        const connectReg = /^(\d+\.\d+)\tplayer\tconnect\t(.+?)\t(.+?)\t.+$/i;
        const disConnectReg = /^(\d+\.\d+)\tplayer\tdisconnect\t(.+)$/i;


        this.playerNames = [];

        let d = 0;
        let result = 0;

        for(let i = 0; i < this.playerData.length; i++){

            d = this.playerData[i];

            if(connectReg.test(d)){

                result = connectReg.exec(d);

                data.push({"player":parseInt(result[3]), "event":"connect", "time": parseFloat(result[1])});
                //console.log(result[2]+" connected");
                this.playerNames.push({"id":parseInt(result[3]),"name": result[2]});
               // console.log(result);
            }else if(disConnectReg.test(d)){

                result = disConnectReg.exec(d);
                data.push({"player":parseInt(result[2]), "event":"disconnect", "time": parseFloat(result[1])});
            }
        }


        //console.log(data);

        

        this.connectData = data;
    }

    parseHeadshotData(){


        let d = 0;
        let result = 0;

        const headshotReg = /^(\d+\.\d+)\theadshot\t(.+)\t.+$/i;


        let data = [];


        for(let i = 0; i < this.headshotData.length; i++){

            let d = this.headshotData[i];

            if(headshotReg.test(d)){
                result = headshotReg.exec(d);
                //console.log(result);
                data.push({"player":parseInt(result[2]),"time":parseFloat(result[1])});
            }
        }

       // console.log(data);

       this.headshotData = data;
    }


    parseKillData(){

        //console.log(this.killData);
       // console.log(this.killData.length);


        //add team kills
        const reg = /^(\d+?\.\d+?)\tkill\t(.*?)\t(.*?)\t(.*?)\t.+$/i;
        const teamKillReg = /^(\d+?\.\d+?)\tteamkill\t(.*?)\t(.*?)\t(.*?)\t.+$/i;
        const suicideReg = /^(\d+\.\d+)\tsuicide\t(.*?)\t.+$/i;
        const firstBloodReg = /^\d+\.\d+\tfirst_blood\t(.*)$/i;
        const spawnKillReg = /^\d+\.\d+\tspawnkill\t(.*?)\t(.*?)\t.+$/i;

       // console.log("parseKillData");

        let result = 0;
        let d = 0;

        for(let i = 0; i < this.killData.length; i++){

           //console.log(i);

            d = this.killData[i];

            if(reg.test(d)){

                result = reg.exec(d);

                //console.log(result);

                if(this.weaponNames.indexOf(result[3]) == -1){
                    this.weaponNames.push(result[3]);
                }

            

               //console.log("Victim = "+result[4]);
                //console.log("Killer = "+result[2]);
                this.kills.push(
                    {"killer":parseInt(result[2]),
                        "victim": parseInt(result[4]),
                        "weapon": this.weapons.getIdByName(result[3]),
                        "time": parseFloat(result[1]),
                        "bTeamKill":false,
                        "type":"kill",
                        "distance": 0
                        }
                    );
            }else if(teamKillReg.test(d)){

                //don't log team kills for matches where there are no teams.

              //  if(this.teamScores.length < 2){

                    result = teamKillReg.exec(d);

                    this.kills.push(
                        {"killer":parseInt(result[2]),
                        "victim": parseInt(result[4]),
                        "weapon": this.weapons.getIdByName(result[3]),
                        "time": parseFloat(result[1]),
                        "bTeamKill":true,
                        "type":"teamKill",
                        "distance": 0
                        }
                    );
               // }
            }else if(suicideReg.test(d)){

                result = suicideReg.exec(d);

                this.kills.push(
                    {"killer":parseInt(result[2]),
                     "victim": parseInt(result[2]),
                     "weapon": -1,
                     "time": parseFloat(result[1]),
                     "bTeamKill":false,
                     "type":"suicide"
                     }
                 );
            }else if(firstBloodReg.test(d)){

                result = firstBloodReg.exec(d);

                this.kills.push(
                    {"killer":parseInt(1),
                     "victim": -1,
                     "weapon": -1,
                     "time": -1,
                     "bTeamKill":false,
                     "type":"firstBlood"
                     }
                 );
            }else if(spawnKillReg.test(d)){

                result = spawnKillReg.exec(d);

                this.kills.push(
                    {"killer":parseInt(result[1]),
                    "victim": parseInt(result[2]),
                    "weapon": -1,
                    "time": 0,
                    "bTeamKill":false,
                    "type":"spawnKill"
                    }
                );
            }

            
        }

        //console.table(this.kills);


        this.parseWeaponData();

        //console.log(this.kills);
       // c//onsole.log(this.kills);
        //console.log(this.weaponNames);
    }

    parseFlagKillData(){

        const data = [];

        //victim,distance,distancetobase,distancetocap
        const reg = /^(\d+\.\d+)\tnstats\tflag_kill\t(.+?)\t(.+?)\t(.+?)\t(.+?)\t(.+)$/i;


        let d = 0;
        let result = 0;

        for(let i = 0; i < this.flagKillData.length; i++){

            d = this.flagKillData[i];

            if(reg.test(d)){

                result = reg.exec(d);

                //console.log(result);

                data.push({
                    "time": parseFloat(result[1]),
                    "killer": parseInt(result[2]),
                    "victim": parseInt(result[3]),
                    "killDistance": parseFloat(result[4]),
                    "distanceToBase": parseFloat(result[5]),
                    "distanceToCap": parseFloat(result[6])
                });
            }
        }


        //console.table(data);

        this.flagKillData = data;
    }

    parseCTFData(){


        this.parseFlagKillData();

        let d = 0;
        let result = 0;

        this.ctfData = [];

        const takenReg = /^(\d+\.\d+)\tflag_taken\t(.+?)\t+(.+)$/i;
        const pickupReg = /^(\d+\.\d+)\tflag_pickedup\t(.+?)\t+(.+)$/i;
        const capReg = /^(\d+\.\d+)\tflag_captured\t(.+?)\t+(.+)$/i;
        const assistReg = /^(\d+\.\d+)\tflag_assist\t(.+?)\t+(.+)$/i;
        const returnReg = /^(\d+\.\d+)\tflag_returned\t(.+?)\t+(.+)$/i;
        const returnReg2 = /^(\d+\.\d+)\tflag_returned_timeout\t(.+)$/i;
        const dropReg = /^(\d+\.\d+)\tflag_dropped\t(.+?)\t+(.+)$/i;
        const coverReg = /^(\d+\.\d+)\tflag_cover\t(.+?)\t.+\t(.+)$/i;
        const killReg = /^(\d+\.\d+)\tflag_kill\t(.+?)$/i;

        const flagReturnDetailReg = /^(\d+\.\d+)\tflag_(return_.+?)\t(.+?)\t.+$/i; 
    

        if(this.flagData.length > 0){
            this.bCTFGame = true;
        }
        

        for(let i = 0; i < this.flagData.length; i++){

            d = this.flagData[i];

          //  console.log(d);

            if(takenReg.test(d)){

                result = takenReg.exec(d);

                this.ctfData.push({
                    "event":"grab",
                    "time": parseFloat(result[1]),
                    "player": parseInt(result[2]),
                    "team": parseInt(result[3])
                });

            }else if(pickupReg.test(d)){

                result = pickupReg.exec(d);

                this.ctfData.push({
                    "event":"pickup",
                    "time": parseFloat(result[1]),
                    "player": parseInt(result[2]),
                    "team": parseInt(result[3])
                });

            }else if(capReg.test(d)){

                result = capReg.exec(d);

                this.totalCaps++;
                this.ctfData.push({
                    "event":"capture",
                    "time": parseFloat(result[1]),
                    "player": parseInt(result[2]),
                    "team": parseInt(result[3])
                });
            }else if(assistReg.test(d)){

                result = assistReg.exec(d);

                this.ctfData.push({
                    "event":"assist",
                    "time": parseFloat(result[1]),
                    "player": parseInt(result[2]),
                    "team": parseInt(result[3])
                });
            }else if(returnReg.test(d)){

                result = returnReg.exec(d);

                this.ctfData.push({
                    "event":"return",
                    "time": parseFloat(result[1]),
                    "player": parseInt(result[2]),
                    "team": parseInt(result[3])
                });

            }else if(returnReg2.test(d)){
                
                this.ctfData.push({
                    "event":"return2",
                    "time": parseFloat(result[1]),
                    "player": -1,
                    "team": parseInt(result[2])
                });
                
            }else if(dropReg.test(d)){

                result = dropReg.exec(d);

                this.ctfData.push({
                    "event":"dropped",
                    "time": parseFloat(result[1]),
                    "player": parseInt(result[2]),
                    "team": parseInt(result[3])
                });
            }else if(coverReg.test(d)){

                result = coverReg.exec(d);

                this.ctfData.push({
                    "event":"cover",
                    "time": parseFloat(result[1]),
                    "player": parseInt(result[2]),
                    "team": parseInt(result[3])
                });
            }else if(killReg.test(d)){

                result = killReg.exec(d);

                this.ctfData.push({
                    "event":"kill",
                    "time": parseFloat(result[1]),
                    "player": parseInt(result[2]),
                    "team": -1
                });
            }else if(flagReturnDetailReg.test(d)){

               /* result = flagReturnDetailReg.exec(d);


                this.ctfData.push({
                    "event": result[2],
                    "time": parseFloat(result[1]),
                    "player": parseInt(result[3]),
                    "team": -1
                });*/
            }
        }


        //console.log(this.ctfData);
    }


    parseTeamScores(){


        const reg = /^\d+\.\d+\tteamscore\t(.+)\t(.+)$/i;

        this.teamScores = [];

        let result = 0;
        let d = 0;

        for(let i = 0; i < this.teamScoreData.length; i++){

            d = this.teamScoreData[i];

            if(reg.test(d)){

                result = reg.exec(d);

                this.teamScores.push({"team":parseInt(result[1]),"score":parseInt(result[2])});
            }
        }

    }



    parseDomData(){



        let d = 0;
        let result = 0;


        let data = [];

        const playerScore = /^(\d+\.\d+)\tdom_playerscore_update\t(.+)\t(.+)$/i;
        const teamScore = /^(\d+\.\d+)\tdom_score_update\t(.+)\t(.+)$/i;
        const capReg = /^(\d+\.\d+)\tcontrolpoint_capture\t(.+)\t(.+)$/i;
        
        let pointNames = [];

        for(let i = 0; i < this.domData.length; i++){

            d = this.domData[i];

            if(playerScore.test(d)){

                result = playerScore.exec(d);

                data.push({
                    "event":"playerScore",
                    "time": parseFloat(result[1]),
                    "player": parseInt(result[2]),
                    "value":parseInt(result[3])
                });

            }else if(teamScore.test(d)){

                result = teamScore.exec(d);
                
                data.push({
                    "event":"teamScore",
                    "time": parseFloat(result[1]),
                    "team": parseInt(result[2]),
                    "value":parseInt(result[3])
                });

            }else if(capReg.test(d)){

                result = capReg.exec(d);

                data.push({
                    "event":"cap",
                    "time": parseFloat(result[1]),
                    "pointName": result[2],
                    "player":parseInt(result[3])
                });
            }
        }

        this.domData = data;

    }


    
    moveFile(){

        fs.rename(this.dir+this.currentFile,this.dir+"imported/"+this.currentFile, (err) =>{

            if(err) throw err;

            new Message("pass", this.dir+this.currentFile+" has been moved to "+this.dir+"imported/"+this.currentFile);
            
            this.bCompleted = true;
        });
    }


    moveTmpFile(){

        fs.rename(this.dir+this.currentFile, this.dir+"tmpfiles/"+this.currentFile, (err) =>{

            if(err) throw err;

            this.bCompleted = true;

            new Message("pass",this.dir+this.currentFile+" has been moved to "+this.dir+"tmpfiles/"+this.currentFile);

        });
    }


    getFileNamesReimport(){

        return new Promise((resolve, reject) =>{

            const mainDir = config.importDir;

            this.validFiles = [];
            this.foundFiles = [];

            const dirReg = /^logs\-\d{4,}\-\d{2}$/i;
            const logFileReg = /^Unreal.ngLog.+\.log$/i;

            const validDirs = [];
            const validFiles = [];

            fs.readdir(mainDir, (err, files) =>{

                if(err) reject(err);

                for(let i = 0; i < files.length; i++){

                    if(dirReg.test(files[i])){
                        validDirs.push(files[i]);
                    }

                }

                let currentFiles = 0;

                for(let i = 0; i < validDirs.length; i++){

                    currentFiles = fs.readdirSync(mainDir+validDirs[i]);

                    for(let f = 0; f < currentFiles.length; f++){

                        if(logFileReg.test(currentFiles[i])){

                            this.logs.push(mainDir+validDirs[i]+"/"+currentFiles[f])
                        }
                    }       
                }

                resolve();
            });
        });
    }



}


module.exports = LogParser;
