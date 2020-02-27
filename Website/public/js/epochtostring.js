



function EpochToString(date, maxUnits, compareTo){

    this.currentDate = date;
        
    this.maxUnits = maxUnits;

    const target = new Date();

    this.target = Math.floor(target.getTime() / 1000);

    if(compareTo != undefined){

        this.target = compareTo;
        
    }

    this.offset = Math.abs(this.target - this.currentDate);

   // console.log(this.offset);

    this.currentBits = [];

    this.currentValues = {
        "seconds":0,
        "minutes":0,
        "hours":0,
        "days":0,
        "weeks":0,
        "years":0
    };


    this.strings = [
        "year",
        "week",
        "day",
        "hour",
        "minute",
        "second"
    ];

   

    this.setValues = () =>{


        /*let seconds = this.offset % 60;
        let minutes = (this.offset / 60) % 60;
        let hours = (this.offset / (60 * 60)) % 24;
        let days = (this.offset / ((60 * 60) * 24)) % 7;
        let weeks = (this.offset / (((60 * 60) * 24) * 7)) % 4;
        let years = (this.offset / ((60 * 60) * 24)) / 365;*/





        const SECOND = 1;
        const MINUTE = 60;
        const HOUR = 60 * 60;
        const DAY = HOUR * 24;
        const WEEK = DAY * 7;
        const YEAR = DAY * 365;



        seconds = this.offset % 60;
        minutes = this.offset / MINUTE;
        hours = this.offset / HOUR;
        days = this.offset / DAY;
        weeks = this.offset / WEEK;
        years = this.offset / YEAR;


        //console.log("years = "+years+"\n weeks = "+weeks+" \ndays = "+days+" \nhours = "+hours+" \nminutes = "+minutes+" \nseconds = "+seconds+"\n"+this.offset);

        minutes = minutes % 60;
        hours = hours % 24;
        days = days % 7;
        weeks = weeks % 52;
        


        
        seconds = Math.floor(seconds);
        minutes = Math.floor(minutes);
        hours = Math.floor(hours);
        days = Math.floor(days);
        weeks = Math.floor(weeks);
        years = Math.floor(years);


       // console.log("years = "+years+" weeks = "+weeks+" days = "+days+" hours = "+hours+" minutes = "+minutes+" seconds = "+seconds);

        this.currentValues.seconds = seconds;
        this.currentValues.minutes = minutes;
        this.currentValues.hours = hours;
        this.currentValues.days = days;
        this.currentValues.weeks = weeks;
        this.currentValues.years = years;

        //console.log(this.currentValues);

        if(this.offset < 60){
            return this.offset+" seconds"
        }
    }


    this.setParts = (value, type) =>{

        if(arguments.length === 0){

            this.currentBits = [];
            return;
        }

        if(value != 0){
            this.currentBits.push({"type": type, "value": value});
        }
    }


    this.fixPostFix = (string, value) =>{



        if(string == undefined){
            return "";
        }

        if(value == 1){
            return string;
        }

        if(value != 1){

            const lastChar = string[string.length - 1];

            if(lastChar.toLowerCase() == "s"){

                return string+"'";
            }else{

                return string+"s";
            }
        }
    }

    this.setStrings = () =>{


        let currentIndex = 0;       

        const values = [
            this.currentValues.years,
            this.currentValues.weeks,
            this.currentValues.days,
            this.currentValues.hours,
            this.currentValues.minutes,
            this.currentValues.seconds,
        ];

        while(currentIndex < values.length){
            
            if(values[currentIndex] != 0){
                this.setParts(values[currentIndex], this.fixPostFix(this.strings[currentIndex], values[currentIndex]));
            }

            currentIndex++;

        }


    }
    

    this.getString = () =>{

        this.setStrings();

        let string = "";

        for(let i = 0; i < this.currentBits.length; i++){

            
            if(i < this.maxUnits){

                if(this.currentBits[i].value != undefined && this.currentBits[i].type != undefined){
                    string += this.currentBits[i].value+" "+this.currentBits[i].type;
                }


                if(i < this.maxUnits - 1 && i < this.currentBits.length - 1){
                    string += ", ";
                }

            }

            
        }

        if(this.currentBits.length == 0){
            string = "";
        }

        return string;
    }

    this.setValues();


}
