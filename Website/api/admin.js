const mysql = require('./database');
const Promise = require('promise');
const crypto = require('crypto');
const config = require('./config');
const Matches = require('./matches');



class Admin{

    constructor(){
        console.log("new admin");

        this.totalUsers = -1;

        this.adminAccounts = -1;
    }   


    setTotalUserCount(){


        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_users";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result[0] != undefined){
                        this.totalUsers = result[0].total_rows;
                    }
                }

                resolve();
            });
        });
    }

    /*
    login(name, pass){

        this.bLoggedIn = false;
        this.username = false;
        this.bAdmin = false;

        return new Promise((resolve, reject) =>{

            const query = "SELECT * FROM nutstats_users WHERE name=? AND password=? AND bAdmin=1";

            const hash = crypto.createHash("sha256");

            hash.update(pass);
            const newPass = hash.digest('hex');

           // console.log("SELECT * FROM nutstats_users WHERE name="+name+" AND password="+newPass+" AND bAdmin=1");

            mysql.query(query, [name, newPass], (err, result) =>{

                if(err) reject(err);

               // console.table(result);

                if(result != undefined){

                    if(result.length > 0){

                        if(result.length == 1){
                            this.bLoggedIn = true;
                            this.bAdmin = true;
                            this.username = result[0].name;
                            this.userId = result[0].id;
                        }
                    }

                }else{
                    this.bLoggedIn = false;
                }

                resolve();

            });
        });
        /*const hash = crypto.createHash("sha256");
        console.log("Name: "+name);
        console.log("Pass: "+pass);

        const secret = "d74ff0ee8da3b9806b18c877dbf29bbde50b5bd8e4dad7a3a725000feb82e8f1";

        hash.update(pass);

        const answer = hash.digest('hex');


        hash.end();

        if(answer === secret){

            for(let i = 0; i < 5; i++){

                console.log("dogs have wet noses");
            }
        }*/
    //}


    login(name, pass){

        console.log("Name is "+name+" it should be "+config.adminUsername);
        console.log("pass is "+name+" it should be "+config.password);
        
        if(name === config.adminUsername && pass === config.password){
            this.bLoggedIn = true;
            return true;
        }
        this.bLoggedIn = false;
        return false;
    }

    bAdminAccountCreated(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT COUNT(*) as total_rows FROM nutstats_users WHERE bAdmin=1";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result != undefined){

                    if(result[0].total_rows != undefined){

                        this.adminAccounts = result[0].total_rows;
                    }
                }

                resolve();
            });


        });
    }


    createAdminAccount(name, pass1, pass2){

        return new Promise((resolve, reject) =>{

            const hash = crypto.createHash("sha256");

            const hashedPassword = hash.digest('hex');

            //console.log("name = "+name);
            if(name.length >= config.minUsernameLength){

                if(pass1 !== pass2){
                    reject("The password you have entered do not match each other.");
                }else{

                    if(pass1.length >= config.minPasswordLength){

                        const query = "INSERT INTO nutstats_users VALUES(NULL,?,?,1)";

                        mysql.query(query, [name, hashedPassword], (err) =>{

                            if(err) reject(err);

                            resolve();
                        });

                        //resolve();

                    }else{
                        reject("Your password must be at least "+config.minPasswordLength+" characters long.");
                    }
                }

            }else{
                reject("Username must be at least "+config.minUsernameLength+" characters long.");
            }

        });
        

    }

    deleteMatch(id){

        id = parseInt(id);

        return new Promise((resolve, reject) =>{

            const m = new Matches();


            m.deleteMatch(id).then(() =>{
                console.log();
                resolve();
            }).catch((err) =>{
                reject(err);
            });
        });
    }


}

module.exports = Admin;