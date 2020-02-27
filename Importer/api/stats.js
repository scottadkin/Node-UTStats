const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');



class Stats{


    constructor(date){


        //console.log("date = "+date);

        this.date = date;

        this.fixDate();
        this.setData();
    }

    fixDate(){

        const reg = /^unreal\.nglog\.(\d{4})\.(\d{2})\.(\d{2}).+$/i;


        if(reg.test(this.date)){

            const result = reg.exec(this.date);
            this.year = parseInt(result[1]);
            this.month = parseInt(result[2]);
            this.day = parseInt(result[3]);

            //this.month = this.month - this.month;
        }else{


            this.year = 0;
            this.month = 0;
            this.day = 0;
        }

    }

    setData(){


        const date = new Date(this.year, this.month, this.day);

        let day = date.getDay();


        const strings = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];   

        this.dayString = strings[day];

    }


    createNewDay(){


        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_days VALUES(NULL,?,?,1)";


            mysql.query(query, [this.month, this.day], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    updateDay(){


        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_days SET matches=matches+1 WHERE month=? AND day=?";

            mysql.query(query, [this.month, this.day], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    checkIfDayExists(){


        return new Promise((resolve, reject) =>{


            const checkQuery = "SELECT COUNT(*) as total_rows FROM nutstats_days WHERE month=? AND day=?";

            mysql.query(checkQuery, [this.month, this.day], (err, result) =>{

                if(err) reject(err);

                this.bDayExist = false;
                
                if(result != undefined){

                    if(result.length > 0){

                        if(result[0].total_rows == 0){
                            
                            this.bDayExist = false;
                        }else{
                            this.bDayExist = true;
                        }
                    }
                }


                resolve();
            });
            
        });
    }



    updateDaysOfWeek(){


        return new Promise((resolve, reject) =>{


            const checkQuery = "SELECT COUNT(*) as total_results FROM nutstats_days_of_week WHERE name=?";

            const newQuery = "INSERT INTO nutstats_days_of_week VALUES(NULL,?,1)";

            const updateQuery = "UPDATE nutstats_days_of_week SET matches=matches+1 WHERE name=?";


            mysql.query(checkQuery, [this.dayString], (err, result) =>{

                if(err){
                    console.trace(err);
                    reject(err);
                }

                if(result[0].total_results == 0){

                    mysql.query(newQuery, [this.dayString], (err) =>{

                        if(err) reject(err);

                        resolve();
                    });        

                }else{

                    mysql.query(updateQuery, [this.dayString], (err) =>{

                        if(err) reject(err);

                        resolve();
                    });
                }

            });
        });
    }

    async updateDayStats(){


        await this.checkIfDayExists();
        if (this.bDayExist) {
            await this.updateDay();
        }
        else {
            await this.createNewDay();
        }
        await this.updateDaysOfWeek();
        new Message("pass", "Day stats updated.");
    }


}




module.exports = Stats;