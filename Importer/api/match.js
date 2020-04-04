const Player = require('./player');
const fs = require('fs');
const mysql = require('./database');
const Weapons = require('./weapons');
const Dates = require('./dates');
const Gametype = require('./gametype');
const PlayerManager = require('./playermanager');
const config = require('./config');
const Map = require('./map');
const Promise = require('promise');
const Message = require('./message');
const Domination = require('./domination');
const CTF = require('./ctf');
const Assault = require('./assault');
const Faces = require('./faces');
const Voices = require('./voices');
const MonsterHunt = require('./monsterhunt');
const BunnyTrack = require('./bunnytrack');
const Servers = require('./servers');
const Items = require('./items');

//const log = require('./log');
//console.log(log);

const MULTI_KILL_LIMIT = 3;

class Match{

    constructor(fileName, gameData, serverData, mapData, killData, weaponData, weaponStats, playerData, playerNames, teamScores, headshots, connectData,
                teamChangeData, pickupData, ctfData, domData, assaultData, nodeStatsData, bunnyTrackData, totalHumans, totalBots, distanceData,
                flagKillData, spawnData, flagPositionData, domPositionData, itemPositionData, spawnLocationData){


        this.fileName = fileName;
        //console.log(gameData);
        this.teamChangeData = teamChangeData;

        this.pickupData = pickupData;
        this.assaultData = assaultData;

        this.totalHumans = totalHumans;

        this.killData = killData;
        this.connectData = connectData;
       // console.log(killData);
       // console.log(gameData);
        this.serverData = serverData;
        this.gameData = gameData;

        this.mapData =mapData;

        this.playerData = playerData;

        this.ctfData = ctfData;

        this.teamScores = teamScores;

        this.headshotData = headshots;

        this.weaponStats = weaponStats;

        //console.log(this.headshotData);
        
        this.playerNames = playerNames;
       // console.log(this.playerNames);

        this.totalBots = totalBots;

        this.weapons = weaponData;

       // console.log(this.weapons);


        this.domData = domData;


        this.nodeStatsData = nodeStatsData;
        //console.log(this.domData);

        this.bunnyTrackData = bunnyTrackData;

        this.distanceData = distanceData;
        this.flagKillData = flagKillData;
        this.spawnData = spawnData;
        this.flagPositionData = flagPositionData;
        this.domPositionData = domPositionData;
        this.itemPositionData = itemPositionData;
        this.spawnLocationData = spawnLocationData;

      //  console.table(this.distanceData);

        //console.log(this.bunnyTrackData);

        this.bBunnytrackMatch = (this.bunnyTrackData.length > 0) ? true : false;


        this.winnerScore = 0;

        this.dm = {
            "winner":0,
            "score":0
        };
        this.bCompleted = false;

        this.players = [];
        this.server = {"version":0,"date":"","ip":"","port":"","name":"","admin":"","email":"","motd":[]};
        this.match = {
            "bInsta":false,
            "mutators": [],
            "gametype":"Noname",
            "gameClass": "",
            "bHumansOnly":false,
            "bWeaponsStay":false,
            "fragLimit":0,
            "timeLimit":0,
            "bHardCore":false,
            "bMegaSpeed":false,
            "airControl":1.00000,
            "bJumpMatch":false,
            "bTranslocator":false,
            "bTournamentMode":false,
            "teamScoreLimit":0,
            "friendlyFireScale":0,
            "matchStart":0,
            "matchEnd":0,
            "map":"",
            "mapTitle":"",
            "mapAuthor":"",
            "timeLimit":0,
            "fragLimit":0
        };

        this.totalTeams = 0;

        this.mapId = 0;

        this.date = 0;
 
        this.dmWinnerId = -1;

        this.playerIds = [];
        
    }

    
    bMatchEnd(){

        const reg = /^\d+\.\d+\tgame_end\thunt successfull!$/i;

        for(let i = 0; i < this.nodeStatsData.length; i++){

            //console.log(this.nodeStatsData[i]);
            if(reg.test(this.nodeStatsData[i])){
               // console.log("FOUND IT FOUND IT");
                return true;

            }
        }


        return false;
    }


