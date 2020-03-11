

class TimeStampConverter{


    constructor(){

        this.dateElems = [];
        this.timeElems = [];
        this.mmssElems = [];
        this.mmssAltElems = [];
        
        this.getElems();
        this.convert();
    }

    getMMSS(value){

        const timeStamp = parseInt(value);
        let seconds = timeStamp % 60;
        let minutes = 0;

        if(timeStamp > 0){

            minutes = Math.floor(timeStamp / 60);
            
        }

        if(seconds < 10){   

            seconds = "0"+seconds;
        }

        if(minutes < 10){
            minutes = "0"+minutes;
        }
        

        return minutes+":"+seconds;
    }

    convert(){


        let td = 0;

        let currentString = "";

        let currentMS = 0;
        let currentTime = 0;

        for(let i = 0; i < this.dateElems.length; i++){


            td = new EpochToString(this.dateElems[i].innerHTML, 2);

            currentString = td.getString();

            if(currentString == ""){
                currentString = "just now";
            }else{
                currentString += " ago";
            }

            this.dateElems[i].innerHTML = currentString;
 
        }


        for(let i = 0; i < this.timeElems.length; i++){

            td = new EpochToString(this.timeElems[i].innerHTML, 2, 0);
            this.timeElems[i].innerHTML = td.getString();
        }


        for(let i = 0; i < this.mmssElems.length; i++){

            this.mmssElems[i].innerHTML = this.getMMSS(this.mmssElems[i].innerHTML);
        }

        for(let i = 0; i < this.mmssAltElems.length; i++){

            currentTime = parseFloat(this.mmssAltElems[i].innerHTML);
            currentMS = Math.round((currentTime - (Math.floor(currentTime))) * 1000);

            if(currentMS < 10){
                currentMS = "00"+currentMs;
            }else if(currentMS < 100){
                currentMS = "0"+currentMS
            }
            this.mmssAltElems[i].innerHTML = this.getMMSS(this.mmssAltElems[i].innerHTML)+"."+currentMS;
        }
        //mmss


    }


    getElems(){

        this.dateElems = document.getElementsByClassName("date");
        this.timeElems = document.getElementsByClassName("date-alt");
        this.mmssElems = document.getElementsByClassName("date-alt-2");
        this.mmssAltElems = document.getElementsByClassName("date-alt-3");
    }
}



_mouseOverTitle = "title";
_mouseOverContent = "This smells funny";


class MouseOver{


    constructor(){

        this.elems = document.getElementsByClassName("m-o");

        this.elem = document.getElementById("mouseover");

        this.titleElem = document.getElementById("mouseover-header");

        this.contentElem = document.getElementById("mouseover-content");

        //console.log(this.elems);

        this.createEvents();
    }


    updateElem(e, elem){


        const bounds = elem.getBoundingClientRect();

        //console.log(bounds);
        //console.log(e);

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const offsetX = mouseX - bounds.left;
        const offsetY = mouseY - bounds.top;


        const headerText = elem.getAttribute("data-title");
        const contentText = elem.getAttribute("data-content");

        this.titleElem.innerHTML = headerText;
        this.contentElem.innerHTML = contentText;

        const moBounds = this.elem.getBoundingClientRect();

        //console.log(moBounds);

        let x = bounds.left + offsetX + (moBounds.width / 2);
        let y = bounds.top - bounds.height + offsetY;

        x = x - moBounds.width;
        y = y - moBounds.height;

        if(x < 0){
            x = 0;
        }else if(x > window.innerWidth - moBounds.width){
            x = window.innerWidth - moBounds.width;
        }

        if(y < 0){
            y = 0;
        }

        this.elem.style.cssText = "margin-left:"+(x)+"px; margin-top:"+(y)+"px;opacity:1;";

        

    }

    hideElem(){
        this.elem.style.cssText = "opacity:0;margin-top:-999px;";
    }

    createEvents(){


        for(let i = 0; i < this.elems.length; i++){

            this.elems[i].addEventListener("mouseover", (event) =>{
                this.updateElem(event, this.elems[i]);
            });

            this.elems[i].addEventListener("mousemove", (event) =>{
                this.updateElem(event, this.elems[i]);
            });



            this.elems[i].addEventListener("mouseout", () =>{

                this.hideElem();
            });
        }

    }
}



class KillsGraph{

    constructor(matchId, parent, playerIds, teamChanges, totalTeams){
        ///json/match/kills

        this.matchId = parseInt(matchId);

        this.totalTeams = totalTeams;

        this.playerIds = playerIds;
        this.teamChanges = teamChanges;

        this.parent = document.getElementById(parent);

        this.json = [];

        this.data = [];
       // this.createElement();
        this.getData();

        //console.log("new kills graph");

    }

