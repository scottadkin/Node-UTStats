
const mysql = require('./database');
const Promise = require('promise');
const config = require('./config');





class Records{


    constructor(bHome, page, type, category, gametype){

        if(bHome){

            this.start = 0;
            this.limit = config.recordsPerPageDefault;
            
        }else{

            page = parseInt(page);

            if(page != page){
                page = 1;
            }

            page = page - 1;

            if(page < 0){
                page = 0;
            }

            this.limit = config.recordsPerPage;
            this.start = this.limit * page;
        }


        if(type != undefined){
            this.type = type;
        }
        
        if(category != undefined){
            this.category = category;
        }


        this.gametype = 0;

        if(gametype != undefined){
            this.gametype = parseInt(gametype);

            if(this.gametype != this.gametype){
                this.gametype = 0;
            }
        }
        

        this.matchRecords = [];
        this.allTimeRecords = [];

        this.playerIds = [];
        this.playerNames = [];


        this.matchIds = [];

        this.pages = 1;


        this.columns = [
            "deaths",
            "kills",
            "points",
            "suicides",
            "team_kills",
            "eff",
           // "ttl",
            "flag_caps",
            "flag_covers",
            "flag_grabs",
            "flag_returns",
            "flag_assists",
            "flag_kills",
            "m7",
            //"s7",
            "best_spree",
            "best_multi",
            "spawn_kills",
            "best_spawn_kill_spree",
            "play_time",
            "dom_caps",
            "assault_caps",
           // "total_matches",
            "monster_kills"
        ];
    }

    setGametype(gametype){

        this.gametype = 0;

        if(gametype != undefined){
            this.gametype = parseInt(gametype);

            if(this.gametype != this.gametype){
                this.gametype = 0;
            }
        }
    }

    bCanDisplay(column){

        let d = 0;

        for(let i = 0; i < this.displayStatus.length; i++){

            d = this.displayStatus[i];

            if(d.column_name == column){
                return true;
            }
        }
        return false;
    }

    getDefault(){


        return this.getDisplayStatus().then(() =>{

            const promises = [];

            //console.table(this.displayStatus);
            

            for(let i = 0; i < this.columns.length; i++){

                if(this.bCanDisplay(this.columns[i])){

                    //console.log(this.columns[i]+" is set to VIEW");
                    promises.push(this.getAllTime(this.columns[i]));
                    promises.push(this.getMatchRecords(this.columns[i]));
                }else{
                   // console.log(this.columns[i]+" is set to hidden skipping");
                }
            }

            return Promise.all(promises);

        });

        
       
    }

    getSingle(){

        return new Promise((resolve, reject) =>{

            if(this.type == "all"){

                return this.getAllTime(this.category).then(() =>{

                    return this.getAllTimeRecordCount(this.category);

                }).then(() =>{

                    resolve();

                }).catch((err) =>{

                    reject(err);

                });

            }else if(this.type == "match"){

                return this.getMatchRecords(this.category).then(() =>{

                    return this.getAllMatchRecordCount(this.category);

                }).then(() =>{

                    resolve();

                }).catch((err) =>{

                    reject(err);

                });

            }else{
                reject("unknown type");
            }

        });
        
    }

    getAllTime(type){

        return new Promise((resolve, reject) =>{

            const index = this.columns.indexOf(type);

            if(index != -1){

                let category = this.columns[index];

                if(category == "play_time"){
                    category = "total_time";
                }

                const query = "SELECT id,name,flag,"+category+" FROM nutstats_player_totals WHERE gametype=? AND "+category+" != 0 ORDER BY "+category+" DESC LIMIT ?, ?";

               // console.log(query);
                //console.log("SELECT id,name,flag,"+category+" FROM nutstats_player_totals WHERE gametype=0 ORDER BY "+category+" DESC LIMIT "+this.start+", "+this.limit);

                mysql.query(query, [this.gametype, this.start, this.limit], (err, result) =>{

                    if(err){
                        console.trace(err);
                        reject(err);
                    }

                    const data = [];

                    if(result != undefined){

                        for(let i = 0; i < result.length; i++){

                            //result[i].type = category;

                            if(this.playerNames.indexOf(result[i].name) == -1){
                                this.playerNames.push(result[i].name);
                                result[i].flag = result[i].flag.toLowerCase();
                            }

                            result[i].value = result[i][category];
                            data.push(result[i]);
                        }

                       // console.table(result);

                        this.allTimeRecords.push({"type": category,"data": data});
                    }

                    resolve();
                });

            }else{

                reject(type+" is not a valid records category.");
            }

        });     
    }


