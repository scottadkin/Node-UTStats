const config = require('./api/config');
const fs = require('fs');
const Promise = require('promise');
const Map = require('./api/map');

const M = new Map();

const maps = [];

async function importMap(file){

    const stats = fs.statSync(config.mapsDir + file);

    maps.push({
        "file": file,
        "size": stats.size
    });

    await M.importInsertMap(file, stats.size);       
}


async function importMaps(){

    const files = fs.readdirSync(config.mapsDir);

    if(files != undefined){

        for(let i = 0; i < files.length; i++){

            await importMap(files[i]);
        }
    }  
}

async function startImport(){

    try{

        await importMaps();
        console.log("Imported all maps total = "+maps.length);
        console.table(maps)

    }catch(err){
        console.trace(err);
    }
}


startImport();