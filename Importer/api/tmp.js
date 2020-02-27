const mysql = require('./database');
const Promise = require('promise');
const config = require('./config');
const fs = require('fs');
const Message = require('./message');




class Tmp{


    constructor(fileName){

        this.fileName = fileName;

    }

    moveFile(){


        return new Promise((resolve, reject) =>{

            fs.access(config.logDir + this.fileName, fs.constants.W_OK, (err) =>{

                if(err) reject(err);

                fs.rename(config.logDir + this.fileName , config.tmpDir + this.fileName, (err) =>{

                    if(err) reject(err);
    
                    new Message("pass", "Moved tmp file "+config.logDir+this.fileName+" to "+config.tmpDir+this.fileName);

                    resolve();
    
                });

            });

            


        });
       
        

       
    }
}



module.exports = Tmp;