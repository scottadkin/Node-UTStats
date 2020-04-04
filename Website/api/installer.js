const fs = require('fs');
const mysql = require('mysql');
const config = require('./config');
const Promise = require('promise');
const Message = require('./message');




class Installer{


    constructor(){

		this.errors = [];

		this.bAltInstall = false;

		if(arguments.length == 1){
			this.bAltInstall = true;
		}
    }


    async start(){


        try{

			await this.connect();
			await this.createDatabase();
			new Message("pass", "Database "+config.mysqlDatabase+" created successfully!");
			await this.connect(true);
			await this.createTables();
			new Message("pass", "Install completed!");
			process.exit(0);


		}catch(err){

			new Message("error", "There was a problem installing: "+err);
			console.trace(err);
		}


        

    }

    connect(){

        //const dbInfo = config.dbInfo();

        if(arguments.length == 0){


            this.connection = new mysql.createConnection({
                "host": config.mysqlHost,
                "user": config.mysqlUser,
                "password": config.mysqlPassword,
                "port": config.mysqlPort
            });

        }else{
            this.connection = new mysql.createConnection({
                "host": config.mysqlHost,
                "user": config.mysqlUser,
                "password": config.mysqlPassword,
                "port": config.mysqlPort,
                "database":config.mysqlDatabase
            });

        }

        return new Promise((resolve, reject) =>{

            this.connection.connect((err) =>{

                if(err) reject(err);

                new Message("pass", "Connected to mysql");

                resolve();
            });
        });
    }


    createTable(query){


        return new Promise((resolve, reject) =>{

            this.connection.query(query, (err) =>{
                
				if(err) reject(err);
				

				let endString = "";

				if(query.length > 30){
					endString = "...";
				}

                new Message("pass", " "+query.substring(0,30)+endString);
                resolve();
            });
        });
    }