    async import(){


        try{
            
            let bCanImport = false;

            if(this.killData.length > 0){

                bCanImport = true;
            }

            if(this.bunnyTrackData.length > 0){
                bCanImport = true;
            }


            if(bCanImport){

                this.setServerInfo();

                await this.setGameInfo();

                this.map = new Map(this.mapData, this.match.playTime, this.server.date, this.spawnData);
                //console.log(this.map);
                await this.map.getMapId();
                await this.map.insertSpawnData();


                const server = new Servers();
                await server.init(this.server.name, this.server.ip, this.server.port, this.server.date, this.match.matchEnd - this.match.matchStart);

                new Message("pass", "Inserted map data.");
                this.players = new PlayerManager(this.playerData, this.gametype.gametypeId, this.match.matchEnd, this.server.date, this.nodeStatsData, this.teamChangeData);

                await this.insertMatch();

                const f = new Faces(this.players);
                await f.updateFaceStats();
            
                const v = new Voices(this.players);
                await v.updateVoiceStats();

                this.setKills();

                this.items = new Items(this.matchId, this.map.mapId, this.pickupData, this.itemPositionData, this.players);
                await this.items.insertPickups();
                await this.items.insertPickupLocations();
               // await this.insertPickupData();
                await this.insertTeamChangeData();
                await this.insertConnectionData();
                await this.insertKillData();
                await this.insertMatchData();
                await this.insertWeaponStats();
                await this.insertSpawnLocationData();


                new Message("pass", "Import complete");

            }else{

                new Message("warning", "No killdata for this match, skipping.");
                
            }

        }catch(err){

            console.trace(err);

            new Message("error", err);
        }

    }


    setWinningPlayers(){



        let d = 0;

        let winningTeam = 0;
        let bestScore = 0;


        for(let i = 0; i < this.teamScores.length; i++){

            if(i == 0 || this.teamScores[i].score > bestScore){ 

                bestScore = this.teamScores[i].score;
                winningTeam = this.teamScores[i].team;
                this.winnerScore = this.teamScores[i].score;

            }
         
        }


        let bCurrentMonsterHunt = false;
        
        for(let i = 0; i < this.players.players.length; i++){

            d = this.players.players[i];

            const monsterHuntReg = /monsterhunt|monster hunt|coop/i;

            

            if(this.totalTeams < 2){

               // console.log(this.totalTeams+" winner id = "+this.dm.winner);

                bCurrentMonsterHunt = monsterHuntReg.test(this.gametype.name);

                if(d.name == this.dm.winner){
                    d.bWinner = 1;
                    this.winnerScore = d.points;
                }else if(bCurrentMonsterHunt && this.bMatchEnd()){
                    d.bWinner = 1;
                    this.winnerScore = d.points;
                }

            }else{

                if(d.team == winningTeam){
                    d.bWinner = 1;
                }

            }
        }

        //console.log("Winner score = "+this.winnerScore);

    }


    updateMatchWinner(){


        return new Promise((resolve, reject) =>{


            let bestScore = 0;
            let bestPlayer = "player";

            let d = 0;

            for(let i = 0; i < this.players.players.length; i++){

                d = this.players.players[i];



                if(config.bIgnoreBots){

                    if(d.bBot){
                        continue;
                    }
                }
                

                
                if(i == 0 || d.points > bestScore){

                    bestScore = d.points;
                    bestPlayer = d.name;
                }
                
            }

            const query = "UPDATE nutstats_match SET dm_winner=?, dm_winner_score=?, winner_score=? WHERE id=?";

            mysql.query(query, [bestPlayer, bestScore, bestScore, this.matchId], (err, result) =>{

              // console.log("UPDATE nutstats_match SET dm_winner='"+bestPlayer+"' AND dm_winner_score="+bestScore+" WHERE id="+this.matchId);

           
                if(err) reject(err);

                //console.log(result);

                resolve();
            });

        });
    }
    

