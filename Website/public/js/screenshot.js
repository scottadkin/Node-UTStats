



class MatchScreenShot{


    constructor(parent, mapUrl, data){


        console.log("mapURL = "+mapUrl);
        this.parent = document.getElementById(parent);

        this.data = data;

        console.log(this.data);

        this.createColors();

        this.parseMapName(mapUrl);

        this.createIcons();

        this.mapImage = new Image();
        this.mapImage.src = "files/maps/"+this.mapUrl+".jpg";


        this.flagTest = new Image();
        this.flagTest.src = "files/flags/uk.png";
        

        

        this.createCanvas();
        this.createDropDownEvents();
        this.createFullscreenEvent();

        new Promise((resolve, reject) =>{

            this.mapImage.onload = () =>{
                resolve();
            }

            this.mapImage.onerror = (err) =>{
                
                console.log("FAILED TO LOAD MAP IMAGE CHANING TO DEFAULT");
                console.trace(err);
                this.mapImage.src = "files/maps/default.jpg";
            }

        }).then(() =>{

            return this.createIcons();
            
            
        }).then(() =>{

            return this.loadFlags();

        }).then(() =>{

            //this.addSuicides();

            this.render();
        }).catch((message) =>{
            console.trace(message);
            console.log("failed ("+message+")");
        });

    }


    createFullscreenEvent(){

        this.canvas.addEventListener("click", () =>{
            //alert("error");

            if(this.canvas.requestFullscreen){
                this.canvas.requestFullscreen();
            }else if(this.canvas.msRequestFullscreen){
                this.canvas.msRequestFullscreen();
            }else if(this.canvas.mozRequestFullscreen){
                this.canvas.mozRequestFullscreen();
            }else if(this.canvas.webkitRequestFullscreen){
                this.canvas.webkitRequestFullscreen();
            }
        });
    }

    createDropDownEvents(){

        const elem = document.getElementById("res-options");

        elem.addEventListener("change", (e) =>{
           // console.log(e);
            //const elem = document.getElementById("res-options");
           // console.log(elem.value);
           // console.log("CHANGED");


            const reg = /^(.+?)x(.+?)$/;

            if(reg.test(elem.value)){

                const result = reg.exec(elem.value);

                const width = parseInt(result[1]);
                this.canvas.width = width;
                this.canvas.height = this.canvas.width * 0.5625;
                //console.log(result);
                this.render();
            }

            
        });

    }

    addSuicides(){

        let d = 0;

        for(let i = 0; i < this.data.players.length; i++){

            d = this.data.players[i];

            this.data.players[i].points -= this.data.players[i].suicides;
            this.data.players[i].points -= this.data.players[i].team_kills;
        }
    }


    loadFlags(){

        const flags = [];


        this.flags = [];

        let d = 0;


        let temp = 0;

        for(let i = 0; i < this.data.players.length; i++){

            d = this.data.players[i].flag.toLowerCase();

            temp = new Image();
            temp.src = "files/flags/"+d+".png";


            this.flags.push({"country": d, "img": temp});

            
            

            if(flags.indexOf(d) == -1){

                flags.push(d);
            }

        }

        const promises = [];


        for(let i = 0; i < flags.length; i++){

            promises.push(new Promise((resolve, reject) =>{

                const image = new Image();
                image.src = "files/flags/"+flags[i]+".png";

                image.onload = () =>{
                    resolve();

                }

            }));
        }


        return Promise.all(promises);
    }


    createIcons(){

        

        
        const promises = [];

        let loaded = 0;
        let toLoad = 4;


        this.redTeamIcon = new Image();
        this.blueTeamIcon = new Image();
        this.greenTeamIcon = new Image();
        this.yellowTeamIcon = new Image();
        this.smartCTFBG = new Image();
        this.faceless = new Image();

        this.redTeamIcon.src = "files/red.png";
        this.blueTeamIcon.src = "files/blue.png";
        this.greenTeamIcon.src = "files/green.png";
        this.yellowTeamIcon.src = "files/yellow.png";

        this.smartCTFBG.src = "files/smartctfbg.png";

        this.faceless.src = "files/faceless.png";


        const icons = [this.redTeamIcon, this.blueTeamIcon, this.greenTeamIcon, this.yellowTeamIcon, this.smartCTFBG, this.faceless];



        this.redGem = new Image();
        this.greenGem = new Image();
        this.yellowGem = new Image();
        this.blueGem = new Image();


        this.redGem.src = "files/redgem.png";
        this.greenGem.src = "files/greengem.png";
        this.yellowGem.src = "files/yellowgem.png";
        this.blueGem.src = "files/bluegem.png";
        

        let d = 0;

        let currentFace = 0;

        const faces = [];

        for(let i = 0; i < this.data.players.length; i++){

            d = this.data.players[i];

            if(d.face != ""){

                if(faces.indexOf(d.face) == -1){

                    faces.push(d.face);
                    currentFace = new Image();

                    currentFace.src = "files/faces/"+d.face+".png";

                   // console.log("Loading files/faces/"+d.face+".png");
                    icons.push(currentFace);
                }
            }
        }



        

        for(let i = 0; i < icons.length; i++){

            promises.push(new Promise((resolve, reject) =>{

                icons[i].onerror = () =>{
                    icons[i].src = "files/faceless.png";
                    resolve();
                }
                icons[i].onload = () =>{
                    resolve();
                }
            }));

        }


        this.icons = icons;

        return Promise.all(promises);
       
    }


    createColors(){

        this.red = "rgb(255,0,0)";
        this.blue = "rgb(0,177,228)";
        this.green = "rgb(0,198,0)";
        this.yellow = "rgb(255,255,0)";
    }

    parseMapName(map){

        const reg = /^(.+?)\.unr$/i;



        if(reg.test(map)){

            let result = reg.exec(map);

            this.mapUrl = result[1];
        }else{
            this.mapUrl = map;
        }


        this.mapUrl = this.mapUrl.toLowerCase();
        console.log("map = "+this.mapUrl);

    }

    x(input){

        return (this.canvas.width / 100) * input;

    }

    y(input){

        return (this.canvas.height / 100) * input;
    }


    createCanvas(){

        this.canvas = document.createElement("canvas");

        this.canvas.className = "match-screenshot-canvas";

        const bounds = this.parent.getBoundingClientRect();

        this.canvas.width = window.innerWidth * 1.25;
        this.canvas.height = this.canvas.width * 0.5625;

        this.c = this.canvas.getContext("2d");

        this.parent.appendChild(this.canvas);

        const note = document.createElement("div");
        note.className = "small-text-center";
        note.innerHTML = "(Click Image For Fullscreen!)";

        this.parent.appendChild(note);

        const title = document.createElement("div");
        title.className = "default-header";
        title.innerHTML = "Change Screenshot Resolution";

        this.parent.appendChild(title);


        const sizes = ["1024x576", "1280x720","1366x768", "1600x900", "1920x1080", "2560x1440","3840x2160", "7680x4320", "15360x8640"];
        const sel = document.createElement("select");
        sel.id = "res-options";
        this.parent.appendChild(sel);

        let op = null;

        for(let i = 0; i < sizes.length; i++){

            op = document.createElement("option");
            op.text = sizes[i];
            op.value = sizes[i];
            sel.add(op);
        }

        //sel.value 

        

        
    }


