const LogParser = require('./api/logparser');
const Message = require('./api/message');
const config = require('./api/config');


new Message("startup","--------------------------------------------------");
new Message("startup","--------------------------------------------------");
new Message("startup","--------- NUTStats Import Module Started ---------");
new Message("startup","---------- Create by Scott Adkin -----------------");
new Message("startup","---------- Build 276 October 2019 ----------------");
new Message("startup","---- To change settings go to /api/config.js -----");
new Message("startup","--------------------------------------------------");
new Message("startup","------------- Reimport all logs-------------------");
new Message("startup","--------------------------------------------------");





const l = new LogParser(true);