    async insertMatchData(){


        try{

            this.setWinningPlayers();

            if(this.bDomination()){
                
                new Message("note", "Gametype is Domination.");

            

                const domGame = new Domination(this.matchId, this.domData, this.players, this.domPositionData);
                
                await domGame.insert();
                await domGame.insertPositions(this.map.mapId, this.map.name);
                await this.players.insertData(this.matchId);
                await this.updateMatchWinner();

            
            }else if(this.bCTF()){

                const ctfGame = new CTF(this.matchId, this.ctfData, this.players, this.map.mapId, this.flagKillData);

                ctfGame.insertFlagPositions(this.flagPositionData, this.map.mapId, this.map.name);

                await ctfGame.insertCTFData();
                await ctfGame.insertCaps();
                ctfGame.mergeFlagKillData();
                await ctfGame.insertFlagKillData();
                await this.players.insertData(this.matchId);
                await this.updateMatchWinner();
                
            }else if(this.bAssault()){

                new Message("note", "Gametype is Assault.");

                const assaultGame = new Assault(this.matchId, this.map.mapId, this.assaultData, this.players);

                await assaultGame.insert();
                await this.players.insertData(this.matchId);                
                await this.updateMatchWinner();

                
            }else if(this.bMonsterHunt()){
                
                new Message("note", "Gametype is MonsterHunt.");

                const mh = new MonsterHunt(this.matchId, this.map.mapId, this.nodeStatsData, this.players);

                await this.players.getPlayerTotalIds(this.players.playerNames);
                await mh.insertData();
                await this.players.insertData(this.matchId);
                await this.updateMatchWinner();
                
                
            }else if(this.bBT()){
                
                new Message("note", "Gametype is BunnyTrack.");

                const bt = new BunnyTrack(this.bunnyTrackData, this.players, this.matchId, this.map.mapId);

                await this.players.insertData(this.matchId);
                await this.players.getPlayerTotalIds(bt.playerNames);
                await bt.getCurrentMapRecord();
                await bt.insertData();
                await bt.updateServerRecords();
                await bt.getPlayerCurrentRecords();
                await bt.updatePlayerRecords();

            }else{

                new Message("note","Gametype is"+this.gametype.name);

                await this.players.insertData(this.matchId);         
                await this.updateMatchWinner();

            }
        }catch(err){

            console.trace(err);
            new Message("error", "Failed to insert match data: "+err);
        }

    }


    insertTeamChangeData(){

        return new Promise((resolve, reject) =>{


            /*const toInsert = this.teamChangeData.length;
            let inserted = 0;

            const query = "INSERT INTO nutstats_team_changes VALUES(NULL,?,?,?,?)";

            if(toInsert == 0){
                resolve();
            }

            let d = 0;

            for(let i = 0; i < toInsert; i++){

                d = this.teamChangeData[i];

                mysql.query(query, [this.matchId, d.player, d.time, d.newTeam], (err) =>{
                    if(err) reject("match.insertTeamChangeData "+err);

                    inserted++;

                    if(inserted >= toInsert){
                        new Message("pass", "Inserted all team change data ("+inserted+"/"+toInsert+")");
                        resolve();
                    }
                });
            }*/

            resolve();

        });
    }

    async insertWeaponStats(){

        await this.weapons.insertData(this.matchId, this.weaponStats, this.players, this.playerNames)

    }

    insertConnectionData(){


        return new Promise((resolve, reject) =>{


            const toInsert = this.connectData.length;
            let inserted = 0;

            if(toInsert > 0){

                const query = "INSERT INTO nutstats_connects VALUES(NULL,?,?,?,?)";

                let d = 0;
                let currentEvent = 0;

                for(let i = 0; i < this.connectData.length; i++){

                    d = this.connectData[i];

                    if(d.event == "connect"){
                        currentEvent = 0;
                    }else{
                        currentEvent = 1;
                    }


                    mysql.query(query, [this.matchId, d.player, currentEvent, d.time], (err) =>{
                        if(err) reject("match.insertConnectionData "+err);

                        inserted++;

                        if(inserted >= toInsert){

                            new Message("pass","Inserted all connection data ("+inserted+"/"+toInsert+")");
                            resolve();
                        }
                    });

                }

            }else{
                resolve();
            }
        });
    }


