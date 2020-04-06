

class InteractiveMap{

    constructor(parent, details, players, spawns, items, flagKills, flagEvents, domPositions, matchStart){

        this.parent = document.getElementById(parent);
        this.details = details;
        this.spawns = spawns;
        this.items = items;
        this.kills = [];
        this.flags = [];
        this.domPoints = [];
        this.players = players;
        this.flagKills = flagKills;
        this.flagEvents = flagEvents;
        this.domPositions = domPositions;
        this.matchStart = matchStart;

       // console.log(this.spawns);

        this.spawnIcon = new Image();
        this.spawnIcon.src = "files/spawn.png";

        this.static = new Image();
        this.static.src = "files/static.png";

        this.redFlag = new Image();
        this.blueFlag = new Image();
        this.greenFlag = new Image();
        this.yellowFlag = new Image();
        this.domIcon = new Image();

        this.redFlag.src = "files/redflag.png";
        this.blueFlag.src = "files/blueflag.png";
        this.greenFlag.src = "files/greenflag.png";
        this.yellowFlag.src = "files/yellowflag.png";
        this.domIcon.src = "files/domicon.png";

        this.bMouseDown = false;

        this.bNoData = true;


        this.bShowSpawns = true;
        this.bShowPickups = true;
        this.bShowDeaths = true;
        this.bShowKills = true;
        this.bShowFlagKills = true;
        this.bShowFlagReturns = true;
        this.bShowFlagDrops = true;

        this.mouse = {
            "x": 0,
            "y": 0
        };

        this.click = {
            "x": -999,
            "y": -999
        };


        this.zoom = 1;


        this.xOffset = 0;
        this.yOffset = 0;

        

        this.init();
    }

    async init(){

        this.createCanvas();

        this.createEvents();



        try{
            await this.loadKills();
            
            await this.loadFlagPositions();

            await this.loadSpawnData();

            await this.loadDomTotalCaps();
        
        }catch(err){
            console.trace(err);
        }


       // console.table(this.kills);

        this.setMapScale();

        this.tick();
    }

    createEvents(){

        this.keys = [];

        this.keys[87] = false;
        this.keys[83] = false;

        onkeydown = onkeyup = (e) =>{

            console.log(e.keyCode);

           // console.log(e.type);
            this.keys[e.keyCode] = e.type == "keydown";

           // console.log("this.keys["+e.keyCode+"] = "+this.keys[e.keyCode]);
        }

        this.canvas.addEventListener("mousedown", (e) =>{

            const bounds = this.canvas.getBoundingClientRect();
            //console.log(bounds);

            this.click.x = e.clientX - bounds.x;
            this.click.y = e.clientY - bounds.y;

            console.log(this.click);
            //console.log(e);

            this.bMouseDown = true;
        });

        this.canvas.addEventListener("mouseup", () =>{

            this.bMouseDown = false;
        });

        this.canvas.addEventListener("mouseout", () =>{

            this.bMouseDown = false;
        });

        this.canvas.addEventListener("mousemove", (e) =>{

            const bounds = this.canvas.getBoundingClientRect();

            //console.log(bounds);

            //console.log(e);

            const x = e.clientX - bounds.left;
            const y = e.clientY - bounds.top;

           // console.log(x+","+y);

            this.mouse.x = x;
            this.mouse.y = y;

            if(this.bMouseDown){

               // console.log(e);
               // this.xOffset += Math.random() * 5;

               this.xOffset += (e.movementX * 4);
               this.yOffset += (e.movementY * 6);
            }
        });

        this.canvas.addEventListener("wheel", (e) =>{

            
           // console.log(e);

            e.preventDefault();

            if(e.deltaY != undefined){

                let zoomOffset = 0;
                const oldZoom = this.zoom;

                if(e.deltaY > 0){

                    this.zoom -= 0.15;

                    

                    if(this.zoom < 0.1){

                        zoomOffset = Math.abs(this.zoom - 0.1);
                        this.zoom = 0.1;
                    }else{

                        //this.xOffset = (this.xOffset * 0.85) + (this.canvas.width * 0.5);
                       // this.yOffset = (this.yOffset * 0.85) + (this.canvas.height * 0.5);
                        //this.xOffset -= Math.abs((((this.canvas.width  * oldZoom) - (this.canvas.width * this.zoom)) * 0.5));
                        //this.yOffset += (((this.canvas.height  * oldZoom) - (this.canvas.height * this.zoom)) * 0.5);

                        //(this.canvas.width * 0.5) - (this.mouse.x - (this.canvas.width));
                        //this.yOffset += //(this.canvas.height * 0.5) - (this.mouse.y - (this.canvas.height));
                    }

                }else if(e.deltaY < 0){

                    this.zoom += 0.15;

                    if(this.zoom >= 2.5){
                        this.zoom = 2.5;
                    }else{
                        //this.xOffset -= (this.canvas.width * 0.5) + (this.mouse.x - (this.canvas.width))//- this.mouse.x;
                       // this.yOffset -= (this.canvas.height * 0.5) + (this.mouse.y - (this.canvas.height))//- this.mouse.y;
                       // this.xOffset = this.xOffset * 1.15;
                        //this.yOffset = this.yOffset * 1.15;

                        //this.xOffset += Math.abs((((this.canvas.width  * oldZoom) - (this.canvas.width * this.zoom)) * 0.5));
                       // this.yOffset -= (((this.canvas.height  * oldZoom) - (this.canvas.height * this.zoom)) * 0.5);
                    }

                   // this.xOffset += (this.xOffset * 0.15);
                   // this.yOffset += (this.yOffset * 0.15);

    
                }
            }


        })
    }

