
const mysql = require("./database");
const Message = require("./message");
const Promise = require("promise");

class Map{



    constructor(mapData, playTime, date, spawnData){


        //console.log("Map for this match was "+mapFile);

        if(arguments.length == 4){
            this.mapId = -1;

            this.data = mapData;


            this.date = date;
            this.playTime = playTime;


            this.name = "";
            this.title = "";
            this.author = "";

            this.spawnData = spawnData;
            this.parseData();
        }



    }

    async setMapId(){

        await this.getMapId();

    }


    parseData(){


        const mapReg = /^\d+\.\d+\tmap\tname\t(.+)$/i;
        const titleReg = /^\d+\.\d+\tmap\ttitle\t(.+)$/i;
        const authorReg = /^\d+\.\d+\tmap\tauthor\t(.+)$/i;


        let d = 0;
        let result = 0;

        //console.log(this.data);

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(mapReg.test(d)){

                result = mapReg.exec(d);
                this.name = result[1];

            }else if(titleReg.test(d)){

                result = titleReg.exec(d);

                this.title = result[1];

            }else if(authorReg.test(d)){
                result = authorReg.exec(d);

                this.author = result[1];
            }
        }
    }



    insertNewMap(){


        return new Promise((resolve, reject) =>{


            const query = "INSERT INTO nutstats_map VALUES(NULL,?,?,?,'',1,?,?,?,0)";

            mysql.query(query,[this.name, this.title, this.author, this.playTime, this.date, this.date], (err, result) =>{

                if(err){
                    reject(err);
                }

       
                    this.mapId = result.insertId;

                resolve();
            });
        });
    }


    updateMapData(){

        return new Promise((resolve, reject) =>{


            const query = "UPDATE nutstats_map SET matches=matches+1, total_time=total_time+?, last=?, title=?, author=? WHERE id=? LIMIT 1";

           // console.log("UPDATE nutstats_map SET matches=matches+1, total_time=total_time+"+this.playTime+", last="+this.date+" WHERE id=? LIMIT 1");
            mysql.query(query,[this.playTime, this.date, this.title, this.author, this.mapId], (err, result) =>{
                if(err){
                    //throw err;
                    reject(err);
                }

               // this.mapId = result.insertId;
                resolve();
            });
        });

    }

    findId(name){

        this.currentId = null;

        return new Promise((resolve, reject) =>{

            const query = "SELECT id FROM nutstats_map WHERE name=?";

            mysql.query(query,[name], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result.length > 0){
                        this.currentId = result[0].id;
                        this.mapId = result[0].id;
                    }

                }
                resolve();
            });
        });

    }

    async getMapId(){


        await this.findId(this.name);

        if(this.currentId == null){

            await this.insertNewMap();

        }else{
            await this.updateMapData();
        }
       
    }


    getMapIds(names){


        return new Promise((resolve, reject) =>{

            if(!Array.isArray(names)){
                reject("names is not an array")
            }

            if(names.length == 0){
                reject("names.length == 0");
            }

            const query = "SELECT id,name FROM nutstats_map WHERE name IN(?)";

            this.maps = [];

            mysql.query(query, [names], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.maps = result;

                    //console.table(result);
                }

                resolve();
            });
        });

    }


    importInsertMap(file, size){


        return new Promise((resolve, reject) =>{


            const query = "SELECT COUNT(*) as total_maps FROM nutstats_map WHERE name=?";

            mysql.query(query, [file], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result[0].total_maps == 0){

                        const insertQuery = "INSERT INTO nutstats_map (name, size) VALUES(?,?)";

                        mysql.query(insertQuery, [file, size], (err) =>{

                            if(err) reject(err);
                            
                            resolve();
                        });
                    }else{

                        resolve();
                    }


                }else{

                    reject();
                }                        
            });        
        });
    }

    insertSpawn(data){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_map_spawn_points VALUES(NULL,?,?,?,?,?,?)";

            const vars = [this.mapId, data.name, data.team, data.x, data.y, data.z];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async checkSpawnData(){

        this.bSpawnDataExists = false;

        return new Promise((resolve,reject) =>{
            
            const query = "SELECT COUNT(*) as total_rows FROM nutstats_map_spawn_points WHERE map_id=?";

            mysql.query(query,[this.mapId], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result[0].total_rows > 0){
                        this.bSpawnDataExists = true;
                    }
                }
                resolve();
            });
        });
    }

    async insertSpawnData(){

        let d = 0;

        //console.table(this.spawnData);

        await this.checkSpawnData();

        if(!this.bSpawnDataExists){

            new Message("note", "Inserting spawn point data for "+this.name);

            for(let i = 0; i < this.spawnData.length; i++){

                d = this.spawnData[i];

                await this.insertSpawn(d);
            }
        }else{

            new Message("note", "Spawn point data for "+this.name+" already exists, skipping.");
        }
    }

   
}

module.exports = Map;