    getTotalKillData(){

        let total = 0;

        let d = 0;

        for(let i = 0; i < this.killData.length; i++){

            d = this.killData[i];

            if(d.type == "kill" || d.type == "teamKill" || d.type == "suicide"){
                total++;
            }
        }


        return total;
    }


    insertHeadshot(vars){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_headshots VALUES(NULL,?,?,?)";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }

    async insertHeadshotData(){
        
        let d = 0;

        for(let i = 0; i < this.headshotData.length; i++){

            d = this.headshotData[i];

            await this.insertHeadshot([this.matchId, this.players.getMasterId(d.player), d.time]);

        }
    }

    insertKill(vars){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_kills VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?)";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async insertKillData(){


        let d = 0;

        let currentWeapon = 0;

        for(let i = 0; i < this.killData.length; i++){

            d = this.killData[i];

            if(d.type == "kill" || d.type == "teamKill" || d.type == "suicide"){

                if(d.weapon == -1){
                    currentWeapon = 0;
                }else{
                    currentWeapon = d.weapon;
                }

                if(d.killer == d.killer){

                    if(d.victim == d.victim){

                        if(d.killerLocation == undefined){
                            d.killerLocation = {"x": 0, "y":0, "z": 0};
                        }

                        if(d.victimLocation == undefined){
                            d.victimLocation = {"x": 0, "y":0, "z": 0};
                        }

                        if(d.distance == undefined){
                            d.distance = -1;
                        }

                        if(d.distance == null){
                            d.distance = -1;
                        }

                        await this.insertKill(
                        [
                            this.matchId, 
                            this.players.getMasterId(d.killer), 
                            this.players.getMasterId(d.victim), 
                            currentWeapon, 
                            d.time, 
                            d.distance, 
                            d.killerLocation.x, 
                            d.killerLocation.y, 
                            d.killerLocation.z, 
                            d.victimLocation.x,
                            d.victimLocation.y,
                            d.victimLocation.z
                        ]);
                        
                    }else{
                        new Message("warning", "[match.insertKillData] d.victim is NaN, skipping query.");
                        
                    }
                }else{
                    new Message("warning", "[match.insertKillData] d.killer is NaN, skipping query.");
                }
    
        
            }
        }

        await this.insertHeadshotData();

    }

    debugDiplayKills(){


        let p = 0;

        for(let i = 0; i < this.players.players.length; i++){

            p = this.players.players[i];

            //console.log(p.multis);
        }
    }


    bDM(){

        const reg = /deathmatch|death match/i;

        if(reg.test(this.gametype.name)){

            new Message("note", "Gametype is deathmatch");

            return true;
        }

        return false;
    }


    bLMS(){

        const reg = /last man standing/i;

        if(reg.test(this.gametype.name)){
            
            new Message("note", "Gametype is Last Man Standing");

            return true;
        }
        return false;
    }

    bDomination(){


        const reg = /domination/i;

        if(reg.test(this.gametype.name)){
            new Message("note","Gametype is Domination");

            return true;
        }


        return false;
    }

    bBT(){

        if(this.bunnyTrackData.length > 0){ 
            return true;
        }

        return false;
    }

    bCTF(){

        if(this.bunnyTrackData.length != 0){
            return false;
        }

        const reg = /capture the flag|ctf/i;
        const reg2 = /botpack\.ctfgame/i;



        //console.log(this.match);

        if(reg.test(this.gametype.name)){
            new Message("note","Gametype is CTF");

            return true;
        }
        
        if(reg2.test(this.match.gameClass)){

            new Message("note", "Gametype is CTF (className)");
            return true;
        }
        


        return false;
    }


