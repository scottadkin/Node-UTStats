const mysql = require('./database');
const Maps = require('./maps');
const Gametype = require('./gametype');
const Players = require('./players');
const Weapons = require('./weapons');
const Promise = require('promise');
const CTF = require('./ctf');
const Dom = require('./dom');
const Assault = require('./assault');
const fs = require('fs');
const Message = require('./message');
const MonsterHunt = require('./monsterhunt');
const Bunnytrack = require('./bunnytrack');
const Rankings = require('./rankings');



class Match{


    constructor(id){

        this.matchId = parseInt(id);

        if(this.matchId !== this.matchId){
            this.matchId = 1;
        }

        this.matchData = [];
        this.maps = new Maps();
        this.gametype = new Gametype();

        this.players = new Players();
        this.weapons = new Weapons();
        this.rankings = new Rankings();
        this.mapName = "";
        this.gametypeName = "";
        this.ctf = [];
    }



    getKillData(){

        const query = "SELECT killer,victim,time FROM nutstats_kills WHERE match_id=? ORDER BY time ASC";


        return new Promise((resolve, reject) =>{
            
            mysql.query(query, [this.matchId], (err, result) => {
                if(err) reject(err);

                console.log("FOUND "+result.length);

                this.matchData.killData = result;


                resolve();
            });
        });
        
    }

    getLMSData(){


        const query = "SELECT victim,time FROM nutstats_kills WHERE match_id=? ORDER BY time ASC";


        return new Promise((resolve, reject) =>{

            mysql.query(query, [this.matchId], (err , result) =>{

                if(err) reject(err);

                this.matchData.lmsData = result;

                resolve();
            });
        });
    }



    bCTF(){

        const reg = /capture the flag|ctf/i;
        const reg2 = /botpack.ctfgame|ctf/i;

        if(reg.test(this.matchData.gametypeName)){
            return true;
        }

        if(reg2.test(this.matchData.gameclass)){
            return true;
        }

        return false;
    }

    bBunnytrack(){

        const reg = /bunnytrack|bunny track/i;

        if(reg.test(this.matchData.gametypeName)){
            return true;
        }

        return false;
    }

    bDom(){

        const reg = /domination|dom/i;

        if(reg.test(this.matchData.gametypeName)){
            return true;
        }

        return false;
    }


    bAssault(){

        const reg = /assault/i;

        if(reg.test(this.matchData.gametypeName)){
            return true;
        }

        return false;
    }

    bMonsterHunt(){

        const reg = /monsterhunt|monster hunt|coop|noname/i;

        if(reg.test(this.matchData.gametypeName)){
            return true;
        }

        return false;
    }


    getBasicData(){


        //PUT THESE IN 2 different functions see if it fixes
//
        //return new Promise((resolve, reject) =>{

            //const p = [];

           // p.push(this.maps.getMapNameById(this.matchData.map));
           // p.push(this.gametype.getGametypeName(this.matchData.gametype));


            //return Promise.all(p);

      //  });
    }