    renderTitle(){


        const c = this.c;

        const font = this.y(3)+"px Arial";

        c.fillStyle = "yellow";

        c.textAlign = "center";
        c.font = font;

        if(this.data.total_teams > 1){
            let teamName = "";

            const t = this.data.winning_team;

            if(t == 0){
                teamName = "Red";
            }else if(t == 1){
                teamName = "Blue";
            }else if(t == 2){
                teamName = "Green";
            }else if(t == 3){
                teamName = "Yellow";
            }

            c.fillText(teamName+" team wins the match! ", this.x(50), this.y(5));

        }else{
            c.fillText(this.data.dm_winner+" wins the match!", this.x(50), this.y(5));
        } 


        c.textAlign = "left";
    }

    getMMSS(value){ 

        value = parseInt(value);

        let seconds = value % 60;

        let minutes = Math.floor(value / 60);


        if(seconds < 10){
            seconds = "0"+seconds;
        }

        if(minutes < 10){
            minutes = "0"+minutes;
        }


        return minutes+":"+seconds;

    }

    renderFooter(){

        const c = this.c;

        const footerFont = this.y(1.75)+"px arial";

        c.textAlign = "center";
        c.font = footerFont;

        c.fillStyle = "rgb(0,255,0)";
        c.fillText("The match has ended.", this.x(50), this.y(90));
        c.fillStyle = "white";

        const date = new Date();

        date.setTime(this.data.date* 1000);

        c.fillStyle = "yellow";
        c.fillText("Playing "+this.data.gametypeName+" on "+this.data.mapName+" in "+this.data.name, this.x(50), this.y(94.5));

        c.fillStyle = "white";
        c.fillText("Date of Match: "+date+" Elapsed time: "+this.getMMSS(this.data.match_playtime), this.x(50), this.y(97.25));


        c.textAlign = "left";

    }

    bTDM(){
        
        const reg = /tournament team game/i;

        if(reg.test(this.data.gametypeName)){
            return true;
        }

        return false;
    }

    bLMS(){

        const reg = /last man standing/i;

        if(reg.test(this.data.gametypeName)){
            return true;
        }

        return false;
    }

    bCTF(){
        
        const reg = /capture the flag|ctf/i;

        const reg2 = /botpack.ctfgame|ctf/i;

        if(reg.test(this.data.gametypeName)){
            return true;
        }

        if(reg2.test(this.data.gameclass)){
            return true;
        }

        return false;
    }

    bCoop(){

        const reg = /coop|co op/i;

        if(reg.test(this.data.gametypeName)){
            return true;
        }

        return false;
    }

    bSiege(){

        const reg = /siege/i;

        if(reg.test(this.data.gametypeName)){
            return true;
        }

        return false;
    }

    bMonsterHunt(){
        
        const reg = /monsterhunt|monster hunt|noname/i;

        if(reg.test(this.data.gametypeName)){
            return true;
        }

        return false;
    }

    bBunnytrack(){

        const reg = /bunnytrack|bunny track/i;

        if(reg.test(this.data.gametypeName)){
            return true;
        }

        return false;
    }

    bRoyal(){

        //UT Royale

        const reg = /ut royale/i;

        if(reg.test(this.data.gametypeName)){
            return true;
        }

        return false;
    }

    setTotalTeamPlayerCount(){

        this.totalRedPlayers = 0;
        this.totalBluePlayers = 0;
        this.totalGreenPlayers = 0;
        this.totalYellowPlayers = 0;


        let d = 0;

        for(let i = 0; i < this.data.players.length; i++){

            d = this.data.players[i].team;


            if(d == 0){
                this.totalRedPlayers++;
            }else if(d == 1){
                this.totalBluePlayers++;
            }else if(d == 2){
                this.totalGreenPlayers++;
            }else if(d == 3){
                this.totalYellowPlayers++;
            }
        }
    }

    renderTeamScoreBoard(){


        this.setTotalTeamPlayerCount();

        const c = this.c;

        const normalFont = this.y(2.4)+"px arial";
        const smallFont = this.y(1.7)+"px arial";

        const pingFont = this.y(1.0)+"px arial";

        c.font = normalFont;
        const rowHeight = this.y(3.6);

        let maxPlayers = 16;

        if(this.data.total_teams > 2){
            maxPlayers = 6;
        }


        let d = 0;

        let currentRedPlayer = 0;
        let currentBluePlayer = 0;
        let currentGreenPlayer = 0;
        let currentYellowPlayer = 0;

        const startY = this.y(27);


        const teamOffset = this.x(10);
        const teamOffset2 = this.x(60);

        const teamYOffset = this.y(30);

        let yOffset = 0;
        let xOffset = 0;

        const scoreOffset = this.x(30);

        let currentTeam = 0;
        let currentPlayer = 0;


        for(let i = 0; i < this.data.players.length; i++){

            d = this.data.players[i];

            if(d.team == 0){

                currentRedPlayer++;
                yOffset = currentRedPlayer * rowHeight;
                xOffset = teamOffset;
                c.fillStyle = this.red;


                if(currentRedPlayer == 1){
                    c.fillText("Red Team", xOffset, startY + yOffset - rowHeight);
                    c.textAlign = "right";
                    c.fillText(this.data.teamscore_0, xOffset + scoreOffset, startY + yOffset - rowHeight);
       
                    
                }
                
                if(currentRedPlayer > maxPlayers){

                    
                    c.font = smallFont;
                    c.fillText((this.totalRedPlayers - maxPlayers)+" player[s] not shown", xOffset, startY + ((maxPlayers + 1) * rowHeight));
                    c.font = normalFont;
                    continue;
                }
              

            }else if(d.team == 1){

                currentBluePlayer++;
                yOffset = currentBluePlayer * rowHeight;
                xOffset = teamOffset2;
                c.fillStyle = this.blue;

                if(currentBluePlayer == 1){
                    c.fillText("Blue Team", xOffset, startY + yOffset - rowHeight);
                    c.textAlign = "right";
                    c.fillText(this.data.teamscore_1, xOffset + scoreOffset, startY + yOffset - rowHeight);
                }

                if(currentBluePlayer > maxPlayers){

                    c.font = smallFont;
                    c.fillText((this.totalBluePlayers - maxPlayers)+" player[s] not shown", xOffset, startY + ((maxPlayers + 1) * rowHeight));
                    c.font = normalFont;

                    continue;
                }


            }else if(d.team == 2){

                currentGreenPlayer++;
                yOffset = (currentGreenPlayer * rowHeight) + teamYOffset;
                xOffset = teamOffset;
                c.fillStyle = this.green;

                if(currentGreenPlayer == 1){
                    c.fillText("Green Team", xOffset, startY + yOffset - rowHeight);
                    c.textAlign = "right";
                    c.fillText(this.data.teamscore_2, xOffset + scoreOffset, startY + yOffset - rowHeight);
                }

                if(currentGreenPlayer > maxPlayers){

                    c.font = smallFont;
                    c.fillText((this.totalGreenPlayers - maxPlayers)+" player[s] not shown", xOffset, startY + teamYOffset + ((maxPlayers + 1) * rowHeight));
                    c.font = normalFont;

                    continue;
                }


            }else if(d.team == 3){

                currentYellowPlayer++;
                yOffset = (currentYellowPlayer * rowHeight) + teamYOffset;
                xOffset = teamOffset2;
                c.fillStyle = this.yellow;

                if(currentYellowPlayer == 1){
                    c.fillText("Yellow Team", xOffset, startY + yOffset - rowHeight);
                    c.textAlign = "right";
                    c.fillText(this.data.teamscore_3, xOffset + scoreOffset, startY + yOffset - rowHeight);
                }

                if(currentYellowPlayer > maxPlayers){

                    c.font = smallFont;
                    c.fillText((this.totalYellowPlayers - maxPlayers)+" player[s] not shown", xOffset, startY + teamYOffset + ((maxPlayers + 1) * rowHeight));
                    c.font = normalFont;

                    continue;
                }
           

            }



            
            c.textAlign = "left";
            c.fillText(d.name, xOffset, startY + yOffset);
            c.textAlign = "right";

            
            if(this.bTDM()){
                c.fillText(d.points, xOffset + scoreOffset, startY + yOffset);
            }else{
                c.fillText(d.points, xOffset + scoreOffset, startY + yOffset);
            }

            c.textAlign = "left";
            c.font = pingFont;
            c.fillStyle = "white";
            c.drawImage(this.getFlagImage(d.flag), xOffset - this.x(4.6), startY + yOffset + this.y(0.5), this.x(1), this.y(1));
            c.fillText("Time: "+Math.ceil(d.play_time / 60), xOffset - this.x(3), startY + yOffset);
            c.fillText("Ping: "+d.ping_average, xOffset - this.x(3), startY + yOffset + this.y(1.1));
            c.font = normalFont;

            
            
        }

        //c.textAlign = "left";
    }

