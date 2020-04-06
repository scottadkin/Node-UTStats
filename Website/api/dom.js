const mysql = require('./database');
const Promise = require('promise');




class Dom{


    constructor(matchId){

        this.matchId = parseInt(matchId);




       // console.log("Match id = "+matchId);
    }

    getTeamscoreData(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT team_id, points, time FROM nutstats_dom_teamscore WHERE match_id=? ORDER BY time ASC";

            mysql.query(query, [this.matchId], (err, result) =>{

                if(err) throw(err);


                this.teamscoreData = result;

                resolve();
            });
        });
    }



    getPointCaptures(){


        return new Promise((resolve, reject) =>{


            const query = "SELECT player_id, point_name, time FROM nutstats_dom_captures WHERE match_id=? ORDER BY time ASC";


            mysql.query(query, [this.matchId], (err, result) =>{

                if(err) reject(err);


                console.log(result);
                this.capturesData = result;
                resolve();
            });
        });
    }

    deleteMatchData(id){


        return this.deleteDomScores(id).then(() =>{

            return this.deleteDomPlayerScores(id);

        }).then(() =>{

            return this.deleteDomTeamScores(id);
        });
    }

    deleteDomTeamScores(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_dom_teamscore WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    deleteDomPlayerScores(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_dom_playerscore WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    deleteDomScores(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const query = "DELETE FROM nutstats_dom_captures WHERE match_id=?";

            mysql.query(query, [id], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    getTotalCaps(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT point_name,COUNT(*) as total_caps FROM nutstats_dom_captures WHERE match_id=? GROUP BY point_name";

            this.capTotals = [];

            mysql.query(query, [this.matchId], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    this.capTotals = result;
                }

                resolve();
            });
        });
    }
}


module.exports = Dom;