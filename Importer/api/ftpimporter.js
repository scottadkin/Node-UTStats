const ftp = require('ftp');
const fs = require('fs');
const Message = require('./message');
const Promise = require('promise');
const config = require('./config');
const mysql = require('./database');


class FTPImporter{

    constructor(host, port, user, password){

        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;

        this.bConnected = false;

        this.files = [];

        this.logs = [];
        this.aceLogs = [];
        this.acePlayerLogs = [];
        this.tmpFiles = [];
        this.aceShots = [];


        this.maps = [];


        //this.createInstance();
    }


    readShotsDir(){


        //this.aceShotsImported = [];

        const alreadyImported = [];

        fs.readdir(config.aceSShotDirImport, (err, files) =>{

            if(err) throw err;

            if(files != undefined){

                for(let i = 0; i < files.length; i++){

                    alreadyImported.push(files[i]);
                }
            }

            //console.table(alreadyImported);

        });

        this.client.list(config.aceSShotDir, (err, list) =>{

            if(err) throw err;

            if(list != undefined){

               // this.files = this.files.concat(list);

                for(let i = 0; i < list.length; i++){

                    if(alreadyImported.indexOf(list[i].name) != -1){
                        new Message("warning", "Ace screenshot "+list[i].name+" has already been imported, skipping.");
                    }else{
                        this.files.push(list[i]);
                    }

                    /*if(!this.bFileAlreadyImported(list[i].name)){

                        this.files.push(list[i].name);
                        console.log("new image");
                    }else{
                        new Message("warning", "Ace screenshot "+list[i].name+" has already been imported, skipping.");
                    }*/

                }
            }

            this.sortFiles();

        });
        
    }

    readLogsDir(){

        const tmpFiles = [];

        fs.readdir(config.logDir, (err, files) =>{

            if(err) throw err;

            if(files != undefined){

                for(let i = 0; i < files.length; i++){

                    tmpFiles.push(files[i]);
                }

            }
        });

        this.client.list(config.logDir ,(err, list) =>{

            if(err) throw err;

            if(list != undefined){

                //this.files = list;
                //console.table(list);

                for(let i = 0; i < list.length; i++){

                    if(!this.bFileAlreadyImported(list[i].name)){

                        if(tmpFiles.indexOf(list[i].name) == -1){
                            this.files.push(list[i]);
                        }else{
                            new Message("warning", "Tmp file "+list[i].name+" has already been imported, skipping.");
                        }
                    }else{
                        new Message("warning", "Log "+list[i].name+" has already been imported, skipping.");
                    }
                }

            }

            this.readShotsDir();
        });
    }

    readMapsDir(){

        this.client.list(config.mapsDir, (err, list) =>{

            if(err) throw err;

            //console.table(list);

            const reg = /^.+\.unr$/i;

            if(list != undefined){

                for(let i = 0; i < list.length; i++){

                    if(reg.test(list[i].name)){

                        this.maps.push({
                            "name": list[i].name,
                            "size": list[i].size
                        });
                    }
                }
            }

            //console.table(this.maps);
        });

        
    }

    sortFiles(){

        const matchLogReg = /^unreal\.nglog\..+\.log$/i;
        const tmpReg = /^unreal\.nglog\..+\.tmp$/i;
        const aceReg = /^\[ace\].+\.log$/i;
        const acePlayerReg = /^\[ace-player\].+\.log$/i;
        const aceShotReg = /^\[ace\].+\.jpg$/i;

        let d = 0;

        for(let i = 0; i < this.files.length; i++){

            d = this.files[i];

            //console.log(d);

            if(matchLogReg.test(d.name)){

                this.logs.push(d);

            }else if(tmpReg.test(d.name)){

                this.tmpFiles.push(d);

            }else if(aceReg.test(d.name)){

                this.aceLogs.push(d);

            }else if(acePlayerReg.test(d.name)){

                this.acePlayerLogs.push(d);

            }else if(aceShotReg.test(d.name)){

                this.aceShots.push(d);
            }
        }

        //console.table(this.logs);


        new Message("pass", "Found "+this.logs.length+" match logs to import from server "+this.host+":"+this.port);
        new Message("pass", "Found "+this.aceLogs.length+" ACE kick logs to import from server "+this.host+":"+this.port);
        new Message("pass", "Found "+this.acePlayerLogs.length+" ACE player logs to import from server "+this.host+":"+this.port);
        new Message("pass", "Found "+this.aceShots.length+" ACE kick screenshots to import from server "+this.host+":"+this.port);
        new Message("pass", "Found "+this.tmpFiles.length+" match tmp to import from server "+this.host+":"+this.port);

        this.downloadFiles();

    }