    renderDmScoreBoard(){

        const c = this.c;

        const font = this.y(2.2)+"px arial";

        const pingFont = this.y(1)+"px arial";
        const pingRowHeight = this.y(1.1);
        const pingOffsetX = this.x(0.5);
        const pingOffsetX2 = this.x(4);
        

        c.font = font;

        const startY = this.y(25);

        const rowHeight = this.y(2.8);

        const maxPlayers = 20;

        let d = 0;

        const nameOffset = this.x(20);
        const deathOffset = this.x(60);
        const killsOffset = this.x(75);

        const flagOffsetX = this.x(-1.5);
        const flagOffsetY = this.y(0.45);
        const flagSizeX = this.x(1.1);
        const flagSizeY = this.y(1.25);


        let x = 0;
        let y = 0;

        let eff = 0;
        let fph = 0;
        let playtime = 0;

        this.data.players.sort((a,b) =>{


                //a = a.points;
                //b = b.points;
          

            if(a.points > b.points){
                return -1;
            }else if(a.points < b.points){
                return 1;
            }

            if(a.deaths < b.deaths){
                return -1;
            }else if(b.deaths > a.deaths){
                return 1;
            }
            return 0;
        });

        let header1 = "Player";
        let header2 = "Frags";
        let header3 = "Deaths";


        
        for(let i = 0; i < this.data.players.length; i++){

            c.font = font;

            if(i > maxPlayers){
                return;
            }
            c.textAlign = "left";
            d = this.data.players[i];

            x = nameOffset;

            y = startY + (rowHeight * i);

            if(i == 0){
                c.fillStyle = "white";
                c.textAlign = "left";

                if(this.bLMS()){
                    header1 = "Player";
                    header2 = "Lives";
                    header3 = "Kills";
                }else if(this.bRoyal()){

                    header1 = "Player";
                    header2 = "Frags";
                    header3 = "Kills";
                }

                c.fillText(header1, x, y - (rowHeight * 1.5));
               // x = deathOffset;

                c.textAlign = "right";
                c.fillText(header2, deathOffset, y - (rowHeight * 1.5));
               // x = killsOffset;
                c.fillText(header3, killsOffset, y - (rowHeight * 1.5));

            }

            c.fillStyle = "rgb(0,198,255)";
            c.textAlign = "left";
            c.drawImage(this.getFlagImage(d.flag), x + flagOffsetX, y + flagOffsetY, flagSizeX, flagSizeY);
            c.fillText(d.name, x, y);
            x = deathOffset;

            c.fillStyle = "rgb(198,255,255)";
            c.textAlign = "right";

            if(!this.bLMS()){

                c.fillText(d.points, x, y);
                x = killsOffset;

                if(!this.bRoyal()){
                    c.fillText(d.deaths, x, y);
                }else{
                    c.fillText(d.kills, x, y);
                }
            }else{
                c.fillText(d.points, x, y);
                x = killsOffset;
                c.fillText(d.kills, x, y);
                
            }

            c.font = pingFont;
            c.fillStyle = "white";
            c.textAlign = "left";

            eff = 0;

            if(d.kills > 0 && d.deaths > 0){
                eff = d.kills / (d.kills + d.deaths);
            }else if(d.kills > 0 && d.deaths == 0){
                eff = 1;
            }


            eff = Math.floor(eff * 100);

           // playtime = Math.ceil(d.play_time / 60);

            //fph = Math.floor((d.kills / d.play_time) * (60 * 60));
            fph = Math.floor((d.points / d.play_time) * (60 * 60));

            c.fillText("FPH: "+fph, x + pingOffsetX, y + pingRowHeight + this.y(0.3))
            c.fillText("EFF: "+eff+"%", x + pingOffsetX2, y + pingRowHeight + this.y(0.3))
            c.fillText("Ping: "+d.ping_average, x + pingOffsetX2, y + this.y(0.3))
            c.fillText("Time: "+Math.ceil(d.play_time / 60), x + pingOffsetX, y + this.y(0.3))
            
        }
    }



    setMaxCTFValues(){

        this.maxFlagKills = 0;
        this.maxGrabs = 0;
        this.maxCaps = 0;
        this.maxAssists = 0;
        this.maxCovers = 0;
        this.maxDeaths = 0;


        let d = 0;


        for(let i = 0; i < this.data.players.length; i++){

            d = this.data.players[i];

            if(d.flag_caps > this.maxCaps){
                this.maxCaps = d.flag_caps;
            }

            if(d.flag_grabs > this.maxGrabs){
                this.maxGrabs = d.flag_grabs;
            }

            if(d.flag_assists > this.maxAssists){
                this.maxAssists = d.flag_assists;
            }

            if(d.flag_kills > this.maxFlagKills){
                this.maxFlagKills = d.flag_kills;
            }


            if(d.deaths > this.maxDeaths){

                this.maxDeaths = d.deaths;
            }

            if(d.flag_covers > this.maxCovers){
                this.maxCovers = d.flag_covers;
            }


        }
    }

    getTeamPingAverage(team){


        let d = 0;

        let totalPing = 0;
        let players = 0;
        
        for(let i = 0; i < this.data.players.length; i++){

            d = this.data.players[i];


            if(d.team == team){

                totalPing += d.ping;
                players++;
            }
        }

        if(players > 0){

            if(totalPing > 0){

                return Math.ceil(totalPing / players);
            }

            return 0;

        }else{

            return 0;
        }
    }


