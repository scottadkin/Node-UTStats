const LogParser = require('./api/logparser');
const Message = require('./api/message');
const config = require('./api/config');


new Message("startup","--------------------------------------------------");
new Message("startup","--------------------------------------------------");
new Message("startup","------- Node UTStats Import Module Started -------");
new Message("startup","---------- Created by Scott Adkin ----------------");
new Message("startup","---------- Build April 2020 ----------------------");
new Message("startup","---- To change settings go to /api/config.js -----");
new Message("startup","--------------------------------------------------");





let l = new LogParser();

setInterval(() =>{

    if(l.bFinished){

        l = new LogParser();
               
    }else{
        new Message("note", "Last import has not completed yet, skipping.");
    }

}, config.importInterval);



//app.listen(1337);