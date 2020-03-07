
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const app = new express();
const Matches = require('./api/matches');
const Match = require('./api/match');
const Maps = require('./api/maps');
const Players = require('./api/players');
const Player = require('./api/player');
const Gametype = require('./api/gametype');
const Weapons = require('./api/weapons');
const Rankings = require('./api/rankings');
const Records = require('./api/records');
const config = require('./api/config');
const Bunnytrack = require('./api/bunnytrack');
const Admin = require('./api/admin');
const Faces = require('./api/faces');
const Home = require('./api/home');
const Monsters = require('./api/monsters');
const Hits = require('./api/hits');
const PickUps = require('./api/pickups');
const Servers = require('./api/servers');
const ThumbnailCreator = require('./api/thumbnailcreator');
const mysql = require('./api/database');
const Countries = require('./api/countries');
const Stats = require('./api/stats');
const ACE = require('./api/ace');
const Jimp = require('jimp');
const fs = require('fs');

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const UTServerQuery = require('./api/serverquery');

const fileUpload = require('express-fileupload');




const options = {
    "host": config.mysqlHost,
    "port": config.mysqlPort,
    "user": config.mysqlUser,
    "password": config.mysqlPassword,
    "database": config.mysqlDatabase,
    createDatabaseTable: true,
    charset: 'utf8mb4_bin',
	schema: {
		tableName: 'nutstats_sessions',
		columnNames: {
			session_id: 'session_id',
			expires: 'expires',
			data: 'data'
		}
	}
};

const sessionStore = new MySQLStore(options);


app.use(session({
    "secret":"rOGHSDgihdkgnwogADGiefhsofO572",
    "resave": false,
    "saveUninitialized": true,
    "store": sessionStore,
    "cookie": { path: '/', httpOnly: false, secure: false}
}));

app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");

app.use(fileUpload());


const hits = new Hits();

const serverQuery = new UTServerQuery();


/*let fails = 0;
                let string = "";
                if(config.password == "password"){
                    fails++;
                    string += "Admin password must be changed before you can continue.";
                }

                this.res.render("setup", {"req": this.req});*/


//const port = 1337;


//const admin = new Admin();

//admin.setTotalUserCount().then(() =>{

    if(config.password != "password" && config.adminUsername != "admin"){

        defaultServer();
        
    }else{

        setupServer();
    }
//}).catch((err) =>{
  //  res.send(err);
//});


function setupServer(){

    app.get('/', (req, res) =>{

        if(config.password != "password" && config.adminUsername != "admin"){

            res.render("error", {"req": req, "message": "Please restart service to gain access to the site.", "config": config});
            /*if(req.session.bSetupLoggedIn == undefined){
                res.render("admin", {"req": req, "bSetup": true});
            }else{
                res.render("setup", {"req": req});
            }*/

        }else{

            res.render("error", {"req": req, "message": "You must change the admin username, and password in api/config.js before site is avaliable.", "config": config});
        }

    });

    app.post('/login', (req, res) =>{

       // console.table(req.body);

        if(req.body.name != ''){

            if(req.body.pass != ''){

                if(req.body.name == config.adminUsername && req.body.pass == config.password){
                    

                    req.session.bSetupLoggedIn = 1;

                    res.send('<head><meta http-equiv="refresh" content="0; URL=/" /></head>');

                }else{
                    res.send("Username or password are incorrect!");
                }

            }else{
                res.send("Password can't be empty");
            }

        }else{

            res.send("Username can't be empty.");
        }
       // res.send("Login");

    }); 


    app.post('/create-admin-account', (req, res) =>{

        //console.table(req.body);

        const a = new Admin();


        let bFailed = false;

        a.bAdminAccountCreated().then(() =>{

            if(a.adminAccounts > 0){
                bFailed = true;
                return true;
            }else{
                return a.createAdminAccount(req.body.username, req.body.pass1, req.body.pass2);
            }

        }).then(() =>{
            if(bFailed){
                res.send("Admin account has already been created... can't create another. You need to restart the nodeUTStats server to gain access to the site.");
            }else{
                res.send("Admin account successfully created! You now need to restart the nodeUTStats server to gain access to the site.");
            }

        }).catch((err) =>{
            console.trace(err);
            res.render("error", {"req": req, "message": err});
        });
        

  
    });

    app.get('/logout', (req,res) =>{

        //if(req.session == undefined)
           // res.send("You arent logged in");

        if(req.session.bSetupLoggedIn != undefined){
            delete req.session.bSetupLoggedIn;

            res.send('logged out');
        }else{
            res.send("You can't be logged out, you aren't logged in.");
        }
    });
    
}


