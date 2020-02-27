


class ACP{


    constructor(){
        console.log("mew AC{P");
    }


    static deleteMatch(id){
       
        return new Promise((resolve, reject) =>{

            id = parseInt(id);

            console.log("TRYTING TO FDRLYR match id = "+id);

            if(id !== id){
            // console.log("id must be a number");
                reject("id must be a number");
            }
            const x = new XMLHttpRequest();

            x.onreadystatechange = () =>{

                if(x.status == 200 && x.readyState == 4){

                    console.log("response=" +x.responseText);
                    resolve();
                }
            }

            x.open("post","/admin/delete/match/");
            x.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            x.send("id="+id);

        });
        
    }
}




(() =>{
    const className = "delete";

    const elems = document.getElementsByClassName(className);

    console.log(elems);

    let currentParent = null;

    if(elems.length > 0){

        for(let i = 0; i < elems.length; i++){

            currentParent = elems[i].parentElement;

            if(currentParent != null){

                ((index, parent) =>{

                    //const index = i;

                    elems[index].addEventListener("mousedown", () =>{
                    
                        console.log(parent.dataset.matchid);
                        //const parent = currentParent;
                            parent.style.cssText = "background-color:rgb(150,0,0)";
                        ACP.deleteMatch(parent.dataset.matchid).then(() =>{
                            console.log(index);
                            parent.style.cssText = "display:none;";
                        }).catch((err) =>{
                            console.trace(err);
                        });
                        
                    });
                })(i, currentParent);
                
            }
        }
    }

})();



(() =>{

    

    const elem = document.getElementById('player-output');
    const nameBox = document.getElementById('admin-player-select');
    const ipBox = document.getElementById("admin-ip-select");
    const countryBox = document.getElementById("admin-country-select");
    const searchButton = document.getElementById("admin-search-button");


    let currentIps = [];


    function refresh(){

        elem.innerHTML = `<div class="small-loading">Loading data...</div>`;
    }

    function getPlayerIps(name, ip, country){


        const x = new XMLHttpRequest();

        refresh();


        x.onreadystatechange = () =>{

            if(x.status == 200 && x.readyState == 4){

               // console.log(x.responseText);

                currentIps = JSON.parse(x.responseText);
                console.log(currentIps);

                elem.innerHTML = ``;

                //elem.innerHTML += `<div class="admin-info"><div class="default-header">Found Ips</div>`;

                currentIps.sort((a, b) =>{

                    a = a.uses;
                    b = b.uses;

                    if(a < b){
                        return 1;
                    }else if(a > b){
                        return -1;
                    }

                    return 0;
                });

                elem.innerHTML += `
                    <div class="admin-player-ip">
                        <div class="yellow">Name</div>
                        <div class="yellow">IP</div>
                        <div class="yellow">Country</div>
                        <div class="yellow">Total Uses</div>
                    </div>`;

                for(let i = 0; i < currentIps.length; i++){

                    elem.innerHTML += `
                    <div class="admin-player-ip">
                        <div>${currentIps[i].name}</div>
                        <div>${currentIps[i].ip}</div>
                        <div><img src="files/flags/${currentIps[i].flag.toLowerCase()}.png" alt="flag"> ${currentIps[i].country}</div>
                        <div>${currentIps[i].uses}</div>
                    </div>`;
         
                }

               // elem.innerHTML+= `</div>`;

                
            }
        }

        x.open("POST","/admin/json/");
        x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        x.send("mode=playerips&name="+name+"&ip="+ip+"&country="+country);
    }




    function getPlayerAceDetails(name, ip){


        const x = new XMLHttpRequest();

       // let data = [];


        x.onreadystatechange = () =>{


            if(x.status == 200 && x.readyState == 4){

                const elem = document.getElementById("player-output-ace");

                const data = JSON.parse(x.responseText);

                if(data.length == 0){
                    elem.innerHTML = "";
                    return;
                }

                elem.innerHTML = `<div class="default-header">ACE Search Results</div><div class="data-default player-out-ace yellow">
                    <div>Name</div>
                    <div>IP</div>
                    <div>OS</div>
                    <div>Hardware Details</div>
                    <div>Uses</div>
                </div>`;

                


                for(let i = 0; i < data.length; i++){

                    elem.innerHTML += `<div class="data-default player-out-ace">
                        <div>${data[i].name}</div>
                        <div>${data[i].ip}</div>
                        <div>${data[i].os}</div>
                        <div>
                            <span class="yellow">HWID: </span>${data[i].hwid}<br>
                            <span class="yellow">MAC1: </span>${data[i].mac1}<br>
                            <span class="yellow">MAC2: </span>${data[i].mac2}
                        </div>
                        
                        <div>${data[i].total_uses}</div>
                    </div>`;
                }

                console.log(data);
            }
        }

        x.open("POST", "/admin/json/");
        x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        x.send("mode=ace&name="+name+"&ip="+ip);
    }


    if(searchButton != undefined){

        searchButton.addEventListener("click", () =>{

            getPlayerIps(nameBox.value, ipBox.value,'');
            getPlayerAceDetails(nameBox.value, ipBox.value);

        });

    }

    

})();