    createTables(){


        const queries = [
            `CREATE TABLE nutstats_assault (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                attacking_team int(11) NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

            `CREATE TABLE nutstats_assault_events (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                player_id int(11) NOT NULL,
                obj_id int(11) NOT NULL,
                time float NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_assault_objectives (
                id int(11) NOT NULL,
                map_id int(11) NOT NULL,
                obj_id int(11) NOT NULL,
                obj_name varchar(50) COLLATE utf8_unicode_ci NOT NULL,
                image varchar(100) COLLATE utf8_unicode_ci NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_connects (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                player_id int(11) NOT NULL,
                type int(11) NOT NULL,
                time float NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_dom_captures (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                player_id int(11) NOT NULL,
                point_name varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                time float NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_dom_playerscore (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                player_id int(11) NOT NULL,
                points int(11) NOT NULL,
                time float NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_dom_teamscore (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                team_id int(11) NOT NULL,
                points float NOT NULL,
                time float NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_flag_events (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                player_id int(11) NOT NULL,
                type varchar(50) COLLATE utf8_unicode_ci NOT NULL,
                time float NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_flag_events_score (
                id int(11) NOT NULL,
                type varchar(30) COLLATE utf8_unicode_ci NOT NULL,
                value int(11) NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_gametype (
                id int(11) NOT NULL,
                name varchar(50) COLLATE utf8_unicode_ci NOT NULL,
                matches int(11) NOT NULL,
                total_time int(11) NOT NULL,
                last int(11) NOT NULL, 
                display_name varchar(100),
                bdisplay int(1) NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_headshots (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                player_id int(11) NOT NULL,
                timeStamp float NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_kills (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                killer int(11) NOT NULL,
                victim int(11) NOT NULL,
                weapon int(11) NOT NULL,
                time float NOT NULL,
                distance float NOT NULL,
                killer_x FLOAT NOT NULL,
                killer_y FLOAT NOT NULL,
                killer_z FLOAT NOT NULL,
                victim_x FLOAT NOT NULL,
                victim_y FLOAT NOT NULL,
                victim_z FLOAT NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=latin1;`,

              `CREATE TABLE nutstats_log_file_history (
                id int(11) NOT NULL,
                file varchar(200) COLLATE utf8_unicode_ci NOT NULL,
                imported int(11) NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,


              `CREATE TABLE nutstats_map (
                id int(11) NOT NULL,
                name varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                title varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                author varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                sshot varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                matches int(11) NOT NULL,
                total_time int(11) NOT NULL,
                last int(11) NOT NULL,
                first int(11) NOT NULL,
                size int(11) NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,


              `CREATE TABLE nutstats_match (
                id int(11) NOT NULL,
                date int(11) NOT NULL,
                name varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                ip varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                admin varchar(50) COLLATE utf8_unicode_ci NOT NULL,
                email varchar(50) COLLATE utf8_unicode_ci NOT NULL,
                motd varchar(400) COLLATE utf8_unicode_ci NOT NULL,
                gametype varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                map varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                mutators varchar(500) COLLATE utf8_unicode_ci NOT NULL,
                total_players int(11) NOT NULL,
                total_bots int(11) NOT NULL,
                total_teams int(11) NOT NULL,
                teamscore_0 int(11) NOT NULL,
                teamscore_1 int(11) NOT NULL,
                teamscore_2 int(11) NOT NULL,
                teamscore_3 int(11) NOT NULL,
                dm_winner varchar(30) COLLATE utf8_unicode_ci NOT NULL,
                dm_winner_score int(11) NOT NULL,
                match_start float NOT NULL,
                match_end float NOT NULL,
                match_playtime float NOT NULL,
                frag_limit int(11) NOT NULL,
                time_limit float NOT NULL,
                winning_team int(11) NOT NULL,
                winner_score int(11) NOT NULL,
                views int(11) NOT NULL, 
                gameclass varchar(100),
                file varchar(150) NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_pickups (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                player int(11) NOT NULL,
                time double NOT NULL,
                type varchar(30) COLLATE utf8_unicode_ci NOT NULL,
                bdeactivate int(11) NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_player (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                player_match_id int(11) NOT NULL,
                player_id int(11) NOT NULL,
                name varchar(30) COLLATE utf8_unicode_ci NOT NULL,
                face varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                ip varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                flag varchar(10) COLLATE utf8_unicode_ci NOT NULL,
                team int(11) NOT NULL,
                points int(11) NOT NULL,
                kills int(11) NOT NULL,
                headshots int(11) NOT NULL,
                team_kills int(11) NOT NULL,
                deaths int(11) NOT NULL,
                suicides int(11) NOT NULL,
                eff double NOT NULL,
                m1 int(11) NOT NULL,
                m2 int(11) NOT NULL,
                m3 int(11) NOT NULL,
                m4 int(11) NOT NULL,
                m5 int(11) NOT NULL,
                m6 int(11) NOT NULL,
                m7 int(11) NOT NULL,
                s1 int(11) NOT NULL,
                s2 int(11) NOT NULL,
                s3 int(11) NOT NULL,
                s4 int(11) NOT NULL,
                s5 int(11) NOT NULL,
                s6 int(11) NOT NULL,
                s7 int(11) NOT NULL,
                best_multi int(11) NOT NULL,
                best_spree int(11) NOT NULL,
                flag_caps int(11) NOT NULL,
                flag_grabs int(11) NOT NULL,
                flag_assists int(11) NOT NULL,
                flag_drops int(11) NOT NULL,
                flag_returns int(11) NOT NULL,
                flag_covers int(11) NOT NULL,
                flag_seals int(11) NOT NULL,
                flag_kills int(11) NOT NULL,
                flag_pickups int(11) NOT NULL,
                play_time float NOT NULL,
                ttl float NOT NULL,
                bBot int(11) NOT NULL,
                ping_best int(11) NOT NULL,
                ping_average int(11) NOT NULL,
                ping_worst int(11) NOT NULL,
                gametype int(11) NOT NULL,
                dom_caps int(11) NOT NULL,
                assault_caps int(11) NOT NULL,
                damage int(11) NOT NULL,
                first_blood int(11) NOT NULL,
                winner int(11) NOT NULL,
                spawn_kills int(11) NOT NULL,
                flag_saves int(11) NOT NULL, 
                voice varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                netspeed int(11) NOT NULL,
                fov float NOT NULL,
                mouse_sens Float NOT NULL,
                dodge_click_time Float NOT NULL,
                best_spawn_kill_spree int(11) NOT NULL,
                monster_kills int(11) NOT NULL,
                shortest_distance_kill FLOAT NOT NULL,
                longest_distance_kill FLOAT NOT NULL,
                shortest_kill_time FLOAT NOT NULL,
                longest_kill_time FLOAT NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `CREATE TABLE nutstats_player_totals (
                id int(11) NOT NULL,
                name varchar(30) COLLATE utf8_unicode_ci NOT NULL,
                ip varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                flag varchar(10) COLLATE utf8_unicode_ci NOT NULL,
                points int(11) NOT NULL,
                kills int(11) NOT NULL,
                headshots int(11) NOT NULL,
                team_kills int(11) NOT NULL,
                deaths int(11) NOT NULL,
                suicides int(11) NOT NULL,
                eff double NOT NULL,
                m1 int(11) NOT NULL,
                m2 int(11) NOT NULL,
                m3 int(11) NOT NULL,
                m4 int(11) NOT NULL,
                m5 int(11) NOT NULL,
                m6 int(11) NOT NULL,
                m7 int(11) NOT NULL,
                s1 int(11) NOT NULL,
                s2 int(11) NOT NULL,
                s3 int(11) NOT NULL,
                s4 int(11) NOT NULL,
                s5 int(11) NOT NULL,
                s6 int(11) NOT NULL,
                s7 int(11) NOT NULL,
                best_multi int(11) NOT NULL,
                best_spree int(11) NOT NULL,
                flag_caps int(11) NOT NULL,
                flag_grabs int(11) NOT NULL,
                flag_assists int(11) NOT NULL,
                flag_drops int(11) NOT NULL,
                flag_returns int(11) NOT NULL,
                flag_covers int(11) NOT NULL,
                flag_seals int(11) NOT NULL,
                flag_kills int(11) NOT NULL,
                flag_pickups int(11) NOT NULL,
                total_time float NOT NULL,
                total_matches int(11) NOT NULL,
                gametype int(11) NOT NULL,
                dom_caps int(11) NOT NULL,
                dom_points int(11) NOT NULL,
                assault_caps int(11) NOT NULL,
                damage int(11) NOT NULL,
                first_blood int(11) NOT NULL,
                ranking double NOT NULL,
                last_played int(11) NOT NULL,
                wins int(11) NOT NULL,
                last_match int(11) NOT NULL,
                last_match_date int(11) NOT NULL,
                first_match int(11) NOT NULL,
                ranking_change int(11) NOT NULL,
                ranking_diff float NOT NULL,
                views int(11) NOT NULL,
                spawn_kills int(11) NOT NULL,
                flag_saves int(11) NOT NULL,
                face varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                voice varchar(100) COLLATE utf8_unicode_ci NOT NULL,
                fov int(11) NOT NULL,
                netspeed int(11) NOT NULL,
                mouse_sens float NOT NULL,
                dodge_click_time float NOT NULL,
                best_spawn_kill_spree int(11) NOT NULL,
                monster_kills int(11) NOT NULL,
                gametype_position int(11) NOT NULL,
                shortest_distance_kill FLOAT NOT NULL,
                longest_distance_kill FLOAT NOT NULL,
                shortest_kill_time FLOAT NOT NULL,
                longest_kill_time FLOAT NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,


              `CREATE TABLE nutstats_rankings (
                id int(11) NOT NULL,
                player_id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                gametype_id int(11) NOT NULL,
                ranking float NOT NULL,
                ranking_change float NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=latin1;`,


              `CREATE TABLE nutstats_team_changes (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                player_id int(11) NOT NULL,
                time float NOT NULL,
                new_team int(11) NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,


              `CREATE TABLE nutstats_weapons (
                id int(11) NOT NULL,
                name varchar(50) COLLATE utf8_unicode_ci NOT NULL,
                img varchar(100) COLLATE utf8_unicode_ci NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,


              `CREATE TABLE nutstats_weapons_stats (
                id int(11) NOT NULL,
                match_id int(11) NOT NULL,
                player_id int(11) NOT NULL,
                weapon_id int(11) NOT NULL,
                shots int(11) NOT NULL,
                hits int(11) NOT NULL,
                kills int(11) NOT NULL,
                damage int(11) NOT NULL,
                accuracy float NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `
              CREATE TABLE nutstats_weapons_stats_total (
                id int(11) NOT NULL,
                player_id int(30) NOT NULL,
                weapon_id int(11) NOT NULL,
                shots int(11) NOT NULL,
                hits int(11) NOT NULL,
                kills int(11) NOT NULL,
                damage int(11) NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `
              CREATE TABLE nutstats_hits (
                id int(11) NOT NULL,
                year int(4) NOT NULL,
                month int(2) NOT NULL,
                day int(2) NOT NULL,
                hour int(2) NOT NULL,
                hits int(11) NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `ALTER TABLE nutstats_hits
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_hits
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `
              CREATE TABLE nutstats_player_monster_kills (
                id int(11) NOT NULL,
                player_id int(11) NOT NULL,
                monster_id int(11) NOT NULL,
                kills int(11) NOT NULL
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

              `ALTER TABLE nutstats_player_monster_kills
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_player_monster_kills
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,


              //////////////////////////////////////////////////////

              `ALTER TABLE nutstats_assault
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_assault_events
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_assault_objectives
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_connects
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_dom_captures
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_dom_playerscore
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_dom_teamscore
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_flag_events
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_flag_events_score
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_gametype
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_headshots
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_kills
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_log_file_history
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_map
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_match
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_pickups
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_player
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_player_totals
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_rankings
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_team_changes
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_weapons
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_weapons_stats
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_weapons_stats_total
                ADD PRIMARY KEY (id);`,


                `ALTER TABLE nutstats_assault
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_assault_events
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_assault_objectives
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_connects
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,


                `ALTER TABLE nutstats_dom_captures
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_dom_playerscore
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_dom_teamscore
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_flag_events
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_flag_events_score
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_gametype
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_headshots
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_kills
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_log_file_history
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_map
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_match
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

  

                `ALTER TABLE nutstats_pickups
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,
                `
                ALTER TABLE nutstats_player
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_player_totals
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_rankings
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_team_changes
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_weapons
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_weapons_stats
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `ALTER TABLE nutstats_weapons_stats_total
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,



                `CREATE TABLE nutstats_days_of_week (
                  id int(11) NOT NULL,
                  name varchar(20) NOT NULL,
                  matches int(11) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,


                `ALTER TABLE nutstats_days_of_week
                ADD PRIMARY KEY (id);`,


                `ALTER TABLE nutstats_days_of_week
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_monsters (
                  id int(11) NOT NULL,
                  name varchar(120) NOT NULL,
                  matches int(11) NOT NULL,
                  kills int(11) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_monsters
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_monsters
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,


                `CREATE TABLE nutstats_monster_kills (
                  id int(11) NOT NULL,
                  match_id int(11) NOT NULL,
                  player_id int(11) NOT NULL,
                  monster_id int(11) NOT NULL,
                  time float NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_monster_kills
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_monster_kills
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_faces (
                  id int(11) NOT NULL,
                  name varchar(100) NOT NULL,
                  uses int(11) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_faces
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_faces
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_voices (
                  id int(11) NOT NULL,
                  name varchar(100) NOT NULL,
                  uses int(11) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_voices
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_voices
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_flag_captures (
                  id int(11) NOT NULL,
                  match_id int(11) NOT NULL,
                  map_id int(11) NOT NULL,
                  grab_id int(11) NOT NULL,
                  grab_time float NOT NULL,
                  cap_id int(11) NOT NULL,
                  cap_time float NOT NULL,
                  assist_ids varchar(500) NOT NULL,
                  bassist int(1) NOT NULL,
                  cover_ids varchar(500) NOT NULL,
                  total_assists int(11) NOT NULL,
                  total_covers int(11) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_flag_captures
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_flag_captures
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_bunnytrack_records (
                  id int(11) NOT NULL,
                  map_id int(11) NOT NULL,
                  player_id int(11) NOT NULL,
                  match_id int(11) NOT NULL,
                  date int(11) NOT NULL,
                  time float NOT NULL,
                  improvement float NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_bunnytrack_records
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_bunnytrack_records
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_bunnytrack_caps (
                  id int(11) NOT NULL,
                  match_id int(11) NOT NULL,
                  map_id int(11) NOT NULL,
                  player_id int(11) NOT NULL,
                  date int(11) NOT NULL,
                  time float NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_bunnytrack_caps
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_bunnytrack_caps
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_bunnytrack_player_records (
                  id int(11) NOT NULL,
                  map_id int(11) NOT NULL,
                  player_id int(11) NOT NULL,
                  match_id int(11) NOT NULL,
                  date int(11) NOT NULL,
                  time float NOT NULL,
                  improvement float NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_bunnytrack_player_records
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_bunnytrack_player_records
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                

                `CREATE TABLE nutstats_days (
                  id int(11) NOT NULL,
                  month int(11) NOT NULL,
                  day int(11) NOT NULL,
                  matches int(11) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,


                `ALTER TABLE nutstats_days
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_days
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_users (
                  id int(11) NOT NULL,
                  name varchar(20) NOT NULL,
                  password varchar(200) NOT NULL,
                  bAdmin int(1) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_users
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_users
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_servers (
                  id int(11) NOT NULL,
                  server_name varchar(100) NOT NULL,
                  ip varchar(100) NOT NULL,
                  port int(11) NOT NULL,
                  first int(11) NOT NULL,
                  last int(11) NOT NULL,
                  matches int(11) NOT NULL,
                  playtime float NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_servers
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_servers
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_server_query_servers (
                  id int(11) NOT NULL,
                  name varchar(100) NOT NULL,
                  ip varchar(100) NOT NULL,
                  port int(11) NOT NULL,
                  map varchar(100) NOT NULL,
                  current_players int(11) NOT NULL,
                  max_players int(11) NOT NULL,
                  fetched int(11) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_server_query_servers
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_server_query_servers
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_server_query_player_count (
                  id int(11) NOT NULL,
                  server varchar(100) NOT NULL,
                  time int(11) NOT NULL,
                  players int(11) NOT NULL,
                  max_players int(11) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_server_query_player_count
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_server_query_player_count
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_server_query_players (
                  id int(11) NOT NULL,
                  server int(11) NOT NULL,
                  name varchar(50) NOT NULL,
                  score int(11) NOT NULL,
                  date int(11) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_server_query_players
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_server_query_players
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_ace_player (
                  id int(11) NOT NULL,
                  name varchar(30) NOT NULL,
                  ip varchar(100) NOT NULL,
                  os varchar(200) NOT NULL,
                  mac1 varchar(50) NOT NULL,
                  mac2 varchar(50) NOT NULL,
                  hwid varchar(50) NOT NULL,
                  time varchar(50) NOT NULL,
                  file varchar(100) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_ace_player
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_ace_player
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_ace_logs (
                  id int(11) NOT NULL,
                  name varchar(30) NOT NULL,
                  ip varchar(100) NOT NULL,
                  mac1 varchar(100) NOT NULL,
                  mac2 varchar(100) NOT NULL,
                  hwid varchar(100) NOT NULL,
                  game_version int(100) NOT NULL,
                  data text NOT NULL,
                  image longblob NOT NULL,
                  time_stamp varchar(100) NOT NULL,
                  file varchar(100) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_ace_logs
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_ace_logs
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `CREATE TABLE nutstats_sessions (
                  session_id varchar(128)  NOT NULL,
                  expires int(11) NOT NULL,
                  data text NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_sessions
                ADD PRIMARY KEY (session_id);`,

                `CREATE TABLE nutstats_records (
                  id int(11) NOT NULL,
                  name varchar(100) NOT NULL,
                  column_name varchar(100) NOT NULL,
                  bdisplay int(11) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,

                `ALTER TABLE nutstats_records
                ADD PRIMARY KEY (id);`,

                `ALTER TABLE nutstats_records
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

                `INSERT INTO nutstats_records (id, name, column_name, bdisplay) VALUES
                (1, 'Deaths', 'deaths', 1),
                (2, 'Kills', 'kills', 1),
                (3, 'Frags', 'points', 1),
                (4, 'Suicides', 'suicides', 1),
                (5, 'Team Kills', 'team_kills', 1),
                (6, 'Efficiency', 'eff', 1),
                (7, 'Flag Captures', 'flag_caps', 1),
                (8, 'Flag Covers', 'flag_covers', 1),
                (9, 'Flag Grabs', 'flag_grabs', 1),
                (10, 'Flag Returns', 'flag_returns', 1),
                (11, 'Flag Assists', 'flag_assists', 1),
                (12, 'Flag Kills', 'flag_kills', 1),
                (13, 'Holy Shits', 'm7', 1),
                (14, 'Longest Spree', 'best_spree', 1),
                (15, 'Longest Multi Kill', 'best_multi', 1),
                (16, 'Most Spawn Kills', 'spawn_kills', 1),
                (17, 'Longest Spawn Kill Spree', 'best_spawn_kill_spree', 1),
                (18, 'Total Playtime', 'play_time', 1),
                (19, 'Domination Captures', 'dom_caps', 1),
                (20, 'Assault Captures', 'assault_caps', 1),
                (21, 'Monsterhunt Kills', 'monster_kills', 1);`,
                
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
                  class_name varchar(50) NOT NULL,
                  name varchar(100) NOT NULL,
                  x float NOT NULL,
                  y float NOT NULL,
                  z float NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`,
          
                `ALTER TABLE nutstats_item_locations
                ADD PRIMARY KEY (id);`,
          
                `ALTER TABLE nutstats_item_locations
                MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,

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

        const tableNames = [
            "nutstats_assault",
            "nutstats_assault_events",
            "nutstats_assault_objectives",
            "nutstats_connects",
            "nutstats_dom_captures",
            "nutstats_dom_playerscore",
            "nutstats_dom_teamscore",
            "nutstats_flag_events",
            "nutstats_flag_events_score",
            "nutstats_gametype",
            "nutstats_headshots",
            "nutstats_kills",
            "nutstats_log_file_history",
            "nutstats_map",
            "nutstats_match",
            "nutstats_pickups",
            "nutstats_player",
            "nutstats_player_totals",
            "nutstats_rankings",
            "nutstats_team_changes",
            "nutstats_weapons",
            "nutstats_weapons_stats",
            "nutstats_weapons_stats_totals"
            
      
        ];



        const promises = [];

        let tName = "";
        for(let i = 0; i < queries.length; i++){

            /*if(i < tableNames.length - 1){
                tName = tableNames[i];
            }else{
                tName = "Altered table";
            }*/

            promises.push(this.createTable(queries[i]));
        }


        return Promise.all(promises);
    }

    createDatabase(){

        return new Promise((resolve, reject) =>{

			//if is an alt install skip the database creation process
			if(!this.bAltInstall){

				const query = "CREATE DATABASE "+config.mysqlDatabase;


				this.connection.query(query, (err) =>{

					if(err) reject(err);

					this.connection.end();
					resolve();
				});

			}else{
				
				resolve();
			}
        });
    }


    createDirIfNotExists(dir){

        if(!fs.existsSync(dir)){

            fs.mkdir(dir, {recursive: true}, (err) =>{

                if(err){
                    new Message("error","Failed to create "+dir+" ("+err+")");
                }else{

                    new Message("pass", "Created "+dir);
                }
            });

        }else{

            new Message("warning","The directory "+dir+" already exists.");
        }
    }

    createLogDirs(){


        this.createDirIfNotExists(importedDir);
        this.createDirIfNotExists(tmpDir);


    }
}




module.exports = Installer;