    createCanvas(){

        const elem = document.createElement("canvas");
        elem.height = window.innerHeight * 0.8;// * 0.5625;
        elem.width = elem.height * 1.7777;
        elem.style.cssText = "display:block;margin-left:auto;margin-right:auto;border:1px solid rgb(12,12,12);box-shadow:1px 1px 1px rgba(0,0,0,0.5)";

        this.parent.appendChild(elem);

        this.canvas = elem;
        this.c = this.canvas.getContext("2d");
    }

    //change value to its percent value of max range
    xPercent(input){

        return this.xBit * input;

    }

    //change value to its percent value of max range
    yPercent(input){

        return this.yBit * input;
    }


    //get pixel location from the map percentage value
    x(input){

        //const percent = 

        const width = this.canvas.width / 100;

        return this.xPercent(width * this.xOffset) + this.xPercent((this.canvas.width / 100) * input) * this.zoom;
    }

    //get pixel location from the map percentage value
    y(input){

        const height = this.canvas.height / 100;

        return this.yPercent(height * this.yOffset) + this.yPercent((this.canvas.height / 100) * input) * this.zoom;
    }


    //change value to canvas width percent
    pX(input){

        return (this.canvas.width / 100) * input;
    }

    pY(input){

        return (this.canvas.height / 100) * input;
    }

    setFontSize(input){

        return (this.canvas.height / 100) * input;
    }
    

    renderPolygon(){


        const c = this.c;

        c.fillStyle = "rgb(32,32,32)";

        let d = 0;

        c.lineWidth = this.pY(0.1);

        c.beginPath();

        const minX = this.x(this.minX - (Math.abs(this.minX) * 0.1));
        const minY = this.y(this.minY - (Math.abs(this.minY) * 0.1));
        const maxX = this.x(this.maxX + (this.maxX * 0.1));
        const maxY = this.y(this.maxY + (this.maxY * 0.1));

        c.moveTo(minX, minY);
        c.lineTo(maxX, minY);
        c.lineTo(maxX, maxY);
        c.lineTo(minX, maxY);
        c.lineTo(minX, minY);
        c.fill();
        c.stroke();
        c.closePath();

    }


    getPlayerName(id){

        let d = 0;

        for(let i = 0; i < this.players.length; i++){

            d = this.players[i];

            if(d.id == id){
                return d.name;
            }
        }

        return "Not Found";
    }

    mmss(time){

        let seconds = (time % 60).toFixed(2);
        let minutes = 0;

        if(time > 0){
            minutes = Math.floor(time / 60);
        }

        if(seconds < 10){
            seconds = "0"+seconds;
        }

        if(minutes < 10){
            minutes = "0"+minutes;
        }

        return minutes+":"+seconds;
    }

