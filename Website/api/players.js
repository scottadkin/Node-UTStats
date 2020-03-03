const mysql = require('./database');
const config = require('./config');
const Promise = require('promise');
const Countires = require('./countries');
const Bunnytrack = require('./bunnytrack');
const Weapons = require('./weapons');




class Players{

    constructor(){

        //console.log(req);

        let req = {};

        this.sortType = "name";

        if(arguments.length == 1){
            req = arguments[0];
        }

        this.totalIds = [];

        this.usedIps = [];
        this.page = 1;
        this.totalPlayers = 0;

        this.faces = [];

        this.search = -1;

        this.order = "DESC";

        if(req.search != undefined){
            this.search = req.search;
        }

        if(req.sortType != undefined){

            this.sortType = req.sortType.toLowerCase();

            const validSorts = [
                "name",
                "matches",
                "last",
                "first",
                "playtime",
                "kills",
                "deaths",
                "score"
            ];

            const validNames = [
                "name",
                "total_matches",
                "last_played",
                "first",
                "total_time",
                "kills",
                "deaths",
                "points"
            ];

            if(validSorts.indexOf(this.sortType) == -1){
                this.sortType = "name";
            }else{

                this.sortType = validNames[validSorts.indexOf(this.sortType)];
            }

            
        }

        if(req.page != undefined){
            this.page = parseInt(req.page);
        }

        if(req.orderType != undefined){

            this.order = req.orderType;
           // console.log(this.order);

            if(this.order == 0){
                this.order = "ASC";
            }else{
                this.order = "DESC";
            }
        }

        this.totalIds = [];

        //console.log("searching for player with name like "+this.search);
    }