    createGraph(){

        if(this.totalTeams < 2){

            //console.log("TOTAL TEAMS LESS THAN 2 = "+this.totalTeams);
            const data = [];

            this.playerKills.sort((a, b) =>{

                a = a.kills;
                b = b.kills;

                if(a < b){
                    return 1;
                }else if(a > b){
                    return -1;
                }

                return 0;

            });

            //console.log("test");

            let d = 0;

            for(let i = 0; i < this.playerKills.length; i++){

                if(i > 7){
                    break;
                }

                d = this.playerKills[i];
                data.push({"name": d.name, "data": d.data});

            }

            //onsole.log("test 2");

            //console.log("DATA UNDE HERE");
            //console.log(data);

            new SGraph(this.parent.id, 0.5, "rgb(12,12,12)", "Kills Graph", data, "Kills", "Kills Over Time", "kills", null);

        }else{

            const data = [];

            /*this.teamKills.sort((a, b) =>{

                a = a.kills;
                b = b.kills;

                if(a < b){
                    return 1;
                }else if(a > b){
                    return -1;
                }

                return 0;

            });*/

           // console.table(this.teamKills);

            let d = 0;

            for(let i = 0; i < this.teamKills.length; i++){

                d = this.teamKills[i];
                data.push({"name": d.name, "data": d.data});

            }
            new SGraph(this.parent.id, 0.5, "rgb(12,12,12)", "Team Kills Graph", data, "Kills", "Kills Over Time", "kills", null);
        }
    }


    getPlayerTeamAt(id, time){

        let d = 0;

        let currentTeam = -1;

        for(let i = 0; i < this.teamChanges.length; i++){

            d = this.teamChanges[i];

            if(d.player == id && d.time <= time){
                currentTeam = d.team;
            }
        }

        return currentTeam;
    }

    getPlayerName(id){

        let d = 0;

        for(let i = 0; i < this.playerIds.length; i++){

            d = this.playerIds[i];

            if(d.id == id){
                return d.name;
            }
        }

        return null;
    }

    parseData(){

        let d = 0;

        const players = [];

        const teams = [
            {"id": 0, "name": "red", "kills": 0, "data": []},
            {"id": 1, "name": "blue", "kills": 0, "data": []}
        ];

        if(this.totalTeams > 2){
            
            teams.push({"id": 2, "name": "green", "kills": 0, "data": []});
        }

        if(this.totalTeams > 3){
            teams.push({"id": 2, "name": "yellow", "kills": 0, "data": []});
        }


        for(let i = 0; i < this.playerIds.length; i++){

            d = this.playerIds[i];

            players.push({"id": d.id, "kills": 0, "name": d.name, "data": []});
        }

        const getPlayerIndex = (id) =>{

            for(let i = 0; i < players.length; i++){

                if(players[i].id == id){
                    return i;
                }
            }

            return -1;
        }

        let playerIndex = 0;
        let currentTeam = 0;

        const updateTeamKills = () =>{

            for(let i = 0; i < teams.length; i++){
                teams[i].data.push(teams[i].kills);
            }

        }

        const updatePlayerKills = () =>{

            for(let i = 0; i < players.length; i++){
                players[i].data.push(players[i].kills);
            }
        }

        for(let i = 0; i < this.json.length; i++){

            d = this.json[i];

            //console.log(d);
            playerIndex = getPlayerIndex(d.killer);
            currentTeam = this.getPlayerTeamAt(d.killer, d.time);

            if(playerIndex == -1){
                continue;
            }

            players[playerIndex].kills++;
      
            updatePlayerKills();
           // console.log("currentTeam = "+currentTeam);
            if(currentTeam != -1){

                if(teams[currentTeam] != undefined){
                    teams[currentTeam].kills++;
                }

                updateTeamKills();

            }

        }

        //console.table(teams);

      //  console.table(players);

        this.teamKills = teams;
        this.playerKills = players;

        this.createGraph();
    }

    getData(){

        const x = new XMLHttpRequest();

        x.onreadystatechange = () =>{

            if(x.status == 200 && x.readyState == 4){
                this.json = JSON.parse(x.responseText);
                
                this.parseData();
                //console.table(this.data);
                //new SGraph("dm-score-graph", 0.5, "rgb(12,12,12)", "Kills Graph",  JSON.stringify(this.playerIds) , "Kills", "Kills Over Time", "", null);
                //new SGraph(this.parent.id, 0.5, "rgb(12,12,12)", "Kills Graph", this.playerKills, "Kills", "Kills Over Time", "", null);
            }
        }

        x.open("GET","/json/match/kills?id="+this.matchId);
       // x.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        x.send();

    }
}




