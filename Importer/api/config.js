

const Config = {
    host:"localhost", //database host
    user:"root",    //database user
    password:"", // database password
    database:"14node_utstats", // database name
    port: "3306",   //database port

    ftpServers: [
        {"host": "127.0.0.1", "port": 21, "user": "scott", "password": "password"}
       // {"host": "127.0.0.1", "port": 21, "user": "scott", "password": "password"},
        //{"host": "127.0.0.1", "port": 21, "user": "scott", "password": "password"},
    ],

    bDeleteFilesFromFTP: true,

    bIgnoreBots: false,
    bIgnoreDuplicates: false,
    bMoveTmpFiles: true,
    tmpFileTimeMoveLimit: 300 * 60 , // minutes * seconds
    bMoveLogFiles: false,
    multiKillTimeLimit: 3,
    minCaps: 1, //Ignore matches that don't have any caps (BT and CTF)
    minPlayers: 0, // set this to 2 if you want to ignore matches that only have 1 human player
    importInterval: 60 * 1000, //seconds * miliseconds
    tmpDir: "Logs/tmpfiles/",
    logDir: "Logs/",
    importDir: "Logs/imported/" ,
    btMaxCapTime: 600000,
   // acePrefix: "[ACE] - ",
    //acePlayerPrefix: "[ACE-PLAYER] - ",
    aceSShotDir: "Shots/",
    bMoveAceLogs: true,
    aceImportDir: "Logs/ace/",
    btPlusPlusIni: "System/BTPlusPlus.ini",
    btGameIni: "System/BTGame.ini",
    mapsDir: "Maps/"
};



module.exports = Config;