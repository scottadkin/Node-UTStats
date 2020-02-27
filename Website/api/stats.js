const mysql = require('./database');
const Promise = require('promise');

class Stats{


    constructor(){

        this.date = new Date();

        this.day = this.date.getDate();
        this.month = this.date.getMonth() + 1;
        this.year = this.date.getFullYear();

        console.log(this.day+" - "+this.month+" - "+this.year);

    }

    getTodaysHits(){
        
        this.todaysHits = [];

        for(let i = 0; i < 24; i++){

            this.todaysHits.push({"hour":i,"hits": 0});
            
        }


        this.todaysTotalHits = 0;

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_hits WHERE day=? AND month=? AND year=?";

            mysql.query(query, [this.day, this.month, this.year], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    //this.todaysHits = result;

                    for(let i = 0; i < result.length; i++){

                        this.todaysHits[result[i].hour].hits = result[i].hits;
                        this.todaysTotalHits += result[i].hits;
                    }
                }

                console.table(this.todaysHits);
                resolve();
            });
        });

    }

    getTotalHits(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT SUM(hits) as total_views from nutstats_hits";

            this.totalHits = 0;

            mysql.query(query, (err, result) =>{

                if(err) reject(err);


                if(result != undefined){
                    this.totalHits = result[0].total_views;
                }

                resolve();
                
            });
        });

    }


    getThisMonthsHits(){


        this.monthsHits = [];
        this.totalMonthsHits = 0;

        return new Promise((resolve, reject) =>{

            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            function daysInMonth (month, year) {
                return new Date(year, month, 0).getDate();
            }

            const totalDays = daysInMonth(month, year) + 1;
            this.totalDays = totalDays;

            console.log("YEAR = "+year);
            console.log("month = "+month);

            for(let i = 0; i < totalDays; i++){

                this.monthsHits.push(0);
            }
            
            const query = "SELECT day,SUM(hits) as total_hits FROM nutstats_hits WHERE year=? AND month=? GROUP BY day ORDER BY day ASC";
            mysql.query(query, [year, month], (err, result) =>{

                if(err) reject(err);

                if(result != undefined){
                    //this.monthsHits = result;

                    for(let i = 0; i < result.length; i++){
                        this.monthsHits[result[i].day] = result[i].total_hits;

                        this.totalMonthsHits += result[i].total_hits;
                    }

                    this.monthsHits.splice(0,1);
                    console.table(this.monthsHits);
                }

                resolve();
            });
        });
    }

}



module.exports = Stats;