    renderSmartCTF(){




        this.data.players.sort((a,b) =>{

            if(a.points > b.points){
                return -1;
            }else if(a.points < b.points){
                return 1;
            }

            if(a.deaths > b.deaths){
                return 1;
            }else if(a.deaths < b.deaths){
                return -1;
            }

            return 0;
        });

        this.setMaxCTFValues();

        const c = this.c;


        const red = "rgb(255,0,0)";
        const blue = "rgb(0,168,255)";
        const green = "rgb(0,255,0)";
        const yellow = "rgb(255,255,0)";

        c.textBaseline = "top";

        const teamWidth = this.x(40);

        const playerHeight = this.y(9.25);

        const headerStartY = this.y(12);

        const headerHeight = this.y(5);

        const iconSize = this.y(4);
        const iconOffsetY = this.y(0.5);
        const iconOffsetX = this.x(1);

        const teamScoreOffset = this.x(4);
        const teamScoreOffsetY = this.y(0.7);
       

        const nameOffset = this.x(4);
        const scoreOffset = this.x(39.2);
        const nameOffsetY = this.y(0.9);
        const nameFont = this.y(1.9)+"px arial";

        const pingFont = this.y(0.8)+"px Arial";


        const teamX = this.x(5);
        const team2X = this.x(55);


        const teamY = this.y(12);
        const team2Y = this.y(52);

        c.fillStyle = "rgba(0,0,0,0.75)";

        const headerFont = this.y(4)+"px arial";
        const headerFont2 = this.y(2.25)+"px arial";

        c.font = headerFont;

        const fragsPointsHeaderX = this.x(33); 
        const fragsPointsHeaderY = this.y(1.5); 
        
        const pingAverageOffsetX = this.x(8);
        const pingAverageOffsetY = this.y(1.25);

        const pingRowHeight = this.y(1.5);


        const pingOffset = {"x": this.x(1), "y": this.y(1)};
        const tmOffset = {"x": this.x(2), "y": 0};

        if(this.data.total_teams == 2){


            c.font = headerFont;

            c.drawImage(this.smartCTFBG, teamX, headerStartY, teamWidth, headerHeight);
            c.drawImage(this.smartCTFBG, teamX, headerStartY, teamWidth, headerHeight);
            c.drawImage(this.smartCTFBG, teamX, headerStartY, teamWidth, headerHeight);
            c.drawImage(this.smartCTFBG, teamX, headerStartY, teamWidth, headerHeight);
            c.fillStyle = "rgba(255,0,0,0.3)";
            c.fillRect(teamX, headerStartY, teamWidth, headerHeight);

            c.drawImage(this.redTeamIcon, teamX + iconOffsetX, headerStartY + iconOffsetY, iconSize, iconSize);
            c.fillStyle = red;
            c.fillText(this.data.teamscore_0, teamX + teamScoreOffset, headerStartY + teamScoreOffsetY);

            c.font = headerFont2;

            c.fillText("Frags / Pts", teamX + fragsPointsHeaderX, headerStartY + fragsPointsHeaderY);

            c.font = pingFont;
            c.fillStyle = "rgb(160,160,160)";

            c.fillText("PING: "+this.getTeamPingAverage(0)+"  PL:0%", teamX + pingAverageOffsetX, headerStartY + pingAverageOffsetY);
            c.fillText("TM:"+(Math.ceil(this.data.match_playtime / 60)), teamX + pingAverageOffsetX, headerStartY + pingAverageOffsetY + pingRowHeight);


            c.font = headerFont;
            c.drawImage(this.smartCTFBG, team2X, headerStartY, teamWidth, headerHeight);
            c.fillStyle = "rgba(0,32,255,0.3)";
            c.fillRect( team2X, headerStartY, teamWidth, headerHeight);

            c.drawImage(this.blueTeamIcon, team2X + iconOffsetX, headerStartY + iconOffsetY, iconSize, iconSize);
            c.fillStyle = blue;
            c.fillText(this.data.teamscore_1, team2X + teamScoreOffset, headerStartY + teamScoreOffsetY);


            c.font = headerFont2;

            c.fillText("Frags / Pts", team2X + fragsPointsHeaderX, headerStartY + fragsPointsHeaderY);

            c.font = pingFont;
            c.fillStyle = "rgb(160,160,160)";

            c.fillText("PING: "+this.getTeamPingAverage(1)+"  PL:0%", team2X + pingAverageOffsetX, headerStartY + pingAverageOffsetY);
            c.fillText("TM:"+(Math.ceil(this.data.match_playtime / 60)), team2X + pingAverageOffsetX, headerStartY + pingAverageOffsetY + pingRowHeight);
        }


        let totalRedPlayers = 0;
        let totalBluePlayers = 0;
        let totalGreenPlayers = 0;
        let totalYellowPlayers = 0;

        let currentTeam = 0;

        let x = 0;
        let y = 0;


        const playerBGColor = "rgba(0,0,0,0.75)";

        let currentTeamIndex = 0;


        let d = 0;

        

        let teamColor = 0;

        const flagSizeX = this.x(1.3);
        const flagSizeY = this.y(1.3);
        const flagOffsetX = this.x(1.4);
        const flagOffsetY = this.y(5);

        const pingOffsetX = this.x(1);
        const pingOffsetY = this.y(7);
        const pingOffsetY2 = this.y(8.1);
            
        let nameSize = 0;

        for(let i = 0; i < this.data.players.length; i++){

            d = this.data.players[i];

            currentTeam = d.team;

            if(d.team == 0){
                totalRedPlayers++;
                currentTeamIndex = totalRedPlayers - 1;
            }else if(d.team == 1){
                totalBluePlayers++;
                currentTeamIndex = totalBluePlayers - 1;
            }else if(d.team == 2){
                totalGreenPlayers++;
                currentTeamIndex = totalGreenPlayers - 1;
            }else if(d.team == 3){
                totalYellowPlayers++;
                currentTeamIndex = totalYellowPlayers - 1;
            }


            if(currentTeamIndex > 6){
                continue;
            }
            //red or green
            if(currentTeam == 0 || currentTeam == 1){

                x = teamX;
                y = teamY + headerHeight;

                teamColor = red;

                if(currentTeam == 1){
                    x = team2X;
                    teamColor = blue;
                }

            }else if(currentTeam == 2 || currentTeam == 3){

                x = teamX;
                y = team2Y + headerHeight;

                teamColor = green;

                if(currentTeam == 3){
                    x = team2X;
                    teamColor = yellow;
                }
            }

            y = y + (playerHeight * currentTeamIndex);


            c.fillStyle = playerBGColor;
            
            c.fillRect(x, y, teamWidth, playerHeight);

            //face image

            c.strokeStyle = "rgb(100,100,100)";
            c.lineWidth = this.y(0.15);
            c.drawImage(this.getFace(d.face), x + iconOffsetX, y + iconOffsetY, iconSize, iconSize);
            c.strokeRect(x + iconOffsetX, y + iconOffsetY, iconSize, iconSize);

            //console.log(d.flagIcon);
            //console.log(this.faceless);
            
            c.drawImage(this.getFlagImage(d.flag), x + flagOffsetX, y + flagOffsetY, flagSizeX, flagSizeY);


            c.fillStyle = "white";
            c.font = pingFont;
            c.fillText("PING: "+d.ping_average, x + pingOffsetX, y + pingOffsetY);
            c.fillText("PL: 0%", x + pingOffsetX, y + pingOffsetY2);





            c.fillStyle = teamColor;
            c.font = nameFont;
            c.fillText(d.name, x + nameOffset, y + nameOffsetY);

            c.textAlign = "right";
            c.fillText(d.kills+"/"+d.points, x + scoreOffset, y + nameOffsetY);

            c.textAlign = "left";

            nameSize = c.measureText(d.name+" ").width;
            c.font = pingFont;

            c.fillStyle = "rgb(160,160,160)";
            c.fillText("TM: "+Math.ceil((d.play_time / 60))+" EFF: "+Math.floor(d.eff)+"%", x + nameOffset + nameSize, y + nameOffsetY + this.y(0.8));

            y = y + this.y(4);

            this.drawSmartCTFBar(0,0,x + pingOffsetX, y, "Caps", d.flag_caps, this.maxCaps);
            this.drawSmartCTFBar(1,0,x + pingOffsetX, y, "Grabs", d.flag_grabs, this.maxGrabs);
            this.drawSmartCTFBar(2,0,x + pingOffsetX, y, "Assists", d.flag_assists, this.maxAssists);

            this.drawSmartCTFBar(0,1,x + pingOffsetX, y, "Covers", d.flag_covers, this.maxCovers);
            this.drawSmartCTFBar(1,1,x + pingOffsetX, y, "Deaths", d.deaths, this.maxDeaths);
            this.drawSmartCTFBar(2,1,x + pingOffsetX, y, "FlagKills", d.flag_kills, this.maxFlagKills);
        }



        //footer stuff

        c.textAlign = "center";

        c.font = this.y(2.2);
        c.fillStyle = "white";

        c.fillText("Spectators: there is currently no one spectating the match", this.x(50), this.y(90));

        c.fillStyle = "yellow";

        c.fillText("[ SmartCTF 4E | {PiN}Kev | {DnF2}SiNiSTeR | [es]Rush | adminthis & The_Cowboy & Sp0ngeb0b ]", this.x(50), this.y(94));

        c.fillStyle = "white";

        const date = new Date();

        date.setTime(this.data.date * 1000);

        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        let dayOfWeek = date.getDay();
        let hours = date.getHours();
        let minutes = date.getMinutes();


        if(hours < 10){
            hours = "0"+hours;
        }

        if(minutes < 10){
            minutes = "0"+minutes;
        }


        c.fillText("Date of match: "+this.getDayName(dayOfWeek)+" "+day+" "+this.getMonthName(month)+" "+year+", "+hours+":"+minutes+" | Elapsed Time: "+this.getMMSS(this.data.match_playtime), this.x(50), this.y(96));

        c.fillText("Playing "+this.data.mapName+" on "+this.data.name, this.x(50), this.y(98));


        c.textAlign = "left";

    }

