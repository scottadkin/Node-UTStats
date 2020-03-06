# Node UTStats
Node UTStats is a remake of the utstats system originally created in 2005 by azazel, AnthraX and toa, Node UTStats is made using node.js, the original version used PHP. Node UTStats also tracks a lot more data than the original UTStats and supports more custom gametypes.


# Supported Gametypes
- Deathmatch
- Team DeathMatch
- Capture The Flag
- Domination
- Assault
- Last Man Standing
- Monster Hunt
- Bunnytrack
- Coop
- Siege (basic support)


# Requirements 
- Node.js
- MYSQL
- UTStats mutator


# Installing the Database and Website

- Place the contents of the archive into a folder.
- Open the website folder then open the Api folder in it.
- Open config.js and edit the mysql host, user, password, and database to the one you want to connect with.
- Change the website adminname and admin password in the same file to something other than username and password.
- Now go back to the website main folder.
- Run the command "npm install" from the command line to install dependencies.
- Now run the command "node install", this will create the database needed. If you don't have permission to create a database but have an empty database then run the command "node installalt" instead. If you are **upgrading from Node UTStats version 9 - 10D you can run "npm upgrade" to update your current database to work with the new version.**

# Installing the Importer

- Now the website and database have been set up go to the main folder where Website and Importer folders are.
- Now open the Importer folder.
- Run the command "npm install" to install dependencies.
- Now open the api folder.
- Open config.js and edit the mysql host, user, password, and database to the one you want to connect with.

# Installing the UTStats and Node UTStats Mutators
Node UTStats uses the already exisiting UTStats mutator as a base and extends it with the Node UTStats mutator.
- First download the original UTStats mutator from [this package](http://ut-files.com/index.php?dir=Stats/&file=utstats_beta428.zip "UTStats 428")
- Now follow the install directions for the mutator ignoring the website setup in the readme.txt.
- Now open the Node UTStats Mutator folder and place the file NodeUTStats.u in your servers System folder. Example: "C:/UnrealTournament/System"
- While in the the UnrealTournament System folder, open the file UnrealTournament.ini
- Now look for a block called **[Engine.GameEngine]** or **[XC_Engine.XC_GameEngine]** if you are using XC_Engine.
- Now add the following line at the bottom of the block **ServerActors=NodeUTStats.NodeUTStatsServerActor**

# Connecting to FTP servers

You can add ftp servers you want to connect with by editing the ftpServers array in the Importer/api/config.js, there are no limit to how many ftp servers you want to connect with. The Imported module is set up
by default to connect directly to your unreal tournament servers main directory e.g C:/UnrealTournament/
```
ftpServers: [
    {"host": "127.0.0.1", "port": 21, "user": "scott", "password": "password"}
    // {"host": "127.0.0.1", "port": 21, "user": "scott", "password": "password"},
    //{"host": "127.0.0.1", "port": 21, "user": "scott", "password": "password"},
],
```


# Running the website
- Go into the website folder.
- Open command prompt and type the command "node app"
- The website is now accessible by www.example.com:1337

# Running the Importer

- Go into the Imported folder.
- Open command prompt and type the command "node app"
- The importer will now go through all the connected servers and import logs, by default it will check every minute to find new longs to import, you can change this in Importer/api/config.js and changing 
```
 importInterval: 60 * 1000, //seconds * miliseconds
 to change it to every ten minutes replace the line with this one
importInterval: 600 * 1000, //seconds * miliseconds
```
- To import bt records run the command "node btimport".
- To import all maps in the Maps/ dir run the command "node mapimport"


# Importing Bunnytrack records
- To import records from btPlusPlus.ini and or btgame.ini run the command "node btimport" in the importer directory, this will only work after you have used the main import function first as it downloads a copy of the bunnytrack ini files.

# Setting up ACE

- By default ACE doesn't save player information to log files, to get the most out of this module you will have to change a few lines in UnrealTournament.ini so ACE will save player information that will help admins ban trouble makers.
- Find this section in UnrealTournament.ini [ACEv11d_S.ACEActor].
- Now find the following lines and change them to the following
```
bExternalLog=true
bExternalLogJoins=true
JoinLogPath=../Logs/
JoinLogPrefix=[ACE-PLAYER]
```

# Setting up Nexgenstats viewer
You can now connect Nexgen Stats Viewer, to add a gametype to be fetched simply add the gametype name(case insensitive) to the nexgenStatsGametypes array in config.js (Website folder)

Here is an example of what the nexgen.ini snippet would look like if you are connecting to localhost:1337/nexgenstats
```
[NexgenStatsViewer105.NSVConfigExt]
lastInstalledVersion=105
enableUTStatsClient=True
utStatsHost=localhost
utStatsPort=1337
utStatsPath=/nexgenstats
```

# Thanks to
- Original creators of the utstats mutators
- esnesi (Lead tester)
- ue (tester)