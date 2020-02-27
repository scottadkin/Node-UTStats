const mysql = require('./database');

class Dates{


    constructor(timeStamp){

        this.timeStamp = timeStamp;

        this.date = new Date(this.timeStamp * 1000);

       // console.log("timestamp = "+this.timeStamp);

        //console.log(this.date);

        this.setValues();
    }

    setValues(){

        this.day = this.date.getDate();
      //  console.log("day of match is"+this.day);

        this.month = this.date.getMonth();
       // console.log("Month is "+this.month);

        this.dayOfWeek = this.date.getDay();
        //console.log("day of the week is "+this.dayOfWeek);


        this.year = this.date.getFullYear();

        this.processDay();
        this.processMonth();
        
    }

    processMonth(){

        const query = "SELECT id FROM nutstats_months WHERE year=? AND month=?";

        mysql.query(query, [this.year, this.month], (err, result) =>{

            if(err) throw err;

            if(result.length > 0){
                this.updateMonth(result[0].id);
            }else{
                this.updateMonth(-1);
            }
        });
    }


    insertMonth(){

        const query = "INSERT INTO nutstats_months VALUES(NULL,?,?,1)";

        mysql.query(query, [this.year, this.month], (err) =>{
            if(err) throw err;
        });
    }

    updateMonth(monthId){


        if(monthId == -1){
            this.insertMonth();
        }else{


            const query = "UPDATE nutstats_months SET matches=matches+1 WHERE id=?";

            mysql.query(query, [monthId], (err)=>{
                if(err) throw err;
            });
        }
    }

    processDay(){

        const query = "SELECT id FROM nutstats_days WHERE day=?";


        mysql.query(query,[this.dayOfWeek], (err, result) =>{
            if(err) throw err;

            //console.log(result);

            if(result.length > 0){
                //return result[0].id;
                this.updateDay(result[0].id);
            }else{
                this.updateDay(-1);
            }
        });



        //return -1;
    }

    insertDay(){


        const query = "INSERT INTO nutstats_days VALUES(NULL,?,1)";

        mysql.query(query, [this.dayOfWeek], (err) =>{

            if(err) throw err;
        });
    }


    updateDay(dayId){

        //const dayId = this.getDayId();

        if(dayId == -1){
            this.insertDay();
        }else{


            const query = "UPDATE nutstats_days SET matches=matches+1 WHERE id=?";

            mysql.query(query, [dayId], (err)=>{
                if(err) throw err;
            });
        }
    }
}


module.exports = Dates;