    getDayName(value){

        switch(value){

            case 0: {   return "Sunday"; }
            case 1: {   return "Monday"; }
            case 2: {   return "Tuesday"; }
            case 3: {   return "Wednesday"; }
            case 4: {   return "Thursday"; }
            case 5: {   return "Friday"; }
            case 6: {   return "Saturday"; }
        }
    }

    getMonthName(value){

        switch(value){

            case 0: {   return "January";  } 
            case 1: {   return "February";  } 
            case 2: {   return "March";  } 
            case 3: {   return "April";  }
            case 4: {   return "May";  } 
            case 5: {   return "June";  }
            case 6: {   return "July";  } 
            case 7: {   return "August";  } 
            case 8: {   return "September";  } 
            case 9: {   return "October";  } 
            case 10: {   return "November";  } 
            case 11: {   return "December";  } 
            default: {  return "Dogs have wet noses";}
        }
    }


    getFace(face){




        let d = 0;


        const reg = /files\/faces\/(.+)\.png$/i;

        let result = 0;

        for(let i = 0; i < this.icons.length; i++){

            d = this.icons[i];

            if(reg.test(d.src)){

                result = reg.exec(d.src);

                //console.log(result[1]);

                //console.log("Looking for "+face+"  found "+d.src);

                if(result[1] == face){
                    return d;
                }
            }

            
        }

        return this.faceless;
    }


    drawSmartCTFBar(row, column, startX, startY, name, value, maxValue){

        const c = this.c;

        c.fillStyle = "white";

        c.font = this.y(1.2)+"px Arial";

        const textOffsetX = this.x(3);
        const barOffsetX = this.x(7);

        const maxWidth = this.x(13);

        if(maxValue == 0){
            maxValue = 1;
        }
        const bit = maxWidth / maxValue;

        const valueOffsetX = this.x(3.5);
    
        const col2Offset = this.x(18);
        const rowHeight = this.y(1.7);

        if(row > 0){
            startY = startY + (rowHeight * row);
        }

        if(column > 0){
            startX = startX + col2Offset;
        }

        c.fillText(name+":", startX + textOffsetX, startY);
        c.textAlign = "right";
        c.fillText(value, startX + textOffsetX + valueOffsetX, startY);


        let color = Math.floor(bit * 2.55);
        c.textAlign = "left";
        c.fillStyle = "rgb("+color+",255,"+color+")";

        c.fillRect(startX + barOffsetX, startY + this.y(0.4), bit * value, this.y(0.5));




    }


    getFlagImage(code){

        code = code.toLowerCase();

        for(let i = 0; i < this.flags.length; i++){

            if(this.flags[i].country == code){

                return this.flags[i].img;
            }
        }
    }

    setMaxMonsterValues(){

        this.maxKills = 0;
        this.maxSuicides = 0;
        this.maxDeaths = 0;
        this.maxTeamKills = 0;

        let d = 0;

        for(let i = 0; i < this.data.players.length; i++){

            d = this.data.players[i];

            if(d.monster_kills > this.maxKills){

                this.maxKills = d.monster_kills;

            }

            if(d.suicides > this.maxSuicides){

                this.maxSuicides = d.suicides;

            }

            if(d.deaths > this.maxDeaths){

                this.maxDeaths = d.deaths;

            }

            if(d.team_kills > this.maxTeamKills){

                this.maxTeamKills = d.team_kills;

            }


        }

    }

