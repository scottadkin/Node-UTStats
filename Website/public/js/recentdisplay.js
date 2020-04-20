
class RecentMatchDisplay{

    constructor(parent, maps, gametypes, mapThumbs, mapImages){

        this.parent = document.getElementById(parent);

        this.maps = maps;
        this.gametypes = gametypes;
        this.mapThumbs = mapThumbs;
        this.mapImages = mapImages;
        
       // console.table(maps);
        console.table(mapImages);


    }


    stripPrefix(input){

        const reg = /^.+?\-(.+)$/i;

        const result = reg.exec(input);

        if(result != null){

            return result[1];
        }

        return input;
    }

    getMapThumb(name){

        let d = 0;

        for(let i = 0; i < this.mapThumbs.length; i++){

            d = this.mapThumbs[i];

            if(d.name == undefined){
                if(d == name+".jpg"){
                    return d;
                }
            }else{
                if(d.name == name){
                    return d.file;
                }
            }
        }

        return null;

    }

    getMapFullsize(name){

        let d = 0;

        for(let i = 0; i < this.mapImages.length; i++){

            
            d = this.mapImages[i];

            console.log("looking for "+name+" found"+d);
            console.log(d);

            if(d.name == undefined){
                if(d == name+".jpg"){
                    return d;
                }
            }else{
                if(d.name == name){
                    return d.file;
                }
            }
        }

        return null;

    }

    getMapImage(mapName){

        console.log("mapName = "+mapName);
        mapName = mapName.toLowerCase();
        const altName = this.stripPrefix(mapName);
        console.log("Looking for image for "+mapName+ " or "+altName+"");

        const dir = "files/maps/";
        const thumbsDir = "files/maps/thumbs/";



        const prefixThumb = this.getMapThumb(mapName);
        const thumb = this.getMapThumb(altName);

        const prefixFullsize = this.getMapFullsize(mapName);
        const fullsize = this.getMapFullsize(altName);


       console.log("PrefixThumb = "+prefixThumb);
        console.log("PrefixFullSize = "+prefixFullsize);

        console.log("thumb = "+thumb);
        console.log("fullSize = "+fullsize);

        if(prefixThumb != null){
            return thumbsDir+prefixThumb;
        }

        if(prefixFullsize != null){
            return dir+prefixFullsize;
        }

        if(thumb != null){
            return thumbsDir+thumb;
        }

        if(fullsize != null){
            return thumbsDir+fullsize;
        }


        return thumbsDir+"default.jpg";

        
    }

    getMapName(id){

        for(let i = 0; i < this.maps.length; i++){

            if(this.maps[i].id == id){
                return this.maps[i].name;
            }
        }

        return 'Not Found';
    }

    getGametypeName(id){

        for(let i = 0; i < this.gametypes.length; i++){

            if(this.gametypes[i].id == id){
                return this.gametypes[i].name;
            }
        }
        return 'Not Found';
    }

    getWinnerElems(totalTeams, result){

        const outter = document.createElement("div");

        if(totalTeams >= 2){

            const redTeam = document.createElement("div");
            const blueTeam = document.createElement("div");
            
            redTeam.className = "team-red";
            blueTeam.className = "team-blue";


            redTeam.appendChild(document.createTextNode(result.red));
            blueTeam.appendChild(document.createTextNode(result.blue));

            outter.appendChild(redTeam);
            outter.appendChild(blueTeam);

            if(totalTeams >= 3){

                const greenTeam = document.createElement("div");
                greenTeam.className = "team-green";

                greenTeam.appendChild(document.createTextNode(result.green));

                outter.appendChild(greenTeam);

                if(totalTeams == 3){
                    outter.className = "tripple-test";
                }

            
                if(totalTeams >= 4){

                    const yellowTeam = document.createElement("div");
                    yellowTeam.className = "team-yellow";

                    yellowTeam.appendChild(document.createTextNode(result.yellow));

                    outter.appendChild(yellowTeam);

                    outter.className = "quad-test";
                }
            }else{
                outter.className = "double-test";
            }

        }else{

            const solo = document.createElement("div");
            solo.className = "team-grey";
            

            solo.appendChild(document.createTextNode(result.dmWinner));

            outter.appendChild(solo);
            outter.className = "solo-test";
        }


        return outter;
    }

    displayBox(serverName, matchId, mapImageUrl, map, gametype, date, matchLength, players, totalTeams, result){


        const wrapper = document.createElement("div");
        wrapper.className = "home-recent-match-test";

        const serverElem = document.createElement("div");
        serverElem.className = "home-recent-match-test-server";
        serverElem.appendChild(document.createTextNode(serverName));

        this.parent.appendChild(wrapper);

        wrapper.appendChild(serverElem);

      //  wrapper.innerHTML += '<a href="/match?id='+matchId+'">';

        const innerElem = document.createElement("div");
        innerElem.className = "home-recent-match-test-inner";

        const imageElem = document.createElement("div");
        
        const mapImage = document.createElement("img");

        const mapImageSource = this.getMapImage(this.getMapName(map));
        mapImage.src = mapImageSource;
        mapImage.alt = "image";

        innerElem.appendChild(imageElem);
        imageElem.appendChild(mapImage);


        const infoElem = document.createElement("div");
        infoElem.className = "home-recent-match-test-info";

        const mapSpan = document.createElement("span");
        mapSpan.className = "yellow";
        mapSpan.appendChild(document.createTextNode(this.getMapName(map)));

        infoElem.appendChild(mapSpan);

        infoElem.innerHTML += "<br>";
        infoElem.appendChild(document.createTextNode(this.getGametypeName(gametype)));
        infoElem.innerHTML += '<br>Played <span class="date">'+date+'</span><br>';
        infoElem.innerHTML += '<span class="yellow">Length <span class="date-alt">'+matchLength+'</span></span><br>';
        infoElem.innerHTML += 'Players '+players;

        innerElem.appendChild(infoElem);

        const winnerElems = this.getWinnerElems(totalTeams, result);

        innerElem.appendChild(winnerElems);


        wrapper.appendChild(innerElem);





        //wrapper.innerHTML += '</a>';

        wrapper.innerHTML = '<a style="color:white" href="/match?id='+matchId+'">'+wrapper.innerHTML+'</a>';
   

        /*return `<div class="home-recent-match-test">
                    <div class="home-recent-match-test-server">${ this.htmlentities(serverName) }</div>
                    <a style="color:white" href="/match?id=${ this.htmlentities(matchId) }">
                    <div class="home-recent-match-test-inner">                
                        <div>        
                            <img src="${ this.htmlentities(mapImage) }" alt="sshot"/>                
                        </div>    
                        <div class="home-recent-match-test-info">
                            
                            <span class="yellow">${ this.htmlentities(mapName) }</span><br>
                            ${ this.htmlentities(gametypeName) }<br>
                            Played <span class="date">${ this.htmlentities(date) }</span> <br>   
                            <span class="yellow">Length <span class="date-alt">${ this.htmlentities(matchLength) }</span></span><br>
                            Players ${players}<br>                   
                        </div>
                        <div>
                            
                            <div class="double-test">
                                <div class="team-red">3</div>
                                <div class="team-blue">0</div>
                            </div>

                        </div>
                    </div>
                    </a>
                </div>`;*/
    }
}