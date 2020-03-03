const mysql = require('./database');
const Promise = require('promise');
const config = require('./config');
const Message = require('./message');





class Gametype{


    constructor(){

        this.gametypeName = "";

        this.currentGametypes = [];
        this.currentGametypesData = [];
    }



    getHomeData(){

        return new Promise((resolve, reject) =>{

            this.allTimeData = [];

            const query = "SELECT * FROM nutstats_gametype WHERE bdisplay=1 ORDER BY matches DESC LIMIT ?";

            mysql.query(query, [config.homeMaxGametypes], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.allTimeData = result;
                }

                resolve();
            });
        });
    }


    getAllTimeData(){

        return new Promise((resolve, reject) =>{

            this.allTimeData = [];

            const query = "SELECT * FROM nutstats_gametype WHERE bdisplay=1 ORDER BY matches DESC";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                this.allTimeData = result;


                resolve();

            });
        });
    }


    getGametypeName(id){

       id = parseInt(id);

       return new Promise((resolve, reject) =>{

        const query = "SELECT name FROM nutstats_gametype WHERE id=?";

        mysql.query(query, [id], (err, result) =>{

            if(err) reject(err);

           // if(!Array.isArray(result)){
           //     resolve();
           // }

            if(typeof result == 'undefined' || result == null || result == undefined){
                resolve();
            }
            if(result.length > 0){
                this.gametypeName = result[0].name;
            }else{
                this.gametypeName = "unknown gametype";
            }
            resolve();
        });
    });
    }


    getGametypeNames(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nutstats_gametype";

            this.gametypeNames = [];

            mysql.query(query, (err, result) =>{

                if(err){
                    //console.log(err);
                    reject(err);
                }

                this.gametypeNames = result;



                resolve();
            });
        });
    }



    getGametypesOrderByMatches(){

        this.data = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_gametype WHERE bdisplay=1 ORDER BY matches DESC";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                this.data = result;
                resolve();
            });
        });
    }


    getGametypesByIds(ids){

        this.gametypes = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nutstats_gametype WHERE id IN(?)";

            if(ids.length > 0){
                mysql.query(query, [ids], (err, result) =>{

                    if(err) reject(err);

                    this.gametypes = result;

                    resolve();
                });
            }else{
                new Message("warning", "Gametype.getGametypeByIds() is not an array or it's length is 0");
                resolve();
                //reject("Gametype.getGametypeByIds(ids) is not an array or it's length is 0");
            }
        });
    }


    reduceTotals(id, playtime){

       // id = parseInt(id);
       // playtime = parseFloat(playtime);



        return new Promise((resolve, reject) =>{

            if(playtime == undefined){
               // console.log("playtime = "+playtime);
                //console.log("SKIPPING playtime = NaN");
                resolve();
            }

            if(id == undefined){
              //  console.log("id = "+id);
               // console.log("SKIPPING id = NaN");
                resolve();
            }

            const query = "UPDATE nutstats_gametype SET matches=matches-1, total_time=total_time-? WHERE id=?";

            mysql.query(query, [playtime, id], (err) =>{

                //console.log(err);
                if(err) reject(err);

                resolve();
            });
        });
    }

    getAll(){

        return new Promise((resolve, reject) =>{
            
        });
    }


    getAllNames(){

        this.names = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nutstats_gametype ORDER BY name ASC";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.names = result;
                }

                resolve();
            });
        });
    }



    getGametypeId(name){

        name = name.toLowerCase();

        

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name FROM nutstats_gametype WHERE name=? LIMIT 1";

            mysql.query(query, [name], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    if(result.length > 0){
                        this.currentGametypes.push(result[0]);
                    }
                }
                resolve();
            });
        });
    }


    getCurrentGametype(name){

        name = name.toLowerCase();

        if(this.currentGametypes.length > 0){

            let d = 0;

            for(let i = 0; i < this.currentGametypes.length; i++){

                d = this.currentGametypes[i];

                if(d.name.toLowerCase() == name){
                    return d;
                }
            }
        }

        return null;
    }


    getAll(){


        this.data = [];

        return new Promise((resolve, reject) =>{


            const query = "SELECT id,name,matches,bdisplay FROM nutstats_gametype";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.data = result;
                }
                resolve();
            });
        });
    }


    updateViewStatus(id, value){

        id = parseInt(id);
        value = parseInt(value);

        return new Promise((resolve, reject) =>{

            if(id != id) reject("id is NaN");

            if(value != value) reject("value is NaN");

            if(value != 0 && value != 1) reject("value is not a valid value")

            const query = "UPDATE nutstats_gametype SET bdisplay=? WHERE id=? LIMIT 1";

            mysql.query(query, [value, id], (err) =>{

                if(err) reject(err);

                resolve();
            }); 

        });
    }

}



module.exports = Gametype;