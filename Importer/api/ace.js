const Promise = require('promise');
const fs = require('fs');
const config = require('./config');
const mysql = require('./database');
const Message = require('./message');

class ACE{


    constructor(){

        this.kickLogs = [];
        this.kickScreenshots = [];
        this.playerLogs = [];

    }

    reset(){

        this.kickLogs = [];
        this.kickScreenshots = [];
        this.playerLogs = [];

    }

    async import(){

        new Message("note", "Starting ACE log import process.");

        await this.findKickLogs()
        await this.readKickLogs();
        await this.readPlayerLogs();


        new Message("pass", "ACE logs import has completed.");
        new Message("pass", this.playerLogs.length+" ACE players logs were imported.");
        new Message("pass", this.kickLogs.length+" ACE kick logs were imported.");

        this.reset();
      
    }

    findKickLogs(){

        const logReg = /^.+\.log$/i;

        const kickReg = /^\[ace\] \- .+?\.log$/i;
        const playerReg = /^\[ace\-player\] \- .+?\.log$/i;

        return new Promise((resolve, reject) =>{

            fs.readdir(config.logDir, (err, files) =>{

                if(err) reject(err);
    
                for(let i = 0; i < files.length; i++){

                    if(logReg.test(files[i])){

                        if(kickReg.test(files[i])){

                            this.kickLogs.push(files[i]);

                        }else if(playerReg.test(files[i])){

                            this.playerLogs.push(files[i]);
                        }
                    }
                }

                resolve();
            });

        });
        
    }


    insertKickLog(vars){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_ace_logs VALUES(NULL,?,?,?,?,?,?,?,?,?,?)";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async insertKickData(data, logFile){


        data = data.replace(/\0/g, '');
        const lines = this.splitFileIntoLines(data);      

        const nameReg = /^\[.*\]: PlayerName.*: (.+)$/i;
        const ipReg = /^\[.*\]: PlayerIP.*: (.+)$/i;
        const mac1Reg = /^\[.*\]: MACHash1.*:(.+)$/i;
        const mac2Reg = /^\[.*\]: MACHash2.*:(.+)$/i;
        const hwidReg = /^\[.*\]: HWID.*: (.+)$/i;
        const versionReg = /^\[.*\]: GameVersion.*: (.+)$/i;
        const timeStampReg = /^\[.*\]: TimeStamp.*: (.+)$/i;
        const sshotReg = /^\[.*\]: Filename.*: \.\.\/(.+)$/i;


        let playerName = "";
        let playerIp = "";
        let mac1 = "";
        let mac2 = "";
        let hwid = "";
        let gameVersion = "";
        let timeStamp = "";
        let fileName = "";

        let result = "";

        let cleanName = "";
        
        for(let i = 0; i < lines.length; i++){

            if(nameReg.test(lines[i])){

                result = nameReg.exec(lines[i]);
                playerName = result[1];

            }else if(ipReg.test(lines[i])){

                result = ipReg.exec(lines[i]);
                playerIp = result[1];

            }else if(mac1Reg.test(lines[i])){

                result = mac1Reg.exec(lines[i]);
                mac1 = result[1];

            }else if(mac2Reg.test(lines[i])){

                result = mac2Reg.exec(lines[i]);
                mac2 = result[1];

            }else if(hwidReg.test(lines[i])){

                result = hwidReg.exec(lines[i]);
                hwid = result[1];

            }else if(versionReg.test(lines[i])){

                result = versionReg.exec(lines[i]);
                gameVersion = result[1];

            }else if(timeStampReg.test(lines[i])){

                result = timeStampReg.exec(lines[i]);
                timeStamp = result[1];

            }else if(sshotReg.test(lines[i])){

                result = sshotReg.exec(lines[i]);
                fileName = result[1];
            }

        }

        try{
            let sshotData = null;

            if(fileName != null && fileName != ""){
                sshotData = fs.readFileSync(fileName,'utf-8');  

                cleanName = fileName.replace(/^.*(shots\/)/i,'');
                //console.log("CLEAN NAME = "+cleanName);
                fs.rename(fileName, config.aceSShotDirImport + cleanName, (err) =>{

                    if(err) throw err;
                });
            }

            if(sshotData == null || sshotData == undefined){
                sshotData = "Not Found";
            }

            await this.insertKickLog([playerName, playerIp, mac1, mac2, hwid, gameVersion, data, sshotData, timeStamp, logFile]);
            await this.moveLog(logFile);   

        }catch(err){
            console.trace(err);
            new Message("error", err);
        }        
       
    }

    moveLog(file){

        
        return new Promise((resolve, reject) =>{

            if(config.bMoveAceLogs){

                fs.rename(config.logDir+file, config.aceImportDir+file, (err) =>{

                    if(err){
                        console.trace(err);
                        new Message("error","Moving file "+config.logDir+file+" to "+config.aceImportDir+file+" failed.");

                        resolve();
                    }else{
    
                        new Message("pass", "Moved "+config.logDir+file+" successfully");
                        resolve();
                    }
                });
            }else{

                new Message("warning", "config.bMoveAceLogs is set to false, log will not be moved.");
                resolve();
            }

        });  
    }

    bLogAlreadyImported(fileName){

        this.bAlreadyImported = false;

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_ace_logs WHERE file=?";

            mysql.query(query, [fileName], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result[0].total_rows > 0){
                        this.bAlreadyImported = true;
                    }
                }

