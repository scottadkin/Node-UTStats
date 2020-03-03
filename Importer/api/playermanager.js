const Message = require('./message');
const Player = require('./player');
const mysql = require('./database');
const Rankings = require('./rankings');
const Promise = require('promise');
const config = require('./config');
const geoip = require('geoip-lite');
/**
 * 
 * class to manage player objects
 */
class PlayerManager{



    constructor(data, gametype, matchEnd, matchDate, nodeStatsData, teamChangeData){

        if(arguments.length == 0){
            return;
        }

        this.data = data;

        this.gametype = gametype;
        this.players = [];
        this.matchEnd = parseFloat(matchEnd);

        this.matchDate = matchDate;

        this.nodeStatsData = nodeStatsData;

        this.teamChangeData = teamChangeData;

        //console.log(teamChangeData);


        this.uniquePlayers = 0;

        this.playerNames = [];

        this.playerTotalData = [];

        this.playerGametypeTotalIds = [];

        //name followed by ids that name uses during match
        this.playerIds = [];

        this.duplicateIds = [];

        this.createPlayers();

        this.setPlayTime();
        this.setPlayerTeams();

    }



   
    updatePlayerIds(name, id){



        for(let i = 0; i < this.playerIds.length; i++){

            if(this.playerIds[i].name == name){

                this.playerIds[i].ids.push(id);

                return;
            }
        }

        //if we have gotten here there is no data for that player

        this.playerIds.push({"name": name, "ids": [id], "masterId": id});
    }
    