    fixItemName(string){

        const reg = /^(\D+)\d+$/i;

        const result = reg.exec(string);

        //console.log(result);

        if(result != null){

            return result[1];
        }

        return string;
    }

    render(){

        
        const c = this.c;

        const mouseX = -this.xOffset + this.mouse.x;
        const mouseY = -this.yOffset + this.mouse.y;


        let boxX = 0;
        let boxY = 0;
        let boxTitle = "title";
        let boxText = "";
        let boxText2 = "";
        let bShowBox = false;


        const updateTextBox = (title, text, text2) =>{

            bShowBox = true;
            boxTitle = title;
            boxText = text;
            boxText2 = text2;
        }

        c.textBaseline = "top";

        const radius = this.pY(0.5);

       
        const pat = c.createPattern(this.static, 'repeat');
        c.fillStyle = pat;
        c.fillRect(0,0,this.canvas.width, this.canvas.height);

        c.fillStyle = "rgba(0,0,0,0.8)";
        c.fillRect(0,0,this.canvas.width, this.canvas.height);

    
        if(this.bNoData || this.totalX == 0 || this.totalY == 0){

            c.font = this.setFontSize(4)+"px Arial";
            c.fillStyle = "white"
            c.textAlign = "center";

            c.fillText("No data to display", this.canvas.width * 0.5, this.canvas.height * 0.4);
            c.textAlign = "left";
            return;
        }
        
        
        this.renderPolygon();
        c.fillStyle = "white";

        c.font = this.setFontSize(2)+"px Arial"

        let d = 0;

        c.fillStyle = "yellow";
        c.textAlign = "center";

        if(this.bShowSpawns){

            const spawnSize = this.pY(2) * this.zoom;

            let spawnX = -this.xOffset + this.x(d.x);
            let spawnY = -this.yOffset + this.y(d.y)

            let teamString = "";

            for(let i = 0; i < this.spawns.length; i++){

                d = this.spawns[i];

                spawnX = -this.xOffset + this.x(d.x);
                spawnY = -this.yOffset + this.y(d.y);

            // console.log("StartPosition = "+d.x+","+d.y+","+d.z+" display position = "+this.x(d.x)+","+this.y(d.y));

               // c.fillRect(this.x(d.x), this.y(d.y), 5, 5);
                c.drawImage(this.spawnIcon, this.x(d.x) - (spawnSize * 0.5), this.y(d.y) - (spawnSize * 0.5), spawnSize, spawnSize);

                if(mouseX >= spawnX - spawnSize && mouseX <= spawnX + spawnSize){

                    if(mouseY >= spawnY - spawnSize && mouseY <= spawnY + spawnSize){

                        

                        if(this.details.totalTeams >= 2){

                            if(d.team == 0){
                                teamString = "Red team";
                            }else if(d.team == 1){
                                teamString = "Blue team";
                            }else if(d.team == 2){
                                teamString = "Green team";
                            }else if(d.team == 3){
                                teamString = "Yellow team";
                            }else{
                                teamString = "Any team";
                            }
                        }else{
                            teamString = "Any Team";
                        }

                        updateTextBox("Spawn Point", teamString, d.count+" spawns during match.");
                    }

                }

               // c.fillText(this.x(d.x).toFixed(2)+","+this.y(d.y).toFixed(2),this.x(d.x), this.y(d.y));
            }
        }


        
        

        

        //console.log(this.kills.length);
        c.lineWidth = this.pY(0.1) * this.zoom;

        if(this.bShowKills || this.bShowDeaths){

            let killerX = 0;
            let killerY = 0;
            let victimX = 0;
            let victimY = 0;

            for(let i = 0; i < this.kills.length; i++){

                d = this.kills[i];

                killerX = -this.xOffset + this.x(d.killer_x);
                killerY = -this.yOffset + this.y(d.killer_y);
                victimX = -this.xOffset + this.x(d.victim_x);
                victimY = -this.yOffset + this.y(d.victim_y);

                c.strokeStyle = "rgba(255,255,255,0.125)";
                c.fillStyle = "rgba(255,0,0,0.5)";

                if(mouseX >= killerX - (radius * this.zoom) && mouseX <= killerX + (radius * this.zoom)){
                    if(mouseY >= killerY - (radius * this.zoom) && mouseY <= killerY + (radius * this.zoom)){
                        //c.fillStyle = "green";
                        c.strokeStyle = "red";

                        updateTextBox(
                            "Killer Location", 
                            this.getPlayerName(d.killer)+" killed "+this.getPlayerName(d.victim), 
                            "Timestamp: "+this.mmss(d.time - this.matchStart)
                        );
                    }
                }

                if(mouseX >= victimX - (radius * this.zoom) && mouseX <= victimX + (radius * this.zoom)){
                    if(mouseY >= victimY - (radius * this.zoom) && mouseY <= victimY + (radius * this.zoom)){
                        //c.fillStyle = "green";
                        c.strokeStyle = "red";
      
                        updateTextBox(
                            "Death Location", 
                            this.getPlayerName(d.killer)+" killed "+this.getPlayerName(d.victim), 
                            "Timestamp: "+this.mmss(d.time - this.matchStart)
                        );
                        
                    }
                }
                
                
                
                if(this.bShowKills && this.bShowDeaths){
                    c.beginPath();
                    c.moveTo(this.x(d.killer_x), this.y(d.killer_y));
                    c.lineTo(this.x(d.victim_x), this.y(d.victim_y));
                    c.stroke();
                    c.closePath();
                }

                //c.fillText(d.killer_x+","+d.killer_y, this.x(d.killer_x), this.y(d.killer_y));

               

                // c.fillText(this.x(d.x).toFixed(2)+","+this.y(d.y).toFixed(2),this.x(d.x), this.y(d.y));


    
                if(this.bShowKills){
                    c.fillStyle = "rgba(253,171,159,0.5)";
                    
                    c.beginPath();
                    c.arc(this.x(d.killer_x), this.y(d.killer_y), radius * this.zoom, 0, Math.PI * 2);
                    c.fill();
                    c.closePath();
                }

               


                if(this.bShowDeaths){
                    c.fillStyle = "rgba(255,0,0,0.5)";
                    c.beginPath();
                    c.arc(this.x(d.victim_x), this.y(d.victim_y), radius * this.zoom, 0, Math.PI * 2);
                    c.fill();
                    c.closePath();
                }
            }
        }



        if(this.bShowFlagKills){

            let flagBox = this.pY(2) * this.zoom;
            let flagKillX = 0;
            let flagKillY = 0;

            for(let i = 0; i < this.flagKills.length; i++){

                d = this.flagKills[i];

                flagKillX = -this.xOffset + this.x(d.x);
                flagKillY = -this.yOffset + this.y(d.y);

                c.fillStyle = "green";

                if(mouseX > flagKillX - (radius * this.zoom) && mouseX < flagKillX + (radius * this.zoom)){

                    if(mouseY > flagKillY - (radius * this.zoom) && mouseY < flagKillY + (radius * this.zoom)){
                        c.fillStyle = "white";

                        updateTextBox(
                            "Flag Kill Location", 
                            this.getPlayerName(d.killer)+" killed "+this.getPlayerName(d.victim), 
                            "Timestamp: "+this.mmss(d.time - this.matchStart)
                        );

                    }
                }

                c.beginPath();
                c.arc(this.x(d.x), this.y(d.y), radius * this.zoom, 0, Math.PI * 2);
                c.fill();
                c.closePath();

            }
        }


        if(this.bShowPickups){

            const itemSize = this.pY(0.5) * this.zoom;

            let itemX = 0;
            let itemY = 0;

            for(let i = 0; i < this.items.length; i++){

                d = this.items[i];

            // console.log("StartPosition = "+d.x+","+d.y+","+d.z+" display position = "+this.x(d.x)+","+this.y(d.y));
                c.fillStyle = "white";
                

                itemX = -this.xOffset + this.x(d.x);
                itemY = -this.yOffset + this.y(d.y)

                if(mouseX >= itemX - itemSize && mouseX <= itemX + itemSize){

                    if(mouseY >= itemY - itemSize && mouseY <= itemY + itemSize){

                        updateTextBox(
                            "Pickup Location", 
                            this.fixItemName(d.name), 
                            ""
                        );

                        
                        c.fillStyle = "yellow";
                    }
                }

                c.beginPath();
                c.arc(this.x(d.x), this.y(d.y), itemSize, 0, Math.PI * 2);
                c.fill();
                c.closePath();

                //c.fillText(d.name,this.x(d.x), this.y(d.y));
            }
        }


        c.strokeStyle = "rgb(16,16,16)";
        c.lineWidth = this.pY(0.2);

        for(let i = 0; i < this.flagPositions.length; i++){
         
            d = this.flagPositions[i];

            c.fillStyle = "red";
            if(d.team == 1){
                c.fillStyle = "blue";
            }else if(d.team == 2){
                c.fillStyle = "green";
            }else if(d.team == 3){
                c.fillStyle = "yellow";
            }

            c.fillRect(this.x(d.x), this.y(d.y), this.pY(3) * this.zoom, this.pY(1.6) * this.zoom);
            c.strokeRect(this.x(d.x), this.y(d.y), this.pY(3) * this.zoom, this.pY(1.6) * this.zoom);

            c.fillStyle = "rgb(16,16,16)";

            c.fillRect(this.x(d.x), this.y(d.y), this.pY(0.125) * this.zoom, this.pY(5) * this.zoom);

        }



        if(this.bShowFlagDrops){
            c.fillStyle = "orange";


            let flagDropX = 0;
            let flagDropY = 0;

            if(this.flagDrops != undefined){
                //console.table(this.flagDrops);
                for(let i = 0; i < this.flagDrops.length; i++){

                    d = this.flagDrops[i];

                    c.beginPath();
                    c.arc(this.x(d.x), this.y(d.y), radius * this.zoom, 0, Math.PI * 2);
                    c.fill()
                    c.closePath();

                    flagDropX = -this.xOffset + this.x(d.x);
                    flagDropY = -this.yOffset + this.y(d.y);

                    if(mouseX >= flagDropX - (radius * this.zoom) && mouseX <= flagDropX + (radius * this.zoom)){

                        if(mouseY >= flagDropY - (radius * this.zoom) && mouseY <= flagDropY + (radius * this.zoom)){
                            updateTextBox(
                                "Flag Drop Location", 
                                this.getPlayerName(d.player_id)+" dropped the flag.", 
                                "Timestamp: "+this.mmss(d.time - this.matchStart)
                            );
                        }
                    }
                }
            }
        }

        c.fillStyle = "yellow";

        //console.table(this.domPositions);

        let domX = 0;
        let domY = 0;
        const domSize = this.pY(4) * this.zoom;

        for(let i = 0; i < this.domPositions.length; i++){

            d = this.domPositions[i];

            domX = -this.xOffset + this.x(d.x);
            domY = -this.yOffset + this.y(d.y);

            if(mouseX >= domX && mouseX <= domX + domSize){

                if(mouseY >= domY && mouseY <= domY + domSize){

                    updateTextBox(
                        "Domination Point", 
                        d.name,
                        "Capped a total of "+d.count+" times."
                    );
                }
            }

            c.drawImage(this.domIcon, this.x(d.x), this.y(d.y), domSize, domSize);

        }

        if(bShowBox){

            const boxWidth = this.pX(25);
            const boxHeight = this.pY(10);

            let bX = this.xOffset + mouseX;
            let bY = this.yOffset + mouseY;

            if(bX + boxWidth > this.canvas.width){
                bX = this.canvas.width - boxWidth;
            }

            if(bY + boxHeight > this.canvas.height){
                bY = this.canvas.height - boxHeight;
            }
            

            c.fillStyle = "black";
            c.strokeStyle = "rgba(255,255,255,0.1)";

            c.lineWidth = this.pY(0.25);

            c.fillRect(bX, bY, boxWidth, boxHeight);
            c.strokeRect(bX ,bY, boxWidth, boxHeight);

           

            c.textAlign = "center";

            c.font = this.pY(1.9)+"px Arial";

            c.fillStyle = "yellow";

            c.fillText(boxTitle, bX + (boxWidth * 0.5), bY + (boxHeight * 0.1));

            c.fillStyle = "white";

            c.font = this.pY(1.6)+"px Arial";

            c.fillText(boxText, bX + (boxWidth * 0.5), bY + (boxHeight * 0.4));
            c.fillText(boxText2, bX + (boxWidth * 0.5), bY + (boxHeight * 0.4) + (boxHeight * 0.26));
            c.textAlign = "left";
        }

        c.textAlign = "left";

        this.renderHUD();
    }


