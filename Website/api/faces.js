const Promise = require('promise');
const fs = require('fs');
const config = require('./config');
const mysql = require('./database');




class Faces{

    constructor(){

        this.images = [];

    }

    loadImages(images){

       
        const promises = [];



        for(let i = 0; i < images.length; i++){

            promises.push(new Promise((resolve, reject) =>{

                let face = images[i];


                fs.access(config.facesDir + face + config.facesExt, fs.constants.R_OK, (err) =>{

                   // console.log(config.facesDir + face + config.facesExt);
                    

                    if(err){
                       // console.log("not found");
                        this.images.push({"string": images[i], "url": config.defaultFace + config.facesExt});
                        
                    }else{
                       // console.log("found");
                        this.images.push({"string": images[i], "url": face + config.facesExt});
                       
                    }

                    resolve();
                });
            }));
        }


        return Promise.all(promises);

    }

    getAllFiles(){

        return new Promise((resolve, reject) =>{

            this.faceFiles = [];

            fs.readdir(config.facesDir, (err, files) =>{

                if(err){    
                    reject(err);
                }else{

                    this.faceFiles = files;
                    console.table(files);
                    resolve();
                }
            });
        });
    }

    getAllFaceDetails(){

        return new Promise((resolve, reject) =>{


            const query = "SELECT * FROM nutstats_faces ORDER BY uses DESC";

            this.faceDetails = [];

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.faceDetails = result;
                }

                console.table(this.faceDetails);

                resolve();

            });
        });
    }


}



module.exports = Faces;