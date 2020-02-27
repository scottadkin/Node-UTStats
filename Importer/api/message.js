class Message{



    constructor(type, message){

        this.message = message;
        this.type = type;

        


        this.output();
    }



    output(){

        let fontColor = "\x1b[37m";
        let bgColor = "\x1b[0m";

        let start = "[Notice]: ";

        switch(this.type.toLowerCase()){
            case "error": { fontColor = "\x1b[31m"; start = "[Error]: " } break;
            case "warning": { fontColor = "\x1b[33m"; start = "[Warning]: " } break;
            case "pass": { fontColor = "\x1b[32m"; start = "[Success]: " } break;
            case "note": { fontColor = "\x1b[35m"; start = "[Notice]: " } break;
            case "startup": { fontColor = "\x1b[36m"; start = "[Start Up]: " } break;
        }

        const now = new Date();

        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();

        if(hours < 10){

            hours = "0"+hours;
        }

        if(minutes < 10){
            minutes = "0"+minutes;
        }

        if(seconds < 10){
            seconds = "0"+seconds;
        }

        //console.trace(this.message);
        let dateString = "["+hours+":"+minutes+":"+seconds+"]";
        console.log(fontColor, dateString+start+this.message, "\x1b[0m");
    }


}



module.exports = Message;