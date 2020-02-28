const ftp = require('ftp');
const fs = require('fs');
const Message = require('./message');
const Promise = require('promise');
const config = require('./config');


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

        this.client.list(config.aceSShotDir, (err, list) =>{

            if(err) throw err;

            if(list != undefined){

                this.files = this.files.concat(list);
            }

            this.sortFiles();

        });
    }

    readLogsDir(){

        this.client.list(config.logDir ,(err, list) =>{

            if(err) throw err;

            if(list != undefined){

                this.files = list;
                //console.table(this.files);

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

        new Message("pass", "Found "+this.logs.length+" match logs to import from server "+this.host+":"+this.port);
        new Message("pass", "Found "+this.aceLogs.length+" ACE kick logs to import from server "+this.host+":"+this.port);
        new Message("pass", "Found "+this.acePlayerLogs.length+" ACE player logs to import from server "+this.host+":"+this.port);
        new Message("pass", "Found "+this.aceShots.length+" ACE kick screenshots to import from server "+this.host+":"+this.port);
        new Message("pass", "Found "+this.tmpFiles.length+" match tmp to import from server "+this.host+":"+this.port);

        this.downloadFiles();

    }

    downloadFile(dir, file, targetDir){

        return new Promise((resolve, reject) =>{

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

        });
        
    }

    async downloadFiles(){


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

    import(){


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

}


module.exports = FTPImporter;