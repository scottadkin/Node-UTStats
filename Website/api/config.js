

const Config = {
    "siteName": "Ooper ut stats",
    "port": 1337,

    "mysqlHost": "localhost",
    "mysqlUser": "root",
    "mysqlPassword": "",
    "mysqlDatabase": "node_utstats",
    "mysqlPort": 3306,
    "sessonTable": "nutstats_sessions",



    "matchesPerPage":25,
    "playersPerPage":50,
    "rankingsHomePerPage":10,
    "rankingsPerPage":50,
    "mapsPerPage":10,
    "defaultMap":"default",
    "recordsPerPage": 50,
    "recordsPerPageDefault": 10,

    "mapsDir": "public/files/maps/",
    "mapsExt": ".jpg",

    "facesDir": "public/files/faces/",
    "facesExt": ".png",
    "defaultFace": "faceless",

    "monstersDir": "public/files/monsters/",
    "bHomeDisplayFaces": true,
    "bHomeDisplayMonsters": true,
    "bHomeDisplayCountries": true,
    "bHomeDisplayPlayers": true,
    "bHomeDisplayRecent": true,
    "bHomeDisplayGametypes": true,
    "bHomeDisplayMaps": true,
    "bHomeDisplayServers": true,

    "bNavDisplayHome": true,
    "bNavDisplayRecentMatches": true,
    "bNavDisplayRankings": true,
    "bNavDisplayPlayers": true,
    "bNavDisplayMaps": true,
    "bNavDisplayRecords": true,
    "bNavDisplayBunnytrack": true,
    "bNavDisplayAdmin": true,
   

    "homeMaxMonsters": 5,
    "homeMaxFaces": 5,
    "homeMaxVoices": 5,
    "homeMaxCountires":5,
    "homeMaxMatches": 5,
    "homeMaxGametypes": 5,
    "bHomeMergeServers": true,

    "btRecentTimes": 10,
    "btRecentRecords": 10,
    "btTimesPerPage": 50,

    "mapsResultsPerPage":25,


    "minPlayers": 0,
    "minMatchLength": 0, //how many seconds a match needs to be to be displayed,,
    "minTopScore": 0, //only show matches that have a player with at least 20 frags in the match
    "minFlagCaps": 1, //only show matches that have at least 1 flag cap

    "maxLoginAttempts": 10,
    "loginLockoutTimeLimit": 600, // amount of seconds until a user can try and login in after exceeding maxLoginAttempts,
    "maxSessionLength": 1,//amount of seconds until a users session expires, default 30 minutes

    //"monsterImagesDir": "../public/files/monsters/"

    "serverQueryInterval": 1, // how many minutes inbetween queries to server
    

    "adminUsername": "username", //can not be username
    "password": "password", //can not be password
    "minUsernameLength": 2,
    "minPasswordLength": 6,


    "nexgenStatsGametypes": [
        "Capture The Flag",
        "Capture The Flag (Instagib)"
    ],


    "maxAceLogs": 20
};




module.exports = Config;