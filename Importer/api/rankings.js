const mysql = require('./database');
const Promise = require('promise');
const config = require('./config');
const Message = require('./message');


class Rankings{


    constructor(players, gametypeId, matchId){

        this.players = players;

        this.gametype = gametypeId;

        this.matchId = matchId;

        this.values = {
            "frag":300,
            "death":-150,
            "suicide":-150,
            "teamKill":-1200,
            "flagGrab":600,
            "flagPickup":600,
            "flagReturn":600,
            "flagCap":6000,
            "flagCover":1800,
            "flagSeal":1200,
            "flagAssist":3000,
            "flagKill":1200,
            "domCap":6000,
            "assaultCap":6000,
            "doubleKill":600,
            "multiKill":600,
            "megaKill":600,
            "ultraKill":700,
            "monsterKill":800,
            "ludicrousKill":900,
            "holyKill":1000,
            "spree":600,
            "rampage":600,
            "dominating":900,
            "unstoppable":1200,
            "godlike":1800,
            "massacre":2400,
            "brutalizing":3200,
            "monsterHuntKill":300
        };
    }


    async updateRankings(){


        await this.getPlayersGametypePlaytime();
        this.setRankingScores();
        await this.updatePlayerRankings();
        await this.updatePlayerRankingHistory();
        await this.getGametypeRankings(this.gametype);
        await this.updateGametypePositions();

    }

    getPlayersGametypePlaytime(){

        return new Promise((resolve,reject) =>{

            const names = [];
            let nameString = "";

            let d = 0;

            for(let i = 0; i < this.players.length; i++){

                d = this.players[i];

                if(names.indexOf(d.name) == -1){
                    names.push(d.name);
                    nameString+=d.name+",";

                    
                }

            }

            const query = "SELECT * FROM nutstats_player_totals WHERE name IN (?) AND gametype=?";

            mysql.query(query, [names, this.gametype], (err, result) =>{    

                if(err) throw err;

                //console.log("result");
                //console.log(result);
                //console.log("result");

                this.gametypeTotals = result;
                resolve();
            });

            //resolve();
        });
    }


    getPlayerTotalOffset(name){

        let d = 0;

        for(let i = 0; i < this.gametypeTotals.length; i++){

            d = this.gametypeTotals[i];

            if(d.name == name){
                return d;
            }

        }


        return -1;
    }