    bFileAlreadyImported(fileName){


        const reg = /^.+\/logs\/(.+)$/i;

        let result = reg.exec(fileName);

        if(result != null){

            fileName = result[1];
        }
        
        let d = 0;

        for(let i = 0; i < this.previousImports.length; i++){

            d = this.previousImports[i];   

            if(d.file == fileName){

                return true;
            }

        }

        return false;

    }

    downloadFile(dir, file, targetDir){

       // console.log("check");

        return new Promise((resolve, reject) =>{

            //console.log(this.bFileAlreadyImported(file.name));
            if(this.bFileAlreadyImported(file.name)){

                new Message("warning", "The file "+file.name+" has already been imported, skipping.");
                resolve();
        
            }else{

                this.client.get(dir + file.name, (err, stream) =>{

                    if(err) reject(err);

                    if(stream != undefined){
                        
                        stream.once('close', () =>{
                            //this.client.end();
                            new Message("pass", "Downloaded "+dir + file.name);//; +" successfully to "+targetDir + file.name);

                            if(config.bDeleteFilesFromFTP){

                                //new Message("pass", "Deleted "+ dir + file.name + " from server "+this.host+":"+this.port);
                            }
                            resolve();
                        });

                        stream.pipe(fs.createWriteStream(targetDir + file.name));

                    }else{

                        new Message("error", dir+file.name+" was not found.");
                        resolve();
                    }

                });

            }
        });
        
    }



    async downloadFiles(){

        //console.table(this.logs);
       // console.table(this.tmpFiles);
        //console.table(this.aceLogs);

        try{


            new Message("note", "Starting download for match log files.");

            for(let i = 0; i < this.logs.length; i++){

                await this.downloadFile(config.logDir, this.logs[i], config.logDir);

            }

            new Message("note", "Starting download for tmp files.");

            for(let i = 0; i < this.tmpFiles.length; i++){

                await this.downloadFile(config.logDir, this.tmpFiles[i], config.logDir);
            }

            new Message("note", "Starting download for ACE kick logs.");

            for(let i = 0; i < this.aceLogs.length; i++){

                await this.downloadFile(config.logDir, this.aceLogs[i], config.logDir);

            }

            new Message("note", "Starting download for ACE kick screenshots.");

            
            for(let i = 0; i < this.aceShots.length; i++){

                await this.downloadFile(config.aceSShotDir, this.aceShots[i], config.aceSShotDir);
            }


            if(config.bImportBTRecords){

                await this.downloadFile("System/", {"name": config.btPlusPlusIni }, "BT/");
                await this.downloadFile("System/", {"name": config.btGameIni }, "BT/");
            }

        }catch(err){
            console.trace(err);
            //throw err;
        }

        this.client.end();
    }

    async import(){

        try{
            await this.getPreviousImportList();
        }catch(err){
            throw err;
        }   

        return new Promise((resolve, reject) =>{

            this.client = new ftp();

            this.client.on('ready', (err) =>{

                if(err) reject(err); 

                new Message("pass", "Connected to "+this.host+":"+this.port+" successfully!");

                this.readLogsDir();

                if(config.bImportMaps){
                    this.readMapsDir();
                }

            });


            this.client.on('end', (err) =>{

                if(err) reject(err);

                new Message("pass", "Finished downloading files from "+this.host+":"+this.port);
                new Message("pass", "Disconnected from "+this.host+":"+this.port);

                resolve();

            });

            this.client.connect({
                "host": this.host,
                "port": this.port,
                "user": this.user,
                "password": this.password
            });
        });       
    }


    getPreviousMatchLogs(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT DISTINCT `file` FROM nutstats_match";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    
                    for(let i = 0; i < result.length; i++){

                        this.previousImports.push(result[i]);
                    }
                }
                resolve();
            });
        });
    }

    getPreviousAceKickLogs(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT DISTINCT file FROM nutstats_ace_logs";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    for(let i = 0; i < result.length; i++){

                        this.previousImports.push(result[i]);
                    }
                }

                resolve();
            });


        });
    }

    getPreviousAcePlayers(){

        //fs.readdir();
    }

    async getPreviousImportList(){

        this.previousImports = [];

        try{
            await this.getPreviousMatchLogs();
            await this.getPreviousAceKickLogs();
            //this.getPreviousAcePlayers();

            //console.table(this.previousImports);
        }catch(err){
            throw err;
        }
        
    }

}


module.exports = FTPImporter;