    createPlayers(){

        const connectReg = /^(\d+\.\d+)\tplayer\tconnect\t(.+?)\t(.+?)\t.+$/i; 
        //const playerLeave = /^(\d+\.\d+)\tplayer\tdisconnect\t(.+)$/i;
        
        const playerIp = /^(\d+\.\d+)\tplayer\tip\t(.+)\t(.+)$/i;

        //16.49	player	IsABot	2	True
        const playerbBot = /^\d+\.\d+\tplayer\tisabot\t(.+)\t(.+)$/i;
        const playerPing = /^\d+\.\d+\tplayer\tping\t(.+)\t(.+)$/i;
        
        //const playerFace = /^\d+\.\d+\tplayer\tface_uts\t(.+)\t(.+)$/i;


        let result = "";

        let d = 0;

        let geo = 0;

       // console.log(this.data);

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];
           // console.log(d);
            //console.log(i);
            if(connectReg.test(d)){

                //console.log(connectReg.exec(data[i]));

                result = connectReg.exec(d);

                //console.log(result);

               // this.playerIds.push({"name":result[2], "ids": [parseInt(result[3])]});

                this.updatePlayerIds(result[2], parseInt(result[3]));

                //console.log(this.playerIds);

                if(this.playerNames.indexOf(result[2]) == -1){
                    this.playerNames.push(result[2]);
                    this.uniquePlayers++;
                }
                this.addPlayer(new Player(parseInt(result[3]), result[2], parseFloat(result[1]), this.gametype));

                //this.data.splice(i,1);

            }else if(playerIp.test(d)){


                result = playerIp.exec(d);

                this.updatePlayer(parseInt(result[2]), "ip", result[3]);
                //if(result[3]){

                geo = geoip.lookup(result[3]);
                //console.log(geo);
                if(geo != null && geo != undefined){
                    this.updatePlayer(parseInt(result[2]), "flag", geo.country);
                }
               // }
                //this.data.splice(i,1);

            }else if(playerbBot.test(d)){

                result = playerbBot.exec(d);

                let value = result[2];

                if(value.toLowerCase() == "true"){
                    value = 1;
                }else{
                    value = 0;
                }


                this.updatePlayer(parseInt(result[1]), "bBot", value);
                //this.data.splice(i,1);

            }else if(playerPing.test(d)){

                result = playerPing.exec(d);

                this.updatePlayer(parseInt(result[1]), "pingData", parseInt(result[2]),true);
                //this.data.splice(i,1);
            }/*else if(playerFace.test(d)){


                result = playerFace.exec(d);

                console.log(result);

                this.updatePlayer(parseInt(result[1]), "face", result[2].toLowerCase());
            }*/

        }


        //rename players here because player\trename happens before player connect :thinking:

        //console.log(this.players[0]);

        this.setNodeStatsData();


        this.renamePlayers();

        this.setPlayerStatData();
        //this.setPlayerTeams();
        this.setPingData();
        //console.log("gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg");
        //console.log(this.players);


       // console.log("playerbnames = ");
        //console.log(this.playerNames);

        //console.log(this.data);

    }



    getMasterId(id){

        for(let i = 0; i < this.playerIds.length; i++){

            if(this.playerIds[i].ids.indexOf(id) != -1){

                return this.playerIds[i].masterId;
            }
        }

        return id;
    }


    setNodeStatsData(){

        const faceReg = /^\d+\.\d+\tnstats\tface\t(.+?)\t(.+)$/i;
        const voiceReg = /^\d+\.\d+\tnstats\tvoice\t(.+?)\t(.+)$/i;
        const netspeedReg = /^\d+\.\d+\tnstats\tnetspeed\t(.+?)\t(.+)$/i;
        const fovReg = /^\d+\.\d+\tnstats\tfov\t(.+?)\t(.+)$/i;
        const mouseReg = /^\d+\.\d+\tnstats\tmousesens\t(.+?)\t(.+)$/i;
        const dodgeReg = /^\d+\.\d+\tnstats\tdodgeclicktime\t(.+?)\t(.+)$/i;
        const spawnKillReg = /^\d+\.\d+\tnstats\tspawnkills\t(.+?)\t(.+?)$/i;
        const spawnKillSpreeReg = /^\d+\.\d+\tnstats\tbestspawnkillspree\t(.+?)\t(.+)$/i;
        const shortestKillTimeReg = /^\d+\.\d+\tnstats\tshortesttimebetweenkills\t(.+?)\t(.+)$/i;
        const longestKillTimeReg = /^\d+\.\d+\tnstats\tlongesttimebetweenkills\t(.+?)\t(.+)$/i;
        

        let result = 0;
        let d = 0;

        for(let i = 0; i < this.nodeStatsData.length; i++){

            d = this.nodeStatsData[i];

           //console.log(d);

            if(faceReg.test(d)){

                result = faceReg.exec(d);

                //console.log(result);

                this.updatePlayer(parseInt(result[1]), "face", result[2].toLowerCase());

               // console.log(result[2]);

            }else if(voiceReg.test(d)){

                result = voiceReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "voice", result[2].toLowerCase())

                //console.log(result[2]);

            }else if(netspeedReg.test(d)){

                result = netspeedReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "netspeed", result[2]);

            }else if(fovReg.test(d)){

                result = fovReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "fov", parseFloat(result[2]));

            }else if(mouseReg.test(d)){

                result = mouseReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "mouseSens", parseFloat(result[2]));

            }else if(dodgeReg.test(d)){

                result = dodgeReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "dodgeClickTime", parseFloat(result[2]));

            }else if(spawnKillReg.test(d)){

                result = spawnKillReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "spawnKills", parseInt(result[2]));

            }else if(spawnKillSpreeReg.test(d)){

                result = spawnKillSpreeReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "bestSpawnKillSpree", parseInt(result[2]));

            }else if(shortestKillTimeReg.test(d)){

                result = shortestKillTimeReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "shortestKillTime", parseFloat(result[2]));

            }else if(longestKillTimeReg.test(d)){

                result = longestKillTimeReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "longestKillTime", parseFloat(result[2]));
            }
        }
    }

    //set utstats data if log has that data
    setPlayerStatData(){


        const scoreReg = /^\d+\.\d+\tstat_player\tscore\t(.+)\t(.+)$/i;
        const suicideReg = /^\d+\.\d+\tstat_player\tsuicides\t(.+)\t(.+)$/i;
        const serverTimeReg = /^\d+\.\d+\tstat_player\ttime_on_server\t(.+)\t(.+)$/i;
        const ttlReg = /^\d+\.\d+\tstat_player\tttl\t(.+)\t(.+)$/i;
        //const fragsReg = /^\d+\.\d+\tstat_player\tfrags\t(.+)\t(.+)$/i;
        const killsReg = /^\d+\.\d+\tstat_player\tkills\t(.+)\t(.+)$/i;
        const teamKillsReg = /^\d+\.\d+\tstat_player\tteamkills\t(.+)\t(.+)$/i;
        const deathsReg = /^\d+\.\d+\tstat_player\tdeaths\t(.+)\t(.+)$/i;



        let result = 0;
        let d = 0;


        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(scoreReg.test(d)){
                result = scoreReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "points", parseInt(result[2]));

            }else if(suicideReg.test(d)){
                result = suicideReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "suicides", parseInt(result[2]));
            }else if(serverTimeReg.test(d)){
                result = serverTimeReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "timeOnServer", parseFloat(result[2]));

            }else if(ttlReg.test(d)){
                result = ttlReg.exec(d);

                this.updatePlayer(parseInt(result[1]), "ttl", parseFloat(result[2]));

            }else if(killsReg.test(d)){

                result = killsReg.exec(d);
                this.updatePlayer(parseInt(result[1]), "kills", parseInt(result[2]));

            }else if(deathsReg.test(d)){

                result = deathsReg.exec(d);
                this.updatePlayer(parseInt(result[1]), "deaths", parseInt(result[2]));

            }else if(teamKillsReg.test(d)){

                result = teamKillsReg.exec(d);
                this.updatePlayer(parseInt(result[1]), "teamKills", parseInt(result[2]));
            }

        }

    }

    setPingData(){


        const reg = /^\d+\.\d+\tplayer\tping\t(.+?)\t(.+?)$/i;

        let d = 0;
        let result = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(reg.test(d)){
                //console.log("ping");
                result = reg.exec(d);

                this.updatePlayer(parseInt(result[1]), "pingData", parseInt(result[2]), true);

               // this.data.splice(i,1);
            }
        }

        //console.log(this.data);

        let totalPing = 0;



        for(let p = 0; p < this.players.length; p++){

            //console.log(this.players[p].pingData);


            if(this.players[p].pingData.length > 0){
                
                totalPing = 0;

                for(let d = 0; d < this.players[p].pingData.length; d++){

            
                    totalPing += this.players[p].pingData[d];

                    //set first values
                    if(d == 0){
                        this.players[p].bestPing = this.players[p].pingData[d];
                        this.players[p].worstPing = this.players[p].pingData[d];
                    }else{


                        if(this.players[p].bestPing > this.players[p].pingData[d]){

                            this.players[p].bestPing = this.players[p].pingData[d];

                        }else if(this.players[p].worstPing < this.players[p].pingData[d]){

                            this.players[p].worstPing = this.players[p].pingData[d];
                        }
                    }
                }

                if(totalPing > 0){

                    if(this.players[p].pingData.length > 0){
                        this.players[p].averagePing = totalPing / this.players[p].pingData.length;
                    }
                }
            }
        }
    }


    setPlayerTeams(){



        let result = 0;
        let d = 0;


        const reg = /^\d+\.\d+\tplayer\tteam\t(.+?)\t(.+)$/i;
        const teamChangeReg = /^\d+\.\d+\tplayer\tteamchange\t(.+?)\t(.+)$/i;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(reg.test(d)){

                result = reg.exec(d);
                this.updatePlayer(parseInt(result[1]),"team", parseInt(result[2]));

                this.data.splice(i,1);
            }else if(teamChangeReg.test(d)){

                result = teamChangeReg.exec(d);
                this.updatePlayer(parseInt(result[1]),"team", parseInt(result[2]));
                this.data.splice(i,1);
            }

        }
    }


    addPlayer(newPlayer){

        this.players.push(newPlayer);
    }




    getPlayerById(id){


        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].id == id){
                return this.players[i];
            }
        }



        return -1;
    }


    getPlayerTeamAt(playerId, time){

        let d = 0;

        let currentTeam = -1;


        for(let i = 0; i < this.teamChangeData.length; i++){

            d = this.teamChangeData[i];

            if(d.time > time){
                break;
            }

            if(d.player == playerId){

                if(d.time <= time){
                    
                    currentTeam = d.newTeam;
                }

            }



        }


        return currentTeam;
    }

    getPlayerByNameAlt(name){

        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].name == name){
                return this.players[i];
            }
        }



        return -1;
    }

    updatePlayer(playerId, field, value){

        const player = this.getPlayerById(playerId);

       // console.log("Trying to change player."+field+" to "+value);


        if(field == "face"){
            //console.log(player.name + " face = "+value);
        }

        if(player != -1){

            if(arguments.length < 4){
                if(value != "++"){
                    player[field] = value;
                }else{
                    player[field]++;
                }
               // new Message("pass", 'Changed player.'+field+' to '+value);
            }else{
                player[field].push(value);
                //new Message("pass", 'Changed player.'+field+'  Added '+value+' to array');
            }
            

        }else{
           // new Message("warning", 'Failed to update player! A player with that id('+playerId+') field=['+field+'] value='+value+' doesn\'t exist!');
        }
    }





    renamePlayers(){

        const reg = /^(\d+\.\d+)\tplayer\trename\t(.+)\t(.+)$/i;

        let result = "";

        for(let i = 0; i < this.data.length; i++){

            //console.log(i);
            if(reg.test(this.data[i])){

                result = reg.exec(this.data[i]);

                if(this.getPlayerById(parseInt[3]) != -1){
                    this.updatePlayer(parseInt(result[3]), "name", result[2]);
                }

                

                this.data.splice(i, 1);
            }

        }

        
        
        //for(let i = 0; i < this.players.length; i++){
            //console.log(this.players[i].name);
        //}
   
    }



    getPlayerById(id){

        id = parseInt(id);

        

        for(let i = 0; i < this.players.length; i++){

            //console.log("Looking for "+id+" found "+this.players[i].id);
            if(this.players[i].id == id){
                return this.players[i];
            }
        }


        return -1;
    }



    setPlayTime(){

       // console.log(this.data);

       // const connectReg = /^(\d+\.\d+)\tplayer\tconnect\t(.+?)\t(.+?)\t.+$/i; 
        const disConnectReg = /^(\d+\.\d+)\tplayer\tdisconnect\t(.+?)/i; 

        let d = 0;
        let result = 0;

        let timeDiff = 0;

        let cp = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(disConnectReg.test(d)){

                result = disConnectReg.exec(d);

                cp = this.getPlayerById(parseInt(result[2]));

                if(cp != -1){

                    timeDiff = parseFloat(result[1]) - cp.joined;

                    this.updatePlayer(parseInt(result[2]), "timeOnServer", timeDiff);
                }          
                
                this.data.splice(i,1);
            }
        }


        //now set timeOnServer for players that havent left

        for(let i = 0; i < this.players.length; i++){

            cp = this.players[i];

            if(cp.timeOnServer === 0){

                cp.timeOnServer = this.matchEnd - cp.joined;
            }

            //console.log(cp.timeOnServer);
        }
    }



    createPlayerTotal(name, ip, flag, gametype, date){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_player_totals VALUES(NULL,?,?,?,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,?,0,0,0,0,0,0,0,0,0,0,?,0,0,0,0,0,'','',0,0,0,0,0,0,0,-1,-1,-1,-1)";

            mysql.query(query, [name, ip, flag, gametype, date], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async createNewTotals(players, gametype){

        
        let player = 0;

        for(let i = 0; i < players.length; i++){

            player = this.getPlayerByNameAlt(players[i]);

            if(player != -1){

                await this.createPlayerTotal(player.name, player.ip, player.flag, gametype, this.matchDate);
                
            }
        }
    }

    async reloadPlayerTotalData(gametype){

        if(gametype == 0){

            await this.setPlayerTotalData();

        }else{

            await this.setPlayerTotalData(true);

        }
    }


    getPlayerCurrentTotals(names, gametype){


        //this.playerTotalData = null;

        const query = "SELECT id,name,best_spree,best_multi,last_played,kills,deaths,suicides,best_spawn_kill_spree FROM nutstats_player_totals WHERE gametype=? AND name IN(?)";

        return new Promise((resolve, reject) =>{


            mysql.query(query, [gametype, names], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.playerTotalData = result;

                }

                resolve();

            });
        });
    }

    async setPlayerTotalData(){


        let gametypeId = 0;

        if(arguments.length == 1){
            gametypeId = parseInt(this.gametype);
        }


        const bNameExist = (name) =>{

            for(let i = 0; i < this.playerTotalData.length; i++){

                if(this.playerTotalData[i].name == name){
                    return true;
                }
            }

            return false;
        }

        if(this.playerNames.length > 0){

            await this.getPlayerCurrentTotals(this.playerNames, gametypeId);

            if(this.playerTotalData.length == this.playerNames.length){
                //no new players to insert
                return;
            }

            let newPlayers = [];
           
            for(let i = 0; i < this.playerNames.length; i++){

                if(!bNameExist(this.playerNames[i])){
                    newPlayers.push(this.playerNames[i]);
                }
            }
    
            if(newPlayers.length > 0){

                await this.createNewTotals(newPlayers, gametypeId);
                await this.reloadPlayerTotalData(gametypeId);

            }
        }        
    }



    getPlayerTotalValue(player, field){

        let p = 0;

        //console.log("looking for "+player+"'s best "+field);
        for(let i = 0; i < this.playerTotalData.length; i++){
             
            p = this.playerTotalData[i];

            if(p.name == player){

                if(p[field] != undefined){
                    //console.log("looking for "+player+"'s best "+field+" its = "+p[field]);
                    return p[field];
                }
            }
            
        }

        //new Message("warning","player with that name does not exist");
        return false;
    }



    getBestValue(playerName, value, totalField){


        const currentBestValue = this.getPlayerTotalValue(playerName, totalField);

       // console.log("currentBestVclaue = "+currentBestValue);
        if(currentBestValue !== false){
            
            if(value > currentBestValue){
                return value;
            }else{
                return currentBestValue;
            }
        }

        //console.log("nooooooooooooooooooooooooooo");

        //return the current best value if there is no data
        return value;


    }


    getEff(kills, deaths, suicides){

        if(kills > 0){

            if(deaths == 0){
                return 100;
            }else{
                return (kills / (kills + deaths + suicides)) * 100;
            }
        }else{

            if(deaths > 0){
                return 0;s
            }else{
                return (kills / (kills + deaths + suicides)) * 100;
            }
        }
    }


    updatePlayerTotal(vars){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nutstats_player_totals SET 
                ip=?, 
                flag=?,
                points=points+?,
                kills=kills+?, 
                headshots=headshots+?,
                team_kills=team_kills+?,
                deaths=deaths+?,
                suicides=suicides+?,
                eff=?,
                m1=m1+?,
                m2=m2+?,
                m3=m3+?,
                m4=m4+?,
                m5=m5+?,
                m6=m6+?,
                m7=m7+?,
                s1=s1+?,
                s2=s2+?,
                s3=s3+?,
                s4=s4+?,
                s5=s5+?,
                s6=s6+?,
                s7=s7+?,
                best_multi=?,
                best_spree=?,  
                flag_caps=flag_caps+?,
                flag_grabs=flag_grabs+?,
                flag_assists=flag_assists+?, 
                flag_drops=flag_drops+?, 
                flag_returns=flag_returns+?, 
                flag_covers=flag_covers+?, 
                flag_kills=flag_kills+?,         
                flag_pickups=flag_pickups+?,         
                dom_caps=dom_caps+?,
                assault_caps=assault_caps+?,
                total_time=total_time+?,
                total_matches=total_matches+1,   
                first_blood=first_blood+?,      
                last_played=?,
                last_match=?,
                last_match_date=?,
                wins=wins+?,
                spawn_kills=spawn_kills+?,
                flag_saves=flag_saves+?,
                face=?,
                voice=?,
                fov=?,
                netspeed=?,
                mouse_sens=?,
                dodge_click_time=?,
                best_spawn_kill_spree=?,
                monster_kills=monster_kills+?,
                shortest_distance_kill=?,
                longest_distance_kill=?,
                shortest_kill_time=?,
                longest_kill_time=?
                WHERE id=? AND gametype=?`;

                mysql.query(query, vars, (err) =>{

                    if(err) reject(err);

                    resolve();
                });

        });
    }

    async updateTotals(gametype){

        gametype = parseInt(gametype);

        if(gametype !== gametype){
            new Message("err","Gametype is NaN");
        }
            
        let p = 0;

        let currentPlayerId = 0;

        let bestSpree = 0;
        let bestMulti = 0;
        let lastPlayed = 0;

        let bestSpawnKillSpree = 0;

        let eff = 0;

        let longestKillDistance = null;
        let shortestKillDistance = null;
        let shortestKillTime = null;
        let longestKillTime = null;

        for(let i = 0; i < this.players.length; i++){
            
            p = this.players[i];

            if(p.bBot === 1){

                if(config.bIgnoreBots){

                    new Message("warning", p.name+" is a bot skipping.");
                    continue;
                }

            }


            currentPlayerId = this.getPlayerTotalIdByName(p.name);

            if(currentPlayerId != -1){


                bestSpree = this.getBestValue(p.name, p.bestSpree, "best_spree");
                bestMulti = this.getBestValue(p.name, p.bestMulti, "best_multi");
                lastPlayed = this.getBestValue(p.name, this.matchDate, "last_played");
                bestSpawnKillSpree = this.getBestValue(p.name, p.bestSpawnKillSpree, "best_spawn_kill_spree");

                //new Message("error", this.getBestValue(p.name, p.longestKillDistance, "longest_distance_kill"));

                longestKillDistance = this.getBestValue(p.name, p.longestKillDistance, "longest_distance_kill");
                shortestKillDistance = this.getBestValue(p.name, p.shortestKillDistance, "shortest_distance_kill");

                shortestKillTime = this.getBestValue(p.name, p.shortestKillTime, "shortest_kill_time");
                longestKillTime = this.getBestValue(p.name, p.longestKillTime, "longest_kill_time");

                //make sure it's not null to stop query from failing
                if(longestKillDistance == null){

                    longestKillDistance = p.longestKillDistance;

                    if(longestKillDistance == null){
                        longestKillDistance = -1;
                    }
                }
          

                if(shortestKillDistance == null){

                    shortestKillDistance = p.shortestKillDistance;

                    if(shortestKillDistance == null){
                        shortestKillDistance = -1;
                    }
                }

                if(shortestKillDistance == 0){
                    shortestKillDistance = -1;
                }

                if(longestKillDistance == 0){
                    longestKillDistance = -1;
                }

                if(shortestKillTime == null){

                    shortestKillTime = p.shortestKillTime;

                    if(shortestKillTime == null){
                        shortestKillTime = -1;
                    }
                }

                if(shortestKillTime == 0){
                    shortestKillTime = -1;
                }

                if(longestKillTime == null){

                    longestKillTime = p.longestKillTime;

                    if(longestKillTime == null){
                        longestKillTime = -1;
                    }
                }

                if(longestKillTime == 0){
                    longestKillTime = -1;
                }

                //new Message("error", "Longest kill = "+longestKillDistance+", shortest = "+shortestKillDistance);
                //pass -1 because kills deaths and suicides will always be zero or positive
                eff = this.getEff(
                    this.getBestValue(p.name,-1, "kills") + p.kills,
                    this.getBestValue(p.name,-1, "deaths") + p.deaths,
                    this.getBestValue(p.name,-1, "suicides") + p.suicides
                );

                if(eff !== eff){
                    eff = 0;
                }

                if(p.timeOnServer == undefined || p.timeOnServer !== p.timeOnServer){
                    new Error("error","p.timeOnServer");
                    p.timeOnServer = 0;
                }
                
                await this.updatePlayerTotal([
                        p.ip, 
                        p.flag,
                        p.points, 
                        p.kills, 
                        p.headshots,
                        p.teamKills,
                        p.deaths, 
                        p.suicides,
                        eff,
                        p.multis.double,
                        p.multis.multi,
                        p.multis.mega,
                        p.multis.ultra,
                        p.multis.monster,
                        p.multis.ludicrous,
                        p.multis.holy,
                        p.sprees.spree,
                        p.sprees.rampage,
                        p.sprees.dominating,
                        p.sprees.unstoppable,
                        p.sprees.godlike,
                        p.sprees.massacre,
                        p.sprees.brutalizing,
                        bestMulti,
                        bestSpree,
                        p.flagCaps,
                        p.flagGrabs,
                        p.flagAssists,
                        p.flagDrops,
                        p.flagReturns,
                        p.flagCovers,
                        p.flagKills,
                        p.flagPickups,
                        p.domCaps,
                        p.assaultCaps,
                        p.timeOnServer,
                        p.firstBlood,
                        lastPlayed, 
                        this.matchId,
                        this.matchDate,
                        p.bWinner,
                        p.spawnKills,
                        p.flagSaves,
                        p.face,
                        p.voice,
                        p.fov,
                        p.netspeed,
                        p.mouseSens,
                        p.dodgeClickTime,
                        bestSpawnKillSpree,
                        p.monsterKills,
                        shortestKillDistance, 
                        longestKillDistance,
                        shortestKillTime,
                        longestKillTime,
                        currentPlayerId, 
                        gametype
                    ]);
                
                
            }else{
                new Message("warning","Failed to update "+p.name+" totals for gametype="+gametype);
            }
        }

    }



    getPlayerTotalIdByName(name){

        let p = 0;
        for(let i = 0; i < this.playerTotalData.length; i++){

            p = this.playerTotalData[i];

           // console.log("Looking for "+name+" found "+p.name);

            if(p.name == name){
                //console.log(p);
                //console.log("p.id ======= "+p.id);
                return p.id;
            }
        }

        return -1;

    }
    




    setPlayerGametypeTotals(){

    }


    insertMatchData(vars){

        return new Promise((resolve, reject) =>{

            const query = `INSERT INTO nutstats_player VALUES(
                NULL,
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
                )`;

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });

        });
    }


    async insertPlayerMatchData(){

        let d = 0;
        let currentPlayerId = 0;
        let eff = 0;

        for(let i = 0; i < this.players.length; i++){
            //  new Message("error",i);
            d = this.players[i];

            if(d.bBot === 1){

                if(config.bIgnoreBots){
                    continue;
                }
                
            }

            currentPlayerId = this.getPlayerTotalIdByName(d.name);

            eff = 0;

            if(d.kills > 0){

                if(d.deaths == 0){
                    eff = 100;
                }else{
                    eff = (d.kills / (d.kills + d.deaths)) * 100;
                }
            }

            if(currentPlayerId != -1){

                await this.insertMatchData([
                    this.matchId,
                    d.id,
                    currentPlayerId,
                    d.name,
                    d.face,
                    d.ip,
                    d.flag,
                    d.team,
                    d.points,
                    d.kills,
                    d.headshots,
                    d.teamKills,
                    d.deaths,
                    d.suicides,
                    eff,
                    d.multis.double,
                    d.multis.multi,
                    d.multis.mega,
                    d.multis.ultra,
                    d.multis.monster,
                    d.multis.ludicrous,
                    d.multis.holy,
                    d.sprees.spree,
                    d.sprees.rampage,
                    d.sprees.dominating,
                    d.sprees.unstoppable,
                    d.sprees.godlike,
                    d.sprees.massacre,
                    d.sprees.brutalizing,
                    d.bestMulti,
                    d.bestSpree,
                    d.flagCaps,
                    d.flagGrabs,
                    d.flagAssists,
                    d.flagDrops,
                    d.flagReturns,
                    d.flagCovers,
                    0,
                    d.flagKills,
                    d.flagPickups,
                    d.timeOnServer,
                    d.ttl,
                    d.bBot,
                    d.bestPing,
                    d.averagePing,
                    d.worstPing,
                    this.gametype,
                    d.domCaps,
                    d.assaultCaps,
                    d.damage,
                    d.firstBlood,
                    d.bWinner,
                    d.spawnKills,
                    d.flagSaves,
                    d.voice,
                    d.netspeed,
                    d.fov,
                    d.mouseSens,
                    d.dodgeClickTime,//UPDATE PLAYER TOTALS STUFF AND INSERT
                    d.bestSpawnKillSpree,
                    d.monsterKills,
                    (d.shortestKillDistance != null) ?  d.shortestKillDistance : -1 ,
                    (d.longestKillDistance != null) ? d.longestKillDistance : -1,
                    (d.shortestKillTime != null) ? d.shortestKillTime : -1,
                    (d.longestKillTime != null) ? d.longestKillTime : -1
                ]);

            }else{
                //gsdhgio jdsigojdsogjndsiojgdsn gdsing sdinsert new player totals
            }
        }
    }


    updateTeamChangeData(){

       // console.table(this.players);

        for(let i = 0; i < this.players.length; i++){

  
            for(let x = 0; x < this.teamChangeData.length; x++){

                if(this.players[i].ids.indexOf(this.teamChangeData[x].player) != -1){
                   // console.log("FOUNDNDNDNDNDN");
                    this.teamChangeData[x].player = this.players[i].id;
                }
            }

        }


        //console.table(this.teamChangeData);
    }



    insertTeamChange(vars){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_team_changes VALUES(NULL,?,?,?,?)";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();

            });


        });
    }

    async insertTeamChangeData(){

        let d = 0;

        for(let i = 0; i < this.teamChangeData.length; i++){

            d = this.teamChangeData[i];

            await this.insertTeamChange([this.matchId, d.player, d.time, d.newTeam]);
        }
    }

    mergeDuplicates(){


        const masters = [];



        const getIndex = (name) =>{


            let d = 0;

            for(let i = 0; i < masters.length; i++){

                d = masters[i];

                if(d.name == name){
                    return i;
                }

            }

            return -1;
        }

        let d = 0;


        let currentIndex = 0;

        let m = 0;

        for(let i = 0; i < this.players.length; i++){

            d = this.players[i];

            currentIndex = getIndex(d.name);

            if(currentIndex == -1){
                masters.push(d);
                masters[masters.length - 1].ids = [];
           
            }else{
                //console.log("player already exists");
                
                
                m = masters[currentIndex];

                //m.id = d.id;
                m.ids.push(d.id); 

                //console.log(m.ids);
                m.kills += d.kills;
                m.deaths += d.deaths;

                m.team = d.team;

                //test to see if it fixes players scores after reconnect
               // m.points += d.points;

                if(d.points > m.points){
                    m.points = d.points;
                }

                m.headshots += d.headshots;
                m.teamKills += d.teamKills;
                m.suicides += d.suicides;

                m.multis.double += d.multis.double;
                m.multis.multi += d.multis.multi;
                m.multis.mega += d.multis.mega;
                m.multis.ultra += d.multis.ultra;
                m.multis.monster += d.multis.monster;
                m.multis.ludicrous += d.multis.ludicrous;
                m.multis.holy += d.multis.holy;
                m.sprees.spree += d.sprees.spree;
                m.sprees.rampage += d.sprees.rampage;
                m.sprees.dominating += d.sprees.dominating;
                m.sprees.unstoppable += d.sprees.unstoppable;
                m.sprees.godlike += d.sprees.godlike;
                m.sprees.massacre += d.sprees.massacre;
                m.sprees.brutalizing += d.sprees.brutalizing;
                m.bestMulti = (m.bestMulti < d.bestMulti) ? d.bestMulti : m.bestMulti;        
                m.bestSpree = (m.bestSpree < d.bestSpree) ? d.bestSpree : m.bestSpree;  
                m.flagCaps += d.flagCaps;
                m.flagGrabs +=  d.flagGrabs;
                m.flagAssists += d.flagAssists;
                m.flagDrops += d.flagDrops;
                m.flagReturns += d.flagReturns;
                m.flagCovers += d.flagCovers;
                m.flagKills += d.flagKills;
                m.flagPickups += d.flagPickups;
                m.timeOnServer += d.timeOnServer;
                m.ttl = (m.ttl + d.ttl != 0) ? (m.ttl + d.ttl) / 2 : 0;
                m.bBot = d.bBot;
                m.bestPing = (d.bestPing < m.bestPing) ? d.bestPing : m.bestPing;
                m.averagePing = (m.averagePing + d.averagePing != 0) ? (m.averagePing + d.averagePing) / 2 : 0;
                m.worstPing = (d.worstPing > m.worstPing) ? d.worstPing : m.worstPing;
                m.domCaps += d.domCaps;
                m.assaultCaps += d.assaultCaps;
                m.damage += d.damage;
                m.firstBlood = (d.firstBlood == 1 || m.firstBlood == 1) ? 1 : 0;        
                m.bWinner = d.bWinner;   
                m.spawnKills += d.spawnKills;
                m.flagSaves += d.flagSaves;
                m.monsterKills += d.monsterKills;
                m.bestSpawnKillSpree = (d.bestSpawnKillSpree > m.bestSpawnKillSpree) ? d.bestSpawnKillSpree : m.bestSpawnKillSpree ;

                if(d.longestKillDistance > m.longestKillDistance){
                    m.longestKillDistance = d.longestKillDistance;
                }

                if(d.shortestKillDistance < m.shortestKillDistance){
                    m.shortestKillDistance = d.shortestKillDistance;
                }


                if(d.longestKillTime != null){
                    if(d.longestKillTime > m.longestKillTime){
                        m.longestKillTime = d.longestKillTime;
                    }
                }

                if(d.shortestKillTime != null){
                    if(d.shortestKillTime < m.shortestKillTime){
                        m.shortestKillTime = d.shortestKillTime;
                    }
                }
                //this.players.splice(i,1);
            }
        }

        this.players = masters;

        this.updateTeamChangeData();
    }

    async insertData(matchId){

        this.matchId = matchId;

        this.mergeDuplicates();
        
        await this.setPlayerTotalData();
  
        await this.insertPlayerMatchData();
            
        await this.updateTotals(0);

        await this.setPlayerTotalData(true);

        await this.updateTotals(this.gametype);

        await this.insertTeamChangeData();

        if(this.players.length > 0){
            const rankings = new Rankings(this.players, this.gametype, this.matchId);

            await rankings.updateRankings();
        }else{
            return;
        }    
    }
    



    getBestPlayerData(){

        let bestName = 0;
        let bestScore = 0;
        let bestId = 0;


        let p = 0;

       // console.log(this.players);

        for(let i = 0; i < this.players.length; i++){

           // console.log(i);
            p = this.players[i];

            //if(!bLMS){

                if(i == 0 || p.points > bestScore){
                    bestScore = p.points;
                    bestName = p.name;
                    bestId = p.id;
                }
           // }else{
           //     if(i == 0 || p.deaths < bestScore){
            //        bestScore = p.points;
            //        bestName = p.name;
            //    }
           // }
        }

        
        return {"player":bestName, "score":bestScore, "id": bestId};
    }



    getPlayerName(id){

        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].id == id){

                return this.players[i].name;
            }
        }



        return -1;
    }



    //getPlayerTotalIds

    getTotalId(name){


        for(let i = 0; i < this.totalIds.length; i++){

            if(this.totalIds[i].name == name){ 

                return this.totalIds[i].id;
            }
        }

        return -1;
    }

    getTotalName(id){

        for(let i = 0; i < this.totalIds.length; i++){

            if(this.totalIds[i].id == id){ 

                return this.totalIds[i].name;
            }
        }

        return -1;

    }

    getPlayerTotalIds(names){


        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nutstats_player_totals WHERE gametype=0 AND name IN(?)";


            mysql.query(query, [names], (err, result) =>{

                if(err) reject(err);

                //console.log(result);

                this.totalIds = result;

                resolve();
            });
        });
    }


    getPlayerTotalIdByNameAlt(name){

        if(this.totalIds == undefined)
            return;

            
        let d = 0;

        for(let i = 0; i < this.totalIds.length; i++){

            d = this.totalIds[i];

            if(d.name == name){
                return d.id;
            }

        }

        return -1;
    }

    
}


module.exports = PlayerManager;