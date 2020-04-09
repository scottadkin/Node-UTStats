/**
 * Only to be used to upgrade from version 9 or 10 to version 11
 *  
**/ 

const mysql = require('./api/database');
const Promise = require('promise');
const Message = require('./api/message');



const queries = [
    `ALTER TABLE nutstats_map ADD size INT NOT NULL AFTER first`,
    `ALTER TABLE nutstats_kills ADD distance FLOAT NOT NULL AFTER time`,
    `ALTER TABLE nutstats_player ADD shortest_distance_kill FLOAT NOT NULL AFTER monster_kills`,
    `ALTER TABLE nutstats_player ADD longest_distance_kill FLOAT NOT NULL AFTER shortest_distance_kill`,
    `ALTER TABLE nutstats_player ADD shortest_kill_time FLOAT NOT NULL AFTER longest_distance_kill`,
    `ALTER TABLE nutstats_player ADD longest_kill_time FLOAT NOT NULL AFTER shortest_kill_time`,
    `ALTER TABLE nutstats_player_totals ADD shortest_distance_kill FLOAT NOT NULL AFTER gametype_position`,
    `ALTER TABLE nutstats_player_totals ADD longest_distance_kill FLOAT NOT NULL AFTER shortest_distance_kill`,
    `ALTER TABLE nutstats_player_totals ADD shortest_kill_time FLOAT NOT NULL AFTER longest_distance_kill`,
    `ALTER TABLE nutstats_player_totals ADD longest_kill_time FLOAT NOT NULL AFTER shortest_kill_time`,
    `CREATE TABLE nutstats_map_spawn_points (
        id int(11) NOT NULL,
        map_id int(11) NOT NULL,
        name varchar(50) NOT NULL,
        team int(2) NOT NULL,
        x float NOT NULL,
        y float NOT NULL,
        z float NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

      `ALTER TABLE nutstats_map_spawn_points
      ADD PRIMARY KEY (id);`,

      `ALTER TABLE nutstats_map_spawn_points
      MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

      `ALTER TABLE nutstats_kills ADD killer_x FLOAT NOT NULL AFTER distance`,
      `ALTER TABLE nutstats_kills ADD killer_y FLOAT NOT NULL AFTER killer_x`,
      `ALTER TABLE nutstats_kills ADD killer_z FLOAT NOT NULL AFTER killer_y`,
      `ALTER TABLE nutstats_kills ADD victim_x FLOAT NOT NULL AFTER killer_z`,
      `ALTER TABLE nutstats_kills ADD victim_y FLOAT NOT NULL AFTER victim_x`,
      `ALTER TABLE nutstats_kills ADD victim_z FLOAT NOT NULL AFTER victim_y`,

      `CREATE TABLE nutstats_flag_kills (
        id int(11) NOT NULL,
        match_id int(11) NOT NULL,
        time FLOAT NOT NULL,
        killer int(11) NOT NULL,
        victim float NOT NULL,
        kill_distance float NOT NULL,
        distance_to_cap float NOT NULL,
        distance_to_base float NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

      `ALTER TABLE nutstats_flag_kills
      ADD PRIMARY KEY (id);`,

      `ALTER TABLE nutstats_flag_kills
      MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

      `CREATE TABLE nutstats_flag_positions (
        id int(11) NOT NULL,
        map_id int(11) NOT NULL,
        team int(2) NOT NULL,
        x float NOT NULL,
        y float NOT NULL,
        z float NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

      `ALTER TABLE nutstats_flag_positions
      ADD PRIMARY KEY (id);`,

      `ALTER TABLE nutstats_flag_positions
      MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

      `CREATE TABLE nutstats_item_locations (
        id int(11) NOT NULL,
        match_id int(11) NOT NULL,
        map_id int(11) NOT NULL,
        class_name varchar(100) NOT NULL,
        name varchar(50) NOT NULL,
        x float NOT NULL,
        y float NOT NULL,
        z float NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

      `ALTER TABLE nutstats_item_locations
      ADD PRIMARY KEY (id);`,

      `ALTER TABLE nutstats_item_locations
      MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

      `ALTER TABLE nutstats_match ADD file varchar(150) NOT NULL AFTER gameclass`,


      `CREATE TABLE nutstats_dom_positions (
        id int(11) NOT NULL,
        map_id int(11) NOT NULL,
        name varchar(50) NOT NULL,
        x float NOT NULL,
        y float NOT NULL,
        z float NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

      `ALTER TABLE nutstats_dom_positions
      ADD PRIMARY KEY (id);`,

      `ALTER TABLE nutstats_dom_positions
      MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

      `CREATE TABLE nutstats_spawns (
        id int(11) NOT NULL,
        match_id int(11) NOT NULL,
        map_id int(11) NOT NULL,
        player int(11) NOT NULL,
        x float NOT NULL,
        y float NOT NULL,
        z float NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

      `ALTER TABLE nutstats_spawns
      ADD PRIMARY KEY (id);`,

      `ALTER TABLE nutstats_spawns
      MODIFY id int(11) NOT NULL AUTO_INCREMENT;`






];


function updateQuery(q){

    return new Promise((resolve, reject) =>{

        mysql.query(q, (err) =>{

            if(err){
                //console.trace(err);
                new Message("error", err);
            }else{

                new Message("pass", q);
            }

            resolve();
        });
    });
}

async function update(){

    try{

        for(let i = 0; i < queries.length; i++){

            await updateQuery(queries[i]);
        }

    }catch(err){
        
        console.trace(err);
        new Message("error", "Database update failed!");
        new Message("error", err);
    }

}


update();