function defaultServer(){

    app.get('/', (req, res) =>{

        const a = new Admin();


        hits.updateHits().then(() =>{

           // ..return serverQuery.test();
            return hits.getTotalHits();

            
        }).then(() =>{

            const h = new Home(res, req, a, hits.totalHits);

        }).catch((err) =>{

            res.send("Error: "+err);
            
        });


       

    });

    app.post('/admin', (req, res) =>{

        if(req.session.bLoggedIn == undefined){
            res.send("Access Denied!");
            return;
        }else{
            if(!req.session.bLoggedIn){
                res.send("You are not logged in to perform this action.");
                return;
            }
        }

        console.log(req.query);

        let mode = "";

        if(req.query.mode != undefined){
            mode = req.query.mode;
        }

        console.log("MODE = "+mode);
        console.log("MODE = "+mode);
        console.log("MODE = "+mode);
        console.log("MODE = "+mode);
        console.log("MODE = "+mode);
        console.log("MODE = "+mode);
        console.log("MODE = "+mode);

        console.log(req.body);

        if(mode == "matches"){

           // console.table(req.body);

            const matches = new Matches();
            const maps = new Maps();
            const gametype = new Gametype();

            let map = null;
            let gametypeId = null;
            let time = null;

            if(req.body.gametype != undefined){
                gametypeId = req.body.gametype;

                if(gametypeId == 0){
                    gametypeId = null;
                }
            }

            if(req.body.map != undefined){
                map = req.body.map;

                if(map == 0){
                    map = null;
                }
            }

            if(req.body.timeFrame != undefined){
                timeFrame = req.body.timeFrame;
            }

            matches.searchMatches(gametypeId, map, time).then(() =>{

                return maps.getAllMapNames();
                

            }).then(() =>{

                return gametype.getAllNames();

            }).then(() =>{

                res.render("admin", {"req": req, "matches": matches.matches, "maps": maps.names, "gametypes": gametype.names, "config": config});
            }).catch((err) =>{


                console.trace(err);
                res.render("error",{"message": err,"req": req, "config": config});

            });
            
        }else if(mode == "servers"){

            const servers = new Servers();
            
            if(req.body.type != undefined){

                if(req.body.type == "add" && req.body.ip != undefined && req.body.port != undefined){

                    servers.addServer(req.body.ip, req.body.port).then(() =>{
                
                        return servers.getQueryServers(true);        
    
                    }).then(() =>{
    
                        res.render("admin", {"req": req, "servers": servers.queryServers, "config": config});
    
                    }).catch((err) =>{
                        console.trace(err);
                        res.render("error",{"message": err,"req": req, "config": config});
                    });

                }else if(req.body.type = "delete"){

                    servers.deleteServer(req.body.server).then(() =>{
                
                        return servers.getQueryServers(true);        
    
                    }).then(() =>{
    
                        res.render("admin", {"req": req, "servers": servers.queryServers, "config": config});
    
                    }).catch((err) =>{
                        console.trace(err);
                        res.render("error",{"message": err,"req": req, "config": config});
                    });

                }
                

            }else{
                res.render("error",{"message": "IP or Port were not set!","req": req, "config": config});
            }
        }else if(mode == "uploadmaps"){

            //console.log(req.files);


            let strings = [];

            if(req.files == null){
                res.send("No file was selected.");
                return;
            }

            let fileName = "";
            const validFileReg = /^.+\.(jpg|png|bmp|jpeg)$/i;

            if(req.body.mapname === undefined){

                const files = req.files['map-files'];


                if(files != undefined){

                    for(let i = 0; i < files.length; i++){

                        fileName = files[i].name;

                        //if(validFileReg.test(fileName)){

                            if(files[i].mimetype == "image/jpeg" || files[i].mimetype == "image/jpg" || files[i].mimetype == "image/bmp" || files[i].mimetype == "image/png"){

                                files[i].mv('public/files/maps/'+fileName, (err) =>{
                                    if(err)  console.log(err);

                                    Jimp.read('public/files/maps/'+fileName, (err, currentFile) =>{

                                        const currentFileName = files[i].name;

                                        if(err) console.log(err);
                                        console.log('public/files/maps/'+currentFileName);
                                        console.log('public/files/maps/'+currentFileName);
                                        console.log('public/files/maps/'+currentFileName);
                                        console.log('public/files/maps/'+currentFileName);
                                        console.log('public/files/maps/'+currentFileName);
                                        console.log('public/files/maps/'+currentFileName);
                                        console.log('public/files/maps/'+currentFileName);


                                        const reg = /^(.+)\..+$/i;

                                        const result = reg.exec(currentFileName);

                                        if(result != null){

                                            currentFile
                                            .resize(1920,1080)
                                            .quality(70)
                                            .write('public/files/maps/'+result[1]+".jpg");

                                        }
        
                                        

                                        
        
                                        fs.unlink('public/files/maps/'+currentFileName, (err) =>{
        
                                            if(err) console.log(err);
                                        });
                                        
                                    });
                                    strings.push(files[i].name+" uploaded complete.");
                                });
                            }
                        //}else{

                          //  strings.push(files[i].name+" is not a valid file.");
                        //}
                    }
                }
                res.redirect("/admin?mode=maps");
                return;

            }else{

                const file = req.files['map-files'];

                const typeReg = /^.+\/(.+)$/i;

                console.log(file);
                
                fileName = req.body.mapname;
                

                const originalFileName = req.body.mapname;

                const typeResult = typeReg.exec(file.mimetype);

                console.log(typeResult);

                let type = "jpg";

                if(typeResult != null){
                    type = typeResult[1];
                }

                console.log("CURRENT TYPE = "+type);

                fileName = fileName+"."+type;
                console.log(fileName);

                if(validFileReg.test(fileName)){

                    if(file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/bmp" || file.mimetype == "image/png"){

                        file.mv('public/files/maps/'+fileName, (err) =>{

                            if(err) console.log(err);

                            Jimp.read('public/files/maps/'+fileName, (err, currentFile) =>{

                                if(err) console.log(err);

                                currentFile
                                .resize(1920,1080)
                                .quality(70)
                                .write('public/files/maps/'+originalFileName+".jpg");

                                fs.unlink('public/files/maps/'+fileName, (err) =>{

                                    if(err) console.log(err);
                                });
                                
                            });

                            console.log("Upload complete");
                        });
                    }
                }else{
                    
                    console.log("not valid file name");
                }
            }

            
            res.redirect("/admin?mode=maps");

        }else if(mode == "uploadfaces"){

           // console.log(req.files);

            if(req.files != null){

                if(req.files.facefile != undefined){

                    const file = req.files.facefile;

                    const validFileReg = /^.+\.png$/i;

                    let fileName = file.name;

                    fileName = req.body.facename;
                    fileName = fileName+".png";

                    if(file.mimetype == "image/png"){

                        if(validFileReg.test(fileName)){

                            file.mv('public/files/faces/'+fileName, (err) =>{

                                if(err) console.log(err);
                                

                                res.send("Uploaded");
                                return;

                            });
                        }
                    }
                }else{

                    res.send("No name set");
                }

                
            }else{

                res.send("No file selected");
            }

            //res.redirect("/admin?mode=faces");

        }else if(mode == "uploadmonsters"){

            if(req.files != undefined){

                console.log(req.files);

                if(req.files.monsterfile != undefined){

                    const file = req.files.monsterfile;

                    if(file.mimetype == "image/png"){

                        if(req.body.monstername != undefined){

                            let name = req.body.monstername;

                            name = name+".png";

                            const validFileReg = /^.+\.png$/i;

                            if(validFileReg.test(name)){

                                file.mv('public/files/monsters/'+name, (err) =>{

                                    if(err){ 
                                        console.log(err);
                                        res.send(err);
                                        return;
                                    }
                                    res.send("Uploaded");
                                    return;
                                });
                            }else{

                                res.send("Not a valid file name.");
                                return;
                            }
                        }else{

                            res.send("Monster name not set");
                            return;
                        }

                    }else{

                        res.send("Wrong file type, must be image/png");
                        return;
                    }
                }else{

                    res.send("No file selected");
                    return;
                }

            }
            //res.redirect("/admin?mode=monsters");

        }else if(mode == "mergePlayers"){

            //console.log("req.body");
           // console.log(req.body);
           // console.log("req.body");

            const master = req.body['admin-player-master'];
            const potato = req.body['admin-player-potato'];

            if(master == ''){

                res.render("error",{"req":req, "message": "Master player is blank, can't continue.", "config": config});
                return;
            }

            if(potato == ''){

                res.render("error",{"req":req, "message": "Potato player is blank, can't continue.", "config": config});
                return;
            }

            if(potato == master){

                res.render("error",{"req":req, "message": "You can't merge a player with themself, can't continue. ("+master+") -> ("+potato+")", "config": config});
                return;
            }

            const p = new Players();

            p.mergePlayers(master, potato).then(() =>{

                res.redirect('/admin?mode=players&merged=1');
                return;
            }).catch((err) =>{

                console.trace(err);

                res.render("error",{"req":req, "message": err, "config": config});
                return;
            });     

            

        }else if(mode == "renameplayer"){

            const p = new Players();
            

            const oldName = req.body['admin-player-rename-select'];
            const newName = req.body['admin-player-new-name'];

            if(oldName != ''){
                p.renamePlayer(oldName, newName).then(() =>{

                    res.redirect('/admin?mode=players&rename=1');

                }).catch(() =>{


                    res.render("error",{"req":req, "message": "There was a problem renaming the player: "+err+"<br> can't continue.", "config": config});
                    return;

                });
            }else{

                res.render("error",{"req":req, "message": "You must select a player to rename, can't continue.", "config": config});
                    return;
            }


            
        }else if(mode == "deleteplayer"){

            console.log("DELETE PLAYER");

            const p = new Players();
            const bt = new Bunnytrack();
            const r = new Rankings();
            const w = new Weapons();

           // console.log(req.body);

            if(req.body['admin-player-delete'] != undefined && req.body['admin-player-delete'] != ''){

                p.deletePlayer(req.body['admin-player-delete']).then(() =>{

                    //console.log("check 1");
                    return bt.deletePlayer(p.currentPlayer);

                }).then(() =>{

                   // console.log("check 2");
                    return r.deletePlayer(p.currentPlayer);

                }).then(() =>{
                   // console.log("check 3");
                    return w.deletePlayer(p.currentPlayer);

                }).then(() =>{
                    //console.log("check 4");
                    res.redirect("/admin?mode=players");
                    //return;
                }).catch((err) =>{
                    console.trace(err);
                });

            }else{
                res.render("error",{"req":req, "message": "admin-player-delete was undefined or == '' ", "config": config});
                return;
            }

        }else if(mode == "ranking"){

            console.log(req.body);

            const g = new Gametype();

            g.updateViewStatus(req.body.id, req.body.value).then(() =>{

                res.send("ok");

            }).catch((err) =>{
                console.trace(err);
                res.send("error");
            });

        }else if(mode == "records"){

            const r = new Records();

            r.updateViewStatus(req.body.id, req.body.value).then(() =>{

                res.send("ok");

            }).catch((err) =>{
                console.trace(err);
                res.send("error");
            });
            

        }else if(mode == "createmapthumbs"){
                
            const mapThumbs = new ThumbnailCreator("public/files/maps/","public/files/maps/thumbs/",50,480,270);

           // res.render("admin", {"req": req, "thumbs": "maps", "config": config});
           console.log("OK");
                
            
        }else if(mode == "mergeIps"){

     
            const p = new Players();

            if(req.body['admin-player-ip-name'] != undefined || req.body['admin-player-ip-name'] == ''){

                if(req.body['admin-player-ip-ip' != undefined] || req.body['admin-player-ip-ip'] == ''){

                    res.render("error",{"req":req, "message": "admin-player-ip-ip was undefined or == '' ", "config": config});
                    return;
                }else{

                    p.mergeIps(req.body['admin-player-ip-name'], req.body['admin-player-ip-ip']).then(() =>{

                        res.redirect("/admin?mode=players");

                    }).catch((err) =>{

                        res.render("error",{"req":req, "message": "Error mergining ips: "+err, "config": config});
                    });
                }

            }else{
                res.render("error",{"req":req, "message": "admin-player-ip-name was undefined or == '' ", "config": config});
                return;
            }

        }
    });

    app.get('/admin', (req, res) =>{

        //req.session.potato = "1234545554534543543";
        let ses = req.session;

        //console.table(ses);

        const maps = new Maps();

        if(req.session.bLoggedIn){

            //console.log("YOU ARE LOGGED IN");

            let mode = null;

            if(req.query.mode != undefined){
                mode = req.query.mode.toLowerCase();
            }

            //console.log("Current mode = "+mode);


            if(mode == "maps"){

                maps.getAllMapFiles().then(() =>{

                    return maps.getAllMapsDetails();

                }).then(() =>{
                    res.render("admin", {"req": req, "mapDetails": maps.mapDetails, "mapFiles": maps.mapFiles, "config": config});
                }).catch((err) =>{
                    res.render("error",{"req":req, "message": err, "config": config});
                });

            }else if(mode == "faces"){

                const faces = new Faces();

                faces.getAllFiles().then(() =>{

                    return faces.getAllFaceDetails();
                    
                }).then(() =>{

                    res.render("admin", {"req": req, "faceFiles": faces.faceFiles, "faceDetails": faces.faceDetails, "config": config});

                }).catch((err) =>{
                    res.render("error",{"message":err,"req":req});
                });
                
            }else if(mode == "monsters"){
                
                const monsters = new Monsters();
                const monsterImages = require('./api/monsterimages');

                monsters.getAllFiles().then(() =>{
                    
                    return monsters.getAllDetails();

                }).then(() =>{

                    res.render("admin", {"req": req, "monsterFiles": monsters.monsterFiles, "monsterDetails": monsters.monsterDetails, "monsterImages": monsterImages, "config": config});
                }).catch((err) =>{
                    console.trace(err);
                    res.render("error",{"message": err,"req": req, "config": config});
                });

            }else if(mode == "matches"){

                const matches = new Matches();
                const maps = new Maps();
                const gametype = new Gametype();

                matches.getAdminRecentMatches().then(() =>{

                    return maps.getAllMapNames();
                    

                }).then(() =>{

                    return gametype.getAllNames();

                }).then(() =>{

                    res.render("admin", {"req": req, "matches": matches.data, "maps": maps.names, "gametypes": gametype.names, "config": config});
                }).catch((err) =>{

                    console.trace(err);
                    res.render("error",{"message": err,"req": req, "config": config});

                });
                
            }else if(mode == "servers"){
                
                const servers = new Servers();

                servers.getQueryServers(true).then(() =>{

                    res.render("admin", {"req": req, "servers": servers.queryServers, "config": config});

                }).catch((err) =>{
                    console.trace(err);
                    res.render("error",{"message": err,"req": req});
                });

            }else if(mode == "players"){

                const players = new Players();

                const c = new Countries();

                console.log(req.body);
                console.log(req.body);
                console.log(req.body);
                console.log(req.body);
                console.log(req.body);

                players.getPlayerNames().then(() =>{

                    return players.getAllIps();

                }).then(() =>{
                   
                    res.render("admin", {"req": req, "config": config, "playerNames": players.names, "countries": c.countries, "playerIps": players.ips});

                }).catch((err) =>{
                    console.trace(err);
                    res.render("error",{"message": "IP or Port were not set!","req": req, "config": config});
                    return;
                });
                //res.render("admin", {"req": req, "config": config});
            }else if(mode == "ace"){

                const ace = new ACE();

                console.log(req.query);


                const q = req.query;


                if(q.aceName == undefined && q.aceIp == undefined && q.aceMac1 == undefined && q.aceMac2 == undefined && q.aceHwid == undefined){
                    ace.getRecentLogs().then(() =>{

                    // res.send(ace.currentLogs);

                    res.render("admin", {
                        "req": req, 
                        "config": config, 
                        "logs": ace.currentLogs,
                        "aceName": q.aceName,
                        "aceIp": q.aceIp,
                        "aceMac1": q.aceMac1,
                        "aceMac2": q.aceMac2,
                        "aceHwid": q.aceHwid,
                        "maxLogs": config.maxAceLogs

                    });

                    }).catch((err) =>{
                        console.trace(err);
                        res.render("error",{"message": "There was a problem loading ace logs: ("+err+")","req": req, "config": config});
                    });

                }else{

                    
                    ace.searchKickLogs(q.aceName, q.aceIp, q.aceMac1, q.aceMac2, q.aceHwid).then(() =>{

                        res.render("admin", {
                            "req": req, 
                            "config": config, 
                            "logs": ace.currentLogs,
                            "aceName": q.aceName,
                            "aceIp": q.aceIp,
                            "aceMac1": q.aceMac1,
                            "aceMac2": q.aceMac2,
                            "aceHwid": q.aceHwid,
                            "maxLogs": config.maxAceLogs
                        });

                    }).catch((err) =>{

                        console.trace(err);

                        res.render("error",{"message": "There was a problem loading ace logs: ("+err+")","req": req, "config": config});
                    });

                }
                
                
            }else if(mode == 'rankings'){

                const g = new Gametype();

                g.getAll().then(() =>{

                    //res.send(g.data);
                    res.render("admin", {"req": req, "config": config, "gametypes": g.data});
                }).catch((err) =>{

                    console.trace(err);
                })
                
            }else if(mode == "records"){
                
                const r = new Records();

                r.getRecordsStatus().then(() =>{

                    res.render("admin", {"req": req, "config": config, "records": r.data});

                }).catch((err) =>{

                    console.trace(err);
                });
               
               
            }else{


                const s = new Stats();

                s.getTotalHits().then(() =>{

                    return s.getTodaysHits();
                   

                }).then(() =>{

                    return s.getThisMonthsHits();

                }).then(() =>{

                    const  p = new Players();


                    //return p.mergePlayers('a_ferocious_kitten','aimbotter');

                }).then(() =>{
                        res.render("admin", {"req": req/*,"mapDetails": [], "mapFiles": []*/, "config": config, "stats": s});
                }).catch((err) =>{

                    res.render("error",{"message": err,"req": req, "config": config});
                });
                
            }

           // res.render("admin", {"req": req});
        }else{
            res.render("admin", {"req": req, "config": config});
        }
    });

    app.post("/admin/delete/match/", (req, res) =>{

        //console.log(req.body);

        if(req.body.id == undefined){
            res.send("none");
        }

        const a = new Admin();

        if(req.session.bAdmin != undefined && req.session.bLoggedIn != undefined){

            if(req.session.bAdmin == true && req.session.bLoggedIn == true){
                
                let id = parseInt(req.body.id);

                if(id !== id){
                    res.send("id=NaN");
                }

                a.deleteMatch(id).then(() =>{
                    res.send("pass");
                }).catch((err) =>{
                    res.send("Error: "+err);
                });
            }
        }else{
            res.send("Not logged in.");
        }

        
        
    });

    app.post("/login", (req, res) =>{


        const a = new Admin();

        const now = new Date();

        if(req.session.loginLockedOut != undefined){

            if(req.session.loginLockedOut < now.getTime() / 1000){
                req.session.loginAttempts = 0;
            }
        }

        const data = req.body;

        if(req.session.loginAttempts == undefined){
            req.session.loginAttempts = 1;
        }else{

            req.session.loginAttempts++;
        }

        

        let loginAttemptDiff = 0;

        if(req.session.lastLoginAttempt != undefined){
            loginAttemptDiff = Math.floor(now.getTime() / 1000) - req.session.lastLoginAttempt;
        }

        //console.log("LoginAttemptDiff: "+loginAttemptDiff);
        req.session.lastLoginAttempt = Math.floor(now.getTime() / 1000);


        //console.table(req.session);

        if(req.session.loginAttempts <= config.maxLoginAttempts){



            if(a.login(data.name, data.pass)){


                if(a.bLoggedIn){
                   // console.log("a.bLoggedIn = true");
                    //const now = new Date();
                    //{ path: '/', httpOnly: false, secure: false, maxAge: config.maxSessionLength}
                    req.session.bLoggedIn = true;
                    //req.session.bLoggedIn._expires = config.maxSessionLength;
                    req.session.username = a.username;
                    req.session.userId = a.userId;
                    req.session.bAdmin = true;
                    //req.session.maxAge = 


                   // console.table(req.session);

                    //req.session.maxAge = (now.getTime() / 1000) + config.maxSessionLength;
                        
                    res.redirect("/admin?lo=2");
                }else{
                    res.send("failed to login");
                }       

            }else{
                res.render("error", {"req": req, "message": "Incorrect username or password", "config": config});
            }
         
        
        }else{

            req.session.loginLockedOut = Math.floor(now.getTime() / 1000) + config.loginLockoutTimeLimit;
            res.render("error",{"req": req, "message": "You have maxed out your login attemps, please try again in 10 minutes.", "config": config});
        }
    });

    app.get('/logout', (req,res) =>{

        //if(req.session == undefined)
           // res.send("You arent logged in");

        if(req.session.bLoggedIn != undefined){

            delete req.session.username;
            delete req.session.userId;
            delete req.session.lastLoginAttempt;
            delete req.session.bLoggedIn;

            res.redirect("/?lo=1");
        }else{
            res.send("You can't be logged out, you aren't logged in.");
        }
    });

    app.get('/recent', (req, res) =>{

    

        let page = 1;

        if(req.query.page != undefined){
            page = parseInt(req.query.page);
        }

        if(page !== page){
            page = 1;
        }

        const rm = new Matches(page);

        const maps = new Maps();

        hits.updateHits().then(() =>{

            return rm.getRecentMatches();

        }).then(() =>{

            return maps.getMapNames(rm.mapIds);

        }).then(() =>{

            return maps.getAllImages();

        }).then(() =>{

            res.render("recent", {
                "data":rm,
                "page":page,
                "pages":rm.pages,
                "results":rm.totalMatches,
                "req":req, 
                "mapImages": maps.images, 
                "mapThumbs": maps.thumbs, 
                "config": config
            });

        }).catch(() =>{

            res.send(err);
            res.render("error",{"req": req, "message": err, "config": config});
        });
        
        //res.render("recent");
    });



    async function displayPlayers(req, res){


        try{

            const p = new Players(req.query);

            await p.getPlayers();

            await hits.updateHits();
                
            res.render("players",{"data":p, "req": req, "config": config});       

        }catch(err){
            res.render("error",{"req": req, "message": err, "config": config});
        }
       

    }

    app.get("/players", (req, res) =>{



       displayPlayers(req, res);

        
        
    });


    app.get('/player', (req, res) =>{

        let id = 0;

        if(req.query.id != undefined){

            id = parseInt(req.query.id);

            if(id != id){
                res.send("Error");
            }
        }

        let page = 1;
        let pages = 1;

        if(req.query.page != undefined){

            page = parseInt(req.query.page);

            if(page != page){
                page = 1;
            }
        }

        const g = new Gametype();
        const p = new Player(id, page);
        const m = new Maps();
        const w = new Weapons();
        const r = new Rankings();
        const f = new Faces();
        const mh = new Monsters();
        const bt = new Bunnytrack();

        let matches = 0;
        let wins = 0;

        console.log("check 1");

        p.init().then(() =>{

            console.log("check 2");

            return g.getGametypeNames();

        }).then(() =>{

            console.log("check 3");
            return m.getAllImages();

        }).then(() =>{

            console.log("check 4");
            return mh.getMonstersPlayer(id);

        }).then(() =>{

            console.log("check 5");
            return mh.loadMonsters(mh.monsterIds);

        }).then(() =>{
            console.log("check 6");
            return mh.getAllFiles();

        }).then(() =>{

        // let pages = 1;

        console.log("check 7");
        //console.table(m.mapNames);
            if(p.totalMatches > 0){

                pages = Math.ceil(p.totalMatches / config.playersPerPage);
            }

            matches = p.totalMatches;
            wins = p.totalWins;

            return w.getAllWeapons();


        }).then(() =>{

            console.log("check 8");

            return r.getPlayerRankings(p.name);

        }).then(() =>{
            console.log("check 9");

            return f.loadImages([p.face]);

        }).then(() =>{

            console.log("check 10");

            return hits.updatePlayerProfileViews(id);

        }).then(() =>{

            console.log("check 11");

            return hits.updateHits();

        }).then(() =>{

            console.log("check 12");
            return w.getPlayerWeaponStats(id);

        }).then(() =>{

            console.log("check 13");
            return bt.getAllPlayerRecords(id);

        }).then(() =>{
            
            console.log("check 14");
            return bt.getMapRecords();

        }).then(() =>{

            console.log("check 15");
            for(let i = 0; i < bt.mapIds.length; i++){

                if(p.mapIds.indexOf(bt.mapIds[i]) == -1){
                    p.mapIds.push(bt.mapIds[i]);
                }
            }

            return m.getMapNames(p.mapIds);

        }).then(() =>{
            console.log("check 16");

            //console.table(w.playerWeaponStats);
            res.render("player",
                {
                    "id":id, 
                    "name": p.name,
                    "pages":pages,
                    "page":page,
                    "results": p.totalMatches,
                    "flag": p.flag, 
                    "totals": p.totalsData, 
                    "gametypes": g.gametypeNames, 
                    "matchesData": p.matches, 
                    "maps": m.mapNames, 
                    "performance": p.performance,
                    "weaponStats": p.weapons.playerTotals,
                    "weaponNames":w.weapons,
                    "req": req,
                    "matches": matches,
                    "wins": wins,
                    "rankings": r.rankings,
                    "faces":f.images,
                    "mapImages": m.images, 
                    "mapThumbs": m.thumbs, 
                    "monsters": mh.data,
                    "monsterKills": mh.playerData,
                    "config": config,
                    "monsterFiles": mh.monsterFiles,
                    "btPlayerRecords": bt.playerRecords,
                    "btMapRecords": bt.mapRecords
                });

        }).catch((err) =>{

            console.trace(err);
        // res.send("Error: "+err);
            res.render("error",{"req": req, "message": err, "config": config});
        });

        
    });



    async function displayMatch(req, res){

        try{
        
            let id = 1;

            if(req.query.id != undefined){
                id = req.query.id;
            }

            const m = new Match(id);
            const f = new Faces();
            const maps = new Maps();

            await m.getData();
            await f.loadImages(m.players.faces);      
            await hits.updateMatchViews(id);
            await hits.updateHits();
            await maps.getAuthor(m.matchData.map);

            m.matchData.mapAuthor = maps.currentAuthor;

            res.render("match", {"matchData": m.matchData, "mapUrl": m.matchData.mapImage, "req": req, "faces": f.images, "config": config});

        }catch(err){
            res.render("error",{"req": req, "message": err, "config": config});
        }

    }

    app.get("/match", (req, res) =>{

        displayMatch(req, res);
    });


    app.get("/rankings", (req, res) =>{
        
        const r = new Rankings();
        const players = new Players();

        if(req.query.id == undefined){

            r.getDefault().then(() =>{

                

                return players.getPlayersTotalIds(r.playerNames);

                

            }).then(() =>{

                return hits.updateHits();

            }).then(() =>{

                res.render("rankings",{
                    "data": r.data,
                    "gametypes":r.gametypeNames, 
                    "gametypeName": "All", 
                    "playerTotalIds": players.totalIds,
                    "results": r.results,
                    "req":req, 
                    "config": config
                });

            }).catch((err) =>{

                console.trace(err);
                res.render("error",{"req": req, "message": err, "config": config});

            });


        }else{

            const gametypes = new Gametype();
            let gametypeId = parseInt(req.query.id);

            if(gametypeId != gametypeId){
                gametypeId = 1;
            }

            let page = 1;

            if(req.query.page != undefined){

                page = parseInt(req.query.page);

                if(page != page){
                    page = 1;
                }
            }

            r.getGametypeRanking(gametypeId, page).then(() =>{

                if(r.playerNames.length == 0){

                    res.send("No data");
                }

                return players.getPlayersTotalIds(r.playerNames);

                

            }).then(() =>{

                
                return gametypes.getGametypeName(r.gametypeId);
                
                
            }).then(() =>{

                return r.getRankingTotalResults(r.gametypeId);

            }).then(() =>{

                let pages = 1;

                if(r.results > 0){
                    pages = Math.ceil(r.results / config.rankingsPerPage);
                }

                res.render("rankings",{
                    "data": r.data,
                    "perPage": config.rankingsPerPage, 
                    "page": page, 
                    "pages": pages, 
                    "results": r.results, 
                    "gametypeId": r.gametypeId,
                    "gametypeName":gametypes.gametypeName,
                    "gametypes": gametypes.gametypeName, 
                    "playerTotalIds": players.totalIds,
                    "req":req, 
                    "config": config
                });

            }).catch((err) =>{

                console.trace(err);
                res.render("error",{"req": req, "message": err, "config": config});
            });

        }
        
    });


    app.get("/maps", (req, res) =>{

        const maps = new Maps();

        let searchTerm = -1;

        let page = 1;
        let pages = 1;
        let sortBy = "name";
        let order = "ASC";
        let mode = "name";

        if(req.query.page != undefined){
            page = parseInt(req.query.page);
        }

        if(req.query.map != undefined){
            searchTerm = req.query.map;
        }

        if(req.query.sortBy != undefined){

            sortBy = req.query.sortBy.toLowerCase();
        }

        if(req.query.order != undefined){

            order = req.query.order.toUpperCase();

        }

        if(req.query.mode != undefined){
            mode = req.query.mode.toLowerCase();
        }
        
        maps.getTotalMaps(searchTerm).then(() =>{

            return maps.getMapList(searchTerm, page, sortBy, order, mode);

        }).then(() =>{

            return maps.setMapImages();

        }).then(() =>{

            return maps.getAllImages();

        }).then(() =>{

            return hits.updateHits();
            
        }).then(() =>{

            if(maps.totalMaps > 0){
                pages = Math.ceil(maps.totalMaps / config.mapsPerPage);
            }
            //console.log(maps.mapList);
            res.render("maps",{
                "req":req, 
                "maps": maps.mapList, 
                "mapImages": maps.images, 
                "mapThumbs": maps.thumbs, 
                "search": searchTerm, 
                "pages": pages, 
                "results": maps.totalMaps, 
                "page": page, 
                "config": config
            });

        }).catch((err) =>{

            res.render("error",{"req": req, "message": err});
        });
        
    });



    async function displayMapPage(req, res){


        const m = new Maps();
        const matches = new Matches();
        const gametype = new Gametype();
        const maps = new Maps();
        const bt = new Bunnytrack();
        const p = new Players();

        let page = 1;
        let pages = 0;
        let mapId = -1;

        if(req.query.id != undefined){

            mapId = parseInt(req.query.id);

            if(mapId != mapId){
                mapId = -1;
            }

            if(mapId == 0){
                mapId = -1;
            }
        }

        if(req.query.page != undefined){

            page = parseInt(req.query.page);

            if(page != page){
                page = 1;
            }

            if(page < 1){
                page = 1;
            }

        }

        try{

            await m.getMapDetails(mapId);
        
            await m.loadSingleImage(m.mapName);

            await m.getMapPlayHistory(mapId);

            await matches.getMatchesByMap(mapId, page);

            await matches.getMapMatchCount(mapId);

            await hits.updateHits();

            await maps.getMapNames([mapId]);

            await maps.loadImages(maps.mapNames);

            await bt.getMapTopPlayers(mapId,10);

            await p.getPlayersByIds(bt.playerIds);
                

            let ids = [];
            let d = 0;

            for(let i = 0; i < matches.mapMatches.length; i++){

                d = matches.mapMatches[i];

                if(ids.indexOf(d.gametype) == -1){
                    ids.push(d.gametype);
                }
            }

            await gametype.getGametypesByIds(ids);

            ids = [];

            d = 0;

            for(let i = 0; i < matches.mapMatches.length; i++){

                d = matches.mapMatches[i];

                if(ids.indexOf(d.map) == -1){
                    ids.push(d.map);
                }

            }

            await m.getMapNames(ids);

            await m.getLongestMatch(mapId);

            pages = Math.ceil(matches.mapMatchCount / config.mapsResultsPerPage);

            res.render("map.ejs", 
            {"req": req, 
                "title": m.mapName, 
                "ogImage": m.mapImage, 
                "fullMapName": m.realMapName, 
                "mapDetails": m.mapDetails, 
                "mapHistory": m.mapHistory,
                "recentMatches": matches.mapMatches,
                "gametypes": gametype.gametypes,
                "maps": m.mapNames,
                "pages": pages,
                "page": page,
                "results": matches.mapMatchCount,
                "longestMatch": m.longestMatchData,
                "mapImages":maps.loadedMaps, 
                "config": config,
                "btRecords": bt.mapPlayerRecords,
                "btPlayers": p.players
            });

        }catch(err){

            console.trace(err);

            res.render("error",{"req": req, "message": err, "config": config});
        }
       

    }


    app.get("/map", (req, res) =>{
        
        displayMapPage(req, res);
        
    });



    app.get("/records", (req, res) =>{

        let type = null;
        let page = 1;
        let category = null;

        if(req.query.type != undefined){
            type = req.query.type;
        }

        if(req.query.page != undefined){

            page = parseInt(req.query.page);

            if(page != page){
                page = 1;
            }
        }

        let currentGametype = 0;

        if(req.query.gametype != undefined){
            currentGametype = req.query.gametype;
        }

        if(req.query.cat){

            category = req.query.cat;
        }

        let r = null;

        const matches = new Matches();
        const maps = new Maps();
        const p = new Players();
        const g = new Gametype();

        if(type != null && category != null){

            r = new Records(false, page, type, category, currentGametype);
            
            r.getSingle().then(() =>{

                return matches.getMapIdsByMatchIds(r.matchIds);

            }).then(() =>{
     
                return maps.getMapNames(matches.mapIds);
    
            }).then(() =>{
                
    
                return hits.updateHits();
    
            }).then(() =>{

                return g.getGametypeNames();

            }).then(() =>{

                return p.getPlayersTotalIds(r.playerNames);
                
            }).then(() =>{

                const totalMatches = [];

                if(p.totalIds != undefined){
                    for(let i = 0; i < p.totalIds.length; i++){

                        totalMatches.push({"name": p.totalIds[i].name ,"matches": p.totalIds[i].total_matches});
                    }
                }

                console.log("console.table(p.playerNames)");
                console.table(r.playerNames);

                res.render("records", {
                    "req": req,
                    "bSingle": true,
                    "matchRecords": r.matchRecords, 
                    "allTimeRecords": r.allTimeRecords, 
                    "mapNames": maps.mapNames, 
                    "mapData": matches.mapData, 
                    "matchDates": matches.dates,
                    "playerTotalIds": p.totalIds,
                    "playerTotalMatches": totalMatches,
                    "alltimeResults": r.allTimeResults,
                    "matchResults": r.matchResults,
                    "search": "",
                    "pages": r.pages,
                    "page": page,
                    "results": r.results,
                    "type": r.type,
                    "searchType": type,
                    "cat": r.category,
                    "perPage": config.recordsPerPage,
                    "config": config,
                    "gametypeNames": g.gametypeNames,
                    "currentGametype": currentGametype
                });

            }).catch((err) =>{
                console.trace(err);
                res.render("error",{"req": req, "message": err, "config": config});
            });

        }else{

            r = new Records(true);

            r.setGametype(currentGametype);

            r.getDefault().then(() =>{

                // console.log(r.matchRecords);
                //console.table(r.matchIds)
                 return matches.getMapIdsByMatchIds(r.matchIds);
             
             }).then(() =>{
     
                 return maps.getMapNames(matches.mapIds);
     
             }).then(() =>{
     
                return p.getPlayersTotalIds(r.playerNames,0);
             
             }).then(() =>{
     
                 return hits.updateHits();
     
             }).then(() =>{

                return g.getGametypeNames();

            }).then(() =>{
     
               //  let results = r.matchResults;
     
     
                // if(r.allTimeResults < r.matchResults){
               //      results = r.allTimeResults;
                // }
     
     
                // if(results != 0){
                 //    r.pages = Math.ceil(results / config.recordsPerPage);
                // }
     
                const totalMatches = [];

                if(p.totalIds != undefined){
                    for(let i = 0; i < p.totalIds.length; i++){

                        totalMatches.push({"name": p.totalIds[i].name ,"matches": p.totalIds[i].total_matches});
                    }
                }

              // console.table(r.playerNames);
                 //console.table(maps.mapNames);
                res.render("records", {
                    "req": req,
                    "matchRecords": r.matchRecords, 
                    "allTimeRecords": r.allTimeRecords, 
                    "mapNames": maps.mapNames, 
                    "mapData": matches.mapData, 
                    "playerTotalIds": p.totalIds,                  
                    "playerTotalMatches": totalMatches,
                    "alltimeResults": r.allTimeResults,
                    "matchResults": r.matchResults,
                    "search": "",
                    "pages": r.pages,
                    "page": page,
                    "results": r.results,
                    "bSingle": false,
                    "perPage": 0, 
                    "config": config,
                    "gametypeNames": g.gametypeNames,
                    "currentGametype": currentGametype,
                    "searchType": type,
                    "cat": r.category,
                });
     
             }).catch((err) =>{
     
                console.trace(err);
                 res.render("error",{"req": req, "message": err, "config": config});
             });
        }
        

        
        
    });


    app.get("/bunnytrack", (req, res) =>{

        const bt = new Bunnytrack();
        const m = new Maps();
        const p = new Players();

        bt.getRecentTimes().then(() =>{

            return bt.getRecentRecords();
            
        }).then(() =>{

            return bt.getRecordStats();

        }).then(() =>{

            return bt.getSummary();


        }).then(() =>{

            return bt.getMostPlayedRecords();

        }).then(() =>{

            
            return p.getPlayersByIds(bt.playerIds);


        }).then(() =>{

            return m.getMapNames(bt.mapIds, true);

        }).then(() =>{

            return m.loadImages(m.mapNames);

        }).then(() =>{

            return hits.updateHits();

        }).then(() =>{

            //console.table(m.mapNames);

            res.render("bunnytrack", {
                "req": req, 
                "recentTimes": bt.recentTimes, 
                "recentRecords": bt.recentRecords, 
                "maps": m.mapNames, 
                "players": p.players,
                "totalRecords": bt.totalRecords,
                "summary": bt.summary,
                "mapCounter": bt.maps,
                "mapImages": m.loadedMaps, 
                "config": config,
                "mostPlayedMapRecords": bt.mostPlayedRecords
            });

        }).catch((err) =>{

            res.render("error",{"req": req, "message": err, "config": config});
        });
        
    });

    app.get("/bt-records", (req, res) =>{

        const bt = new Bunnytrack();
        const m = new Maps();
        const p = new Players();


        bt.getAllRecords().then(() =>{

            return m.getMapNames(bt.mapIds);
            

        }).then(() =>{

            return p.getPlayersByIds(bt.playerIds);

        }).then(() =>{

            return hits.updateHits();

        }).then(() =>{

            res.render("btrecords", {"req": req, "data": bt.data, "players": p.players, "maps": m.mapNames, "config": config});

        }).catch((err) =>{

            res.render("error",{"req": req, "message": err, "config": config});

        });
        
    });

    app.get("/bt-times", (req, res) =>{
        
        const bt = new Bunnytrack();
        const m = new Maps();
        const p = new Players();

        let page = 1;

        if(req.query.page != undefined){
            
            page = parseInt(req.query.page);

            if(page != page){
                page = 1;
            }

            if(page < 1){
                page = 1;
            }
        }

        bt.getRecent(page).then(() =>{

            return m.getMapNames(bt.mapIds);

        }).then(() =>{

            return p.getPlayersByIds(bt.playerIds);

        }).then(() =>{

            
            return bt.getTotalResults();
            
            
        }).then(() =>{

            return hits.updateHits();
            
        }).then(() =>{

            let pages = 1;

            if(bt.totalResults > 0){
                pages = Math.ceil(bt.totalResults / config.btTimesPerPage);
            }

            res.render("bttimes", {"req": req, "data": bt.data, "maps": m.mapNames, "players": p.players, "page": page, "pages": pages, "results": bt.totalResults, "config": config});

        }).catch((err) =>{
            res.render("error",{"req": req, "message": err, "config": config});
        });
        
        
    });


    app.get("/json/match/kills", (req, res) =>{


        let id = -1;

        if(req.query.id != undefined){

            id = parseInt(req.query.id);

            if(id != id){
                res.send("[]");
            }

            const m = new Match(id);

            m.getKillData().then(() =>{

                res.send(m.matchData.killData);
            }).catch(() =>{
                res.send("[]");
            });

        }else{
            res.send("[]");
        }
    });

    app.get("/json/match/kills_ext", (req, res) =>{


        let id = -1;

        if(req.query.id != undefined){

            id = parseInt(req.query.id);

            if(id != id){
                res.send("[]");
            }

            const m = new Match(id);

            m.getKillDataExtended(id).then(() =>{

                console.table(m.killData);
                res.send(m.killData);

            }).catch(() =>{
                res.send("[]");
            });

        }else{
            res.send("[]");
        }
    });


    app.get("/json/match/killslms", (req, res) =>{


        let id = -1;

        if(req.query.id != undefined){

            id = parseInt(req.query.id);

            if(id != id){
                res.send("[]");
            }

            const m = new Match(id);

            m.getLMSData().then(() =>{

                res.send(m.matchData.lmsData);
            }).catch(() =>{
                res.send("[]");
            });


        }else{
            res.send("[]");
        }
    });


    app.get('/json/records/',(req, res) =>{

        let mode = null;


        if(req.query.m != undefined){

            const r = new Records();
            mode = req.query.m;

            r.getSingleCategory(mode).then(() =>{

                res.send(r.data);
            }).catch(() =>{

                res.send("error");
            });
            

        }else{

            res.send([{}]);
        }
    });

    app.get('/json/pickups/', (req, res) =>{

        if(req.query.match != undefined){

            const id = parseInt(req.query.match);

            const p = new PickUps();

            p.getMatchPickUps(id).then(() =>{

                res.send(JSON.stringify(p.matchPickups));
                
            }).catch((err) =>{
                res.send(err);
            });

        }else{

            res.send([]);
        }
    });


    app.get('/json/connects/', (req, res) =>{

        if(req.query.match != undefined){

            const id = parseInt(req.query.match);

            const players = new Players();

            players.getPlayerConnects(id).then(() =>{

                res.send(players.connects);
                
            }).catch((err) =>{

                console.trace(err)

                res.send(err);
            });
        }else{
            res.send([]);
        }
    });


    app.get('/json/aliases/', (req, res) =>{

        if(req.query.name != undefined){

            if(req.query.name != ""){

                const p = new Player();

                p.getAllUsedIps(req.query.name).then(() =>{

                   // console.table(p.ips);

                    const ips = [];

                    for(let i = 0; i < p.ips.length; i++){

                        ips.push(p.ips[i].ip);
                    }

                    return p.getNamesUsedByIps(ips);
                    //res.send(p.ips);
                }).then(() =>{

                    res.send(p.usedNames);
                }).catch(() =>{

                    res.send(err);
                });

            }
        }
    });


    app.get('/nexgenstats', (req, res) =>{

        const n = require('./api/nexgenstats');

        const test = new n(res);
        test.getData();

    });

    app.post('/admin/json/', (req, res) =>{

        if(req.session.bAdmin != undefined && req.session.bLoggedIn != undefined){

            if(req.session.bAdmin == true && req.session.bLoggedIn == true){


                if(req.body.mode != undefined){

                    const mode = req.body.mode;

                    if(mode == "playerips"){


                        console.log(req.body);
                        const p = new Players();

                        if(req.body.name != undefined){

                            p.getPlayerAdminName(req.body.name).then(() =>{

                                console.log(p.usedIps);  

                            }).then(() =>{

                                return p.getPlayerAdminCountry(req.body.country);

                            }).then(() =>{

                                return p.getPlayerAdminIp(req.body.ip);


                            }).then(() =>{

                                res.send(p.usedIps);
                            }).catch((err) =>{
                                
                                console.trace(err);

                                res.send("[]");
                            });

                        }

                    }else if(mode == "ace"){


                        const p = new Players();

                        console.log(req.body);

                        if(req.body.name != ''){

                            if(req.body.ip == ''){

                                p.getPlayerAceDetails(0, req.body.name).then(() =>{

                                    res.send(p.aceDetails);
                                    
                                }).catch((err) =>{
                                    console.trace(err)
                                });

                            }else{

                                p.getPlayerAceDetails(2, req.body.name, req.body.ip).then(() =>{

                                    res.send(p.aceDetails);
                                    
                                }).catch((err) =>{
                                    console.trace(err)
                                });
                            }

                        }else{

                            if(req.body.ip != undefined || req.body.ip != ''){

                                p.getPlayerAceDetails(1,req.body.ip).then(() =>{

                                    res.send(p.aceDetails);
                                    
                                }).catch((err) =>{
                                    console.trace(err)
                                });
                            }else{

                                res.send("[]");
                            }
                        }
                    }
                    console.log(req.body);
                }
                
            }else{
                console.log("Access Denied");
            }

        }else{
            console.log("Access Denied2");
        }
        
    });
}

app.listen(config.port, () =>{
    console.log("running");
});