    getTeamChangeData(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_team_changes WHERE match_id=? ORDER BY time ASC";

            mysql.query(query, [this.matchData.id], (err, result) =>{
                
                if(err) reject(err);

                this.matchData.teamChanges = result;
                
                resolve();
            });
        });
    }



    getMatchInfo(){

        return new Promise((resolve, reject) =>{


            const query = "SELECT * FROM nutstats_match WHERE id=?";

            mysql.query(query, [this.matchId], (err, result) =>{

                if(err) reject(err);

                if(result == undefined){
                    reject("match does not exist");
                }else if(result.length == 0){
                    reject("match does not exist");
                }
                this.matchData = result[0];


                resolve();
            });

        });
    }


    async getGametypeData(){


        if(this.bCTF() && !this.bBunnytrack()){

            // console.log("ctf game");
            const ctf = new CTF(this.matchData.id);

            await ctf.getFlagEvents();
            this.matchData.flagEvents = ctf.flagEvents;     
            await ctf.getFlagCaptures();
            await ctf.getAdvancedFlagKills();
            this.matchData.flagCaptures = ctf.flagCaptures;
            this.matchData.flagKills = ctf.advancedFlagKills;



        }else if(this.bDom()){

            const dom = new Dom(this.matchData.id);

            await dom.getTeamscoreData();

            this.matchData.domTeamScores = dom.teamscoreData;

            await dom.getPointCaptures();

            this.matchData.domCaptures = dom.capturesData;
            

        
        }else if(this.bAssault()){

            const a = new Assault(this.matchData.id, this.matchData.map);
        
            await a.getData();

            this.matchData.assaultObjectives = a.objNames;
            this.matchData.assaultEvents = a.events;
            this.matchData.assaultAttackingTeam = a.attackingTeam;


        }else if(this.bMonsterHunt()){

           
            const m = new MonsterHunt(this.matchData.id);

            await m.loadMonsterKillData();
            await m.monsters.loadMonsters(m.monsterIds);
            await m.monsters.getAllFiles();

            this.matchData.monsterFiles = m.monsters.monsterFiles;
            this.matchData.monsterImages = m.monsters.data;
            this.matchData.monsters = m.monsterKills;
            this.matchData.monsterIds = m.monsterIds;
            this.matchData.monsterKills = m.kills;
         

        }else if(this.bBunnytrack()){

            const bt = new Bunnytrack();

            await bt.getMatchCaps(this.matchId);

            this.matchData.caps = bt.matchCaps;
            await bt.getMapRecord(this.matchData.map);

            this.matchData.record = bt.mapRecord;

            await bt.getPlayerRecords(this.matchData.map, this.players.players);


            this.matchData.playerRecords = bt.playerRecords;

            await bt.getRecordHolder();
      
            this.matchData.recordHolder = bt.recordPlayer;
                //this.matchData.players.push(bt.recordPlayer);

        }
    }

    getMatchData(){


        this.matchData = [];



        return this.getMatchInfo().then(() =>{


            return this.players.getPlayersInMatch(this.matchData.id);


        }).then(() =>{


            return this.maps.getMapNameById(this.matchData.map);
            
        }).then(() =>{

            return this.gametype.getGametypeName(this.matchData.gametype);

        }).then(() =>{

            this.matchData.mapName = this.maps.mapName;
            this.matchData.gametypeName = this.gametype.gametypeName;

            this.matchData.players = this.players.players;

            return this.weapons.getWeaponMatchStats(this.matchData.id);

        }).then(() =>{

            return this.getTeamChangeData();

        })/*.then(() =>{

            return this.rankings.getMatchRankingsChange(this.matchData.id);

        }).then(() =>{

            return this.rankings.getPlayerTotalIds();

        })*/.then(() =>{

            let ids = [];

            let d = 0;

           // for(let i = 0; i < this.rankings.matchRankings.length; i++){

                //d = this.rankings.matchRankings[i];

              // ids.push(d.player_id);
            //}

            return this.rankings.getRankingsForPlayers(this.matchData.gametype, this.players.players);

        }).then(() =>{

            return this.rankings.getMatchRankingsChange(this.matchData.id);

        }).then(() =>{


            this.matchData.playerRankings = this.rankings.playerRankings;
            this.matchData.matchRankings = this.rankings.matchRankings;

           // this.matchData.rankingPlaces = this.rankings.playerList;
           // this.matchData.rankingChanges = this.rankings.matchRankings;
            //this.matchData.rankingPlayerIds = this.rankings.rankingIds;
            this.matchData.weapons = this.weapons.weapons;
            this.matchData.weaponStats = this.weapons.matchData;


            return this.getGametypeData();

        }).then(() =>{

            return this.setMapImage();

        }).catch((message) =>{

            new Message("error", "failed to get matchdata "+message);
            console.trace(message);
        });

    }

    getData(){

      //  return new Promise((resolve, reject) =>{

            return this.getMatchData().then(() =>{
               
               new Message("pass","got match data");

            }).catch((message) =>{
                new Message("error", "ERROR: "+message);
                //console.trace(message);
            });
            
        //});
   // }

    }


    setMapImage(){


        return new Promise((resolve, reject) =>{

            const dir = "files/maps/";
            const ext = ".jpg";

            const reg = /^(.+)\.unr$/i;
            let result = 0;

           // console.log(this.matchData);

            let mapName = this.matchData.mapName;



            if(reg.test(mapName)){

                result = reg.exec(mapName);

                mapName = result[1];
               // console.log(mapName);

                
            }

            mapName = this.maps.removePrefix(mapName);

            if(mapName != undefined){
                mapName = mapName.toLowerCase();
            }


            fs.access("public/"+dir+mapName+ext, fs.constants.F_OK, (err) =>{

                if(err){
                    //new Message("warning","Map image doesnt exist using default instead ("+err+")");
                    this.matchData.mapImage = "default";
                    resolve();
                }else{
                    this.matchData.mapImage = mapName;
                    resolve();
                }

            });
        });
    }



    changeDmWinner(oldName, name){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_match SET dm_winner=? WHERE dm_winner=?";

            mysql.query(query, [name, oldName], (err) =>{

                if(err) reject(err);


                resolve();
            });
        });
    }


    getKillDataExtended(id){

        id = parseInt(id);

        this.killData = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT match_id,killer,victim,weapon,time,distance FROM nutstats_kills WHERE match_id=? ORDER BY time ASC";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.killData = result;
                }
                
                resolve();
            });
        });


    }
}




module.exports = Match;