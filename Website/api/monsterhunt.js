const mysql = require('./database');
const Promise = require('promise');
const Monsters = require('./monsters');

class MonsterHunt{

    constructor(matchId){   

        this.matchId = parseInt(matchId);

        this.monsterIds = [];
        this.monsterKills = [];
        this.kills = [];

        this.monsters = new Monsters();

    }

    updateMonsterKills(id){

        for(let i = 0; i < this.monsterKills.length; i++){

            if(this.monsterKills[i].id == id){
                this.monsterKills[i].kills++;
                return;
            }
        }

        this.monsterKills.push({"id": id, "kills": 1});
    }

    loadMonsterKillData(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_monster_kills WHERE match_id=?";

            mysql.query(query, [this.matchId], (err, result) =>{
                
                if(err) reject(err);

                this.kills = result;

                for(let i = 0; i < result.length; i++){

                    if(this.monsterIds.indexOf(result[i].monster_id) == -1){
                        this.monsterIds.push(result[i].monster_id);
                    }

                    this.updateMonsterKills(result[i].monster_id);
                }

                
                //console.log(result);
                resolve();
            });

        });
    }

    
}



module.exports = MonsterHunt;