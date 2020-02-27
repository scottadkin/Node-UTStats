

const mysql = require('./database');
const Message = require('./message');
const Promise = require('promise');

class Gametype{

    constructor(name, totalTime, date, bBT, gameClass){

        this.name = name;

        if(bBT){
            this.name = "Bunnytrack";
        }
        
        this.date = date;
        this.totalTime = totalTime;

        this.gametypeId = -1;

        this.gameClass = gameClass;

    }

    updateValues(){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_gametype SET matches=matches+1, total_time=total_time+?, last=? WHERE id=? LIMIT 1";

            mysql.query(query, [this.totalTime, this.date, this.gametypeId], (err) =>{
                if(err) reject(err);
                resolve();
            });
        });
    }

    getGametypeId(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id from nutstats_gametype WHERE name=? LIMIT 1";

            this.id = null;

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result.length > 0){
                        this.id = result[0].id;
                    }
                }

                resolve();
            });

        });
    }

    async updateGametype(){


        await this.getGametypeId(this.name);

        if(this.id == null){
            await this.createNewGametype();
        }else{
            this.gametypeId = this.id;

            await this.updateValues();

        }

        

    }

    createNewGametype(){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_gametype VALUES(NULL,?,1,?,?,'',1)";

            mysql.query(query, [this.name,this.totalTime, this.date], (err, result) =>{
                if(err) reject(err);

               new Message("pass","Created new gametype "+this.name);
                //console.log(result);
                if(result.insertId != undefined){
                    this.gametypeId = result.insertId;
                    this.id = result.insertId;
                    resolve();
                }

                reject("Failed to create new gametype");
            });

        });
    }




}





module.exports = Gametype;
