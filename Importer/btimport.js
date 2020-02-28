const mysql = require('./api/database');
const config = require('./api/config');
const Bunnytrack = require('./api/bunnytrack');
const Message = require('./api/message');

const bt = new Bunnytrack();


async function importBTRecords(){


    try{

        await bt.readBtIni();
        await bt.readBtIni(true);
        bt.createRecordObjects();

        await bt.p.getPlayerMasterIds(bt.playerNames);
        await bt.insertBlankGametypeData();
        await bt.p.getPlayerMasterIds(bt.playerNames);
        await bt.checkWhatMapsExists();
        await bt.insertNewMaps();
        await bt.checkWhatMapsExists();
        await bt.deleteOldRecords();
        await bt.insertRecords();
        bt.moveImportedInis();

       new Message("pass","Inserted all records from BTPlusPlus.ini");

    }catch(err){
        
        console.trace(err);
        new Message("error","Failed to import bt.ini records: "+err);

    }
}



importBTRecords();
    