class KillMatchUp{

    constructor(matchId, parent, playerIds){

        
        this.matchId = matchId;
        this.parent = document.getElementById(parent);
        this.playerIds = playerIds;
        this.data = [];
        this.loadData();
    }


    getPlayerData(id){

        let d = 0;

        for(let i = 0; i < this.playerIds.length; i++){

            d = this.playerIds[i];

            if(d.id == id){
                return d;
            }

        }

        return null;
    }
    display(){

        const elem = document.createElement("div");
        elem.className = "default";


        let string = `<a href="#kills-match-up"><div class="default-header" id="kills-match-up">Kills Match Up</div></a>`;

        this.parent.appendChild(elem);

        string += `<table class="kills-table"><tr><th>&nbsp;</th>`;
        //let string2 = `<table><tr>`;

        const playerOrder = [];


        let lastKillerId = -1;

        let d = 0;

        let currentKiller = 0;

        for(let i = 0; i < this.players.length; i++){

            d = this.players[i];

            //console.log(d);

            if(d.killer != lastKillerId){

                lastKillerId = d.killer;

                playerOrder.push(d.killer);

                currentKiller = this.getPlayerData(d.killer);

                console.log(currentKiller);

                if(currentKiller != null){
                    string += `<th style="color:white"> <img src="files/flags/${currentKiller.flag}.png" alt="flag"/> <a href="/match?id=${this.matchId}&amp;pid=${currentKiller.id}">${currentKiller.name}</a></th>`;
                }else{
                    string += `<th>Ignored Player</th>`;
                }
            }

        }

        string += `</tr>`;
        
        let currentPlayer = 0;

        const getKills = (killer, victim) =>{

            let d = 0;

            for(let i = 0; i < this.players.length; i++){

                d = this.players[i];

                if(d.killer == killer && d.victim == victim){
                    return d.kills;
                }

            }

            return "";

        }

        const getPlayerLine = (killerName, killerId) =>{

            const playerData = this.getPlayerData(killerId);

           // console.table(playerData);

            let string = `<tr><td><img src="files/flags/${playerData.flag}.png" alt="flag"/> <a href="/match?id=${this.matchId}&amp;pid=${playerData.id}">${killerName}</a></td>`;

            for(let i = 0; i < playerOrder.length; i++){

                if(playerOrder[i] == killerId){
                    string += `<td style="background-color:rgba(255,255,255,0.05)">${getKills(killerId, playerOrder[i])}</td>`;
                }else{
                    string += `<td>${getKills(killerId, playerOrder[i])}</td>`;
                }
            }

            return string;
        }


        for(let i = 0; i < playerOrder.length; i++){

            //subString = "";
            currentPlayer = this.getPlayerData(playerOrder[i]);
           // console.log(currentPlayer);
            if(currentPlayer == null || currentPlayer == undefined){
                continue;
            }

           // for(let x = 0; x < playerOrder.length; x++){
                string += getPlayerLine(this.getPlayerData(playerOrder[i]).name, playerOrder[i]);
           // }//

           // string +=`<tr><td>${currentPlayer.name}</td><td>32</td><td>32</td><td>32</td><td>32</td><td>32</td><td>32</td><td>32</td><td>32</td><td>32</td><td>32</td><td>32</td><td>32</td><td>32</td><td>32</td><td>32</td><td>32</td></tr>`;
        }
        
        string+= `</table>`;

        elem.innerHTML += string;


    }

    sortData(){

        const players = [];

        const updateKills = (id, victim) =>{

            for(let i = 0; i < players.length; i++){

                if(players[i].killer == id && players[i].victim == victim){
                    players[i].kills++;
                    return;
                }
            }

            players.push({"killer": id, "victim": victim, "kills": 1});
        }

        let d = 0;

        let killerIndex = 0;
        let victimIndex = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            updateKills(d.killer, d.victim);
        }

        players.sort((a, b) =>{

            if(a.killer < b.killer){
                return -1;
            }else if(a.killer > b.killer){
                return 1;
            }

            return 0;

        });

        this.players = players;

        //console.table(players);


    }

    loadData(){

        const x = new XMLHttpRequest();

        x.onreadystatechange = () =>{

            if(x.status == 200 && x.readyState == 4){

                //console.table(x.responseText);

                this.data = JSON.parse(x.responseText);

               // console.log(this.data);

                this.sortData();

                this.display();
            }
        }

        x.open("GET", "json/match/kills?id="+this.matchId);
        x.send();
    }
}