    bAssault(){


        const reg = /assault/i;

        if(reg.test(this.gametype.name)){
            new Message("note", "Gametype is Assault");

            return true;
        }



        return false;
    }


    bMonsterHunt(){

        const reg = /monster hunt|monsterhunt|coop/i;

        if(reg.test(this.gametype.name)){

            new Message("note","Gametype is MonsterHunt");

            return true;
        }

        return false;
    }


    //

    async setGameInfo(){

        const gametypeReg = /^\d+\.\d+\tgame\tgameName\t(.+)$/i;
        const gameClassReg = /^\d+\.\d+\tgame\tGameClass\t(.+)$/i;
        const mutatorReg = /^\d+\.\d+\tgame\tgoodmutator\t(.+)$/i;
        const startReg = /^(\d+\.\d+)\trealstart$/i;
        const endReg = /^(\d+\.\d+)\tgame_end.+$/i;
        const fragLimitReg = /^\d+\.\d+\tgame\tfraglimit\t(.+)$/i;
        const timeLimitReg = /^\d+\.\d+\tgame\ttimelimit\t(.+)$/i;
        const instagibReg = /^\d+\.\d+\tgame\tinsta\t(.+)$/i;


        let result = 0;
        let d = 0;


       // console.log(this.gameData);
        


        for(let i = 0; i < this.gameData.length; i++){

            d = this.gameData[i];


            
            if(gametypeReg.test(d)){

                result = gametypeReg.exec(d);
                this.match.gametype = result[1];

            }else if(gameClassReg.test(d)){

                result = gameClassReg.exec(d);
                this.match.gameClass = result[1];
                
            }else if(mutatorReg.test(d)){

                //console.log("FOUND A MUTATOR");
                
                result = mutatorReg.exec(d);

                this.match.mutators.push(result[1]);

            }else if(startReg.test(d)){

                result = startReg.exec(d);

                this.match.matchStart = parseFloat(result[1]);
            }else if(endReg.test(d)){
                result = endReg.exec(d);

                this.match.matchEnd = parseFloat(result[1]);

            }else if(fragLimitReg.test(d)){

                result = fragLimitReg.exec(d);

                this.match.fragLimit = parseInt(result[1]);

            }else if(timeLimitReg.test(d)){

                result = timeLimitReg.exec(d);

                this.match.timeLimit = parseInt(result[1]);
                
            }else if(instagibReg.test(d)){

                result = instagibReg.exec(d);
              //  console.log(result);

                let insta = result[1].toLowerCase();

                if(insta == "true"){
                    this.match.bInsta = true;
                }
            }

        }


        if(this.match.bInsta){
            this.match.gametype = this.match.gametype + " (Instagib)";
        }


       // return new Promise((resolve, reject) =>{

            let playTime = this.match.matchEnd - this.match.matchStart;

            if(playTime < 0){
                playTime = 0;
            }

            this.match.playTime = playTime;
            const bBt = (this.bunnyTrackData.length > 0) ? true : false;

            this.gametype = new Gametype(this.match.gametype, playTime, this.server.date, bBt);

            await this.gametype.updateGametype();
       // });

        //console.log(this.match);
    }


