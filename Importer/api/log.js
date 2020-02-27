
const mysql = require('./database');
const config = require('./config');
const fs = require('fs');

const Promise = require('promise');
const Message = require('./message');

class Log{

    constructor(fileName){

        this.fileName = fileName;
        
        this.bCanImport = true;

    }
    

    bAlreadyImported(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_log_file_history WHERE file=?";

            mysql.query(query, [this.fileName], (err, result) =>{

                if(err){
                    console.trace(err);
                    reject(err);
                }

                if(result != undefined){

                    if(result[0].total_rows > 0){

                        
                        if(config.bIgnoreDuplicates){

                            this.bCanImport = false;
                            new Message("warning", "This log has already been imported... Skipping.");

                        }else{

                            new Message("warning", "This log has already been imported.");

                        }
                    }
                }
                resolve();
            });

        });
    }



    updateImportLogDatabase(){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_log_file_history VALUES(NULL,?,?)";

            let date = new Date();

            const time = parseInt(date.getTime() / 1000);

            mysql.query(query, [this.fileName, time], (err) =>{

                if(err) reject("Failed to update logdatabase history "+err);

                resolve();
                
            });

        });
    }


    createDirectoryString(){


        const reg = /^unreal\.nglog\.(.+?)\.(.+?)\.(.+?)\..+$/i;

        let result = 0;

        if(reg.test(this.fileName)){

            result = reg.exec(this.fileName);

            //console.log(result);


            return "logs-"+result[1]+"-"+result[2]+"/";
        }

        return "";
    }


    moveLog(){

        return new Promise((resolve, reject) =>{

            const logDir = "../Logs/";
            const newDir = "../Logs/imported/";

            const dateDir = this.createDirectoryString();

            if(!config.bMoveLogFiles){

                new Message("warning", "bMoveLogFiles is set to false, log file will not be moved.");
               
                resolve();

            }else{

                if(fs.existsSync(newDir + dateDir)){
        
                    fs.rename(logDir+this.fileName, newDir+dateDir+this.fileName, (err) =>{
                        if(err) reject(err)
                        resolve();
                    });

                }else{

                    fs.mkdir(newDir + dateDir, { recursive: true }, (err) =>{
                        if(err) new Message("error", err);

                        fs.rename(logDir+this.fileName, newDir+dateDir+this.fileName, (err) =>{
                            if(err) reject(err)
                            resolve();
                        });
                    });
                }

            }

        });
        
    }

}


module.exports = Log;