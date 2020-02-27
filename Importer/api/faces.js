
const mysql = require('./database');
const Promise = require('promise');



class Faces{

    constructor(players){

        this.players = players;

        this.faces = [];

        this.setFaces();

    }


    getFaceIndex(face){


        let d = 0;


        for(let i = 0; i < this.faces.length; i++){

            d = this.faces[i];

            if(d.name == face){
                return i;
            }
        }

        return -1;
    }


    setFaces(){


        let d = 0;

        let currentIndex = 0;

        for(let i = 0; i < this.players.players.length; i++){

            d = this.players.players[i];

            currentIndex = this.getFaceIndex(d.face);

            if(currentIndex == -1){

                this.faces.push({"name": d.face, "uses": 1});
            }else{

                this.faces[currentIndex].uses++;
            }
        }
    }

    createFace(name, uses){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_faces VALUES(NULL,?,?)";

            mysql.query(query, [name, uses], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }

    updateFace(name, uses){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_faces SET uses=uses+? WHERE name=?";

            mysql.query(query, [uses, name], (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }

    checkFace(name){

        return new Promise((resolve, reject) =>{

            this.currentFaceInfo = null;

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_faces WHERE name=?";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.currentFaceInfo = result[0];
                }

                resolve();
            });

        });
    }

    async updateFaceStats(){

        let d = 0;

        for(let i = 0; i < this.faces.length; i++){

            d = this.faces[i];

            await this.checkFace(d.name);

            if(this.currentFaceInfo != null){

                if(this.currentFaceInfo.total_rows == 0){

                    await this.createFace(d.name, d.uses);

                }else{

                    await this.updateFace(d.name, d.uses);
                }
            }      
        }
    }


}




module.exports = Faces;