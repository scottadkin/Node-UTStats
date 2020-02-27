const mysql = require('./database');
const Promise = require('promise');
const fs = require('fs');
const config = require('./config');
const MonsterImages = require('./monsterimages');


class Monsters{

    constructor(){


        this.data = [];


        this.images = MonsterImages;
    }






    getMonstersHome(){


        return new Promise((resolve, reject) =>{


            const query = "SELECT * FROM nutstats_monsters ORDER BY kills DESC LIMIT ?";

            mysql.query(query, [config.homeMaxMonsters], (err, result) =>{

                if(err) reject(err);

               // console.table(result);

                this.data = result;


               // console.log(this.data);
                resolve();
            });

        });
    }


    loadMonsters(ids){

        return new Promise((resolve, reject) =>{

            this.data = [];


            if(ids.length == 0)
                resolve();

            const query = "SELECT id,name FROM nutstats_monsters WHERE id IN(?)";


            mysql.query(query, [ids], (err, result) =>{

                if(err) reject(err);

                this.data = result;

               // console.table(result);

                resolve();
            });
        });
    }




    getAllFiles(){

        return new Promise((resolve, reject) =>{

            this.monsterFiles = [];

            fs.readdir(config.monstersDir, (err, files) =>{

                if(err){
                    reject(err);
                }else{
                    this.monsterFiles = files;
                    resolve();
                }

            });
        });
    }


    getAllDetails(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_monsters ORDER BY matches DESC";

            this.monsterDetails = [];

            mysql.query(query, (err, result) =>{

                if(err){
                    reject(err);
                }else{

                    //console.table(result);
                    this.monsterDetails = result;
                    resolve();
                }
            });
        });
    }


    getMonstersPlayer(id){


        id = parseInt(id);

        if(id != id){
            id = 1;
        }

        this.monsterIds = [];

        this.playerData = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_player_monster_kills WHERE player_id=? ORDER BY kills DESC";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.playerData = result;

                    for(let i = 0; i < this.playerData.length; i++){

                        if(this.monsterIds.indexOf(this.playerData[i].monster_id) == -1){
                            this.monsterIds.push(this.playerData[i].monster_id);
                        }
                    }
                   // console.table(this.playerData);
                }
                resolve();

            });
        });
    }

}



module.exports = Monsters;