    getPlayersInMatch(id){


        this.players = [];

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_player WHERE match_id=? ORDER BY team ASC, points DESC, kills DESC, deaths ASC";

            mysql.query(query, [id], (err, result) =>{
                if(err) reject(err);

                if(result != undefined){
                    if(result.length > 0){
                        

                        for(let i = 0; i < result.length; i++){

                            this.faces.push(result[i].face);

                            result[i].flag = result[i].flag.toLowerCase();
                            //console.log(result[i].flag);
                            delete result[i].ip;
                        }

                        this.players = result;
                    }
                }

               // console.log(result);
                resolve();
            });
        });
    }

    getMostAddicted(){

        return new Promise((resolve, reject) =>{

            this.addicted = [];

            this.faces = [];
            

            const query = "SELECT id,name,flag,total_time,first_match,total_matches,last_match_date,face FROM nutstats_player_totals WHERE gametype=0 ORDER by total_matches DESC LIMIT 5";

            
            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    for(let i = 0; i < result.length; i++){
                        this.faces.push(result[i].face);

                        result[i].flag = result[i].flag.toLowerCase();
                    }
                }
                
                this.addicted = result;

                resolve();
            });

        });
    }



    setPages(){


        if(this.totalPlayers > 0){

            this.pages = Math.ceil(this.totalPlayers / config.playersPerPage);

        }else{
            this.pages = 1;
        }


        //this.page--;


        if(this.page <= 0){
            this.page = 1;
        }

    }


    getTotalPlayers(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as players FROM nutstats_player_totals WHERE gametype=0";
            const searchQuery = "SELECT COUNT(*) as players FROM nutstats_player_totals WHERE gametype=0 AND name LIKE '%' ? '%'";


            if(this.search === -1){

                mysql.query(query, (err, result) =>{

                    if(err) reject(err);
                // console.log(result);
                    this.totalPlayers = result[0].players;

                    resolve();
                });
                
            }else{

                mysql.query(searchQuery, [this.search], (err, result) =>{

                    if(err) reject(err);
                // console.log(result);
                    this.totalPlayers = result[0].players;

                    resolve();
                });
            }
        });
    }




    getPlayers(){

        return new Promise((resolve, reject) =>{


            this.getTotalPlayers().then(() =>{

                this.setPages();

                const start = config.playersPerPage * (this.page - 1);

               // console.log("startt = "+start);
                
                const query = "SELECT id,name,flag,face,total_time,total_matches,first_match,last_match_date,points,kills,deaths FROM nutstats_player_totals WHERE gametype=0 ORDER BY name ASC LIMIT ?,?";

                const searchQuery = "SELECT id,name,flag,face,total_time,total_matches,first_match,last_match_date,points,kills,deaths FROM nutstats_player_totals WHERE gametype=0 AND name LIKE '%' ? '%' ORDER BY "+this.sortType+" "+this.order+" LIMIT ?,?";

               //console.log("SELECT id,name,flag,total_time,total_matches,last_match_date,kills,deaths FROM nutstats_player_totals WHERE gametype=0, name LIKE '%'"+this.search+"'%' ORDER BY name ASC LIMIT 100");
                

                if(this.search === -1){

                    //console.log(" === -1")
                    mysql.query(query, [start, config.playersPerPage], (err, result)=>{
                        if(err) reject(err);

                    // console.log(result);
                        if(result != undefined){

                            for(let i = 0; i < result.length; i++){
                                result[i].flag = result[i].flag.toLowerCase();
                            }

                        }
                        this.players = result;


                        resolve();
                    });
                }else{
                   // console.log("right one");

                   // console.log("SELECT id,name,flag,face,total_time,total_matches,last_match_date,kills,deaths FROM nutstats_player_totals WHERE gametype=0 AND name LIKE '%' "+this.search+" '%' ORDER BY "+this.sortType+" DESC LIMIT "+start+","+config.playersPerPage);

                    console.log("this.order = "+this.order);
                    mysql.query(searchQuery, [this.search, start, config.playersPerPage], (err, result) =>{
                       // console.log("sdearaahachahchahcahc");
                        if(err) throw(err);

                       // console.log(result);
                        if(result != undefined){

                            for(let i = 0; i < result.length; i++){

                                result[i].flag = result[i].flag.toLowerCase();
                            }
                        }
                        this.players = result;

                        resolve();
                    });
                }

            }).catch((err) =>{
                reject("Failed to get total player count ("+err+")");
            });

            

        });
    }

    getPlayersTotalIds(names){

        this.totalIds = [];

        let gametype = 0;

        if(arguments.length > 1){

            gametype = parseInt(arguments[1]);

            if(gametype != gametype){
                gametype = 1;
            }
        }

        return new Promise((resolve, reject) =>{

            if(names.length == 0){

                resolve();
               // reject("No names passed to getPlayersTotalIds");
            }

            const query = "SELECT id,name,total_matches FROM nutstats_player_totals WHERE gametype=? AND name IN(?)";

            //console.log("names");
           // console.log(names);
            //console.log("names");
            mysql.query(query, [gametype, names], (err, result) =>{

                if(err) reject(err);

                this.totalIds = result;

                

                resolve();

            }); 
        });
    }


    getPlayersByIds(ids){

        this.players = [];



        return new Promise((resolve, reject) =>{

            if(!Array.isArray(ids)){

                resolve();

            }else if(ids.length == 0){

                resolve();

            }else{

                
                let query = "SELECT id,name,flag,total_matches FROM nutstats_player_totals WHERE gametype=0 AND id IN(?)";

                if(arguments.length == 2){
                    query = "SELECT id,name,flag,total_matches FROM nutstats_player_totals WHERE id IN(?)";
                }

                mysql.query(query, [ids], (err, result) =>{

                    if(err) reject(err);

                    if(result != undefined){

                        console.log("result");
                        console.log(result);
                        console.log("result");

                        for(let i = 0; i < result.length; i++){

                            result[i].flag = result[i].flag.toLowerCase();
                        }
                    }
                    this.players = result;
                    
                    resolve();

                });
            }
        });
    }


    getPlayersByIdsGametype(ids, gametypes){

        this.players = [];


        const promises = [];


        if(ids.length == 0){

            return new Promise((resolve, reject) =>{
                resolve();
            });
        }

        for(let i = 0; i < gametypes.length; i++){

            promises.push(new Promise((resolve, reject) =>{


                const query = "SELECT id,name,flag,total_matches,gametype FROM nutstats_player_totals WHERE gametype IN(?) AND id IN(?)";


            }));

        }



        return new Promise((resolve, reject) =>{
      
            const query = "SELECT id,name,flag,total_matches,gametype FROM nutstats_player_totals WHERE gametype IN(?) AND id IN(?)";


            mysql.query(query, [gametypes,ids], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    console.log("result");
                    console.log(result);
                    console.log("result");

                    for(let i = 0; i < result.length; i++){

                        result[i].flag = result[i].flag.toLowerCase();

                        this.players.push(result[i]);
                    }
                    
                }
                console.log(this.players);
                // this.players = result;
                
                resolve();

            });
            
        });
    }


    removeMatchData(gametype, players){

       // console.log("removeMatchData("+gametype+")");
        const promises = [];

        if(gametype != -1 && players.length > 0){

            for(let i = 0; i < players.length; i++){

                promises.push(new Promise((resolve, reject) =>{

                    let queries = 0;

                    const currentPlayerIndex = i;

                    const p = players[currentPlayerIndex];

                    const points = p.points;
                    const kills = p.kills;
                    const headshots = p.headshots;
                    const teamKills = p.team_kills;
                    const deaths = p.deaths;
                    const suicides = p.suicides;

                    let eff = 0;

                    if(kills > 0 && deaths == 0){
                        eff = 100;
                    }else if(kills == 0 && deaths > 0){
                        eff = 0;
                    }else if(kills == 0 && deaths == 0){
                        eff = 0;
                    }else{
                        eff = kills / (kills + deaths);
                    }

                    const m1 = p.m1;
                    const m2 = p.m2;
                    const m3 = p.m3;
                    const m4 = p.m4;
                    const m5 = p.m5;
                    const m6 = p.m6;
                    const m7 = p.m7;

                    const s1 = p.s1;
                    const s2 = p.s2;
                    const s3 = p.s3;
                    const s4 = p.s4;
                    const s5 = p.s5;
                    const s6 = p.s6;
                    const s7 = p.s7;

                    const bestMulti = p.best_multi;
                    const bestSpree = p.best_spree;

                    const flagCaps = p.flag_caps;
                    const flagGrabs = p.flag_grabs;
                    const flagAssists = p.flag_assists;
                    const flagDrops = p.flag_drops;
                    const flagReturns = p.flag_returns;
                    const flagCovers = p.flag_covers;
                    const flagSeals = p.flag_seals;
                    const flagKills = p.flag_kills;
                    const flagPickups = p.flag_pickups;
                    const flagSaves = p.flag_saves;

                    const playTime = p.play_time;

                    //const ttl = p.ttl;

                    const domCaps = p.dom_caps;
                    const domPoints = 0;
                    const assaultCaps = p.assault_caps;
                    const damage = p.damage;
                    const firstBlood = p.first_blood;
                    const winner = p.winner;
                    const spawnKills = p.spawn_kills;
                    
                    const spawnKillSpree = p.best_spawn_kill_spree;
                    const monsterKills = p.monster_kills;

                    const query = `UPDATE nutstats_player_totals SET points=points-?, kills=kills-?, headshots=headshots-?, team_kills=team_kills-?, 
                    deaths=deaths-?, suicides=suicides-?, m1=m1-?, m2=m2-?, m3=m3-?, m4=m4-?, m5=m5-?, m6=m6-?, m7=m7-?, s1=s1-?, s2=s2-?, s3=s3-?, 
                    s4=s4-?, s5=s5-?, s6=s6-?, s7=s7-?, best_multi=best_multi-?, best_spree=best_spree-?, flag_caps=flag_caps-?, flag_grabs=flag_grabs-?, 
                    flag_assists=flag_assists-?, flag_drops=flag_drops-?, flag_returns=flag_returns-?, flag_covers=flag_covers-?, flag_seals=flag_seals-?, 
                    flag_kills=flag_kills-?, flag_pickups=flag_pickups-?, total_time=total_time-?, total_matches=total_matches-1, dom_caps=dom_caps-?, 
                    dom_points=dom_points-?, assault_caps=assault_caps-?, damage=damage-?, first_blood=first_blood-?, wins=wins-?, spawn_kills=spawn_kills-?, 
                    flag_saves=flag_saves-?, monster_kills=monster_kills-? WHERE name=? AND gametype IN (?)`;

                    const variables = [points, kills, headshots, teamKills, deaths, suicides, m1, m2, m3, m4, m5, m6, m7, s1, s2, s3, s4, s5, s6, s7,
                    bestMulti, bestSpree, flagCaps, flagGrabs, flagAssists, flagDrops, flagReturns, flagCovers, flagSeals, flagKills, flagPickups,
                    playTime, domCaps, domPoints, assaultCaps, damage, firstBlood, winner, spawnKills, flagSaves, monsterKills, p.name, [0,gametype]];

                    /*const variables2 = [points, kills, headshots, teamKills, deaths, suicides, m1, m2, m3, m4, m5, m6, m7, s1, s2, s3, s4, s5, s6, s7,
                        bestMulti, bestSpree, flagCaps, flagGrabs, flagAssists, flagDrops, flagReturns, flagCovers, flagSeals, flagKills, flagPickups,
                        playTime, 1, domCaps, domPoints, assaultCaps, damage, firstBlood, winner, spawnKills, flagSaves, monsterKills, p.name, gametype];
                        */

                    
                    mysql.query(query, variables, (err, result) =>{

                        //console.log("query1");
                        //console.log(err);
                        if(err) reject(err);

                        //console.log(result);
                       // queries++;

                        //console.log(queries);
                        //if(queries == 2){
                            resolve();
                       // }
                        
                    });

                    /*mysql.query(query, variables2, (err) =>{
                        console.log("!query2");

                        console.log(err);
                        if(err) reject(err);

                        queries++;
                        //console.log(queries);
                        if(queries == 2){
                            resolve();
                        }
                    });*/
                }));

            }

        }


        return Promise.all(promises);
    }




    getPlayerConnects(matchId){

        matchId = parseInt(matchId);

        this.connects = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_connects WHERE match_id=? ORDER BY time ASC";

            mysql.query(query, [matchId], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.connects = result;
                }

                resolve();
            });


        });
    }

    

    getPlayerNames(){

        this.names = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nutstats_player_totals WHERE gametype=0 ORDER by name ASC";

            mysql.query(query, (err, result) =>{

                if(err){
                    reject(err);
                }

                if(result != undefined){
                    this.names = result;
                }

                //console.table(this.names);
                resolve();
                
            });
        });

    }



    getPlayerAdminIp(ip){

       // this.usedIps = [];

        const c = new Countires();

        return new Promise((resolve, reject) =>{

            if(ip == ''){
                resolve();
            }

            let query = "SELECT name,ip,flag,COUNT(ip) AS total_uses FROM nutstats_player WHERE ip LIKE '%' ? '%' GROUP BY ip";         

            mysql.query(query, [ip], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    for(let i = 0; i < result.length; i++){

                        this.usedIps.push(
                            {
                                "ip": result[i].ip,
                                "flag": result[i].flag,
                                "country": c.getName(result[i].flag),
                                "uses": result[i].total_uses,
                                "name": result[i].name
                            }
                        );
                    }

                   // console.log(result);
                }

                resolve();
            });

        });

    }

    getPlayerAdminCountry(country){

        //this.usedIps = [];

        const c = new Countires();

        return new Promise((resolve, reject) =>{

            let query = "SELECT name,ip,flag,COUNT(ip) AS total_uses FROM nutstats_player WHERE flag=? GROUP BY ip";         

            mysql.query(query, [country], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    for(let i = 0; i < result.length; i++){

                        this.usedIps.push(
                            {
                                "ip": result[i].ip,
                                "flag": result[i].flag,
                                "country": c.getName(result[i].flag),
                                "uses": result[i].total_uses,
                                "name": result[i].name
                            }
                        );
                    }

                   // console.log(result);
                }

                resolve();
            });

        });

    }



    getPlayerAdminName(name){

     

        //this.usedIps = [];

        const c = new Countires();

        return new Promise((resolve, reject) =>{

            let query = "SELECT name,ip,flag,COUNT(ip) AS total_uses FROM nutstats_player WHERE name=? GROUP BY ip";         

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    for(let i = 0; i < result.length; i++){

                        this.usedIps.push(
                            {
                                "ip": result[i].ip,
                                "flag": result[i].flag,
                                "country": c.getName(result[i].flag),
                                "uses": result[i].total_uses,
                                "name": result[i].name
                            }
                        );
                    }

                   // console.log(result);
                }

                resolve();
            });

        });
    }

    getAllIps(){


        this.allIps = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT DISTINCT ip FROM nutstats_player";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.allIps = result;
                }

                resolve();
            });
        });
    }


    getPlayerTotals(player){

       // player = parseInt(player);

        this.currentPlayerTotals = [];

        return new Promise((resolve, reject) =>{

            //if(player != player){
             //   reject("Player is NaN");
           // }

            const query = "SELECT * FROM nutstats_player_totals WHERE name=?";

            mysql.query(query, [player], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.currentPlayerTotals = result;
                }

                resolve();
            });
        });
    }



    mergePlayerTotals(master, potato){

        
            let p = 0;

            const promises = [];

            this.toMerge = [];

            for(let i = 0; i < this.currentPlayerTotals.length; i++){


                promises.push(new Promise((resolve, reject) =>{

                    p = this.currentPlayerTotals[i];
                console.log("Merging "+master+" data with "+potato+" data for gametype = "+p.gametype);


                const query = `UPDATE nutstats_player_totals SET 
                    points=points+?,
                    kills=kills+?,
                    headshots=headshots+?,
                    team_kills=team_kills+?,
                    deaths=deaths+?,
                    suicides=suicides=?,
                    m1=m1+?,
                    m2=m2+?,
                    m3=m3+?,
                    m4=m4+?,
                    m5=m5+?,
                    m6=m6+?,
                    m7=m7+?,
                    s1=s1+?,
                    s2=s2+?,
                    s3=s3+?,
                    s4=s4+?,
                    s5=s5+?,
                    s6=s6+?,
                    s7=s7+?,
                    flag_caps=flag_caps+?,
                    flag_grabs=flag_grabs+?,
                    flag_assists=flag_assists+?,
                    flag_drops=flag_drops+?,
                    flag_returns=flag_returns+?,
                    flag_covers=flag_covers+?,
                    flag_seals=flag_seals+?,
                    flag_kills=flag_kills+?,
                    flag_pickups=flag_pickups+?,
                    total_time=total_time+?,
                    total_matches=total_matches+?,
                    dom_caps=dom_caps+?,
                    dom_points=dom_points+?,
                    assault_caps=assault_caps+?,
                    damage=damage+?,
                    first_blood=first_blood+?,
                    wins=wins+?,
                    views=views+?,
                    spawn_kills=spawn_kills+?,
                    flag_saves=flag_saves+?,
                    monster_kills=monster_kills+?
                    
                    WHERE gametype=? AND name=?`;


                    mysql.query(query, [
                        
                        p.points,
                        p.kills,
                        p.headshots,
                        p.team_kills,
                        p.deaths,
                        p.suicides,
                        p.m1,
                        p.m2,
                        p.m3,
                        p.m4,
                        p.m5,
                        p.m6,
                        p.m7,
                        p.s1,
                        p.s2,
                        p.s3,
                        p.s4,
                        p.s5,
                        p.s6,
                        p.s7,
                        p.flag_caps,
                        p.flag_grabs,
                        p.flag_assists,
                        p.flag_drops,
                        p.flag_returns,
                        p.flag_covers,
                        p.flag_seals,
                        p.flag_kills,
                        p.flag_pickups,
                        p.total_time,
                        p.total_matches,
                        p.dom_caps,
                        p.dom_points,
                        p.assault_caps,
                        p.damage,
                        p.first_blood,
                        p.wins,
                        p.views,
                        p.spawn_kills,
                        p.flag_saves,
                        p.monster_kills, 
                        p.gametype, 
                        master
                    ], (err, result) =>{

                        if(err) reject(err);

                        if(result != undefined){

                            if(result.affectedRows == 0){
                                this.toMerge.push(this.currentPlayerTotals[i]);
                            }
                        }


                        resolve();
                    });

                }));
                

            }


            return Promise.all(promises);
           
    }

    getPlayerTotalIdByName(name){

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nutstats_player_totals WHERE gametype=0 AND name=? LIMIT 1";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);
                
                if(result != undefined){
                    this.totalIds.push(result[0]);
                }
                resolve();
            });
        });
    }

    deletePlayerTotals(name){

        console.log("DELETE "+name);

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_player_totals WHERE name=?";

            console.log("DELETE FROM nutstats_player_totals WHERE name="+name);

            mysql.query(query, [name], (err) =>{

                if(err) reject(err);

                resolve();
            });

        });
    }

    updatePlayerMatches(name, id, oldName){


        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_player SET name=?, player_id=? WHERE name=?";

            console.log("UPDATE nutstats_player SET name="+name+", player_id="+id+" WHERE name="+oldName);

            mysql.query(query, [name, id, oldName], (err) =>{

                if(err) reject(err);


                resolve();
            });
        });

    }

    getCurrentTotalId(name){


       // console.log("this.totalIds");
       // console.log(this.totalIds);
       // console.log("this.totalIds");
        for(let i = 0; i < this.totalIds.length; i++){

           // console.log("Looking for "+name+" found "+this.totalIds[i].name);
            if(this.totalIds[i].name == name){
               // console.log("found");
                return this.totalIds[i].id;
            }
        }
       // console.log("not found");
        return null;
    }


    addPlayerTotals(master){

        const promises = [];


        const query = `INSERT INTO nutstats_player_totals VALUES(NULL,?,'','xx',
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?
        )`;

        for(let i = 0; i < this.toMerge.length; i++){
            
            promises.push(new Promise((resolve, reject) =>{

                const d = this.toMerge[i];

                if(d != master){

                    mysql.query(query, [
                        master, 
                        d.points, 
                        d.kills,
                        d.headshots,
                        d.team_kills,
                        d.deaths,
                        d.suicides,
                        d.eff,
                        d.m1,
                        d.m2,
                        d.m3,
                        d.m4,
                        d.m5,
                        d.m6,
                        d.m7,
                        d.s1,
                        d.s2,
                        d.s3,
                        d.s4,
                        d.s5,
                        d.s6,
                        d.s7,
                        d.best_multi,
                        d.best_spree,
                        d.flag_caps,
                        d.flag_grabs,
                        d.flag_assists,
                        d.flag_drops,
                        d.flag_returns,
                        d.flag_covers,
                        d.flag_seals,
                        d.flag_kills,
                        d.flag_pickups,
                        d.total_time,
                        d.total_matches,
                        d.gametype,
                        d.dom_caps,
                        d.dom_points,
                        d.assault_caps,
                        d.damage,
                        d.first_blood,
                        d.ranking,
                        d.last_played,
                        d.wins,
                        d.last_match,
                        d.last_match_date,
                        d.first_match,
                        d.ranking_change,
                        d.ranking_diff,
                        0,
                        d.spawn_kills,
                        d.flag_saves,
                        '',
                        '',
                        0,
                        0,
                        0,
                        0,
                        d.best_spawn_kill_spree,
                        d.monster_kills,
                        0,
                        d.shortest_distance_kill,
                        d.longest_distance_kill,
                        d.shortest_kill_time,
                        d.longest_kill_time



                    ], (err) =>{
                        
                        if(err) reject(err);


                        resolve();
                    });

                }else{
                    resolve();
                }

            }));

        }

        return Promise.all(promises);
    }


    mergePlayers(master, potato){


        const bt = new Bunnytrack();

        const Match = require('./match');
        const m = new Match();

        return new Promise((resolve, reject) =>{

            this.getPlayerTotals(potato).then(() =>{

               // console.log(this.currentPlayerTotals);

                //resolve();
                

                return this.getPlayersTotalIds([master, potato]);
                

            }).then(() =>{

                if(this.getCurrentTotalId(master) == null){
                    reject("Master player does not exist");
                }

                if(this.getCurrentTotalId(potato) == null){
                    reject("potato player doesnt exist");
                }

                return this.mergePlayerTotals(master, potato);

                
            }).then(() =>{

                return this.addPlayerTotals(master);

            }).then(() =>{

                return this.updatePlayerMatches(master, this.getCurrentTotalId(master), potato);

            }).then(() =>{

                console.log('this.deletePlayerTotals('+potato+')');

                return this.deletePlayerTotals(potato);

            }).then(() =>{

                return m.changeDmWinner(potato, master);
                
            }).then(() =>{

                return this.getPlayerTotalIdByName(master);
            }).then(() =>{

                return this.getPlayerTotalIdByName(potato);

            }).then(() =>{

                return bt.changeRecordHolderIds(this.getCurrentTotalId(master), this.getCurrentTotalId(potato));

            }).then(() =>{

                return bt.changeCapPlayerIds(this.getCurrentTotalId(master), this.getCurrentTotalId(potato));

            }).then(() =>{

                return bt.changePlayerRecords(this.getCurrentTotalId(master), this.getCurrentTotalId(potato));

            }).then(() =>{

                resolve();

            }).catch((err) =>{

                reject(err);
            });
        });
       
    }


    renamePlayer(oldName, newName){

        console.log("RENAME PLAYER");

        const Match = require('./match');
        const m = new Match();

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_player SET name=? WHERE name=?";

            mysql.query(query, [newName, oldName], (err) =>{

                if(err) reject(err);

                const query2 = "UPDATE nutstats_player_totals SET name=? WHERE name=?";

                mysql.query(query2, [newName, oldName], (err) =>{

                    if(err) reject(err);

                    m.changeDmWinner(oldName, newName).then(() =>{
                        resolve();
                    }).catch((err) =>{
                        reject(err);
                    });
                });
            });
        });

    }


    deletePlayerMatchData(player){


        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_player WHERE player_id=?";

            mysql.query(query, [player], (err) =>{

                if(err) reject(err);

                resolve();

            });

        });
        
    }


    deletePlayerTotalsData(player){

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_player_totals WHERE name=?";

            mysql.query(query, [player], (err) =>{

                if(err) reject(err);


                resolve();

            }); 
        });
    }


    
    deletePlayer(name){


        this.currentPlayer = 0;
        this.currentName = "";

        return this.getPlayerTotalIdByName(name).then(() =>{

            if(this.totalIds.length > 0){

                if(this.totalIds[0] != undefined){
                    console.log(this.totalIds);
                    this.currentPlayer = this.totalIds[0].id;
                    this.currentName = this.totalIds[0].name;
                    console.log("Trying to delete "+name+" data, id = "+this.totalIds[0].id);

                    return this.deletePlayerMatchData(this.currentPlayer).then(() =>{

                        console.log("deleted player match data");
                        return this.deletePlayerTotalsData(this.currentName);
                    });
                }

            }
        });

    }


    getPlayerAceDetails(type){

        this.aceDetails = [];

        return new Promise((resolve, reject) =>{

            let query = "";

            let variables = [];

            if(type == 0){
                query = "SELECT id,name,ip,os,mac1,mac2,hwid,COUNT(*) as total_uses FROM nutstats_ace_player WHERE name=? GROUP BY ip, hwid, mac1, mac2";
                variables = [arguments[1]];
            }else if(type == 1){
                query = "SELECT id,name,ip,os,mac1,mac2,hwid,COUNT(*) as total_uses FROM nutstats_ace_player WHERE ip=? GROUP BY ip, hwid, mac1, mac2";
                variables = [arguments[1]];
            }else if(type == 2){
                query = "SELECT id,name,ip,os,mac1,mac2,hwid,COUNT(*) as total_uses FROM nutstats_ace_player WHERE name=? AND ip=? GROUP BY ip, hwid, mac1, mac2";
                variables = [arguments[1], arguments[2]];
            }

            mysql.query(query, variables, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.aceDetails = result;

                    console.table(result);
                }

                resolve();
            });
        });  
    }


    getAllIps(){

        this.ips = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT ip,COUNT(*) as total_uses FROM nutstats_player GROUP BY(ip) ORDER BY total_uses DESC";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.ips = result;

                    console.table(this.ips);
                }

                resolve();
            });
        });
    }


    changePlayerMatchOwner(name, id, ip){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_player SET player_id=?, name=? WHERE ip=?";

            mysql.query(query, [id, name, ip], (err) =>{

                if(err) reject(err);

                console.log("changePlayerId");

                resolve();
            });
        });
    }

    changePlayerOwner(name, ip){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_player_totals SET name=? WHERE ip=?";

            mysql.query(query, [name, ip], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    getMasterData(id){


        this.masterData = null;

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_player_totals WHERE id=? AND gametype=0";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.masterData = result[0];
                }

                resolve();
            });
        });
    }


    getDuplicateData(name, masterId){

        this.duplicateData = null;

        return new Promise((resolve, reject) =>{    

            const query = "SELECT * FROM nutstats_player_totals WHERE name=? AND id!=? AND gametype=0";

            mysql.query(query, [name, masterId], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.duplicateData = result;
                }

                resolve();
            });
        });     
    }

    mergeDuplicates(name, masterId){


        return new Promise((resolve, reject) =>{

            this.getMasterData(masterId).then(() =>{

                console.log("getMasterData");

                return this.getDuplicateData(name, masterId);

            }).then(() =>{

                console.log("After getDuplicateDate");

                if(this.masterData == null){
                    //cant merge data with nothing
                    reject("this.masterData is null");
                }


                if(this.duplicateData == null){
                    //nothing to merge skip
                    resolve();
                }


                if(this.duplicateData.length == 0){

                    resolve();
                }


                let d = 0;
                let m = this.masterData;

                let currentDeaths = 0;
                let currentKills = 0;
                let currentSuicides = 0;
                let currentEff = 0;

                for(let i = 0; i < this.duplicateData.length; i++){

                    console.log(i+" out of "+this.duplicateData.length);

                    d = this.duplicateData[i];

                    if(d.gametype != 0 && m.gametype != 0){
                        console.log("NOT MATCHING GAMETYPE");
                        continue;
                    }

                    currentDeaths = 0;
                    currentKills = 0;
                    currentSuicides = 0;
                    currentEff = 0;



                    m.points += d.points;
                    m.kills += d.kills;
                    m.headshots += d.headshots;
                    m.team_kills += d.team_kills;
                    m.deaths += d.deaths;
                    m.suicides += d.suicides;
 
                    currentDeaths = m.deaths + d.deaths;
                    currentKills = m.kills + d.kills;
           
                    if(currentKills > 0){

                        if(currentDeaths == 0){
                            currentEff = 100;
                        }else{

                            currentEff = (currentKills / (currentDeaths + currentKills)) * 100;

                        }
                    }

                    m.m1 += d.m1;
                    m.m2 += d.m2;
                    m.m3 += d.m3;
                    m.m4 += d.m4;
                    m.m5 += d.m5;
                    m.m6 += d.m6;
                    m.m7 += d.m7;


                    m.s1 += d.s1;
                    m.s2 += d.s2;
                    m.s3 += d.s3;
                    m.s4 += d.s4;
                    m.s5 += d.s5;
                    m.s6 += d.s6;
                    m.s7 += d.s7;

                    if(d.best_multi > m.best_multi){
                        m.best_multi = d.best_multi;
                    }

                    if(d.best_spree > m.best_spree){
                        m.best_spree = d.best_spree;
                    }

                    m.flag_caps += d.flag_caps;
                    m.flag_grabs += d.flag_grabs;
                    m.flag_assists += d.flag_assists;
                    m.flag_drops += d.flag_drops;
                    m.flag_returns += d.flag_returns;
                    m.flag_covers += d.flag_covers;
                    m.flag_seals += d.flag_seals;
                    m.flag_kills += d.flag_kills;
                    m.flag_pickups += d.flag_pickups;

                    m.total_time += d.total_time;
                    m.total_matches += d.total_matches;

                    m.dom_caps += d.dom_caps;
                    m.dom_points += d.dom_points;
                    m.assault_caps += d.assault_caps;
                    
                    m.damage += d.damage;
                    m.first_blood += d.first_blood;

                    if(d.last_played > m.last_played){
                        m.last_played = d.last_played;
                    }

                   
                    m.wins += d.wins;

                    if(d.last_match > m.last_match){

                        m.last_match = d.last_match;
                    }

                    if(d.first_match < m.last_match){

                        m.last_match = d.first_match;

                    }

                    m.views += d.views;

                    m.spawn_kills += d.spawn_kills;

                    m.flag_saves += d.flag_saves;

                    if(d.best_spawn_kill_spree > m.best_spawn_kill_spree){
                        m.best_spawn_kill_spree = d.best_spawn_kill_spree;
                    }

                    m.monster_kills = d.monster_kills;

   
                }


                const query = `UPDATE nutstats_player_totals SET 
                points=?,
                kills=?,
                headshots=?,
                team_kills=?,
                deaths=?,
                suicides=?,
                m1=?,
                m2=?,
                m3=?,
                m4=?,
                m5=?,
                m6=?,
                m7=?,
                s1=?,
                s2=?,
                s3=?,
                s4=?,
                s5=?,
                s6=?,
                s7=?,
                flag_caps=?,
                flag_grabs=?,
                flag_assists=?,
                flag_drops=?,
                flag_returns=?,
                flag_covers=?,
                flag_seals=?,
                flag_kills=?,
                flag_pickups=?,
                total_time=?,
                total_matches=?,
                dom_caps=?,
                dom_points=?,
                assault_caps=?,
                damage=?,
                first_blood=?,
                wins=?,
                views=?,
                spawn_kills=?,
                flag_saves=?,
                monster_kills=?
                
                WHERE gametype=0 AND name=?`;

                console.log("before query");

                mysql.query(query, [m.points,
                    m.kills,
                    m.headshots,
                    m.team_kills,
                    m.deaths,
                    m.suicides,
                    m.m1,
                    m.m2,
                    m.m3,
                    m.m4,
                    m.m5,
                    m.m6,
                    m.m7,
                    m.s1,
                    m.s2,
                    m.s3,
                    m.s4,
                    m.s5,
                    m.s6,
                    m.s7,
                    m.flag_caps,
                    m.flag_grabs,
                    m.flag_assists,
                    m.flag_drops,
                    m.flag_returns,
                    m.flag_covers,
                    m.flag_seals,
                    m.flag_kills,
                    m.flag_pickups,
                    m.total_time,
                    m.total_matches,
                    m.dom_caps,
                    m.dom_points,
                    m.assault_caps,
                    m.damage,
                    m.first_blood,
                    m.wins,
                    m.views,
                    m.spawn_kills,
                    m.flag_saves,
                    m.monster_kills,
                    masterId], (err) =>{

                        console.log("In QUERY");

                    if(err) reject(err);

                    resolve();

                });
            });
        });
    }

    deleteDuplicates(name, id){

        console.log("delteDuplicates");
        console.log("delteDuplicates");
        console.log("delteDuplicates");
        console.log("delteDuplicates");
        console.log("delteDuplicates");

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_player_totals WHERE id!=? AND name=?";

            //console.log("DELETE FROM nutstats_player_totals WHERE id!="+id+" AND name="+name)

            mysql.query(query, [id, name], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    mergeIps(name, ip){

        this.masterIp = ip;

        this.currentName = null;
        this.currentId = null;


        return this.getPlayerTotalIdByName(name).then(() =>{

            this.currentName = this.totalIds[0].name;
            this.currentId = this.totalIds[0].id;

            return this.changePlayerMatchOwner(this.currentName, this.currentId, this.masterIp);

        }).then(() =>{

            return this.changePlayerOwner(this.currentName, this.masterIp);

        }).then(() =>{

            return this.mergeDuplicates(this.currentName, this.currentId);
            
        }).then(() =>{


            return this.deleteDuplicates(this.currentName, this.currentId);
        });

    

    }
}




module.exports = Players;