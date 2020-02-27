
const geoip = require('geoip-lite');
const mysql = require('./database');

const Message = require('./message');
const config = require('./config');




class Player{

    constructor(id, name, joined, gametypeId){

        if(arguments.length == 0){
            return;
        }

        this.id = parseInt(id);
        this.ids = [];

        this.gametype = gametypeId;


        this.bInsertedMatchData = false;

        this.bWinner = 0;

        this.matchDate = 0;
        //the id of the player in nutstats_players_totals
        this.playerId = 0;
        this.name = name;
        this.joined = joined;
        this.team = 255;
        this.ip = "";
        this.flag = "xx";
        this.points = 0;
        this.timeOnServer = 0;
        this.ttl = 0;
        this.bBot = 0;
        this.face = "";
        this.voice = "";
        this.fov = 0;
        this.netspeed = 0;
        this.mouseSens = 0;
        this.dodgeClickTime = 0;

        this.damage = 0;
        this.bFirstBlood = 0;
        this.matchId = 0;
        
        this.victims = [];
        this.kills = 0;
        //monster kills are not the multi kill type
        this.monsterKills = 0;
        this.spawnKills = 0;
        this.bestSpawnKillSpree = 0;
        this.headshots = 0;
        this.teamKills = 0;
        this.deaths = 0;
        this.suicides = 0;
        this.firstBlood = 0;
        this.multis = {
            "double": 0,
            "multi": 0,
            "mega": 0,
            "ultra": 0,
            "monster": 0,
            "ludicrous": 0,
            "holy": 0,
        };
        this.sprees = {
            "spree":0,
            "rampage":0,
            "dominating":0,
            "unstoppable":0,
            "godlike":0,
            "massacre":0,
            "brutalizing":0,
        };

        this.flagCaps = 0;
        this.flagGrabs = 0;
        this.flagAssists = 0;
        this.flagDrops = 0;
        this.flagReturns = 0;
        this.flagCovers = 0;
        this.flagKills = 0;
        this.flagPickups = 0;
        this.flagSaves = 0;
        this.flagTime = 0;

        this.domCaps = 0;
        
        this.assaultCaps = 0;

        this.pickups = [];

        this.bestMulti = 0;
        this.bestSpree = 0;


        this.currentSpree = 0;
        this.currentMulti = 0;
        this.lastKillTime = -999;


        this.killData = [];

        this.bCompleted = false;

        this.pingData = [];
        this.totalPing = 0;
        this.averagePing = 0;


        this.damage = 0;

        this.bWinner = 0;


        this.ping = 0;
        this.bestPing = 0;
        this.worstPing = 0;

        this.ranking = 0;
        this.rankingDiff = 0;
        this.bRankingIncrease = 0;

        this.teamChanges = [];


        this.longestKillDistance = null;
        this.shortestKillDistance = null;

        this.shortestKillTime = null;
        this.longestKillTime = null;

    }



    getVictimPosition(victim){

        for(let i = 0; i < this.killData.length; i++){

            if(this.killData[i].v == victim){
                return i;
            }
        }


        return -1;
    }


    killedPlayer(time, victimId, weapon){

        if(time == -1 && victimId == -1 && weapon == -1){
            //console.log(this.name+" got first blood");
            this.firstBlood = 1;
        }

        victimId = parseInt(victimId);

        //console.log("TimeDiff = "+(time - this.lastKillTime)+" LIMIT is "+config.multiKillTimeLimit());

        const victimOffset = this.getVictimPosition(victimId);

        if(victimOffset == -1){

            this.killData.push({"v":victimId,"t":[time],"w":[weapon]});
        }else{

            this.killData[victimOffset].t.push(time);
            this.killData[victimOffset].w.push(weapon);
        }

        //console.log(this.name+" killed "+victimId+" with the "+weapon);
        
        this.currentSpree++;

        //this.debugSpreeString(this.currentSpree);

        this.updateMulti(time);

        
        this.lastKillTime = time;

    }



    spawnKilledPlayer(){

        this.spawnKills++;
    }



    updateMulti(time){



        const updateMultiList = () =>{

            switch(this.currentMulti){

                case 0: {} break;
                case 1: {} break;
                case 2: {   this.multis.double++; } break;
                case 3: {   this.multis.multi++;} break;
                case 4: {   this.multis.mega++;} break;
                case 5: {   this.multis.ultra++;} break;
                case 6: {   this.multis.monster++;} break;
                case 7: {   this.multis.ludicrous++;} break;
                default: {   this.multis.holy++;} break;

            }

           

        }


        if(time == undefined){
            updateMultiList();
            this.currentMulti = 0;
            return;
        }

        if(time - this.lastKillTime <= config.multiKillTimeLimit){

            //console.log("musaklfaskfl kill");
            
            this.currentMulti++;

            if(this.currentMulti > this.bestMulti){
                this.bestMulti = this.currentSpree;
            }

            
        }else{
            updateMultiList();
            this.currentMulti = 1;
        }

        //this.debugMultiKillString(this.currentMulti);
    }



    updateSpree(){


        const s = this.currentSpree;

        if(s >= 5 && s < 10){
            this.sprees.spree++;
        }else if(s >= 10 && s < 15){
            this.sprees.rampage++;
        }else if(s >= 15 && s < 20){
            this.sprees.dominating++;
        }else if(s >= 20 && s < 25){
            this.sprees.unstoppable++;
        }else if(s >= 25 && s < 30){
            this.sprees.godlike++;
        }else if(s >= 30 && s < 35){
            this.sprees.massacre++;
        }else if(s >= 35){
            this.sprees.brutalizing++;
        }

        if(this.currentSpree > this.bestSpree){
            this.bestSpree = this.currentSpree;
        }

        this.currentSpree = 0;
    }



    killed(){

        this.updateMulti();
        this.updateSpree();

    }


    matchFinished(){


        this.updateMulti();
        this.updateSpree();
    }


    getPlayerMasterIds(names){

       // console.table(names);


        return new Promise((resolve, reject) =>{

            this.totalIds = [];

            if(!Array.isArray(names)){
                reject("names is not an Array");
            }

            if(names.length == 0){
                resolve();
            }

            const query = "SELECT id,name FROM nutstats_player_totals WHERE name IN(?) AND gametype=0";

            //console.log("SELECT id,name FROM nutstats_player_totals WHERE gametype=0 AND name IN('"+names[0]+"','"+names[1]+"')");


            mysql.query(query, [names], (err, result) =>{

             
                if(err) reject(err);


                if(result != undefined){
                    this.totalIds = result;
                   // console.table(result);
                }

                resolve();
            });

        });
    }

    createBlankTotal(name){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_player_totals (name,flag) VALUES(?,'xx')";

            mysql.query(query, [name], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async createBlankData(names){

        for(let i = 0; i < names.length; i++){

            await this.createBlankTotal(names[i]);
        }

    }

    updateKillDistances(distance){


        //first kill
        if(this.shortestKillDistance == null && this.longestKillDistance == null){

            this.shortestKillDistance = distance;
            this.longestKillDistance = distance;

            return;
        }

        if(distance > this.longestKillDistance){
            this.longestKillDistance = distance;
        }

        if(distance < this.shortestKillDistance){

            this.shortestKillDistance = distance;
        }

    }

}


module.exports = Player;