    resetClick(){

        this.click.x = -999;
        this.click.y = -999;
    }

    renderHUD(){

        //const bounds = this.canvas.getBoundingClientRect();

        const c = this.c;
        c.textBaseline = "top";

        c.fillStyle = "black";

        c.fillRect(0,0, this.canvas.width, this.canvas.height * 0.1);


        c.fillStyle = "white";
        c.textAlign = "right";

        c.font = this.setFontSize(2.2)+"px Arial";

        c.fillText("Zoom: "+(this.zoom * 100).toFixed(0)+"%", this.pX(61), this.pY(1));



        c.fillText("X: "+this.xOffset.toFixed(2), this.pX(99), this.pY(1));
        c.fillText("Y: "+this.yOffset.toFixed(2), this.pX(99), this.pY(5));

        c.textAlign = "left";

        //c.fillText(this.mouse.x + "," + this.mouse.y , this.mouse.x, this.mouse.y);

        //c.fillText((-this.xOffset + this.mouse.x) + "," + (-this.yOffset + this.mouse.y), this.mouse.x, this.mouse.y + 100);


        c.strokeStyle = "rgba(255,255,255,0.5)";
        c.lineWidth = this.pY(0.25);

        let stringWidth = c.measureText("Show Spawns").width;

        const green = "rgb(30,185,30)";
        const red = "rgb(185,30,30)";


        let x = this.pX(1);
        let y = this.pY(1);
        const boxHeight = this.pY(3);
        const boxWidth = this.pX(15);

        const row1 = this.pY(1);
        const row2 = this.pY(5.5);

        const col1 = this.pX(1);
        const col2 = this.pX(18);
        const col3 = this.pX(35);
        const col4 = this.pX(52);


        const renderButton = (string, bShow, x, y) =>{

            //const stringWidth = c.measureText(string).width;

            c.fillStyle = green;

            if(!bShow){
                c.fillStyle = red;
            }

            c.fillRect(x, y, boxWidth, boxHeight);
            c.strokeRect(x, y, boxWidth, boxHeight);

            c.fillStyle = "white";

            c.fillText(string, x + (boxWidth * 0.5), y + (boxHeight * 0.2));
        }

        const bClickInRange = (x, y) =>{

            if(this.click.x >= x && this.click.x <= x + boxWidth){

                if(this.click.y >= y && this.click.y <= y + boxHeight){

                    return true;

                }
            }

            return false;
        }


        //has user clicked a button in last frame

        c.textAlign = "center";

        if(bClickInRange(x, y)){
            this.bShowSpawns = !this.bShowSpawns;
            this.resetClick();
        }

        renderButton("Show Spawns", this.bShowSpawns, x, y);

        y = row2;

        if(bClickInRange(x, y)){
            this.bShowPickups = !this.bShowPickups;
            this.resetClick();
        }
            
        renderButton("Show Pickups", this.bShowPickups, x, y);


        y = row1;
        x = col2;

        if(bClickInRange(x, y)){

            this.bShowKills = !this.bShowKills;
            this.resetClick();
        }

        renderButton("Show Kills", this.bShowKills, x, y);

        y = row2;

        if(bClickInRange(x, y)){
            this.bShowDeaths = !this.bShowDeaths;
            this.resetClick();
        }

        renderButton("Show Deaths", this.bShowDeaths, x, y);

        y = row1;
        x = col3;

        if(bClickInRange(x, y)){
            this.bShowFlagKills = !this.bShowFlagKills;
            this.resetClick();
        }

        renderButton("Show Flag Kills", this.bShowFlagKills, x, y);

        y = row2;

        if(bClickInRange(x, y)){
            this.bShowFlagDrops = !this.bShowFlagDrops;
            this.resetClick();
        }

        renderButton("Show Flag Drops", this.bShowFlagDrops, x, y);



        x = col4;
        y = row1;

        if(bClickInRange(x, y)){
            this.bShowFlagReturns = !this.bShowFlagReturns;
            this.resetClick();
        }

        renderButton("Show Flag Returns", this.bShowFlagReturns, x, y);
        
        c.textAlign = "left";

    }

