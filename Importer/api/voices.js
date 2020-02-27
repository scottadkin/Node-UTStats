const mysql = require('./database');
const Promise = require('promise');




class Voices{


    constructor(players){

        this.players = players.players;


        this.voices = [];

        this.setVoices();

    }


    getVoiceIndex(voice){

        for(let i = 0; i < this.voices.length; i++){

            if(this.voices[i].name == voice){
                return i;
            }

        }


        return - 1;
    }

    setVoices(){


        let d = 0;

        let currentIndex = 0;


        for(let i = 0; i < this.players.length; i++){

            d = this.players[i];

            currentIndex = this.getVoiceIndex(d.voice);

            if(currentIndex == -1){

                this.voices.push({"name": d.voice, "uses": 1});

            }else{

                this.voices[currentIndex].uses++;
            }
        }

       // console.log(this.voices);
    }

    bExist(name){

        this.bAlreadyExist = false;

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_voices WHERE name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result[0].total_rows > 0){

                        this.bAlreadyExist = true;
                    }
                }
                resolve();
            });
        });
    }

    createVoice(vars){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_voices VALUES(NULL,?,?)";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    updateVoice(vars){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_voices SET uses=uses+? WHERE name=?";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async updateVoiceStats(){

        for(let i = 0; i < this.voices.length; i++){

            const d = this.voices[i];
            
            await this.bExist(d.name);

            if(!this.bAlreadyExist){
                await this.createVoice([d.name, d.uses]);
            }else{
                await this.updateVoice([d.uses, d.name]);
            }
        }
    }
}



module.exports = Voices;