    getMatchRecords(type){

        return new Promise((resolve, reject) =>{

            const index = this.columns.indexOf(type);

            if(index != -1){

                let vars = [this.gametype, this.start, this.limit];

                const category = this.columns[index];

                let query = "SELECT id,name,match_id,player_id,flag,"+category+" FROM nutstats_player WHERE "+category+" != 0 AND gametype=? ORDER BY "+category+" DESC LIMIT ?, ?";

                if(this.gametype == 0){
                    vars = [this.start, this.limit]
                    query = "SELECT id,name,match_id,player_id,flag,"+category+" FROM nutstats_player WHERE "+category+" != 0 AND gametype LIKE '%' ORDER BY "+category+" DESC LIMIT ?, ?";
                }
               // console.log("SELECT id,name,match_id,player_id,flag,"+category+" FROM nutstats_player WHERE "+category+" != 0 AND gametype="+this.gametype+" ORDER BY "+category+" DESC LIMIT "+this.start+", "+this.limit);
                
                mysql.query(query, vars, (err, result) =>{

                    if(err) reject(err);
                    
                    const data = [];

                    if(result != undefined){

                        for(let i = 0; i < result.length; i++){

                            //result[i].type = category;
                            result[i].flag = result[i].flag.toLowerCase();
                            
                            if(this.playerIds.indexOf(result[i].player_id) == -1){
                                this.playerIds.push(result[i].player_id);
                            }

                            if(this.playerNames.indexOf(result[i].name) == -1){
                                this.playerNames.push(result[i].name);
                            }

                           // console.log(result[i].match_id+" ("+this.matchIds.indexOf(result[i].match_id)+")");
                            if(this.matchIds.indexOf(result[i].match_id) == -1){

                                this.matchIds.push(result[i].match_id);
                            }

                            result[i].value = result[i][category];

                            data.push(result[i]);
                        }

                        this.matchRecords.push({"type": category, "data": data});
                        
                    }
                    resolve();
                });

            }else{

                reject(type+" is not a valid records category.");
            }
            

        });
    }


    getAllTimeRecordCount(type){

        return new Promise((resolve, reject) =>{

            let index = this.columns.indexOf(type);

            if(index != -1){

                let column = this.columns[index];

                if(column == "play_time"){
                    column = "total_time";
                }
                
                let query = "SELECT COUNT(*) as total_rows FROM nutstats_player_totals WHERE "+column+" != 0 AND gametype=?";
                let vars = [this.gametype];

                if(this.gametype == 0){
                    query = "SELECT COUNT(*) as total_rows FROM nutstats_player_totals WHERE "+column+" != 0 AND gametype=0";
                    vars = [];
                }

                this.results = 0;

                mysql.query(query, vars, (err, result) =>{

                    if(err) reject(err);

                // console.log("TOTAL ROWS = "+result[0].rows);

                    if(result != undefined){

                        this.results = result[0].total_rows;

                        this.pages = Math.ceil(this.results / config.recordsPerPage);
                        
                    }

                    resolve();

                });

            }else{

                reject("Category doesn't exist");
            }
        });
    }


    getAllMatchRecordCount(type){

        return new Promise((resolve, reject) =>{


            const index = this.columns.indexOf(type);
            const column = this.columns[index];

            let query = "SELECT COUNT(*) as total_rows FROM nutstats_player WHERE "+column+" !=0 AND gametype=?";

            let vars = [this.gametype];

            if(this.gametype == 0){
                query = "SELECT COUNT(*) as total_rows FROM nutstats_player WHERE "+column+" !=0 AND gametype LIKE '%'";
                vars = [];
            }
            this.results = 0;

            mysql.query(query, vars, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.results = result[0].total_rows;
                    this.pages = Math.ceil(this.results / config.recordsPerPage);

                }
                resolve();
            });
        });
    }

    getRecordsStatus(){

        this.data = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,bdisplay FROM nutstats_records";

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

            if(id != id){
                reject("id is NaN");
            }

            if(value != value){
                reject("value is NaN");
            }

            if(value != 1 && value != 0){
                reject("value is not a valid option");
            }

            const query = "UPDATE nutstats_records SET bdisplay=? WHERE id=? LIMIT 1";

            mysql.query(query, [value, id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    getDisplayStatus(){


        this.displayStatus = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_records WHERE bdisplay=1";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    this.displayStatus = result;
                }

               // console.table(result);

                resolve();
            });

        });
    }
}



module.exports = Records;