    setMapScale(){


        const padding = 250;

        this.xOffset = 0;
        this.yOffset = 0;
        this.zOffset = 0;

        let minX = null;
        let minY = null;
        let minZ = 0;

        let maxX = null;
        let maxY = null;
        let maxZ = 0;


        const updateMinMax = (d) =>{

            if(d.x < minX || minX == null){
                minX = d.x;
            }

            if(d.x > maxX || maxX == null){
                maxX = d.x;
            }

            if(d.y < minY || minY == null){
                minY = d.y;
            }

            if(d.y > maxY || maxY == null){
                maxY = d.y;
            }

            /*if(d.z != undefined){

                if(d.z < minZ || i == 0){
                    minZ = d.z;
                }

                if(d.z > maxZ || i == 0){
                    maxZ = d.z;
                }
            }*/

        }

        let d = 0;


       // console.table(this.spawns);
        for(let i = 0; i < this.spawns.length; i++){

            d = this.spawns[i];

            updateMinMax(d);
        }

        for(let i = 0; i < this.items.length; i++){

            d = this.items[i];

            updateMinMax(d);
        }

        for(let i = 0; i < this.kills.length; i++){

            d = this.kills[i];
            updateMinMax({"x": d.victim_x, "y":d.victim_y});
            updateMinMax({"x": d.killer_x, "y":d.killer_y});

        }

        for(let i = 0; i < this.domPositions.length; i++){

            d = this.domPositions[i];

            updateMinMax(d);
        }

        if(this.spawns.length > 0 || this.items.length > 0 || this.kills.length > 0){
            this.bNoData = false;
        }

        const totalX = Math.abs(maxX - minX);
        const totalY = Math.abs(maxY - minY);


        //this.xOffset = minX + (totalX * 0.5);
        //this.yOffset = minY + (totalY * 0.5) + this.canvas.height;
        

        console.log("totlaX = "+ totalX);
        console.log("totlaY = "+ totalY);

        this.xBit = 100 / totalX;
        this.yBit = 100 / totalY;

        //console.log(this.xBit * totalX);

        this.totalX = totalX;
        this.totalY = totalY;

        console.log("this.xBit = "+this.xBit)

        this.c.fillRect(0,0,this.canvas.width, this.canvas.height);

        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
        this.render();
       
    }


