const Promise = require('promise');
const mysql = require('./database');
const dgram = require('dgram');
const config = require('./config');
//onst process = require('process');


class UTServerQuery{


    constructor(){


        this.server = dgram.createSocket('udp4');

        this.servers = [];


        this.loop = null;

        this.setup().then(() =>{

            console.log("Everything is ok");

            this.main();

        }).catch((err) =>{
            console.log(err);
        });

    }

    getAllServers(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,ip,port FROM nutstats_server_query_servers";

            

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != null){
                   // console.table(result);
                    this.servers = [];
                    this.servers = result;

                }

                resolve();
            });
        });
    }

    parseData(data, rinfo){

        const playerReg = /numplayers\\(\d+)/i
        const maxPlayerReg = /maxplayers\\(\d+)/i
        const serverNameReg = /hostname\\(.+?)\\/i;
        const mapNameReg = /mapname\\(.+?)\\/i;

       // console.log(data.match(playerReg));

        let result = 0;

        let players = 0;
        let maxPlayers = 0;
        let serverName = "";
        let mapName = "";

        result = playerReg.exec(data);

        if(result != null){
            players = result[1];
        }


        result = maxPlayerReg.exec(data);

        if(result != null){
            maxPlayers = result[1];
        }

        result = serverNameReg.exec(data);

        if(result != null){
            serverName = result[1];
        }

        result = mapNameReg.exec(data);

        if(result != null){
            mapName = result[1];
        }

      
        this.insertPlayerCount(rinfo, players, maxPlayers).then(() =>{
           // console.log("this.insertPlaterCount");
            if(serverName != null && serverName != ""){
                this.updateServer(serverName, rinfo.address, rinfo.port - 1, mapName, players, maxPlayers);
            }
            this.updatePlayers(data, rinfo);
        }).catch((err) =>{
            console.trace(err);
        });
    }


    updateServerDetails(name, ip, port, mapName, currentPlayers, maxPlayers){


        return new Promise((resolve, reject) =>{

            if(name == "" || name == null || name == undefined)
                resolve();

            const query = "UPDATE nutstats_server_query_servers SET name=?,map=?,current_players=?,max_players=?,fetched=? WHERE ip=? AND port=?";

            const now = new Date();

            const time = Math.floor(now.getTime() / 1000);

            mysql.query(query, [name, mapName, currentPlayers, maxPlayers, time, ip, port], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    addNewServer(name, ip, port, mapName, currentPlayers, maxPlayers){


        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_server_query_servers VALUES(NULL,?,?,?,?,?,?,?)";

            const now = new Date();
            const time = Math.floor(now.getTime() / 1000);

            mysql.query(query, [name, ip, port, mapName, currentPlayers, maxPlayers, time], (err) =>{

                if(err) reject(err);

                resolve();
            });

        });
        
    }

    updateServer(name, ip, port, mapName, players, maxPlayers){


        return new Promise((resolve, reject) =>{


            const query = "SELECT COUNT(*) as servers FROM nutstats_server_query_servers WHERE ip=? AND port=?";

           // let bAlreadyExists = false;

            mysql.query(query, [ip, port], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result[0].servers > 0){
                        
                        return this.updateServerDetails(name, ip, port, mapName, players, maxPlayers);

                    }else{

                        return this.addNewServer(name, ip, port, mapName, players, maxPlayers);
                    }

                }else{
                    resolve();
                }

            });

            
        });

    }

    getServerId(ip, port){

        port = port - 1;


        for(let i = 0; i < this.servers.length; i++){

           // console.log("Looking for "+ip+":"+port);
            if(this.servers[i].ip == ip && this.servers[i].port == port){
                return this.servers[i].id;
            }
        }

        return -1;
    }

    insertPlayerCount(server, players, maxPlayers){

        return new Promise((resolve, reject) =>{


            const query = "INSERT INTO nutstats_server_query_player_count VALUES(NULL,?,?,?,?)";

            const now = new Date();

            mysql.query(query, [server.address+":"+(server.port - 1), now.getTime() / 1000, players, maxPlayers], (err) =>{

                if(err) reject(err);

                resolve();
            });

        });

    }

    getDataFromServers(){


        let s = 0;

        for(let i = 0; i < this.servers.length; i++){

           // console.log("server "+i);
            
            s = this.servers[i];

            this.server.send('\\info\\xserverquery\\\\players\\xserverquery\\', parseInt(s.port) + 1, s.ip);
        }
    }


    updatePlayers(data, rinfo){


  

       // return new Promise((resolve, reject) =>{


        const namesReg = /player_\d+\\.*?\\/img;
        const nameReg = /player_\d+\\(.*?)\\/i;
        const fragsReg = /frags_\d+\\.*?\\/img;
        const fragReg = /frags_\d+\\(.*?)\\/i;


        let nameResults = [];
        let fragResults = [];

        const players = [];
        const promises = [];

        nameResults = data.match(namesReg);
        fragResults = data.match(fragsReg);


        let currentName = "";
        let currentFrags = 0;

        if(nameResults != null && fragResults != null){

            for(let i = 0; i < nameResults.length; i++){


                currentName = "";
                currentFrags = 0;

                //console.log(nameResults[i]);

                //console.log(nameReg.exec(nameResults[i]));
                //console.log(fragReg.exec(fragResults[i]));

                currentName = nameReg.exec(nameResults[i]);
                currentFrags = fragReg.exec(fragResults[i]);

                if(currentName != null){
                    currentName = currentName[1];
                }

                if(currentFrags != null){
                    currentFrags = currentFrags[1];
                }

                players.push({"name": currentName, "frags": currentFrags});

            }

            //   console.table(players);

            


            const deleteQuery = "DELETE FROM nutstats_server_query_players WHERE server=? AND date < ?";
            const query = "INSERT INTO nutstats_server_query_players VALUES(NULL,?,?,?,?)";

            const serverId = this.getServerId(rinfo.address, rinfo.port);

            const now = new Date();
            const time = Math.floor(now.getTime() / 1000);

            const offset = time - (config.serverQueryInterval * 60);
            
            //console.log(offset);

            mysql.query(deleteQuery, [serverId, offset], (err) =>{

                if(err) console.trace(err);

                for(let i = 0; i < players.length; i++){

                    promises.push(new Promise((resolve, reject) =>{

                        mysql.query(query, [serverId, players[i].name, players[i].frags, time], (err) =>{

                            if(err) reject(err);

                            resolve();
                        });
                    }));
                }
            });

        }
        

        return Promise.all(promises);

            
       // });
    }


    main(){


        const tick = () =>{
            this.getAllServers().then(() =>{

                this.getDataFromServers();

            }).catch((err) =>{
                console.trace(err);
            });
        }

        tick();

        this.loop = setInterval(() =>{

            //console.log("tick");

            tick();
            

        }, (config.serverQueryInterval * 1000 ) * 60);
    }

    setup(){


        this.server.on('error', (err) =>{
            console.log("Error: " +err);
        });

        this.server.on('listening', () =>{

            console.log("Listening for UT server responses.");

        });

        this.server.on('message', (message, rinfo) =>{

            //console.table(rinfo);
           // console.log(`${message}`);

            this.parseData(`${message}`, rinfo);
        });


        this.server.bind(12644);

        /*this.server.send("\\info\\xserverquery\\\\players\\xserverquery", 5556, "cut99.ddns.net", (err) =>{
            console.log(err);
        });*/


        return this.getAllServers();
        
    }
}


module.exports = UTServerQuery;