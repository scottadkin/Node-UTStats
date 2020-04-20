
class RecentMatchDisplay{

    constructor(parent){

        this.parent = document.getElementById(parent);

        this.displayBox("test servfer<a href=\"www.example.com\">www.google.com</a> namne", 33);

    }

    displayBox(serverName, matchId, mapImage, mapName, gametypeName, date, matchLength, players){


        const wrapper = document.createElement("div");
        wrapper.className = "home-recent-match-test";

        const serverElem = document.createElement("div");
        serverElem.className = "home-recent-match-test-server";
        serverElem.appendChild(document.createTextNode(serverName));

        this.parent.appendChild(wrapper);

        wrapper.appendChild(serverElem);

        wrapper.innerHTML += '<a href="/match?id='+matchId+'">hfdh';



        wrapper.innerHTML += '</a>';
   

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