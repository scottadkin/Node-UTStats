
const mysql = require('./database');
const Message = require('./message');
const Promise = require('promise');
const PlayerManager = require('./playermanager');
const config = require('./config');

class Weapons{



    constructor(killData){

        this.data = [];
        this.weapons = [];

        this.killData = killData;

       // console.log(weapons);

        this.weaponNames = [];
        


        this.toInsert = 0;
        this.inserted = 0;

        this.playerWeaponStats = [];

        this.currentWeapon = -1;
        this.playerNameIds = [];


        this.findWeaponNames();
        
    }

    findWeaponNames(){

        const reg = /^\d+?\.\d+?\tkill\t.+?\t(.+?)\t.+$/i;

        let d = 0;
        let result = "";

        for(let i = 0; i < this.killData.length; i++){

            d = this.killData[i];

            result = reg.exec(d);

            if(result != null){

                //console.log(result[1]);

                if(this.weaponNames.indexOf(result[1]) == -1){
                    this.weaponNames.push(result[1]);
                }
            }
        }

        //console.log(this.weaponNames);
    }

    bWeaponExist(name){

        for(let i = 0; i < this.weapons.length; i++){

            if(this.weapons[i].name == name){
                return true;
            }
        }


        return false;
    }

    createWeapon(vars){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_weapons VALUES(NULL,?,'0')";

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.weapons.push({"id":result.insertId,"name":vars[0]});
                }

                resolve();
            });
        });
    }

    async createNewWeapons(){


        for(let i = 0; i < this.weaponNames.length; i++){

            if(!this.bWeaponExist(this.weaponNames[i])){

                await this.createWeapon([this.weaponNames[i]]);

            }    
        }
    }


    async setWeapons(){

        await this.getWeaponList();
        await this.createNewWeapons();
        
    }



    getWeaponList(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nutstats_weapons";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result.length > 0){
                        this.weapons = result;
                    }
                }

                resolve();
            });
        });
    }



    getIdByName(name){


        for(let i = 0; i < this.weapons.length; i++){

            if(this.weapons[i].name == name){
                return this.weapons[i].id;
            }
        }

        return 0;
    }


    mergeDuplicates(){



        const newData = [];


        const getIndex = (id) =>{

            for(let i = 0; i < newData.length; i++){

                if(newData[i].player == id){
                    return i;
                }
            }

            return -1;
        }

       // console.log(this.data);

        let mId = 0;
        let currentIndex = 0;

        for(let i = 0; i < this.data.length; i++){

            mId = this.players.getMasterId(this.data[i].player);

            currentIndex = getIndex(mId);

            if(currentIndex == -1){

                newData.push(this.data[i]);
            }else{

                newData[currentIndex].kills += this.data[i].kills;
                newData[currentIndex].shots += this.data[i].shots;
                newData[currentIndex].damage += this.data[i].damage;
                newData[currentIndex].hits += this.data[i].hits;

                if(newData[currentIndex].shots != 0 && newData[currentIndex].hits != 0){

                    newData[currentIndex].accuracy = (newData[currentIndex].hits / newData[currentIndex].shots) * 100;

                }else if(newData[currentIndex].hits == 0 && newData[currentIndex].shots > 0){

                    newData[currentIndex].accuracy = 0;

                }else if(newData[currentIndex].hits == newData[currentIndex].shots){

                    newData[currentIndex].accuracy = 100;
                }
            }
        }

        this.data = newData;
    }

    insertPlayerMatch(vars){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_weapons_stats VALUES(NULL,?,?,?,?,?,?,?,?)";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async insertPlayerMatchData(){


        let d = 0;
        let mId = 0;
        let currentPlayer = 0;

        this.mergeDuplicates();

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];
            mId = this.players.getMasterId(d.player);

            currentPlayer = this.players.getPlayerById(mId);

            if(currentPlayer.bBot === 1){

                if(config.bIgnoreBots){
                    continue;
                }
            }

            await this.insertPlayerMatch([this.matchId, mId, d.weapon, d.shots, d.hits, d.kills, d.damage, d.accuracy]);
            
        }
    }


    updatePlayerTotalsStats(){

      //  return new Promise((resolve, reject) =>{


       // });
    }


    getPlayerTotalIds(){

       // l//et uniqueIds = [];



        return new Promise((resolve, reject) =>{

            this.totalIds = [];
            const getPlayerName = (id) =>{

                for(let i = 0; i < this.playerNames.length; i++){

                    if(this.playerNames[i].id == id){
                        return this.playerNames[i].name;
                    }
                }

                return -1;
            }   

            let data = [];

            let d = 0;

            let currentName = 0;
            let currentPlayer = 0;

            for(let i = 0; i < this.data.length; i++){

                d = this.data[i].player;

                currentName = getPlayerName(d);

                if(currentName !== -1){
                    currentPlayer = this.players.getPlayerTotalIdByName(currentName);

                   // console.log(currentName+ " total id = "+currentPlayer);

                    this.data[i].totalId = currentPlayer;
                    this.totalIds.push({"name":currentName,"id":currentPlayer});
                }

            }

            resolve();
            
        });
        

        //console.log(this.data);

        //console.log(uniqueIds);
    }


    bPlayerTotalExist(player, weapon){

        this.bTotalExist = false;

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_weapons_stats_total WHERE player_id=? AND weapon_id=?";

            mysql.query(query, [player, weapon], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result[0].total_rows > 0){

                        this.bTotalExist = true;
                    }
                }

                resolve();
            });
        });
    }

    updateTotal(vars){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_weapons_stats_total SET shots=shots+?, hits=hits+?, kills=kills+?, damage=damage+? WHERE player_id=? AND weapon_id=?";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }

    createTotal(vars){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_weapons_stats_total VALUES(NULL,?,?,?,?,?,?)";
            
            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async updateTotals(){

        let d = 0;

        let currentPlayer = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            currentPlayer = this.players.getPlayerById(d.player);

            if(currentPlayer.bBot === 1){

                if(config.bIgnoreBots){
                    continue;
                }
            }
       
            await this.bPlayerTotalExist(d.totalId, d.weapon);

            if(!this.bTotalExist){

                await this.createTotal([d.totalId, d.weapon, d.shots, d.hits, d.kills, d.damage]);

            }else{

                await this.updateTotal([d.shots, d.hits, d.kills, d.damage, d.totalId, d.weapon]);
            }        
        }
    }


    updatePlayerTotalWeaponStats(){

    

    }


    async insertData(matchId ,data, players, playerNames){

        this.matchId = matchId;

        this.data = data;
        this.playerNames = playerNames;

        this.players = players;

        await this.insertPlayerMatchData();
        await this.getPlayerTotalIds();
        await this.updateTotals();
        

    }


}




module.exports = Weapons;