    updatePosition(){
        
        //console.log("up = "+  this.keys[87]);

        const speed = 20;

        if(this.keys[87]){
            this.yOffset -= speed;
        }

        if(this.keys[83]){
            this.yOffset += speed;
        }

        if(this.keys[65]){
            this.xOffset -= speed;
        }

        if(this.keys[68]){
            this.xOffset += speed;
        }

        

        //console.log(this.xOffset + "," + this.yOffset);
    }


    updateFlagEventsData(){


        const getMatchingKill = (time, killer, victim) =>{

            let d = 0;

            for(let i = 0; i < this.kills.length; i++){

                d = this.kills[i];

                if(d.time > time){
                    return null;
                }

                if(arguments.length === 3){

                    if(d.time == time && d.killer == killer && d.victim == victim){
                        return d;
                    }

                }else{

                    if(d.time == time && d.victim == victim){
                        return d;
                    }
                }
            }

            return null;
        }

        let d = 0;
        let currentKill = null;
        

        for(let i = 0; i < this.flagKills.length; i++){

            d = this.flagKills[i];

            currentKill = getMatchingKill(d.time, d.killer, d.victim);

            if(currentKill != null){

                this.flagKills[i].x = currentKill.killer_x;
                this.flagKills[i].y = currentKill.killer_y;
            }
        }



        this.flagDrops = [];
        this.flagReturns = [];

        if(this.flagEvents != undefined){
            for(let i = 0; i < this.flagEvents.length; i++){

                d = this.flagEvents[i];

                if(d.type == "dropped"){

                    //console.log(d);
                    this.flagDrops.push(d);

                    currentKill = getMatchingKill(d.time, -1, d.player_id, true);

                    console.log(currentKill);

                    if(currentKill != null){

                        this.flagDrops[this.flagDrops.length - 1].x = currentKill.victim_x;
                        this.flagDrops[this.flagDrops.length - 1].y = currentKill.victim_y;
                    }

                }else if(d.type == "return"){

                    this.flagReturns.push(d);

                    //currentKill = getMatchingKill();

                }
            }
        }


        console.table(this.flagDrops);
        //console.table(this.flagKills);
    }