    renderMonsterHuntScoreboard(){

        this.setMaxMonsterValues();

        const c = this.c;

        const titleFont = this.y(3)+"px arial";
        const pingFont = this.y(0.9)+"px arial";
        const nameFont = this.y(2)+"px arial";


        const boxOffset = this.x(25);
        const boxWidth = this.x(50);
        const boxHeight = this.y(7.5);

        const faceWidth = this.y(4);
        const faceHeight = this.y(4);
        const faceOffset = this.y(0.5);

        const nameOffsetX = this.x(4);
        const nameOffsetY = this.y(1);
        const scoreOffsetX = this.x(49.5);

        const pingOffset = this.x(0.4);
        const pingOffsetY = this.y(6.2);
        const flagOffsetY = this.y(5);
        const flagSizeX = this.x(1);
        const flagSizeY = this.y(1);

        

        c.font = titleFont;

        c.fillStyle = "yellow";

        c.textAlign = "center";

        c.fillText(this.data.gametypeName, this.x(50), this.y(5));

        c.textAlign = "left";


        let d = 0;

        const startY = this.y(17.5);
        c.lineWidth = this.y(0.05);
        c.strokeStyle = "rgba(255,255,255,0.25)";

        let y = 0;

        let timeOffset = 0;

        const labelOffset = this.x(5);
        const labelOffset2 = this.x(23);
        const labelOffsetY = this.y(3.8);

        const barOffsetX = this.x(0.5);
        const barOffsetY = this.y(0.1);
        const maxBarWidth = this.x(17);

        const valueOffset = this.x(4.5);
        const valueOffset2 = this.x(24.5);

        const barHeight = this.y(0.75);

        const headerHeight = this.y(3);


        const headerColor = "rgba(0,0,0,0.5)";
        c.fillStyle = headerColor;

        c.fillRect(boxOffset, startY - headerHeight, boxWidth, headerHeight);
        c.strokeRect(boxOffset, startY - headerHeight, boxWidth, headerHeight);

        c.fillStyle = "white";

        c.font = this.y(2)+"px arial";
        c.fillText("Player", boxOffset + nameOffsetX, startY - headerHeight + this.y(0.5));
        c.textAlign = "right";
        c.fillText("Kills / Points", boxOffset + scoreOffsetX, startY - headerHeight + this.y(0.5));
        c.textAlign = "left";


        let barWidth = 0;
        let barBit = 0;

        let green = "rgb(100,255,100)";

        const maxPlayers = 9;

        for(let i = 0; i < this.data.players.length; i++){

            if(i >= maxPlayers){
                break;
            }
            y = startY + (boxHeight * i);

            d = this.data.players[i];

            c.fillStyle = "rgba(0,0,0,0.5)";

            c.fillRect(boxOffset, y, boxWidth, boxHeight);
            c.strokeRect(boxOffset, y, boxWidth, boxHeight);

            c.drawImage(this.getFace(d.face), boxOffset + faceOffset, y + faceOffset, faceWidth, faceHeight);

            c.font = nameFont;
            
            c.fillStyle = "yellow";
            c.fillText(d.name, boxOffset + nameOffsetX, y + nameOffsetY);

            timeOffset = c.measureText(d.name+" ").width;
            c.textAlign = "right";
            c.fillText(d.monster_kills+" / "+d.points, boxOffset + scoreOffsetX, y + nameOffsetY);

            c.fillStyle = "white";
            c.font = pingFont;
            c.textAlign = "left";


            c.fillText("TM: "+Math.ceil(d.play_time / 60), boxOffset + nameOffsetX + timeOffset, y + nameOffsetY + this.y(0.8));


            
            c.font = pingFont;
            c.fillStyle = "white";
            c.fillText("Ping: "+d.ping_average, boxOffset + pingOffset, y + pingOffsetY);


            c.drawImage(this.getFlagImage(d.flag), boxOffset + pingOffset + this.x(0.4), y + flagOffsetY, flagSizeX, flagSizeY);


            c.font = this.y(1.3)+"px arial";

            

            

            c.fillText("Kills: ", boxOffset + nameOffsetX, y + labelOffsetY);
            c.textAlign = "right";
            c.fillText(d.monster_kills, boxOffset + nameOffsetX + valueOffset, y + labelOffsetY);

            if(this.maxKills > 0){
                barBit = maxBarWidth / this.maxKills;
            }else{
                barBit = 0;
            }

            c.fillStyle = green;
            c.fillRect(boxOffset + nameOffsetX + valueOffset + barOffsetX, y + labelOffsetY + barOffsetY, barBit * d.monster_kills, barHeight);
            c.fillStyle = "white";

            c.textAlign = "left";
            c.fillText("TeamKills:", boxOffset + nameOffsetX, y + labelOffsetY + this.y(1.7));
            c.textAlign = "right";
            c.fillText(d.team_kills, boxOffset + nameOffsetX + valueOffset, y + labelOffsetY + this.y(1.7));

            if(this.maxTeamKills > 0){
                barBit = maxBarWidth / this.maxTeamKills;
            }else{
                barBit = 0;
            }

            c.fillStyle = green;
            c.fillRect(boxOffset + nameOffsetX + valueOffset + barOffsetX, y + labelOffsetY + barOffsetY + this.y(1.7), barBit * d.team_kills, barHeight);
            c.fillStyle = "white";

            c.textAlign = "left";

            c.fillText("Suicides:", boxOffset + nameOffsetX + labelOffset2, y + labelOffsetY + this.y(1.7));
            c.textAlign = "right";
            c.fillText(d.suicides, boxOffset + nameOffsetX+ labelOffset2 + valueOffset, y + labelOffsetY + this.y(1.7));

            if(this.maxSuicides > 0){
                barBit = maxBarWidth / this.maxSuicides;
            }else{
                barBit = 0;
            }

            c.fillStyle = green;
            c.fillRect(boxOffset + nameOffsetX + labelOffset2 + valueOffset + barOffsetX, y + labelOffsetY + barOffsetY, barBit * d.suicides, barHeight);
            c.fillStyle = "white";
            c.textAlign = "left";

            c.fillText("Deaths:", boxOffset + nameOffsetX + labelOffset2, y + labelOffsetY );
            c.textAlign = "right";
            c.fillText(d.deaths, boxOffset + nameOffsetX+ labelOffset2 + valueOffset, y + labelOffsetY );

            if(this.maxDeaths > 0){
                barBit = maxBarWidth / this.maxDeaths;
            }else{
                barBit = 0;
            }

            c.fillStyle = green;
            c.fillRect(boxOffset + nameOffsetX + labelOffset2 + valueOffset + barOffsetX, y + labelOffsetY + barOffsetY + this.y(1.7), barBit * d.deaths, barHeight);
            c.fillStyle = "white";
            c.textAlign = "left";

        }

    }



    getPlayer(id){

        let d = 0;

        for(let i = 0; i < this.data.players.length; i++){

            d = this.data.players[i];

            if(d.player_id == id){
                return d;
            }

        }

        return null;
    }

    getMMSSMM(value){

        value = parseFloat(value);

        //value = value.toFixed(2);
        let seconds = (value % 60).toFixed(2);
        let minutes = Math.floor(value / 60);

        if(minutes < 10){
            minutes = "0"+minutes;
        }

        if(seconds < 10){
            seconds = "0"+seconds;
        }

        return minutes+":"+seconds;

    }


    getPlayerBestCapTime(id){

        if(this.data.caps == undefined){
            return "No time set"
        }
        for(let i = 0; i < this.data.caps.length; i++){

            if(this.data.caps[i].player_id == id){
                return this.data.caps[i].time;
            }
        }

        return "No time set";
    }

    setPlayerBestTimes(){


        for(let i = 0; i < this.data.players.length; i++){

            this.data.players[i].bestTime = this.getPlayerBestCapTime(this.data.players[i].player_id);

        }
    }

    renderBunnytrackScoreboard(){


        this.setPlayerBestTimes();

        const c = this.c;


        const boxWidth = this.x(60);
        const boxHeight = this.y(5);

        const maxPlayers = 10;

        console.log(this.data.caps);

        let d = 0;

        this.data.players.sort((a,b) =>{

            a = a.bestTime;
            b = b.bestTime;

            if(a < b){
                return -1;
            }else if(a > b){
                return 1;
            }

            return 0;

        });


        const startY = this.y(20);
        const startX = this.x(20);

        let x = 0;
        let y = 0;


        c.fillStyle = "rgba(0,0,0,0.5)";

        //mainheader

        c.strokeStyle = "rgba(255,0,0,0.7)";

        c.lineWidth = this.y(0.5);

        c.fillStyle = "rgba(0,0,0,0.8)";

        c.fillRect(startX, this.y(15), boxWidth, this.y(5));

        c.fillStyle = "rgba(255,0,0,0.7)";
        
        c.fillRect(startX, this.y(14.5), boxWidth, this.y(0.5));
        


        c.fillStyle = "white";

        c.font = this.y(3)+"px Arial";

        c.fillText("Match Result", startX + this.x(2), this.y(16));
        c.textAlign = "right";
        c.fillText(this.data.mapName, startX +boxWidth - this.x(1), this.y(16));

       // c.drawImage();

        c.textAlign = "left";

        //times

        c.font = this.y(2)+"px arial";

        const nameOffsetY = this.y(1.25);
        const flagOffsetY = this.y(1.8);
        const faceOffsetX = this.x(35);

        console.log(this.data.caps);

        const countires = new Countries();

        
        const teamOffsetX = this.x(20);
        const scoreOffsetX = this.x(49);
        const diffOffsetX = this.x(59);
        
        let p = 0;

        let textOffset = 0;

        const faceWidth = this.x(2);
        const faceHeight = this.y(3.8);

        c.strokeStyle = "rgba(255,255,255,0.1)";
        c.lineWidth = this.y(0.1);

        let best = 0;//this.data.caps[0].time;
        let diff = 0;


        const playersDisplayed = [];


        let currentPlayer = 0;

        let currentTime = 0;


        for(let i = 0; i < this.data.players.length; i++){

            d = this.data.players[i];

            

            if(playersDisplayed.indexOf(d.player_id) === -1){

                currentPlayer++;

                playersDisplayed.push(d.player_id);

                if(currentPlayer == 1){

                    best = this.getPlayerBestCapTime(d.player_id);

                    console.log("best = "+best);
                }
            }else{

                continue;
               // continue;
            }

            if(currentPlayer >= maxPlayers){
                return;
            }

            c.fillStyle = "rgba(0,0,0,0.5)";

            

            x = startX;
            y = startY + ((currentPlayer - 1 )* boxHeight);

            c.fillRect(x, y, boxWidth, boxHeight);

            c.fillStyle = "white";
            
            c.fillRect(x + this.x(0.5), y + this.y(0.5),this.x(2), boxHeight * 0.8);
            
            c.textAlign = "center";

            c.font = "bold " +this.y(3)+"px arial";

            c.fillStyle = "rgba(0,0,0,0.8)";

            c.fillText(currentPlayer,x + this.x(1.5) , y + this.y(1.25));

            c.fillStyle = "white";


            c.font = this.y(2)+"px arial";

            p = this.getPlayer(d.player_id);

            c.textAlign = "left";

            c.fillText(p.name, x + this.x(4), y + nameOffsetY);

            textOffset = c.measureText(p.name).width;

            c.drawImage(this.getFlagImage(p.flag), x + this.x(5) + textOffset, y + flagOffsetY);

            c.fillText(countires.getName(p.flag), x + teamOffsetX, y + nameOffsetY);

            c.drawImage(this.getFace(p.face), x + faceOffsetX, y + this.y(0.6), faceWidth, faceHeight);
            c.strokeRect(x + faceOffsetX, y + this.y(0.6), faceWidth, faceHeight);

            c.textAlign = "right";


            currentTime = this.getPlayerBestCapTime(p.player_id);

            currentTime = (typeof currentTime == "number") ?  this.getMMSSMM(currentTime) : "No time set ";

            c.fillText(currentTime, x + scoreOffsetX, y + nameOffsetY);

            diff = this.getPlayerBestCapTime(d.player_id) - best;

            if(currentPlayer != 1){
                //diff = parseFloat(diff);
                //diff = diff.toFixed(2);
                c.fillStyle = "red";

 

                if(diff == diff){

                    
                    c.fillText("+"+this.getMMSSMM(diff), x + diffOffsetX, y + nameOffsetY);
                }else{
                    c.fillText("+ --:--.--", x + diffOffsetX, y + nameOffsetY);
                }
            }
            

            c.textAlign = "left";




        }
    }