class ServerScreenshot{

    constructor(parent, players, server){

        this.parent = parent;
        this.players = players;
        this.server = server;
        this.mapImage = new Image();
        this.mapImage.src = "files/maps/deck]16[.jpg";

        this.create();
    }

    x(input){

        return (this.canvas.width / 100) * input;
    }

    y(input){
        return (this.canvas.height / 100) * input;
    }

    create(){

        this.canvas = document.createElement("canvas");
        this.canvas.width = 1000;
        this.canvas.height = 200;   
        this.canvas.className = "server-query-image";

        this.parent.appendChild(this.canvas);
        this.context = this.canvas.getContext("2d");

        setInterval(() =>{
            this.render();
        },100);

    }

    render(){

       // console.log("render");
        const c = this.context;

       // console.log(c);

       

        
        c.drawImage(this.mapImage, this.y(10),this.y(10), this.x(20),this.y(80));

        c.fillStyle = "rgba(0,0,0,0.5)";
        c.fillRect(0,0,this.canvas.width,this.canvas.height);

        c.fillStyle = "white";
        c.font = this.y(9)+"px arial";

        c.textBaseline = "top";
        c.fillText(this.server.name, this.x(20) + this.y(21), this.y(10));
        c.fillText("Playing "+this.server.mapName, this.x(20) + this.y(21), this.y(22));
        c.fillText("Players "+this.server.players+"/"+this.server.maxPlayers, this.x(20) + this.y(21), this.y(34));


        /*
        let p = 0;

        c.font = this.y(5)+"px arial";

        for(let i = 0; i < this.players.length; i++){

            p = this.players[i];

            c.fillStyle = "white";
            c.fillText(p.name, this.canvas.width/2, 100);
        }
        */
    }
}

class ServerPlayer{

    constructor(name, frags, ping, skin, face, team, mesh, country, deaths, time, health, spree){

        this.name = name;

        this.team = parseInt(team);
        this.ping = parseInt(ping);
        this.face = face;
        this.mesh = mesh;
        this.skin = skin;
        this.frags = parseInt(frags);
        this.deaths = parseInt(deaths);
        this.time = parseInt(time);
        this.country = country;
        this.health = parseInt(health);
        this.spree = parseInt(spree);
    }
}

class ServerTest{


    constructor(parent){

        console.log("servertest");

        this.data = "";


        this.parent = document.getElementById(parent);


        this.getData();

        
    }


    getData(){

        const x = new XMLHttpRequest();

        x.onreadystatechange = () =>{

            if(x.status == 200 && x.readyState == 4){

                //console.log(x.responseText);

                //this.parent.innerHTML = x.responseText;

                const reg = /\\(.*)\\/ig;

                this.data = x.responseText;

                console.log(this.data);
                //console.log(x.responseText.match(reg));

                

                //this.createPlayers();
                this.setServerInfo();

                this.image = new ServerScreenshot(this.parent, this.players, this.server);
            }
        }

        x.open("GET", "/json/server/query/");
        x.send();
    }