    updateSpawnCount(){


        console.table(this.spawns);

        for(let i = 0; i < this.spawns.length; i++){

            this.spawns[i].count = 0;
        }

        console.table(this.spawns);


        const updateSpawnCount = (x, y, z) =>{

            let d = 0;

            for(let i = 0; i < this.spawns.length; i++){

                d = this.spawns[i];

                if(d.x == x && d.y == y && d.z == z){
                    this.spawns[i].count++;
                    return;
                }
            }

            console.log("spawn point not found for this spawn");
        }

        let d = 0;

        for(let i = 0; i < this.spawnData.length; i++){

            d = this.spawnData[i];

            updateSpawnCount(d.x, d.y, d.z);

        }


        console.log(this.details);

        //console.table(this.spawns);
    }

    loadKills(){

        return new Promise((resolve, reject) =>{

            const x = new XMLHttpRequest();

            x.onreadystatechange = () =>{

                if(x.status == 200 && x.readyState == 4){
                    //alert('fuck');
                    this.kills = JSON.parse(x.responseText);
                    //console.log(x.responseText);

                   // console.table(this.kills);

                    if(this.kills.length > 0){

                        //check if the kill data is older version(no distance data)
                        for(let i = 0; i < this.kills.length; i++){

                            if(this.kills[i].distance > 0){
                                this.bNoData = false;
                            }
                        }
                    }
                    
                    resolve();
                }
            }

            let id = this.details.matchId;

            if(id == undefined){
                id = 1;
            }

            if(id != id){
                id = 1;
            }

            x.open("get","/json/match/kills_ext?id="+id);
            x.send();

        });     
    }