    renderCoopScoreboard(){

        const c = this.c;

        const green = "rgb(12,255,12)";
        const shadowGreen = "rgb(8,73,17)";

        const defaultFont = "300 "+this.y(1.6)+"px Roboto";
        const titleFont = ""+this.y(1.7)+"px Roboto";


        c.textAlign = "center";

        c.font = titleFont;

        c.fillStyle = "white";

        console.log(this.data);
        c.fillText(this.data.name,this.x(50),this.y(2));
        c.fillText("Game Type: "+this.data.gametypeName,this.x(50),this.y(4.5));
        c.fillText("Map Title: "+this.data.mapName,this.x(50),this.y(7));
        c.fillText("Author: "+this.data.mapAuthor,this.x(50),this.y(9.5));

        c.textAlign = "left";


        const drawText = (x, y, text, bTitle) =>{

            const shadowOffset = {"x":this.x(0.1),"y":this.y(0.1)};

            if(!bTitle){
                c.font = defaultFont;
            }else{
                c.font = titleFont;
            }
            c.fillStyle = shadowGreen;
            c.fillText(text, this.x(x) + shadowOffset.x, this.y(y) + shadowOffset.y);
            c.fillStyle = green;
            c.fillText(text, this.x(x), this.y(y));
            
        }
        

        const column1 = 25;
        const column2 = 50;
        const column3 = 75;
        

        //c.textAlign = "center";

        drawText(column1, 20, "Name", true);
        drawText(column2, 20, "Deaths", true);
        drawText(column3, 20, "Kills", true);

        let p = 0;

        const playerRowHeight = 2.7;
        const playerStartHeight = 25;

        let currentY = 0;

        for(let i = 0; i < this.data.players.length; i++){

            p = this.data.players[i];

            currentY = playerStartHeight + (playerRowHeight * i)

            c.fillStyle = "white";
            c.font = "100 "+this.y(1)+"px Roboto";

            c.textAlign = "right";
            c.fillText("PING: "+p.ping_average, this.x(column1 - 1.5), this.y(currentY));

            c.drawImage(this.getFlagImage(p.flag), this.x(column1 - 1.2), this.y(currentY), this.x(1), this.y(1));

            c.textAlign = "left";

            drawText(column1, currentY, p.name, false);
            c.textAlign = "right";
            drawText(column2 + 2.7, currentY, p.deaths, false);
            drawText(column3 + 2, currentY, p.kills, false);
            c.textAlign = "left";

        }


        const date = new Date();
        date.setTime(this.data.date * 1000);

        c.fillStyle = "white";
        c.textAlign = "center";
        c.fillText("Time Spent on Map: "+this.getMMSS(this.data.match_playtime), this.x(50), this.y(95));
        c.fillText("Date Of Match: "+date, this.x(50), this.y(97));

        c.textAlign = "left";
    }


