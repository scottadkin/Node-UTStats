const fs = require('fs');
const Message = require('./message');


const importedDir = "../Logs/imported/";
const tmpDir = "../Logs/tmpfiles/";
const aceDir = "../Logs/ace/";


class Installer{


    constructor(){


		this.errors = [];



		this.createLogDirs();

		new Message("pass", "Install completed with no errors!");

		process.exit(0);


    }


    createDirIfNotExists(dir){

        if(!fs.existsSync(dir)){

            fs.mkdir(dir, {recursive: true}, (err) =>{

                if(err){
                    new Message("error","Failed to create "+dir+" ("+err+")");
                }else{

                    new Message("pass", "Created "+dir);
                }
            });

        }else{

            new Message("warning","The directory "+dir+" already exists. Skipping.");
        }
    }

    createLogDirs(){


        this.createDirIfNotExists(importedDir);
        this.createDirIfNotExists(tmpDir);
        this.createDirIfNotExists(aceDir);


    }
}




module.exports = Installer;