    setRankingScores(){


        let d = 0;

        let currentRanking = 0;

        //const rank = new Rankings();
        
        const rV = this.values;

        let totalData = 0;

        let minutes = 0;

        for(let i = 0; i < this.players.length; i++){

            currentRanking = 0;
            d = this.players[i];

            totalData = this.getPlayerTotalOffset(d.name);

            if(totalData == -1){
                continue;
            }

            if(i == 0){
                //console.log(totalData);
            }



           // console.log(d);

           //discount assault and dom and flag stuff from other gametypes

            currentRanking += ((d.kills + totalData.kills) * rV.frag);
            currentRanking += ((d.deaths + totalData.deaths) * rV.death);
            currentRanking += ((d.suicides + totalData.suicides) * rV.suicide);
            currentRanking += ((d.teamKills + totalData.team_kills) * rV.teamKill);

            currentRanking += ((d.flagGrabs + totalData.flag_grabs) * rV.flagGrab);
            currentRanking += ((d.flagPickups + totalData.flag_pickups) * rV.flagPickup);
            currentRanking += ((d.flagReturns + totalData.flag_returns) * rV.flagReturn);
            currentRanking += ((d.flagCaps + totalData.flag_caps) * rV.flagCap);
            currentRanking += ((d.flagCovers + totalData.flag_covers) * rV.flagCover);
            currentRanking += ((d.flagAssists + totalData.flag_assists) * rV.flagAssist);
            currentRanking += ((d.flagKills + totalData.flag_kills) * rV.flagKill);

            currentRanking += ((d.domCaps + totalData.dom_caps) * rV.domCap);
            currentRanking += ((d.assaultCaps + totalData.assault_caps) * rV.assaultCap);

            currentRanking += ((d.sprees.spree + totalData.s1) * rV.spree);
            currentRanking += ((d.sprees.rampage + totalData.s2) * rV.rampage);
            currentRanking += ((d.sprees.dominating + totalData.s3) * rV.dominating);
            currentRanking += ((d.sprees.unstoppable + totalData.s4) * rV.unstoppable);
            currentRanking += ((d.sprees.godlike + totalData.s5) * rV.godlike);
            currentRanking += ((d.sprees.massacre + totalData.s6) * rV.massacre);
            currentRanking += ((d.sprees.brutalizing + totalData.s7) * rV.brutalizing);

            currentRanking += ((d.multis.double + totalData.m1) * rV.doubleKill);
            currentRanking += ((d.multis.multi + totalData.m2) * rV.multiKill);
            currentRanking += ((d.multis.mega + totalData.m3) * rV.megaKill);
            currentRanking += ((d.multis.ultra + totalData.m4) * rV.ultraKill);
            currentRanking += ((d.multis.monster + totalData.m5) * rV.monsterKill);
            currentRanking += ((d.multis.ludicrous + totalData.m6) * rV.ludicrousKill);
            currentRanking += ((d.multis.holy + totalData.m7) * rV.holyKill);
            currentRanking += ((d.monsterKills + totalData.monster_kills) * rV.monsterHuntKill);

            if(totalData.total_time > 0){

                minutes = totalData.total_time / 60;

                currentRanking = currentRanking / minutes;

                if(minutes < 300){

                    if(minutes < 60){
                        currentRanking = currentRanking * 0.2;
                    }else if(minutes >= 60 && minutes < 120){
                        currentRanking = currentRanking * 0.4;
                    }else if(minutes >= 120 && minutes < 200){
                        currentRanking = currentRanking * 0.6;
                    }else if(minutes >= 200){
                        currentRanking = currentRanking * 0.7;
                    }
                }

                if(currentRanking > d.ranking){
                    d.bRankingIncrease = 1;
                }
                d.ranking = currentRanking;
                d.gametypeTotalId = totalData.id;

                d.rankingDiff = totalData.ranking - currentRanking;
            }
           // console.log("TIME = ("+totalData.total_time+") "+d.name + " ranking points are "+currentRanking+" bRankingIncrase ="+d.bRankingIncrease);
        }
    }


    updatePlayer(vars){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_player_totals SET ranking=?,ranking_change=?,ranking_diff=? WHERE id=? LIMIT 1";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();

            });
        });
    }

    async updatePlayerRankings(){

        let d = 0;

        for(let i = 0; i < this.players.length; i++){

            d = this.players[i];

            if(d.bBot === 1){

                if(config.bIgnoreBots){

                    continue;
                }
            }

            await this.updatePlayer([d.ranking.toFixed(2), d.bRankingIncrease, d.rankingDiff, d.gametypeTotalId]);
   
        }
    }

    updateHistory(vars){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nutstats_rankings VALUES(NULL,?,?,?,?,?)";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();

            });

        });
    }

    async updatePlayerRankingHistory(){

        let d = 0;
        
        for(let i = 0; i < this.players.length; i++){

            d = this.players[i];

            if(d.gametypeTotalId != undefined ){

                await this.updateHistory([d.gametypeTotalId, this.matchId, this.gametype, d.ranking.toFixed(2), d.rankingDiff]);
                
            }else{
                new Message("warning", "Failed to update nutstats_rankings for player "+d.name);
            }
        }
    }



    getGametypeRankings(id){

        id = parseInt(id);

        this.gametypeRankings = [];

        return new Promise((resolve, reject) =>{

            const query = "SELECT id,name,gametype,ranking FROM nutstats_player_totals WHERE gametype=? ORDER BY ranking DESC";

            mysql.query(query, [id], (err, result) =>{

                if(err) reject(err);

                this.gametypeRankings = result;

                resolve();
            });
        });

    }

    updatePosition(vars){

        return new Promise((resolve, reject) =>{

            const query = "UPDATE nutstats_player_totals SET gametype_position=? WHERE id=?";

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async updateGametypePositions(){


        let currentPosition = 1;

        if(this.gametypeRankings != undefined){

            if(this.gametypeRankings.length > 0){

                for(let i = 0; i < this.gametypeRankings.length; i++){

                    const index = i;
                    const pos = currentPosition;
                    const pId = this.gametypeRankings[index].id;

                    await this.updatePosition([pos, pId]);

                    currentPosition++;
                }
            }
        }
    }

}



module.exports = Rankings;