    renderSiegeScoreboard(){

        const c = this.c;

        let maxPlayers = 16;

        if(this.data.total_teams > 2){
            maxPlayers = 6;
        }

        const red = "rgb(255,0,0)";
        const blue = "rgb(0,168,255)";
        const green = "rgb(0,255,0)";
        const yellow = "rgb(255,255,0)";

        const teamScoreFont = this.y(3.5)+"px Arial";
        const teamNameFont = this.y(2.4)+"px Arial";
        const teamNameOffset = {"x":this.x(4.6),"y":this.y(1.4)};

        const teamWidth = this.x(30);
        const playerHeight = this.y(5);
        const headerHeight = this.y(5);

        const bgColor = "rgba(0,0,0,0.75)";

        const teamY = this.y(10);
        const teamY2 = this.y(50);
        const teamX = this.x(15);
        const teamX2 = this.x(55);

        c.fillStyle = bgColor;

        const gemSize = {"x": this.x(2.5) ,"y": this.y(4)};
        const iconSize = {"x": this.x(2.5) ,"y": this.y(4)};
        const gemOffset = {"x": teamWidth * 0.775, "y": this.y(0.5)};
        const teamScoreOffset = {"x": teamWidth * 0.98, "y": this.y(0.85)};


        this.data.players.sort((a,b) =>{

            if(a.points > b.points){
                return -1;
            }else if(a.points < b.points){
                return 1;
            }

            return 0;
        });


        const renderPlayers = (team, startX, startY) =>{

            let p = 0;

            const nameFont = this.y(2.3)+"px arial";
            const pingFont = this.y(1.1)+"px arial";
            const scoreFont = "300 "+this.y(2.4)+"px Roboto";

            const col1 = this.x(10);
            const col2 = this.x(14);

            let teamColor = red;

            if(team == 1){
                teamColor = blue;
            }else if(team == 2){
                teamColor = green;
            }else if(team == 3){
                teamColor = yellow;
            }


            let x = 0;
            let y = 0;

            let currentIndex = 0;

            for(let i = 0; i < this.data.players.length; i++){

                if(currentIndex >= maxPlayers){
                    return;
                }

                p = this.data.players[i];
                c.strokeStyle = "rgba(255,255,255,0.8)";
                c.lineWidth = this.y(0.05);

                c.textAlign = "left";

                if(p.team == team){

                    c.fillStyle = bgColor;
                    
                    x = startX + this.x(4);
                    y = startY + (playerHeight * currentIndex);
                    c.fillRect(startX, y,teamWidth,playerHeight);
                    c.drawImage(this.getFace(p.face), startX + this.x(0.91), y, iconSize.x, iconSize.y);
                    c.strokeRect(startX + this.x(0.91), y, iconSize.x, iconSize.y);

                    c.fillStyle = teamColor;
                    c.font = nameFont;

                    c.fillText(p.name, x, y);

                    c.font = pingFont;

                    c.fillText("PI : "+p.ping_average+" MS : PL : 0%", x, y + this.y(3.5));


                    c.fillStyle = yellow;
                    c.fillText("NUKES:", x + col1, y + this.y(0.3));
                    c.fillText("0", x + col1 + this.x(2.8), y + this.y(0.3));
                    c.fillStyle = blue;
                    c.fillText("NKKLS:", x + col1, y + this.y(1.6));
                    c.fillText("0", x + col1 + this.x(2.8), y + this.y(1.7));
                    c.fillStyle = green;
                    c.fillText("BUILD:", x + col1, y + this.y(2.9));
                    c.fillText("0", x + col1 + this.x(2.8), y + this.y(3.1));

                    c.fillStyle = "white";
                    c.fillText("TIME:", x + col2, y + this.y(0.3));
                    c.fillText(Math.ceil(p.play_time / 60), x + col2 + this.x(2.2), y + this.y(0.3));

                    c.fillStyle = red;
                    c.fillText("DTHS:", x + col2, y + this.y(1.6));
                    c.fillText(p.deaths, x + col2 + this.x(2.2), y + this.y(1.6));

                    c.fillStyle = "orange";
                    c.fillText("EFF:", x + col2, y + this.y(3.1));
                    c.fillText(Math.floor(p.eff)+"%", x + col2 + this.x(2.2), y + this.y(3.1));


                    c.fillStyle = teamColor;

                    c.font = scoreFont;
                    c.textAlign = "right";

                    c.fillText(p.kills+"/"+p.points, x + teamWidth - this.x(4.5), y + this.y(0.5));

                    c.font = pingFont;

                    c.fillText("RU: "+(Math.ceil(Math.random() * 5000)), x + teamWidth - this.x(4.5), y + this.y(3.5));

                    currentIndex++;
                }
            }
        }
        
        

        c.fillRect(teamX, teamY, teamWidth, headerHeight);
        c.drawImage(this.redTeamIcon, teamX + this.x(1), teamY + gemOffset.y, gemSize.x, gemSize.y);
        c.drawImage(this.redGem, teamX + gemOffset.x, teamY + gemOffset.y, gemSize.x, gemSize.y);
        c.fillStyle = red;

        c.font = teamNameFont;
        c.textAlign = "left";
        c.fillText("Red", teamX + teamNameOffset.x, teamY + teamNameOffset.y)
        c.textAlign = "right";
        c.font = teamScoreFont;
        c.fillText(this.data.teamscore_0, teamX + teamScoreOffset.x, teamY + teamScoreOffset.y)

        renderPlayers(0, teamX, teamY + headerHeight);

        c.fillStyle = bgColor;
        c.fillRect(teamX2, teamY, teamWidth, headerHeight);
        c.drawImage(this.blueGem, teamX2 + gemOffset.x, teamY + gemOffset.y, gemSize.x, gemSize.y);
        c.drawImage(this.blueTeamIcon, teamX2 + this.x(1), teamY + gemOffset.y, gemSize.x, gemSize.y);
        
        c.fillStyle = blue;
        c.font = teamNameFont;
        c.textAlign = "left";
        c.fillText("Blue", teamX2 + teamNameOffset.x, teamY + teamNameOffset.y);
        c.textAlign = "right";
        c.font = teamScoreFont;
        c.fillText(this.data.teamscore_1, teamX2 + teamScoreOffset.x, teamY + teamScoreOffset.y);

        renderPlayers(1, teamX2, teamY + headerHeight);

        if(this.data.total_teams > 2){

            c.fillStyle = bgColor;
            c.fillRect(teamX, teamY2, teamWidth, headerHeight);
            c.drawImage(this.greenGem, teamX + gemOffset.x, teamY2 + gemOffset.y, gemSize.x, gemSize.y);
            c.drawImage(this.greenTeamIcon, teamX + this.x(1), teamY2 + gemOffset.y, gemSize.x, gemSize.y);

            c.fillStyle = green;
            c.font = teamNameFont;
            c.textAlign = "left";
            c.fillText("Green", teamX + teamNameOffset.x, teamY2 + teamNameOffset.y);
            c.textAlign = "right";
            c.font = teamScoreFont;
            c.fillText(this.data.teamscore_2, teamX +teamScoreOffset.x, teamY2 + teamScoreOffset.y);
            renderPlayers(2, teamX, teamY2 + headerHeight);

            if(this.data.total_teams > 3){
                c.fillStyle = bgColor;
                c.fillRect(teamX2, teamY2, teamWidth, headerHeight);
                c.drawImage(this.yellowGem, teamX2 + gemOffset.x, teamY2 + gemOffset.y, gemSize.x, gemSize.y);
                c.drawImage(this.yellowTeamIcon, teamX2 + this.x(1), teamY2 + gemOffset.y, gemSize.x, gemSize.y);

                c.fillStyle = yellow;
                c.font = teamNameFont;
                c.textAlign = "left";
                c.fillText("Yellow", teamX2 + teamNameOffset.x, teamY2 + teamNameOffset.y);
                c.textAlign = "right";
                c.font = teamScoreFont;
                c.fillText(this.data.teamscore_3, teamX2 + teamScoreOffset.x, teamY2 + teamScoreOffset.y);

                renderPlayers(3, teamX2, teamY2 + headerHeight);
            }

        }

        c.textAlign = "center";

        const date = new Date();
        date.setTime(this.data.date * 1000);
        c.fillStyle = "white";
        c.font = "300 "+this.y(1.5)+"px Roboto";
        c.fillText(this.data.gametypeName, this.x(50), this.y(92));
        c.fillText("Spectators: there is currently no one spectating this match.", this.x(50), this.y(94));
        c.fillText("Date of Match: "+date+" | Elapsed Time: "+this.getMMSS(this.data.match_playtime), this.x(50), this.y(96));
        c.fillText("Playing "+this.data.mapName+" on "+this.data.name, this.x(50), this.y(98));
        c.textAlign = "left";
    }

    render(){

        const c = this.c;
        c.textBaseline = "top";

        c.fillStyle = "black";

        c.fillRect(0, 0, this.x(100), this.y(100));


        c.drawImage(this.mapImage, 0, 0, this.x(100), this.y(100));


        c.fillStyle = "rgba(0,0,0,0.7)";

        c.fillRect(0, 0, this.x(100), this.y(100));
        


        if(!this.bMonsterHunt() && !this.bBunnytrack() && !this.bCoop()){
            this.renderTitle();
        }

       // alert(this.bBunnytrack());


        if(this.data.total_teams > 1){

            if(!this.bCTF() && !this.bBunnytrack() && !this.bSiege()){

                this.renderTeamScoreBoard();
                this.renderFooter();

            }else if(this.bCTF() && !this.bBunnytrack()){

                this.renderSmartCTF();

            }else if(this.bBunnytrack()){

                this.renderBunnytrackScoreboard();

                this.renderFooter();

            }else if(this.bSiege()){

                this.renderSiegeScoreboard();
            }

        }else{
            //render dm scoreboard

            if(this.bMonsterHunt()){

                this.renderMonsterHuntScoreboard();
                this.renderFooter();

            }else if(this.bCoop()){
                
                this.renderCoopScoreboard();

            }else{

                this.renderDmScoreBoard();
                this.renderFooter();

            }
        }

        if(!this.bCTF){
            this.renderFooter();
        }

    }
}