                resolve();

            });

        });
    }

    async readKickLog(fileLocation, fileName){

        new Message("note", "Starting import of ACE Kick Log: "+fileName);

        const data = fs.readFileSync(fileLocation, "utf-8");// (err, data) =>{

        await this.bLogAlreadyImported(fileLocation);

        if(!this.bAlreadyImported){

            await this.insertKickData(data, fileName);

        }else if(this.bAlreadyImported && !config.bIgnoreDuplicates){

            await this.insertKickData(data, fileName);
            
        }else{
            new Message("warning", "This ACE log has already been imported skipping.");
        }

      

    }

    async readKickLogs(){


        for(let i = 0; i < this.kickLogs.length; i++){

            await this.readKickLog(config.logDir+this.kickLogs[i], this.kickLogs[i]);
               
        }

    }

    splitFileIntoLines(data){

        const lines = [];

        const lineReg = /^.+$/img;

        let result = "";

        while(result != null){

            result = lineReg.exec(data);

            if(result != null){
                lines.push(result[0]);
            }
        }

        return lines;
    }

    insertPlayerInfo(vars){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_ace_player VALUES(NULL,?,?,?,?,?,?,?,?)";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async insertPlayerData(data, fileName){


        const foundPlayers = [];

        const getPlayerIndex = (name) =>{

            for(let i = 0; i < foundPlayers.length; i++){

                if(foundPlayers[i].name == name){
                    return i;
                }
            }

            foundPlayers.push({
                "name": name,
                "ip": "",
                "os": "",
                "mac1": "",
                "mac2": "",
                "hwid": "",
                "time": ""
            });

            return foundPlayers.length - 1;
        }

        const lines = this.splitFileIntoLines(data);
        
        const ipReg = /^\[.*\]: \[(.+?)\]: \[ip\] (.+)$/i;
        const osReg = /^\[.*\]: \[(.+?)\]: \[os\] (.+)$/i;
        const mac1Reg = /^\[.*\]: \[(.+?)\]: \[mac1\] (.+)$/i;
        const mac2Reg = /^\[.*\]: \[(.+?)\]: \[mac2\] (.+)$/i;
        const hwidReg = /^\[.*\]: \[(.+?)\]: \[hwid\] (.+)$/i;
        const timeReg = /^\[.*\]: \[(.+?)\]: \[time\] (.+)$/i;

        let result = "";

        let currentPlayer = null;

        let d = 0;

        for(let i = 0; i < lines.length; i++){

            d = lines[i];

            if(ipReg.test(d)){

                result = ipReg.exec(d);

                currentPlayer = getPlayerIndex(result[1]);
                foundPlayers[currentPlayer].ip = result[2];

            }else if(osReg.test(d)){

                result = osReg.exec(d);

                currentPlayer = getPlayerIndex(result[1]);
                foundPlayers[currentPlayer].os = result[2];

            }else if(mac1Reg.test(d)){

                result = mac1Reg.exec(d);

                currentPlayer = getPlayerIndex(result[1]);
                foundPlayers[currentPlayer].mac1 = result[2];

            }else if(mac2Reg.test(d)){

                result = mac2Reg.exec(d);

                currentPlayer = getPlayerIndex(result[1]);
                foundPlayers[currentPlayer].mac2 = result[2];

            }else if(hwidReg.test(d)){

                result = hwidReg.exec(d);

                currentPlayer = getPlayerIndex(result[1]);
                foundPlayers[currentPlayer].hwid = result[2];

            }else if(timeReg.test(d)){

                result = timeReg.exec(d);

                currentPlayer = getPlayerIndex(result[1]);
                foundPlayers[currentPlayer].time = result[2];

            }

        }

        let p = 0;

        for(let i = 0; i < foundPlayers.length; i++){

            p = foundPlayers[i];

            await this.insertPlayerInfo([p.name, p.ip, p.os, p.mac1, p.mac2, p.hwid, p.time, fileName]);   
        }

    
    }

    bPlayerLogAlreadyExist(file){

        this.bPlayerLogImported = false;


        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_ace_player WHERE file=?";

            mysql.query(query, [file], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result[0].total_rows > 0){

                        this.bPlayerLogImported = true;
                    }
                }
                resolve();
            });

        });
    }

    async readPlayerLogs(){

        let data = "";

        for(let i = 0; i < this.playerLogs.length; i++){

            new Message("note", "Starting import of ACE Player Log: "+config.logDir+this.playerLogs[i]);

            data = fs.readFileSync(config.logDir+this.playerLogs[i], 'utf-8');

            data = data.replace(/\0/g, '');

            await this.bPlayerLogAlreadyExist(this.playerLogs[i]);

            if(!this.bPlayerLogImported){


                await this.insertPlayerData(data, this.playerLogs[i]);
                await this.moveLog(this.playerLogs[i]);

                new Message("pass", "ACE Player Log import completed : "+config.logDir+this.playerLogs[i]);

            }else if(this.bPlayerLogImported && !config.bIgnoreDuplicates){

                await this.insertPlayerData(data, this.playerLogs[i]);
                await this.moveLog(this.playerLogs[i]);

                new Message("pass", "ACE Player Log import completed : "+config.logDir+this.playerLogs[i]);
            }
        }
    }




}


module.exports = ACE;