    setServerInfo(){


        const nameReg = /^\d+\.\d+\tinfo\tserver_servername\t(.+)$/i;
        const adminReg = /^\d+\.\d+\tinfo\tserver_adminname\t(.+)$/i;
        const emailReg = /^\d+\.\d+\tinfo\tserver_adminemail\t(.+)$/i;
        const ipReg = /^\d+\.\d+\tinfo\ttrue_server_ip\t(.+)$/i;
        const portReg = /^\d+\.\d+\tinfo\tserver_port\t(.+)$/i;
        const dateReg = /^\d+\.\d+\tinfo\tabsolute_time\t(.+)$/i;
        const motdReg = /^\d+\.\d+\tinfo\tserver_motdline\d\t(.+)$/i;


        let result = 0;
        let d = 0;


        for(let i = 0; i < this.serverData.length; i++){

            d = this.serverData[i];

            if(nameReg.test(d)){

                result = nameReg.exec(d);
                this.server.name = result[1];

            }else if(adminReg.test(d)){

                result = adminReg.exec(d);

                this.server.admin = result[1];

            }else if(emailReg.test(d)){

                result = emailReg.exec(d);

                this.server.email = result[1];

            }else if(ipReg.test(d)){

                result = ipReg.exec(d);

                this.server.ip = result[1];

            }else if(portReg.test(d)){

                result = portReg.exec(d);
                this.server.port = result[1];
            }else if(dateReg.test(d)){

                result = dateReg.exec(d);
                this.server.date = result[1];

                this.setDate(result[1]);

            }else if(motdReg.test(d)){

                result = motdReg.exec(d);

                this.server.motd.push(result[1]);
            }
        }


        //console.log(this.server);
    }


    setDate(data){

        //let date = new Date();

        const reg = /^(.{4})\.(.{2})\.(.{2})\.(.{2})\.(.{2}).+$/i;

        //console.log(reg.exec(data));

        if(reg.test(data)){
            
            let result = reg.exec(data);

            const year = parseInt(result[1]);
            const month = parseInt(result[2]) - 1;
            const day = parseInt(result[3]);
            const hour = parseInt(result[4]);
            const minute = parseInt(result[5]);

            let date = new Date(year, month, day, hour, minute);
            //console.log(date);
            //console.log(date.getTime() * 0.001);
            this.server.date = date.getTime() * 0.001;
        }
    }


    getTeamscore(teamId){

        for(let i = 0; i < this.teamScores.length; i++){

            if(this.teamScores[i].team == teamId){
                return this.teamScores[i];
            }
        }


        return -1;
    }


    insertMatch(){


        //console.log("insert match");


        return new Promise((resolve, reject) =>{

            //console.log("inside promise");
            //console.log("insertMatch");

            const query = "INSERT INTO nutstats_match VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?)";


            let redScore = this.getTeamscore(0);
            let blueScore = this.getTeamscore(1);
            let greenScore = this.getTeamscore(2);
            let yellowScore = this.getTeamscore(3);

            let scores = [];

            let dmWinner = 0;
            let dmWinnerScore = 0;

            let best = 0;

            if(redScore == -1){
                redScore = 0;
            }else{
                redScore = redScore.score;
                scores.push({"team":0,"score": redScore});
            }

            if(blueScore == -1){
                blueScore = 0;
            }else{
                blueScore = blueScore.score;
                scores.push({"team":1,"score": blueScore});
            }


            if(greenScore == -1){
                greenScore = 0;
            }else{
                greenScore = greenScore.score;
                scores.push({"team":2,"score": greenScore});
            }


            if(yellowScore == -1){
                yellowScore = 0;
            }else{
                yellowScore = yellowScore.score;
                scores.push({"team":3,"score": yellowScore});
            }

            //let ts = [redScore, blueScore, greenScore, yellowScore];

            //console.log(best);
            //dm or lms games
           if(scores.length <= 1){
              // console.log("DM");

                best = this.players.getBestPlayerData(false);
                dmWinner = best.player;
                dmWinnerScore = best.score;

                this.dm.winner = best.player;
                this.dm.winnerScore = best.score;
                this.dmWinnerId = best.id;
            
            }else{
               // console.log("NOT DM OR LMS");
            }

           // console.log("dmWinner = "+dmWinner);

            scores.sort((a,b) =>{

                a = a.score;
                b = b.score;

                if(a > b){
                    return -1;
                }else if(a < b){
                    return 1;
                }else{
                    return 0;
                }
            });

            //console.log(scores);
           // console.log("can you see me ehre");

           // let winningTeam = scores[0].team;

           let winningTeam = 0;

           if(scores.length > 0){
                winningTeam = scores[0].team;
           }


           
            //console.log("can you see me ehre");

           // const motd = this.server.motd[0] + " ^^^ "+this.server.motd[1]+" ^^^ "+this.server.motd[2]+" ^^^ "+this.server.motd[3];

            let motd = "";

            for(let i = 0; i < this.server.motd.length; i++){
                motd += "[motd]"+this.server.motd[i]+"[/motd],";
            }

            const playTime = this.match.matchEnd - this.match.matchStart;


            let mutatorString = "";
            

            for(let i = 0; i < this.match.mutators.length; i++){

                mutatorString += this.match.mutators[i];

                if(i < this.match.mutators.length - 1){
                    mutatorString += ", ";
                }
            }


            //console.log("meow");
            
            this.totalTeams = scores.length;

            //console.log("Total teams = "+scores.length);

            mysql.query(query,[
                this.server.date, 
                this.server.name, 
                this.server.ip+":"+this.server.port, 
                this.server.admin, 
                this.server.email, 
                motd,
                this.gametype.gametypeId, 
                this.map.mapId,
                mutatorString,
                this.totalHumans,
                this.totalBots,
                scores.length,
                redScore,
                blueScore,
                greenScore,
                yellowScore,
                "Player",
                dmWinnerScore,
                this.match.matchStart,
                this.match.matchEnd,
                playTime,
                this.match.fragLimit,
                this.match.timeLimit,
                winningTeam,
                this.winnerScore,
                this.match.gameClass,
                this.fileName
            ], 
            (err, result) =>{
                if(err){
                    new Message("error", "(match.insertData) "+err);
                    throw err;
                    reject(err);
                } 

                //console.log("qqqqqqqqqqqqqqqqqqqqqqqq");
                

                this.matchId = result.insertId;

                resolve();
            });
        });
    }



