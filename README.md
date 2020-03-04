# Node UTStats ftp
 Both importer and website combined into one module with ftp support


# Requirements 
- Node.js
- MYSQL
- UTStats mutator
- Node UTStats mutator


# Warning

- Current mapimport.js has not been changed to work with the ftp module.

# Install

- Place the contents of the archive into a folder.
- Open the website folder then open the Api folder in it.
- Open config.js and edit the mysql host, user, password, and database to the one you want to connect with.
- Change the website adminname and admin password in the same file to something other than username and password.
- Now go back to the website main folder.
- Run the command "npm install" from the command line to install dependencies.
- Now run the command "node install", this will create the database needed. If you don't have permission to create a database but have an empty database then run the command "node installalt" instead. If you are **upgrading from Node UTStats version 9 or above you can run "npm upgrade" to update your current database to work with the new version.**
- Now the website and database has been set up go back to the main folder where Website and Importer folders are.
- Now open the Importer folder.
- Run the command "npm install" to install dependencies.
- Now open the api folder.
- Open config.js and edit the mysql host, user, password, and database to the one you want to connect with.


# Connecting to FTP servers

You can add ftp servers you want to connect with by editing the ftpServers array in the Imported/api/config.js, there are no limit to how many ftp servers you want to connect with. The Imported module is set up
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
