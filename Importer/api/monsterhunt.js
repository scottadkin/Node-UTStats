const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');




class MonsterHunt{


    constructor(matchId, mapId, data, players){

        this.matchId = matchId;
        this.mapId = mapId;
        this.data = data;
        this.players = players;

        this.foundMonsters = [];

        this.monsters = [];
        this.kills = []

        this.parseData();

    }


    updateMonsterStats(name){

        let d = 0;

        for(let i = 0; i < this.monsters.length; i++){

           // d = this.monsters[i];

            if(this.monsters[i].name == name){

                this.monsters[i].kills++;

                return;
            }
        }


        this.monsters.push({"name": name, "kills": 1});
    }

    parseData(){


        const killReg = /^(\d+\.\d+)\tnstats\tmonsterkill\t(.+?)\t(.+)$/i;

        let d = 0;
        let result = 0;


        let currentMonster = 0;

       

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(killReg.test(d)){

                result = killReg.exec(d);

                //console.log(result);

               // console.log(result);

                currentMonster = result[3].toLowerCase(0);

                this.updateMonsterStats(currentMonster);

                this.kills.push({"time": parseFloat(result[1]), "player": parseInt(result[2]), "victim": currentMonster});

                this.players.updatePlayer(parseInt(result[2]), "monsterKills", "++");
        
            }
        }



    }




    getMonsterIds(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nutstats_monsters";

            mysql.query(query, (err, result) =>{
                
                if(err) reject(err);

                for(let i = 0; i < result.length; i++){

                    //console.log("MONSTER FOUND IN DATABASE");

                    this.foundMonsters.push({"name": result[i].name, "id": result[i].id});
                }

                //console.log(this.foundMonsters);

                resolve();
            });
        });
    }




    bMonsterAlreadyExist(name){

        for(let i = 0; i < this.foundMonsters.length; i++){

            if(name == this.foundMonsters[i].name){
                return true;
            }
        }

        return false;
    }


    insertNewMonster(name){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_monsters VALUES(NULL,?,0,0)";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.foundMonsters.push({"name": name, "id": result.insertId});

                }

                resolve();
            });
        });

    }

    async insertNewMonsters(){

        //console.table(this.monsters);


        if(this.monsters.length > 0){

            for(let i = 0; i < this.monsters.length; i++){

                if(!this.bMonsterAlreadyExist(this.monsters[i].name)){

                    await this.insertNewMonster(this.monsters[i].name);
                 
                }
            }
        }
    }


    updateMonsterKills(name, kills){


        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_monsters SET matches=matches+1, kills=kills+? WHERE name=?";

            mysql.query(query, [kills, name], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }


    async updateMonsters(){


        for(let i = 0; i < this.monsters.length; i++){

            await this.updateMonsterKills(this.monsters[i].name, this.monsters[i].kills);
        }

    }


    getMonsterId(name){

        let d = 0;
        

        for(let i = 0; i < this.foundMonsters.length; i++){

            d = this.foundMonsters[i];

            if(d.name == name){

                return d.id;
            }
        }

        return -1;
    }


    insertMonsterKill(match, player, monster, time){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_monster_kills VALUES(NULL,?,?,?,?)";

            mysql.query(query, [match, player, monster, time], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async insertMonsterKillData(){


        let d = 0;

        let currentId = 0;

        for(let i = 0; i < this.kills.length; i++){

            d = this.kills[i];

            currentId = this.getMonsterId(d.victim);

            if(currentId != -1){

                await this.insertMonsterKill(this.matchId, d.player, currentId, d.time);

            }else{
                new Message("error", "currentId == -1");
            }
        }

    }

    async insertData(){

        await this.getMonsterIds();
        await this.insertNewMonsters();
        await this.updateMonsters();
        await this.insertMonsterKillData();
        this.updateMonsterPlayerStats();

    }



   // LOG KILLS ON MONSTERS LIKE KILLS TABLE
    //UPDATE PLAYER MONSTER KILLS FOR ALL_TIME_STATS AND NUTSTATS_PLAYER

    async updateMonsterPlayerStats(){

        const data = [];

        const getPlayerIndex = (player, monster) =>{

            for(let i = 0; i < data.length; i++){

                if(data[i].player == player && data[i].monster == monster){
                    return i;
                }
            }

            return -1;
        }

        let currentMonsterId = 0;
        let currentPlayerId = 0;
        let currentIndex = 0;

        let d = 0;  


        for(let i = 0; i < this.kills.length; i++){

            d = this.kills[i];

            currentMonsterId = this.getMonsterId(d.victim);

            currentPlayerId = this.players.getPlayerTotalIdByNameAlt(this.players.getPlayerName(d.player));

            if(currentMonsterId != -1){

                if(currentPlayerId != -1){

                    currentIndex = getPlayerIndex(currentPlayerId, currentMonsterId);

                    if(currentIndex == -1){

                        data.push({"player": currentPlayerId, "monster": currentMonsterId, "kills": 1});
                    }else{

                        data[currentIndex].kills++;
                    }

                }else{
                    new Message("warning", "CurrentPlayerId = -1");
                }

            }else{
                new Message("warning", "CurrentMonsterId = -1");
            }

        }
        

        for(let i = 0; i < data.length; i++){

           await this.updatePlayerMonsterStatsTotal(data[i]);
        }

    }


    updatePlayerMonsterTotal(player, monster, kills){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_player_monster_kills SET kills=kills+? WHERE player_id=? AND monster_id=?";

            mysql.query(query, [kills, player, monster], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });

    }


    insertNewPlayerMonsterTotal(player, monster, kills){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_player_monster_kills VALUES(NULL,?,?,?)";

            mysql.query(query, [player, monster, kills], (err, result) =>{

                if(err) reject(err);      

                resolve();
            });

        });
    }

    getPlayerMonsterStats(player, monster){

        this.currentRows = 0;

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_player_monster_kills WHERE player_id=? AND monster_id=?";

            mysql.query(query, [player, monster], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.currentRows = result[0].total_rows;
                }

                resolve();
            });
        });
    }

    async updatePlayerMonsterStatsTotal(data){

        await this.getPlayerMonsterStats(data.player, data.monster);

        if(this.currentRows == 0){
            await this.insertNewPlayerMonsterTotal(data.player, data.monster, data.kills);
        }else{
            await this.updatePlayerMonsterTotal(data.player, data.monster, data.kills);
        }

    }



}


module.exports = MonsterHunt;