const Promise = require('promise');
const Message = require('./message');
const mysql = require('./database');


class Items{



    constructor(matchId, mapId, data, itemPositionData, players){

        this.matchId = matchId;
        this.mapId = mapId;
        this.data = data;
        this.itemPositionData = itemPositionData;
        this.players = players;

    }

    insertPickup(data){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_pickups VALUES(NULL,?,?,?,?,0)";

           const vars = [
                this.matchId, 
                this.players.getMasterId(data.player), 
                data.time, 
                data.item
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });

        });
    }

    async insertPickups(){

        new Message("note", "Importing pickup data.");
        for(let i = 0; i < this.data.length; i++){

            await this.insertPickup(this.data[i]);
        }
    }


    insertPickupLocation(vars){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_item_locations VALUES(NULL,?,?,?,?,?,?,?)";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
            
        });
    }

    async insertPickupLocations(){

        
        let d = 0;

        new Message("note", "Importing item/pickup/weapon/ammo locations.");

        for(let i = 0; i < this.itemPositionData.length; i++){

            d = this.itemPositionData[i];

            await this.insertPickupLocation([
                this.matchId,
                this.mapId,
                d.type,
                d.name,
                d.x,
                d.y,
                d.z]
            );
        }


    }
}


module.exports = Items;