    createPlayers(){

        const playerNameReg = /\\player_.+?\\(.+?)\\/ig;
        const teamReg = /\\team_.+?\\(.+?)\\/ig;
        const fragsReg = /\\frags_.+?\\(.+?)\\/ig;
        const pingReg = /\\ping_.+?\\(.+?)\\/ig;
        const skinReg = /\\skin_.+?\\(.+?)\\/ig;
        const faceReg = /\\face_.+?\\(.+?)\\/ig;
        const meshReg = /\\mesh_.+?\\(.+?)\\/ig;
        const countryReg = /\\countryc_.+?\\(.+?)\\/ig;
        const deathsReg = /\\deaths_.+?\\(.+?)\\/ig;
        const timeReg = /\\time_.+?\\(.+?)\\/ig;
        const healthReg = /\\health_.+?\\(.+?)\\/ig;
        const spreeReg = /\\spree_.+?\\(.+?)\\/ig;

        //console.log(this.data.match(playerNameReg));

        this.players = [];


        let currentName = 0;
        let currentFrags = 0;
        let currentPing = 0;
        let currentSkin = 0;
        let currentFace = 0;
        let currentTeam = 0;
        let currentMesh = 0;
        let currentCountry = 0;
        let currentDeaths = 0;
        let currentTime = 0;
        let currentHealth = 0;
        let currentSpree = 0;

        do{
            currentName = playerNameReg.exec(this.data);
            currentFrags = fragsReg.exec(this.data);
            currentPing = pingReg.exec(this.data);
            currentSkin = skinReg.exec(this.data);
            currentFace = faceReg.exec(this.data);
            currentTeam = teamReg.exec(this.data);
            currentMesh = meshReg.exec(this.data);
            currentCountry = countryReg.exec(this.data);
            currentDeaths = deathsReg.exec(this.data);
            currentTime = timeReg.exec(this.data);
            currentHealth = healthReg.exec(this.data);
            currentSpree = spreeReg.exec(this.data);
        

  

            if(currentName != null){
                this.players.push(
                    new ServerPlayer(
                        (currentName == null) ? "" : currentName[1], 
                        (currentFrags == null) ? 0 : currentFrags[1], //currentFrags, 
                        (currentPing== null) ? 0 : currentPing[1], //currentPing, 
                        (currentSkin == null) ? "" : currentSkin[1], //currentSkin, 
                        (currentFace == null) ? "" : currentFace[1], //currentFace, 
                        (currentTeam == null) ? 0 : currentTeam[1], //currentTeam, 
                        (currentMesh == null) ? "" : currentMesh[1],  //currentMesh, 
                        (currentCountry == null) ? "xx" : currentCountry[1], // currentCountry, 
                        (currentDeaths == null) ? 0 : currentDeaths[1],  // currentDeaths, 
                        (currentTime == null) ? 0 : currentTime[1], //currentTime, 
                        (currentHealth == null) ? 0 : currentHealth[1],  //currentHealth, 
                        (currentSpree == null) ? 0 : currentSpree[1], // currentSpree
                        )
                );
            }

        }while(currentName != null);
        

       // this.displayData();
    }

    setServerInfo(){

        const hostReg = /\\hostname\\(.+?)\\/i;
        const mapReg = /\\mapname\\(.+?)\\/i;
        const gametypeReg = /\\gametype\\(.+?)\\/i;
        const playersReg = /\\numplayers\\(.+?)\\/i;
        const maxPlayersReg = /\\maxplayers\\(.+?)\\/i;

        this.server = {
            "name": "",
            "mapName": "",
            "gametype": "",
            "players": 0,
            "maxPlayers": 0
        };
        
        //console.log(mapReg.exec(this.data));

        let result = null;

        if(hostReg.test(this.data)){

            result = hostReg.exec(this.data);
            this.server.name = result[1];
        }   


        if(mapReg.test(this.data)){

            result = mapReg.exec(this.data);
            this.server.mapName = result[1];
        } 

        if(gametypeReg.test(this.data)){

            result = gametypeReg.exec(this.data);
            this.server.gametype = result[1];
        } 

        if(playersReg.test(this.data)){

            result = playersReg.exec(this.data);
            this.server.players = parseInt(result[1]);
        } 

        if(maxPlayersReg.test(this.data)){

            result = maxPlayersReg.exec(this.data);
            this.server.maxPlayers = parseInt(result[1]);
        } 


        console.table(this.server);
    }


    displayPlayer(p){

        return `<div class="server-query-player">
            <div><img src="files/faces/faceless.png" alt="image"></div>
            <div>${p.name} <span class="yellow tiny">${p.ping}</span></div>
            <div>${p.frags}</div>
        </div>`;
    }

    displayData(){

        

        let p = 0;

        for(let i = 0; i < this.players.length; i++){

           // this.parent.style.cssText="background-image:url(files/maps/face.jpg)";
            //this.parent.innerHTML += this.displayPlayer(this.players[i]);
        }


    }

}


class PickupsDisplay{


    constructor(elem, matchId, players){

        console.log("new pickups display");

        this.elem = document.getElementById(elem);
        this.matchId = parseInt(matchId);
        this.players = players;

        console.table(players);

        this.pickupData = [];
        this.pickupTypes = [];

        this.loadData();
    }