    setKills(){


        let instigator = 0;
        let victim = 0;
        let weapon = 0;

        let d = 0;

        for(let i = 0; i < this.killData.length; i++){
            
            d = this.killData[i];

            instigator = this.players.getPlayerById(d.killer);
            victim = this.players.getPlayerById(d.victim);

            if(instigator != -1){


                //dont update kill count from suicides

                    //dont count spawnkills twice

                if(d.distance != undefined){

                    instigator.updateKillDistances(d.distance);

                }
                if(d.type != "spawnkill"){

                    if(!d.bTeamKill){
                        instigator.killedPlayer(d.time, d.victim, d.weapon);
                    }else{

                        //if(!this.bDM() && !this.bLMS()){
                            instigator.killedPlayer(d.time, d.victim, d.weapon,true);
                       // }else{
                       //     instigator.killedPlayer(d.time, d.victim, d.weapon);
                        //}
                    }
                }

                

                if(d.killer != d.victim){
                    if(d.type == "spawnKill"){
                        //new Message("error","sssssssssssssssssssssssssssssssssssssssssssssssssssssss");
                        instigator.spawnKilledPlayer();
                    }
                }

            }
            //if(d.killer != d.victim){
                if(victim != -1){

                    victim.killed(d.killer);
                }
            //}
        }



        let cp = 0;

        for(let i = 0; i < this.players.players.length; i++){

            cp = this.players.players[i];//.matchFinished();
           // cp.updateSpree();
           // cp.updateMulti();
            cp.matchFinished();
           // console.log(cp.name+ "\t\tdied = "+cp.deaths+"\t kills = "+cp.kills+" \tid = "+cp.id);
        }




        this.setHeadshots();
    }


    setHeadshots(){

        for(let i = 0; i < this.headshotData.length; i++){

            this.players.updatePlayer(this.headshotData[i].player, "headshots", "++");
        }
    }


    insertPlayerSpawnPosition(data){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_spawns VALUES(NULL,?,?,?,?,?,?)";

            mysql.query(query, [this.matchId,this.map.mapId, data.player, data.x, data.y, data.z], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async insertSpawnLocationData(){

        let d = 0;

        for(let i = 0; i < this.spawnLocationData.length; i++){

            d = this.spawnLocationData[i];

            await this.insertPlayerSpawnPosition(d);

        }
    }
}




module.exports = Match;
