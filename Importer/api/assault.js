const mysql = require('./database');
const Message = require('./message');
const Promise = require('promise');

class Assault{


    constructor(matchId, mapId, data, players){

        this.matchId = matchId;
        this.mapId = mapId;
        this.data = data;

        this.objNames = [];
        this.attackingTeam = 0;
        this.objCaps = [];
        this.players = players;
        //console.log("this.data");
        //console.log(this.data);
       // console.log(this.data);
        this.sortData();
        this.updatePlayerAssaultStats();

    }

    sortData(){


        //new Message("note","sortingngngngngngn datatatata");
        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(d.type == "objName"){

                this.objNames.push(d);

            }else if(d.type == "cap"){
                this.objCaps.push(d);
            }else if(d.type == "attackingTeam"){
                this.attackingTeam = d.id;
            }
        }

        //console.log(this.objNames);
    }

    updatePlayerAssaultStats(){

        let d = 0;

        let player = 0;

        for(let i = 0; i < this.objCaps.length; i++){

            d = this.objCaps[i];

           // player = this.players.getPlayerByName(d.player);
            this.players.updatePlayer(d.player, "assaultCaps", "++");
        }
    }

    async insert(){

        await this.insertAttackingTeam();
        await this.insertObjNames();
        await this.insertObjEvents();
        
    }


    bObjsAlreadyCreated(){


        return new Promise((resolve, reject) =>{


            const query = "SELECT COUNT(*) as total_rows FROM nutstats_assault_objectives WHERE map_id=?";

            mysql.query(query, [this.mapId], (err, result) =>{
                if(err) {
                    new Message("error",err);
                    reject(err);
                }

               // console.log(result);
                if(result[0].total_rows > 0){
                    this.bObjsExist = true;
                }else{
                    this.bObjsExist = false;
                }

                resolve();
            });
        });
    }


    async insertAssaultObjective(mapId, id, name){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_assault_objectives VALUES(NULL,?,?,?,0)";

            mysql.query(query, [mapId, id, name], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });

    }

    async insertObjNames(){


        await this.bObjsAlreadyCreated();

        const toInsert = this.objNames.length;
        let inserted = 0;
        let d = 0;

        if(toInsert > 0 && !this.bObjsExist){         

            for(let i = 0; i < this.objNames.length; i++){

                d = this.objNames[i];

                await this.insertAssaultObjective(this.mapId, d.id, d.name);

                inserted++;

                if(inserted >= toInsert){
                    new Message("pass","Inserted all assault objects names ("+inserted+"/"+this.objNames.length+")");
                    return;
                }          
            }
        }
    }


    async insertObjectiveEvent(matchId, player, capId, time){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_assault_events VALUES(NULL,?,?,?,?)";

            mysql.query(query, [matchId, player, capId, time], (err) =>{

                if(err) reject(err);
                
                resolve();
            });
        });
    }

    async insertObjEvents(){


        const toInsert = this.objCaps.length;
        let inserted = 0;

        if(toInsert == 0){
            return;
        }

        let d = 0;

        for(let i = 0; i < toInsert; i++){

            d = this.objCaps[i];

            await this.insertObjectiveEvent(this.matchId, d.player, d.capId, d.time);

            inserted++;

            if(inserted >= toInsert){
                new Message("pass","Inserted all assault cap events ("+inserted+"/"+toInsert+")");
                return;
            }
        }
    }



    insertAttackingTeam(){


        return new Promise((resolve, reject) =>{


            const query = "INSERT INTO nutstats_assault VALUES(NULL,?,?)";

            mysql.query(query, [this.matchId, this.attackingTeam],(err)=>{

                if(err) reject(err);

                resolve();
            });
        });
    }
}



module.exports = Assault;