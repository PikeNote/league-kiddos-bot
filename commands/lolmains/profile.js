const discord = require("discord.js");
const {
    Command
} = require('discord.js-commando');
var cache = require('memory-cache');
const request = require('request');
var championData;
var settings = cache.get("settings");
const async = require('async');

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
        var clientEmojiCache = client.emojis.cache;
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
        
        async function mainProcess() {
            var tempData = await requestItem(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${tempName}?api_key=${settings["riot_api"]}`,
            "Can't find the specified user, please make sure you typed in the username correctly!\nLeague of Legends API servers may be down aswell.");

        var summonerID = tempData["id"];
        var summonerAccountID = tempData["accountId"];

        const urls = [
            `https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerID}?api_key=${settings["riot_api"]}`,
            `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerID}?api_key=${settings["riot_api"]}`,
            `https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${summonerAccountID}?api_key=${settings["riot_api"]}`
        ]

        var username = tempData["name"];
        var usernameav = `http://avatar.leagueoflegends.com/na/${encodeURI(username)}.png`;
        var level = tempData["summonerLevel"];

        async.map(urls, httpGet, function(err, res) {
            if (err) return console.log(err);
            var mastery = res[0];
            var ranked = res[1];
            var matchList = res[2].matches;

            var embedRe = "";
            if (matchList.length >= 5) {
                for (var i = 0; i < 5; i++) {
                    var champion = championData.filter(c => c.key == matchList[i]["champion"]);
                    embedRe += `${clientEmojiCache.get(settings["emojis"][champion[0].key])} | ${new Date(matchList[i]["timestamp"]).toLocaleDateString("en-US")} | ${matchList[i]["lane"].charAt(0) + matchList[i]["lane"].toLowerCase().slice(1)} | Game ID - ${matchList[i]["gameId"]} | [Match Data](https://lolprofile.net/match/na/${matchList[i]["gameId"]}#Summary)\n`
                }
            } else {
                for (var i = 0; i < matchList.length; i++) {
                    var champion = championData.filter(c => c.key = matchList[i]["champion"]);

                    embedRe += `${clientEmojiCache.get(settings["emojis"][champion[0].key])} | ${new Date(matchList[i]["timestamp"]).toLocaleDateString("en-US")} | ${matchList[i]["lane"].charAt(0) + matchList[i]["lane"].toLowerCase().slice(1)} | Game ID - ${matchList[i]["gameId"]} | [Match Data](https://lolprofile.net/match/na/${matchList[i]["gameId"]}#Summary)\n`
                }
            }

            var masteryCount = [0, 0, 0]
            var topMasteries = [];
            var masteryEmotes = [clientEmojiCache.get(settings["mastery"]["m5"]), clientEmojiCache.get(settings["mastery"]["m6"]), clientEmojiCache.get(settings["mastery"]["m7"])];
            var topMasteryEmotes = [];

            var mtotal = 0;
            var rank = "None";

            ranked = ranked.filter(r => r.queueType == "RANKED_SOLO_5x5");

            if (ranked.length != 0) {
                rank = `${clientEmojiCache.get(settings["rank"][ranked[0]["tier"].charAt(0).toUpperCase() + ranked[0]["tier"].toLowerCase().slice(1)])} | ${ranked[0]["tier"].charAt(0).toUpperCase() + ranked[0]["tier"].toLowerCase().slice(1)} ${ranked[0]["rank"]}`
            }

            for (i = 0; i < 3; i++) {
                topMasteries[i] = championData.filter(c => c.key == mastery[i]["championId"]);
            }

            for (i = 0; i < 3; i++) {
                if (mastery[i]["championLevel"] >= 5) {
                    switch (mastery[i]["championLevel"]) {
                        case 5:
                            topMasteryEmotes[i] = masteryEmotes[0];
                            break;
                        case 6:
                            topMasteryEmotes[i] = masteryEmotes[1];
                            break;
                        case 7:
                            topMasteryEmotes[i] = masteryEmotes[2];
                            break;
                    }

                }
            }

            for (i = 0; i < 3; i++) {
                topMasteries[i] = `${clientEmojiCache.get(settings["emojis"][topMasteries[i][0].key])} ${topMasteries[i][0].name} - ${mastery[i]["championPoints"].toLocaleString()} ${topMasteryEmotes[i]}`
            }

            for (var i = 0; i < mastery.length; i++) {
                mtotal += mastery[i]["championPoints"];
                if (mastery[i]["championLevel"] == 7) {
                    masteryCount[2] += 1;
                } else if (mastery[i]["championLevel"] == 6) {
                    masteryCount[1] += 1;
                } else if (mastery[i]["championLevel"] == 5) {
                    masteryCount[0] += 1;
                }
            }


            msg.channel.send({
                embed: {
                    title: `${username}'s Profile`,
                    color: 0x000ff00,
                    thumbnail: {
                        url: usernameav,
                    },
                    fields: [{
                            name: "Most Played Champions",
                            value: `${topMasteries[0]}\n${topMasteries[1]}\n${topMasteries[2]}`,
                            inline: true
                        },
                        {
                            name: "Mastery Statistics",
                            value: `${masteryCount[2]}x${masteryEmotes[2]} ${masteryCount[1]}x${masteryEmotes[1]} ${masteryCount[0]}x${masteryEmotes[0]}\n${mtotal.toLocaleString()} Total Points`,
                            inline: true
                        },
                        {
                            name: "Level",
                            value: `Level ${level}`,
                            inline: true
                        },
                        {
                            name: "Ranked Statistics",
                            value: rank,
                            inline: true
                        },
                        {
                            name: "Past Matches",
                            value: `Character | Date | Lane | Game ID | Match Link\n${embedRe}`,
                            inline: false
                        }
                    ],
                    timestamp: new Date()
                }
            });

            function errorMessage(error) {

                let errorTemplate = {
                    color: 0xFF0000,
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL
                    },
                    title: "League of Legends Profile Stats",
                    description: error,
                    timestamp: new Date(),
                };

                msg.channel.send({
                    embed: errorTemplate
                });
            }
        });

        function requestItem(url, errorMsg) {
            return new Promise(resolve => {
                request(url, function(error, response, body) {
                    if (response.statusCode == 200) {
                        resolve(JSON.parse(body));
                    } else {
                        errorMessage(errorMsg)
                    }
                })
            })
        }

        function httpGet(url, callback) {
            const options = {
                url: url,
                json: true
            };

            request(options,
                function(err, res, body) {
                    callback(err, body);
                });
        }
        }
        mainProcess();
    }
}