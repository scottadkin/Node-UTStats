const mysql = require('./database');
const config = require('./config');
const Promise = require('promise');
const fs = require('fs');
const Message = require('./message');


class Maps{


    constructor(){
  
        this.loadedMaps = [];

        this.databaseImages = [];

    }

    getMostPlayedMaps(){

        this.mostPlayedMaps = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,matches,total_time,last FROM nutstats_map ORDER BY matches DESC LIMIT 5";

            mysql.query(query, (err, result) =>{
                if(err) reject(err);

                this.mostPlayedMaps = result;

                this.removeUnr(this.mostPlayedMaps);

                return this.loadImages(this.mostPlayedMaps).then(() =>{

                    resolve();

                }).catch((err) =>{

                    reject(err);
                });
            });
        });
    }


    getMapNameById(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "SELECT name FROM nutstats_map WHERE id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

               // console.log(result);

                if(result.length > 0){
   
                    const test = this.removeUnr(result[0].name, true);

                
                    this.mapName = test;//result[0].name;//test;
                }else{
                    this.mapName = "unknown map";
                }


                resolve();
            });
        });
    }

    removePrefix(data){

        const reg = /^.+?-(.+)$/i;


        if(reg.test(data)){

            let result = reg.exec(data);


            return result[1].toLowerCase();

        }


        return data.toLowerCase();
    }

    removeUnr(data){

        if(typeof data == 'undefined' || data == null){
            return;
        }

        //data = ["24","5335"];
        

        const reg = /^(.+)\.unr$/i;

        let d = 0;
        let result = 0;

        //const m = this.mapNames;
        
        if(arguments.length == 2){

            if(typeof data == "object"){
                data = data[0];
            }

            if(reg.test(data)){
                result = reg.exec(data);

                return result[1];
            }

        
            return data;

           // return data[0].name;
        }

        if(data.length == 0){
            return;
        }


        if(arguments.length == 1){

            for(let i = 0; i < data.length; i++){

                d = data[i].name;

                if(reg.test(d)){

                    result = reg.exec(d);

                    data[i].name = result[1];
                }
            }
        }

        
    }

    getMapNames(ids, bBT){



        this.mapNames = [];

        //console.log("gamemapnames");
        return new Promise((resolve, reject) =>{

            //console.log("in promise");

            let toFind = [];

            if(!Array.isArray(ids)){

                //console.log("is not an array");
                resolve();
            }else{
               // console.log("ararararyayrayryaryayrayra");
            }

           // console.log("before loop");


            for(let i = 0; i < ids.length; i++){

                if(toFind.indexOf(ids[i]) == -1){
                    toFind.push(ids[i]);
                }
            }
           // console.log("after looop");

            let query = "SELECT id,name FROM nutstats_map WHERE id IN(?)";

            if(bBT != undefined){
                query = "SELECT * FROM nutstats_map WHERE id IN(?)";
            }
            //console.log(toFind);

            if(toFind.length == 0){
                resolve();
            }
            mysql.query(query, [toFind], (err, result) =>{
                if(err){
                    reject(err);
                    //throw err;
                }
                //console.log(result);
                this.mapNames = result;

                
                this.removeUnr(this.mapNames);

                resolve();
            });

        });
    }



    getMapList(searchTerm, page, sortBy, order, mode){


        this.mapList = [];

        page = parseInt(page);

        if(page != page){
            page = 1;
        }

        page--;

        if(page < 0){
            page = 0;
        }

        if(order != "ASC" && order != "DESC"){
            order = "ASC";
        }

        const validOrders = [
            "name",
            "title",
            "author",
            "matches",
            "total_time",
            "last",
            "first"
        ];

        const orderIndex = validOrders.indexOf(sortBy);

        if(orderIndex != -1){

            sortBy = validOrders[orderIndex];
        }

        if(sortBy == ""){
            sortBy = "name";
        }

        if(mode != "name" && mode != "author" && mode != "title"){
            mode = "name";
        }

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_map ORDER BY matches DESC LIMIT ?, ?";

            const altQuery = "SELECT * FROM nutstats_map WHERE "+mode+" LIKE '%' ? '%' ORDER BY "+sortBy+" "+order+" LIMIT ?, ?";

            console.log(altQuery);
            const start = config.mapsPerPage * page;

            if(searchTerm == -1){

                mysql.query(query, [start, config.mapsPerPage], (err, result) =>{

                    if(err) reject(err);
                    //console.log(result);
                    this.mapList = result;
                    resolve();
                });

            }else{

                mysql.query(altQuery, [searchTerm, start, config.mapsPerPage], (err, result) =>{

                    if(err) reject(err);
                    //console.log(result);
                    this.mapList = result;
                    resolve();
                });
            }
        });
    }


    setImage(defaultName, altName, index){

        defaultName = defaultName.toLowerCase();
        altName = altName.toLowerCase();

        console.log("DEFAULTNAME = "+defaultName);
        console.log("altName = "+altName);

        return new Promise((resolve, reject) =>{


            this.mapList[index].sshot = config.defaultMap + config.mapsExt;

            fs.access(config.mapsDir + defaultName + config.mapsExt, fs.constants.R_OK, (err) =>{

                if(err){
                    //console.log("SetImage with DefaultName doesn't exist. "+config.mapsDir +defaultName);
                    fs.access(config.mapsDir + altName + config.mapsExt, fs.constants.R_OK, (err) =>{

                        if(err){
                            //console.log("Set Image with altName doesn't exist. "+config.mapsDir+altName);
                        }else{
        
                            console.log("FOUND ALT NAME "+config.mapsDir+altName);
                            this.mapList[index].sshot = altName + config.mapsExt;
                        }
        
                        //resolve even if map Image not found because we set it to the default image.
                        resolve();
                    });
                }else{
                    
                    console.log("FOUND DEFAULT NAME "+config.mapsDir +defaultName);
                    this.mapList[index].sshot = defaultName + config.mapsExt;
                    resolve();
                }

            });

            

           // console.table(this.mapList);

        });
    }

    async setMapImages(){

        let d = 0;

        const reg = /^(.+)\.unr$/i;

        let currentName = "";
        let altName = "";

        let result = 0;

        try{

            for(let i = 0; i < this.mapList.length; i++){

                d = this.mapList[i];

                currentName = d.name;

                if(reg.test(currentName)){

                    result = reg.exec(d.name);

                    currentName = result[1];
                }

                altName = this.removePrefix(currentName);

                await this.setImage(currentName, altName, i);

            }

        }catch(err){

            console.trace(err);
        }

    }


    loadImage(defaultName, altName){

        defaultName = defaultName.toLowerCase();
        altName = altName.toLowerCase();
        
        console.log("DEFAULTNAME = "+defaultName);
        console.log("ALTNAMe = "+altName);

        return new Promise((resolve, reject) =>{

            fs.access(config.mapsDir + defaultName + config.mapsExt, fs.constants.R_OK, (err) =>{

                if(err){
                    console.log("LoadImage with default name doesn't exist");


                    //if we dont find the defaultName for the map look for the old style with no gametype prefix

                    fs.access(config.mapsDir + altName + config.mapsExt, fs.constants.R_OK, (err) =>{

                        if(err){

                            console.log("LoadImage with altname doesn;t exist");

                            this.loadedMaps.push({
                                "name": defaultName,
                                "file": "default.jpg"
                            });

                            resolve();

                        }else{

                            this.loadedMaps.push({
                                "name": defaultName,
                                "file": altName+".jpg"
                            });
                            resolve();
                        }

                    });

                }else{
                    this.loadedMaps.push({
                        "name": defaultName,
                        "file": defaultName+".jpg"
                    });
                    resolve();
                }
            });

            
        });
    }

    async loadImages(maps){

        const reg = /(.+)\.unr/i;
        const stripPrefix = /^.+?\-(.+)$/i;


        let result = "";

        if(maps == undefined){
            return;
        }

        let currentMap = "";
        let altName = "";

        try{

            for(let i = 0; i < maps.length; i++){

                currentMap = "";
                altName = "";

                const m = maps[i].name;

                if(reg.test(m)){

                    result = reg.exec(m);
                    
                    currentMap = result[1];
                }else{
                    currentMap = m;
                }

                if(stripPrefix.test(currentMap)){

                    result = stripPrefix.exec(currentMap);

                    altName = result[1];
                }

                await this.loadImage(currentMap, altName);         

            }

        }catch(err){

            console.trace(err);

        }

        console.table(this.loadedMaps);

    }


    loadSingleImage(mapName){

        return new Promise((resolve, reject) =>{


            let newName = mapName;


            newName = this.removeUnr(newName, true);

            this.realMapName = newName;
            const altName = newName.toLowerCase();
            
            newName = this.removePrefix(newName);
            newName = newName.toLowerCase(newName);

            this.mapName = newName;
            this.mapImage = "";
            //console.log("Current mapimage should be = "+newName);

            //console.log(config.mapsDir + newName + config.mapsExt);

            fs.access(config.mapsDir + altName + config.mapsExt, fs.constants.R_OK, (err) =>{

                if(err){
                    //this.mapImage = "files/maps/default" + config.mapsExt;
                    fs.access(config.mapsDir + newName + config.mapsExt, fs.constants.R_OK, (err) =>{

                        if(err){
                            this.mapImage = "files/maps/default" + config.mapsExt;
                        }else{
                            this.mapImage = "files/maps/"+ newName + config.mapsExt;
                        }
        
                        resolve();
                    });

                }else{
                    this.mapImage = "files/maps/"+ altName + config.mapsExt;
                }

                resolve();
            });

            
        });
        
    }

    getTotalMaps(searchTerm){


        this.totalMaps = 0;


        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as maps FROM nutstats_map";

            const altQuery = "SELECT COUNT(*) as maps FROM nutstats_map WHERE name LIKE '%' ? '%'";

            if(searchTerm == -1){

                mysql.query(query, (err, result) =>{
                    
                    if(err) reject(err);

                    this.totalMaps = result[0].maps;
                    resolve();
                });

            }else{

                mysql.query(altQuery, [searchTerm], (err, result) =>{
                    
                    if(err) reject(err);

                    this.totalMaps = result[0].maps;
                    resolve();
                });

            }
        });
    }

    

    getMapDetails(mapId){

        return new Promise((resolve, reject) =>{

            this.mapDetails = [];
            this.mapName = "";

            const query = "SELECT * FROM nutstats_map WHERE id=?";

            mysql.query(query, [mapId], (err, result) =>{

                if(err) reject(err);

                this.mapDetails = result;

                if(result != undefined){
                    if(result[0] != undefined){
                        this.mapName = result[0].name;
                    }
                }

                //console.table(this.mapDetails);

                resolve();
            });
        });
    }


    getMapPlayHistory(mapId, type){

        mapId = parseInt(mapId);


        const day = (60 * 60) * 24;
        const week = day * 7;
        const month = week * 4;

        this.mapHistory = [];

        let timeFrame = day;

        switch(type){

            case 0: {   timeFrame = day; } break;
            case 1: {   timeFrame = week; } break;
            case 2: {   timeFrame = month; } break;
            default: {   timeFrame = month; } break;
        }

        const date = new Date();

        const now = date.getTime() / 1000;

        const start = now - timeFrame;

        return new Promise((resolve, reject) =>{

            let query = "SELECT date FROM nutstats_match WHERE map=? AND date >= ?";

            mysql.query(query, [mapId, start], (err, result) =>{

                if(err) reject(err);

                this.mapHistory = result;

                //console.table(this.mapHistory);

                resolve();

            });

        });
    }


    getLongestMatch(id){

        id = parseInt(id);

        this.longestMatchData = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,match_playtime FROM nutstats_match WHERE map=? ORDER BY match_playtime DESC LIMIT 1";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                this.longestMatchData = result;

                resolve();
            });
        });

    }


    getAllMapFiles(){

        return new Promise((resolve, reject) =>{

            this.mapFiles = [];
            
            fs.readdir(config.mapsDir, (err, files) =>{

                if(err){
                    reject(err);
                }else{
                   // console.table(files);
                    this.mapFiles = files;
                    resolve();
                }


            });

        });
    }

    getAllMapsDetails(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_map ORDER BY matches DESC";

            this.mapDetails = [];

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                this.mapDetails = result;
                //console.table(result);

                resolve();
            });

        });
    }


    reduceMapPlayCount(id, playtime){

       // id = parseInt(id);
        //playtime = parseFloat(playtime);


        return new Promise((resolve, reject) =>{

            if(id == undefined){
                resolve();
            }

            if(playtime == undefined){
                resolve();
            }

            const query = "UPDATE nutstats_map SET matches=matches-1, total_time=total_time-? WHERE id=?";

           // console.log("id = "+id+" & playtime = "+playtime);
            mysql.query(query, [playtime, id], (err) =>{

                //console.log(err);

                if(err) reject(err);

                resolve();
            });
        });
    }


    getAllMapNames(){

        this.names = [];


        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nutstats_map ORDER BY name ASC";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.names = result;
                }
               // console.table(this.names);
                resolve();
            });
        });
    }


    getAuthor(id){

        this.currentAuthor = "";

        return new Promise((resolve, reject) =>{

            id = parseInt(id);

            if(id != id){
                resolve();
            }

            const query = "SELECT author FROM nutstats_map WHERE id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.currentAuthor = result[0].author;
                }
                resolve();
            });

        });

    }


    getAllThumbnails(){


        return new Promise((resolve, reject) =>{

            this.thumbs = [];

            fs.readdir(config.mapsDir+"thumbs/", (err, files) =>{

                if(err) reject(err);

                this.thumbs = files;

                resolve();
            });

        });

        
    }

    getAllFullsizeImages(){

        return new Promise((resolve, reject) =>{

            this.images = [];

            fs.readdir(config.mapsDir, (err, files) =>{

                if(err) reject(err);

                this.images = files;

                resolve();
            });
        });
    }

    async getAllImages(){

        try{
            await this.getAllFullsizeImages();
            await this.getAllThumbnails();
        }catch(err){
            throw err;
        }
    }

    getSpawns(id){

        return new Promise((resolve, reject) =>{

            id = parseInt(id);

            if(id != id){
                reject("Map id must be a valid int");
            }

            const query = "SELECT name,team,x,y,z FROM nutstats_map_spawn_points WHERE map_id=?";

            this.spawns = [];

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.spawns = result;
                }

                resolve();
            });
        });
    }

    getPickups(id){

        return new Promise((resolve, reject) =>{

            id = parseInt(id);

            if(id != id){
                reject("Match id must be a valid int");
            }

            const query = "SELECT class_name, name, x, y, z FROM nutstats_item_locations WHERE match_id=?";

            this.items = [];

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.items = result;
                }
                resolve();
            });
        });
    }


    getFlagPositions(id){

        return new Promise((resolve, reject) =>{

            this.flagPositions = [];

            const query = "SELECT team,x,y,z FROM nutstats_flag_positions WHERE map_id=?";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.flagPositions = result;
                }
                resolve();
            });
        });
    }



    getDomPositions(id){

        id = parseInt(id);

        if(id != id){
            id = 1;
        }

        return new Promise((resolve, reject) =>{

            const query = "SELECT name,x,y,z FROM nutstats_dom_positions WHERE map_id=?";

            this.domPositions = [];

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.domPositions = result;
                }

                resolve();

            });

        });

        
    }

}


module.exports = Maps;