    loadFlagPositions(){

        return new Promise((resolve, reject) =>{

            const x = new XMLHttpRequest();

            x.onreadystatechange = () =>{

                if(x.status == 200 && x.readyState == 4){

                    //console.log(x.responseText);

                    this.flagPositions = JSON.parse(x.responseText);

                    if(this.flagPositions.length > 0){
                        this.bNoData = false;

                        this.updateFlagEventsData();
                    }
                    resolve();
                }
            }

            x.open("get", "/json/map/flags?id="+this.details.mapId);
            x.send();

        });
    }

    loadSpawnData(){

        return new Promise((resolve, reject) =>{

            const x = new XMLHttpRequest();

            this.spawnData = [];

            x.onreadystatechange = () =>{

                if(x.status == 200 && x.readyState == 4){

                    this.spawnData = JSON.parse(x.responseText);

                    //console.table(this.spawnData);

                    this.updateSpawnCount();
                    resolve();
                }
            }

            x.open("get", "/json/match/spawns?id="+this.details.matchId);
            x.send();

        });
    }


    updateDomPositions(){


        for(let i = 0; i < this.domPositions.length; i++){

            this.domPositions[i].count = 0;
        }

        console.table(this.domPositions);

        const updateCount = (name, value) =>{

            for(let i = 0; i < this.domPositions.length; i++){

                if(this.domPositions[i].name == name){
                    this.domPositions[i].count = value;
                    return;
                }
            }
        }

        for(let i = 0; i < this.domTotalCaps.length; i++){

            updateCount(this.domTotalCaps[i].point_name, this.domTotalCaps[i].total_caps);

        }

        console.table(this.domPositions);
    }


    loadDomTotalCaps(){

        return new Promise((resolve, reject) =>{

            const x = new XMLHttpRequest();

            x.onreadystatechange = () =>{

                if(x.status == 200 && x.readyState == 4){

                    this.domTotalCaps = JSON.parse(x.responseText);

                    this.updateDomPositions();
                    resolve();
                }
            }

            x.open("get", "/json/match/domcaps?id="+this.details.matchId);
            x.send();
        });

    }

    tick(){


        setInterval(() =>{
            this.updatePosition();
            this.render();
        }, 25);
    }
}