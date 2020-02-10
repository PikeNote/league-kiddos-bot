const discord = require("discord.js");
const {
    Command
} = require('discord.js-commando');
var cache = require('memory-cache');
const request = require('request');
var championData;
var settings = cache.get("settings");

request(`http://ddragon.leagueoflegends.com/cdn/10.3.1/data/en_US/champion.json`, function(error, response, body) {
    championData = JSON.parse(body)["data"];
    var chpData = [];
    for (var i in championData)
        chpData.push(championData[i]);
    championData = chpData;
})

module.exports = class profile extends Command {
    constructor(client) {
        super(client, {
            name: 'profile',
            group: 'lkids',
            memberName: 'profile',
            description: 'Looks up the profile of a player.',
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 10,
            },
            examples: ['profile PikeNote/profile @PikeNote']
        });
    }

    run(msg, {
        text
    }) {
        var client = this.client;
        var commandA = msg.content.slice(this.client.commandPrefix.length).trim().slice("profile".length).trim();

        var tempName;
        if (msg.mentions.users.first() != null) {
            if (msg.mentions.users.first().nickname == null) {
                tempName = msg.mentions.users.first().username;
            } else {
                tempName = msg.mentions.users.first().nickname;
            }
        } else {
            tempName = encodeURI(commandA)
        }
        request(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${tempName}?api_key=${settings["riot_api"]}`, function(error, response, body) {   
            if (response.statusCode == 200) {
                var tempData = JSON.parse(body);
                var username = tempData["name"];
                var usernameav = `http://avatar.leagueoflegends.com/na/${encodeURI(username)}.png`;
                var level = tempData["summonerLevel"];
                request(`https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${tempData["id"]}?api_key=${settings["riot_api"]}`, function(error, response, body) {
                    if (response.statusCode == 200) {
                        var mastery = JSON.parse(body);
                        request(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${tempData["id"]}?api_key=${settings["riot_api"]}`, function(error, response, body) {
                            if (response.statusCode == 200) {
                                var ranked = JSON.parse(body);
                                request(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${tempData["accountId"]}?api_key=${settings["riot_api"]}`, async function(error, response, body) {
                                    if (response.statusCode == 200) {

                                        var matchList = JSON.parse(body).matches;
                                        var embedRe = "";
                                        if (matchList.length >= 5) {
                                            for (var i = 0; i < 5; i++) {
                                                var champion = await championData.filter(c => c.key == matchList[i]["champion"]);
                                                embedRe += `${client.emojis.get(settings["emojis"][champion[0].key])} | ${new Date(matchList[i]["timestamp"]).toLocaleDateString("en-US")} | ${matchList[i]["lane"].charAt(0) + matchList[i]["lane"].toLowerCase().slice(1)} | Game ID - ${matchList[i]["gameId"]} | [Match Data](https://lolprofile.net/match/na/${matchList[i]["gameId"]}#Summary)\n`
                                            }
                                        } else {
                                            for (var i = 0; i < matchList.length; i++) {
                                                var champion = championData.filter(c => c.key = matchList[i]["champion"]);

                                                embedRe += `${client.emojis.get(settings["emojis"][champion[0].key])} | ${new Date(matchList[i]["timestamp"]).toLocaleDateString("en-US")} | ${matchList[i]["lane"].charAt(0) + matchList[i]["lane"].toLowerCase().slice(1)} | Game ID - ${matchList[i]["gameId"]} | [Match Data](https://lolprofile.net/match/na/${matchList[i]["gameId"]}#Summary)\n`
                                            }
                                        }

                                        var mas5 = 0;
                                        var mas6 = 0;
                                        var mas7 = 0;
                                        var top1;
                                        var top2;
                                        var top3;
                                        var top1m = " ";
                                        var top2m = " ";
                                        var top3m = " ";
                                        var mtotal = 0;
                                        var rank = "None";

                                        ranked = ranked.filter(r => r.queueType == "RANKED_SOLO_5x5");

                                        if (ranked.length != 0) {
                                            rank = `${client.emojis.get(settings["rank"][ranked[0]["tier"].charAt(0).toUpperCase() + ranked[0]["tier"].toLowerCase().slice(1)])} | ${ranked[0]["tier"].charAt(0).toUpperCase() + ranked[0]["tier"].toLowerCase().slice(1)} ${ranked[0]["rank"]}`
                                        }
                                        

                                        top1 = await championData.filter(c => c.key == mastery[0]["championId"]);
                                        top2 = await championData.filter(c => c.key == mastery[1]["championId"]);
                                        top3 = await championData.filter(c => c.key == mastery[2]["championId"]);

                                        if (mastery[0]["championLevel"] >= 5) {
                                            top1m = client.emojis.get(settings["mastery"][`m${mastery[0]["championLevel"]}`]);
                                        }

                                        if (mastery[1]["championLevel"] >= 5) {
                                            top2m = client.emojis.get(settings["mastery"][`m${mastery[1]["championLevel"]}`]);
                                        }

                                        if (mastery[2]["championLevel"] >= 5) {
                                            top3m = client.emojis.get(settings["mastery"][`m${mastery[2]["championLevel"]}`]);
                                        }
                                        
                                        top1 = `${client.emojis.get(settings["emojis"][top1[0].key])} ${top1[0].name} - ${mastery[0]["championPoints"].toLocaleString()} ${top1m}`
                                        top2 = `${client.emojis.get(settings["emojis"][top2[0].key])} ${top2[0].name} - ${mastery[1]["championPoints"].toLocaleString()} ${top2m}`
                                        top3 = `${client.emojis.get(settings["emojis"][top3[0].key])} ${top3[0].name} - ${mastery[2]["championPoints"].toLocaleString()} ${top3m}`

                                        for (var i = 0; i < mastery.length; i++) {
                                            mtotal += mastery[i]["championPoints"];
                                            if (mastery[i]["championLevel"] == 7) {
                                                mas7 += 1;
                                            } else if (mastery[i]["championLevel"] == 6) {
                                                mas6 += 1;
                                            } else if (mastery[i]["championLevel"] == 5) {
                                                mas5 += 1;
                                            }
                                        }



                                        const embed = new discord.RichEmbed()
                                            .addField("Most Played Champions", `${top1}\n${top2}\n${top3}`, true)
                                            .addField("Mastery Statistics", `${mas7}x${client.emojis.get(settings["mastery"]["m7"])} ${mas6}x${client.emojis.get(settings["mastery"]["m6"])} ${mas5}x${client.emojis.get(settings["mastery"]["m5"])}\n${mtotal.toLocaleString()} Total Points`, true)
                                            .addField("Level", `Level ${level}`, true)
                                            .addField("Ranked Statistics", rank, true)
                                            .addField("Past Matches", `Character | Date | Lane | Game ID | Match Link\n${embedRe}`)
                                            .setTitle(`${username}'s Profile`)
                                            .setColor(0x000ff00)
                                            .setThumbnail(usernameav)
                                            .setTimestamp();
                                        msg.channel.send(embed);
                                    }
                                })
                            } else {
                                msg.channel.send("Can't find the specified data.\nLeague of Legends API are most likely down.")
                            }

                        })

                    } else {
                        msg.channel.send("Can't find the specified data.\nLeague of Legends API are most likely down.")
                    }
                })
            } else {
                console.log(body);
                msg.channel.send("Can't find the specified user, please make sure you typed in the username correctly!\nLeague of Legends API servers may be down aswell.")
            }
        })

    }
};

