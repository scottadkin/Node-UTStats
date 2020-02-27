const LogParser = require('./api/logparser');
const Message = require('./api/message');
const config = require('./api/config');
const Promise = require('promise');


new Message("startup","--------------------------------------------------");
new Message("startup","--------------------------------------------------");
new Message("startup","------- Node UTStats Import Module Started -------");
new Message("startup","---------- Created by Scott Adkin -----------------");
new Message("startup","---------- Build  January 2020 -------------------");
new Message("startup","---- To change settings go to /api/config.js -----");
new Message("startup","--------------------------------------------------");


const destFolders = [
    'C:/xampp/htdocs/utstats/logs/', 
    'C:/xampp/htdocs/uuu/'
];

const fs = require('fs');


class LogMover{


    constructor(){

        this.copyLogs();

        this.lp = new LogParser();

    }


    copyLogs(){

        const logDir = 'C:/UnrealTournamentXC/Logs/';
        

        const fileReg = /^.+\.log$/i;

        const validFiles = [];


        fs.readdir('C:/\UnrealTournamentXC/\Logs', (err, files) =>{

            if(err) throw err;


            for(let i = 0; i < files.length; i++){

                if(fileReg.test(files[i])){
                    validFiles.push(files[i]);
                }
            }

            for(let x = 0; x < destFolders.length; x++){
                
                for(let i = 0; i < validFiles.length; i++){

                    fs.copyFileSync(logDir+validFiles[i],destFolders[x]+validFiles[i]);


                    console.log(logDir+validFiles[i]+"  COPIED TO "+destFolders[x]+validFiles[i]);            

                }
            }
        });
    }

}

let l = new LogMover();


setInterval(() =>{

    if(l.lp != undefined){


        if(l.lp.bFinished){

            l.copyLogs();
            
            l = new LogMover();
            
            
        }else{
            new Message("note", "Last import has not completed yet, skipping.");
        }
        
        
        
    }else{
        new Message("note", "Last import has not completed yet, skipping. (undefined)");
    }

}, config.importInterval);







//app.listen(1337);