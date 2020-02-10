/*
const discord = require("discord.js");
const {
    Command
} = require('discord.js-commando');
var cache = require('memory-cache');
const request = require('request');
var settings = cache.get("settings");
var championData;

request(`http://ddragon.leagueoflegends.com/cdn/10.3.1/data/en_US/champion.json`, function(error, response, body) {
    championData = JSON.parse(body)["data"];
})

function distance(a, b){
    if(a.length == 0) return b.length; 
    if(b.length == 0) return a.length; 
  
    var matrix = [];
  
    var i;
    for(i = 0; i <= b.length; i++){
      matrix[i] = [i];
    }

    var j;
    for(j = 0; j <= a.length; j++){
      matrix[0][j] = j;
    }

    for(i = 1; i <= b.length; i++){
      for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, 
                                  Math.min(matrix[i][j-1] + 1, 
                                           matrix[i-1][j] + 1)); 
        }
      }
    }
  
    return matrix[b.length][a.length];
  };

module.exports = class champinfo extends Command {
    constructor(client) {
        super(client, {
            name: 'champinfo',
            group: 'lolmains',
            memberName: 'champinfo',
            description: 'Returns champion information.',
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 10,
            },
        });
    }

    run(msg, {
        text
    }) {
        var client = this.client;
        var commandA = msg.content.slice(this.client.commandPrefix.length).trim().split(/ +/g);
        var characters = settings["characterdata"];
        if (commandA.length >1) {
            var characterInput = commandA.splice(1,4).join(" ");

            var mostLikely = ["",100];

            for (var char in characters) {
                var algoO = distance(char, characterInput);
                
                if (algoO < mostLikely[1]) {
                    mostLikely[0] = char;
                    mostLikely[1] = algoO;
                }
            }

            const embed = new discord.RichEmbed()
                .addField("Type", `${championData}`, true)
                .setTitle(`${client.emojis.get(settings["emojis"][characterdata[mostLikely[0]]])} ${mostLikely[0]}`)
                .setColor(0x000ff00)
                .setThumbnail(usernameav)
                .setTimestamp();

        } else {
            msg.channel.send("Please provide a champion name when running the command!")
        }
    }
};  

*/