    getPlayerDetails(id){


        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].id == id){
                return this.players[i];
            }
        }

        return null;
    }

    updatePickup(type, player){

        for(let i = 0; i < this.pickupData.length; i++){

            if(this.pickupTypes.indexOf(type) == -1){
                this.pickupTypes.push(type);
            }

            if(this.pickupData[i].type == type){
                if(this.pickupData[i].player == player){
                    this.pickupData[i].count++;
                    return;
                }

            }
        }

        this.pickupData.push({"type": type, "player": player, "count": 1});
    }

    displayPickupType(type){

        let string = "";

        let p = 0;

        let currentPlayer = null;

        for(let i = 0; i < this.pickupData.length; i++){

            p = this.pickupData[i];

            currentPlayer = this.getPlayerDetails(p.player);
            
            if(p.type == type && currentPlayer != null){
                string+=` <img src="files/flags/${currentPlayer.flag}.png" alt="flag"/> <a href="/match?id=${this.matchId}&amp;pid=${currentPlayer.id}">${currentPlayer.name}</a> <span style="color:yellow">(${p.count})</span>`;
                
                  
                
            }
        }

        return string;
    }


    getPlayerPickupCount(player, type){

        //let total = 0;

        for(let i = 0; i < this.pickupData.length; i++){

            if(this.pickupData[i].player == player && this.pickupData[i].type == type){

                return this.pickupData[i].count;
            }
        }
        return 0;
    }

    bPlayerPickupAnything(player){

        let total = 0;

        let d = 0;

        for(let i = 0; i < this.pickupData.length; i++){

            d = this.pickupData[i];

            if(d.player == player){
                total += d.count;

                if(total > 0){
                    return true;
                }
            }
        }
        

        return false;
    }

    displayData(){

        let currentPlayer = null;
        let d = 0;


        const pickupData = [];

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];
            currentPlayer = this.getPlayerDetails(d.player);

            //console.log(currentPlayer);
            if(currentPlayer != null){

                this.updatePickup(d.type, currentPlayer.id);
               /* this.elem.innerHTML += `<div class="data-default">
                    <div><img src="files/flags/${currentPlayer.flag}.png" alt="flag"/>${currentPlayer.name}</div>
                </div>`;*/
            }

        }

        this.pickupTypes.sort();

        this.pickupData.sort((a,b) =>{

            a = a.count;
            b = b.count;

            if(a < b){
                return 1;
            }else if(a > b){
                return -1;
            }
            return 0;

        });

        let string = "";

        console.table(this.pickupData);
        console.table(this.players);

        string += `<a href="#pickups"><div class="default-header" id="pickups">
                Pickup Summary
            </div></a>
            <table class="frag-table">
            <tr>
                <th>Player</th>`;

        for(let i = 0; i < this.pickupTypes.length; i++){

            if(this.pickupTypes[i] != "Double Enforcer"){
                string += `
                    <th>${this.getRealName(this.pickupTypes[i])}</th>
                `;
            }
        }

        string += `</tr>`;

        let cssStyle = "";

        let currentCount = 0;

        for(let i = 0; i < this.players.length; i++){

            cssStyle = "rgb(6,6,6)";

            if(i % 2 == 0){
                cssStyle = "rgb(16,16,16)";
            }

            if(!this.bPlayerPickupAnything(this.players[i].id)){
                continue;
            }

            string += `<tr style="background-color:${cssStyle};">
                <td><a href="/match?id=${this.matchId}&amp;pid=${this.players[i].id}"><img src="files/flags/${this.players[i].flag}.png" alt="flag"> ${this.players[i].name}</td></a>`;

            for(let w = 0; w < this.pickupTypes.length; w++){

                currentCount = this.getPlayerPickupCount(this.players[i].id, this.pickupTypes[w]);
                if(currentCount == 0){
                    currentCount = "";
                }
                if(this.pickupTypes[w] != "Double Enforcer"){
                    string += `<td>${currentCount}</td>`;
                }
            } 

            string += `</tr>`;
        }

        /*for(let i = 0; i < this.pickupTypes.length; i++){

            if(i == 0){
                string += `<div class="default-header">
                Pickup Summary
            </div>
            <table class="frag-table">
                <tr>
                    <th>Type</th>
                    <th>Player</th>
                </tr>`;
            }

            if(this.pickupTypes[i] != "Double Enforcer"){
                string += `<tr>
                    <td style="color:yellow;">${this.getRealName(this.pickupTypes[i])}</td>
                    <td style="text-align:left;line-height:22px;">${this.displayPickupType(this.pickupTypes[i])}</td>
                </tr>`;
            }
            
        }*/
        string += '</table></div>';
        this.elem.innerHTML = string;

       // console.log(this.pickupData);
       // console.log(this.pickupTypes);
    }

    getRealName(type){

        const types = [
            "antigrav boots",
            "biosludge ammo",
            "blade hopper",
            "box of rifle rounds",
            "damage amplifier",
            "enforcer",
            "flak shells",
            "ges bio rifle",
            "health vial",
            "large bullets",
            "medbox",
            "pulse cell",
            "rocketpack",
            "shockcore"
        ];
        const names = [
            "Jump<br>Boots",
            "Biorifle<br>Ammo",
            "Ripper<br>Ammo",
            "Sniper<br>Ammo",
            "UDamage",
            "Enforcer",
            "Flak<br>Cannon<br>Ammo",
            "Bio<br>Rifle",
            "Health<br>Vial<br>(5hp)",
            "Minigun<br>Ammo",
            "Medbox<br>(20hp)",
            "Pulse<br>Rifle",
            "Rocket<br>Launcher",
            "Shock<br>Ammo"
        ];


        let index = types.indexOf(type.toLowerCase());

        if(index != -1){
            return names[index];
        }

        return type;
    }


    loadData(){

        const x = new XMLHttpRequest();

        x.onreadystatechange = () =>{

            if(x.status == 200 && x.readyState == 4){

                //console.log(x.responseText);
                this.data = JSON.parse(x.responseText);
                //console.table(this.data);
                this.displayData();
            }
        }

        x.open("GET","/json/pickups/?match="+this.matchId);
        x.send();

    }

}

