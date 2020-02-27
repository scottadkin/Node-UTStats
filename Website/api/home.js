
const mysql = require('./database');
const Promise = require('promise');
const Gametype = require('./gametype');
const Maps = require('./maps');
const Matches = require('./matches');
const Players = require('./players');
const Countries = require('./countries');
const Monsters = require('./monsters');
const config = require('./config');
const fs = require('fs');
const Faces = require('./faces');
const Servers = require('./servers');




class Home{

    constructor(res, req, admin, totalHits){

        this.res = res;
        this.req = req;

        this.admin = admin;

        this.gametypes = new Gametype();
        this.maps = new Maps();
        this.matches = new Matches();
        this.players = new Players();

        this.monsters = new Monsters();

        this.servers = new Servers();

        this.f = new Faces();

        const q = "SELECT * FROM nutstats_map";

        this.totalHits = totalHits;



        this.gametypes.getHomeData().then(() =>{

            return this.maps.getMostPlayedMaps();

        }).then(() =>{

            return this.matches.getHomeRecent();

        }).then(() =>{

            let mapIds = [];

            let d = 0;

            for(let i = 0; i < this.matches.recentMatches.length; i++){

                d = this.matches.recentMatches[i];

                if(mapIds.indexOf(parseInt(d.map)) == -1){
                    mapIds.push(parseInt(d.map));
                }
            }

            return this.maps.getMapNames(mapIds);
            
        }).then(() =>{

            return this.gametypes.getGametypeNames();
            
        }).then(() =>{

            return this.players.getMostAddicted();

        }).then(() =>{

            return this.f.loadImages(this.players.faces);

        }).then(() =>{

            return this.getFlags();

        }).then(() =>{

            return this.monsters.getMonstersHome();

        }).then(() =>{

            return this.monsters.getAllFiles();

        }).then(() =>{

            return this.loadFaces();

        }).then(() =>{

            return this.servers.getAllServers();

        //}).then(() =>{

          //  return this.admin.setTotalUserCount();

        }).then(() =>{

            return this.servers.getQueryServers();

        }).then(() =>{

            return this.servers.getQueryServersPlayers();

        }).then(() =>{

            /*if(this.maps.mapNames == undefined){
                this.maps.mapNames = [];
            }
            this.maps.mapNames = this.maps.mapNames.concat(this.servers.mapNames);
            
            return this.maps.loadImages(this.maps.mapNames);*/

            return this.maps.getAllImages();

        }).then(() =>{


            return this.getLastImportTime();

        }).then(() =>{


           // if(this.admin.totalUserCount > 0){
           // console.table(this.maps.mapNames);
          // console.table(this.maps.loadedMaps);

                this.res.render("home", {
                    "gametypes":this.gametypes.allTimeData,
                    "maps":this.maps.mostPlayedMaps,
                    "matches":this.matches.recentMatches,
                    "mapNames":this.maps.mapNames,
                    "gametypeNames": this.gametypes.gametypeNames,
                    "players": this.players.addicted,
                    "flags":this.flags,
                    "countries": new Countries(),
                    "req": this.req,
                    "monsters": this.monsters,
                    "monsterFiles": this.monsters.monsterFiles,
                    "faces": this.faces,
                    "config": config,
                    "playerFaces": this.f.images,
                    "servers": this.servers.data,
                    "queryServers": this.servers.queryServers,
                    "queryServerPlayers": this.servers.queryPlayers,
                    "totalHits": this.totalHits,
                    "lastImport": this.lastImport,
                    "mapImages": this.maps.images,
                    "mapThumbs": this.maps.thumbs
                });

            //}else{

                

           // }

        }).catch((message) =>{
            console.trace(message);
            this.res.send("Error: "+message);
        });
    }


    getFlags(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT flag, COUNT(*) as total_rows FROM nutstats_player_totals WHERE gametype=0 GROUP by flag ORDER BY total_rows DESC LIMIT ?";

            this.flags = [];
            mysql.query(query, [config.homeMaxCountires], (err, result) =>{

                if(err) throw err;

                if(result != undefined){

                    for(let i = 0; i < result.length; i++){
                        result[i].flag = result[i].flag.toLowerCase();
                    }
                    this.flags = result;
                }

                resolve();

            });

        }); 
    }


    loadFaces(){


        return this.getMostUsedFaces().then(() =>{

            return this.checkFaces();
        });
    }

    getMostUsedFaces(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT name,uses FROM nutstats_faces WHERE name != '' ORDER BY uses DESC LIMIT ?";

            this.faces = [];

            mysql.query(query, [config.homeMaxFaces], (err, result) =>{

                if(err) reject(err);

                this.faces = result;

                resolve();

            });
        });
    }

    checkFaces(){

        const promises = [];


        let d = 0;

        for(let i = 0; i < this.faces.length; i++){

            

            promises.push(new Promise((resolve, reject) =>{

                const d = this.faces[i];

                fs.access("public/files/faces/"+d.name+".png", fs.constants.R_OK, (err) =>{

                    if(err){
                        d.name = "faceless";
                        resolve();
                    }else{
                        resolve();
                    }
                });
            }));

        }


        return Promise.all(promises);
    }


    getLastImportTime(){


        return new Promise((resolve, reject) =>{

            this.lastImport = 0;

            const query = "SELECT imported FROM nutstats_log_file_history ORDER BY imported DESC LIMIT 1";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result[0] != undefined){
                        this.lastImport = result[0].imported;
                    }
                }

                resolve();
            });
        });
    }
}



module.exports = Home;