class ConnectionDisplay{

    constructor(id, elem, players){

        this.elem = document.getElementById(elem);

        this.matchId = parseInt(id);
        this.players = players;

        console.table(this.players);
    

        this.loadData();
    }

    getPlayerDetails(id){


        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].id == id){
                return this.players[i];
            }
        }

        return null;
    }

    display(){

        let d = 0;
        let currentPlayer = null;

        let string = `
        <a href="#player-connections"><div class="default-header" id="player-connections">
            Player Connections
        </div></a>
        <table>
            <tr>
                <th>Player</th>
                <th class="text-center">Action</th>
                <th class="text-center">Time</th>
            </tr>`;
    

        let action = "";

        let seconds = 0;
        let minutes = 0;

       // console.table(this.data);

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            currentPlayer = this.getPlayerDetails(d.player_id);

            //console.log(currentPlayer);

            if(currentPlayer == null){
                continue;
            }

            if(d.type == 0){
                action = "Connected";
            }else{
                action = "Disconnected";
            }

            seconds = Math.floor(d.time % 60);

            if(seconds < 10){
                seconds = "0"+seconds;
            }

            minutes = Math.floor(d.time / 60);

            if(minutes < 10){
                minutes = "0"+minutes;
            }

            //this.elem.innerHTML += '<tr>asfasf</tr>';
            string += `
            <tr>
                <td><img src="/files/flags/${currentPlayer.flag}.png" alt="flag"/> <a href="/match?id=${this.matchId}&amp;pid=${currentPlayer.id}">${currentPlayer.name}</a></td>
                <td class="text-center">${action}</td>
                <td class="text-center">${minutes}:${seconds}</td>
            </tr>`;

        }

        this.elem.innerHTML = string+"</table>";

    }

    loadData(){

        const x = new XMLHttpRequest();

        x.onreadystatechange = () =>{

            if(x.status == 200 && x.readyState == 4){

                this.data = JSON.parse(x.responseText);
                console.log(this.data);
                this.display();
            }
        }

        x.open("GET","/json/connects/?match="+this.matchId);
        x.send();

    }
}


class FlagMouseOverCreater{


    constructor(){


        this.elems = [];


        this.countires = new Countries();
        this.getElems();

        this.createMouseOvers();
    }


    createMouseOvers(){


        const reg = /^.+\/(.+?)\.png$/i;

        let result = 0;

        for(let i = 0; i < this.elems.length; i++){


            result = reg.exec(this.elems[i].src);

           // console.log(result);

            this.elems[i].className+=" m-o";
            this.elems[i].dataset.title = "Country";

            if(result != null){
                this.elems[i].dataset.content = this.countires.getName(result[1].toLowerCase());

            }


            
        }

    }

    getElems(){


        const elems = document.getElementsByTagName("img");

       // console.log(elems);

        const reg = /files\/flags\//i;

        for(let i = 0; i < elems.length; i++){

            if(reg.test(elems[i].src)){

                this.elems.push(elems[i]);
            }
        }

        //console.log(this.elems);
    }
}

class AliasesFetcher{


    constructor(name,parent){

        this.name = name;
        this.parent = document.getElementById(parent);

        this.getData();

    }
    

    displayData(data){

        console.table(data);

        data.sort((a,b) =>{

            a = a.total_uses;
            b = b.total_uses;

            if(a > b){
                return -1;
            }else if(a < b){
                return 1
            }

            return 0;

        });

        let html = `
            <div class="default">
                <div class="default-header">Possible Aliases</div>

                <table class="default-table">
                <tr>
                    <th>Name</th>
                    <th>Uses</th>
                </tr>
        `;

        for(let i = 0; i < data.length; i++){

            html += `<tr>
                <td><a href="/player?id=${data[i].player_id}"><img src="files/flags/${data[i].flag.toLowerCase()}.png" alt="flag"> ${data[i].name}</a></td>
                <td style="text-align:center">${data[i].total_uses}</td>
                </tr>`;
        }

        html += `</table></div>`;

        this.parent.innerHTML = html;

    }


    getData(){

        console.log("NAME = "+this.name);

        const x = new XMLHttpRequest();

        x.onreadystatechange = () =>{

            if(x.status == 200 && x.readyState == 4){

                this.displayData(JSON.parse(x.responseText));
            }
        }


        x.open("GET", "/json/aliases/?name="+this.name);
        x.send();
    }
}



class KillDisplay{

    constructor(matchId, players, teamChanges, weapons, button, hideButton, hideButtonTop, parent){

        this.matchId = matchId;
        this.players = players;
        this.teamChanges = teamChanges;
        this.weapons = weapons;
        this.button = button;
        this.hideButton = hideButton;
        this.hideButtonTop = hideButtonTop;
        this.parent = document.getElementById(parent);
        this.hideEvent();

        this.loadData();
    }


    getPlayer(id){

        for(let i = 0; i < this.players.length; i++){

            if(this.players[i].matchId == id){
                return this.players[i];
            }
        }

        return {
            "name": "Not Found"
        };
    }

    getWeapon(id){

        for(let i = 0; i < this.weapons.length; i++){

            if(this.weapons[i].id == id){
                return this.weapons[i].name;
            }
        }
        return "Suicide";
    }

    mmss(time){

        let seconds = (time % 60).toFixed(2);
        let minutes = Math.floor(time / 60);

    

        if(seconds < 10){
            seconds = "0"+seconds;
        }

        if(minutes < 10){
            minutes = "0"+minutes;
        }

        return minutes+":"+seconds;
    }


    getTeamAt(time, player){

        let d = 0;

        let current = 255;

        for(let i = 0; i < this.teamChanges.length; i++){

            d = this.teamChanges[i];

            if(d.player == player){

                if(d.time <= time){
                    current = d.newTeam;
                    break;
                }
            }

        }

        switch(current){

            case 0: {  return "red"; }
            case 1: { return "blue"; } 
            case 2: { return "green"; } 
            case 3: { return "yellow"; }
            default: { return "grey";   } 
        } 
    }

    hideHideButtons(){

        const elem = document.getElementById("big-frag-table");
        elem.style.cssText = "display:none;";
        this.button.style.cssText = "";
        this.button.innerHTML = "View Kill Data";
        this.hideButton.style.cssText = "display:none;";
        this.hideButtonTop.style.cssText = "display:none;";
    }

    hideEvent(){

        this.hideButton.addEventListener("click", () =>{

            this.hideHideButtons();
        });

        this.hideButtonTop.addEventListener("click", () =>{

            this.hideHideButtons();
        });

        this.button.addEventListener("click", () =>{
            const elem = document.getElementById("big-frag-table");
            elem.style.cssText = "";
            this.button.style.cssText = "display:none";
            this.hideButton.style.cssText = "";
            this.hideButtonTop.style.cssText = "";

        });
    }

    display(){

        this.button.style.cssText =" display:none;";
        this.hideButton.style.cssText ="";
        this.hideButtonTop.style.cssText ="";

        let string = `<table class="frag-table" id="big-frag-table">
            <tr>
                <th>Time</th>
                <th>Killer</th>
                <th>Victim</th>
                <th>Distance</th>
                <th>Weapon</th>
            </tr>`;

        
        let d = 0;
        let killer = null;
        let victim = null;
        let weapon = null;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            killer = this.getPlayer(d.killer);
            victim = this.getPlayer(d.victim);
            weapon = this.getWeapon(d.weapon);

            string += `<tr >
                <td>${this.mmss(d.time)}</td>
                <td class="team-${this.getTeamAt(d.time, d.killer)}"><img src="files/flags/${killer.flag}.png" alt="image"> ${killer.name}</td>
                <td class="team-${this.getTeamAt(d.time, d.victim)}"><img src="files/flags/${victim.flag}.png" alt="image"> ${victim.name}</td>
                <td>${d.distance.toFixed(2)}</td>
                <td>${weapon}</td>
            </tr>`;
        }

        
        string += `</table>`;

        this.parent.innerHTML = string;
    }

    loadData(){

        const x = new XMLHttpRequest();

        x.onreadystatechange = () =>{

            if(x.status == 200 && x.readyState == 4){

                //console.log(x.responseText);

                this.data = JSON.parse(x.responseText);
                //console.table(this.data);

                this.display();
            }
        }

        x.open("GET","/json/match/kills_ext?id="+this.matchId);
        x.send();
    }
}