const discord = require("discord.js");
const { Command } = require('discord.js-commando');
var cache = require('memory-cache');
var settings = cache.get("settings");
const fs= require('fs');


module.exports = class lookfor extends Command {
	constructor(client) {
		super(client, {
			name: 'lookfor',
			group: 'lkids',
			memberName: 'lookfor',
			description: 'Used to search for someone in a specific role.',
            guildOnly: true,
            examples: ['lookfor']
		});
	}

	run(msg, { text }) {
        var client = this.client;
        msg.channel.send(`Welcome to the teammate search promt.\nPlease now respond with what role are you looking for. Ex. Top, Bot, Support, etc.`)
            .then((message) => {
                msg.channel.awaitMessages(response => response.author.id == msg.author.id, {
                    max: 1,
                    time: 60000,
                    errors: ['time'],
                })
                .then(function(collected) {
                    msg.author.lastMessage.delete();
                    var collectedMsg = collected.first().content.toLowerCase();
                    if (collectedMsg == "top" || collectedMsg == "jungle" || collectedMsg == "mid" || collectedMsg == "bot" || collectedMsg == "support") {
                        message.edit("Please now respond if you want to only look for people who main that role? (Yes/No)");
                        msg.channel.awaitMessages(response => response.author.id == msg.author.id, {
                            max: 1,
                            time: 60000,
                            errors: ['time'],
                        })
                        .then(async function(collected) {
                            msg.author.lastMessage.delete();
                            message.edit("Looking for players..");
                            if (collected.first().content.toLowerCase() == "yes") {
                                fs.readFile('./userdata.json', async function read(err, data) {
                                    var userData = JSON.parse(data);
                                    
                                    var role = msg.guild.roles.get(settings[collectedMsg]).members.array();
                                    var usrList = await role.filter(m => m.presence.status == "online" && userData[m.id] != null && userData[m.id]["mainrole"] == settings[collectedMsg])
                        
                                    if (usrList.length > 0) {
                                        const embed = new discord.RichEmbed()
                                            .setTitle(`Online ${collectedMsg.charAt(0).toUpperCase() + collectedMsg.slice(1)} Mains`)
                                            .setDescription(usrList)
                                            .setAuthor(client.user.username, client.user.displayAvatarURL)
                                            .setColor(0x000ff00)
                                            .setFooter('Some people here may not be able to play; please contact them yourself')
                                            .setTimestamp();
                                        return msg.embed(embed);
                                    } else {
                                        const embed = new discord.RichEmbed()
                                            .setTitle(`Online ${collectedMsg.charAt(0).toUpperCase() + collectedMsg.slice(1)} Laners`)
                                            .setDescription(`There are no online ${collectedMsg} laners at this time; please check back later!`)
                                            .setAuthor(client.user.username, client.user.displayAvatarURL)
                                            .setColor(0x0ff0000)
                                            .setTimestamp();
                                        return msg.embed(embed);
                                    }
                                })
                                    
                            } else if (collected.first().content.toLowerCase() == "no") {

                                    var role = msg.guild.roles.get(settings[collectedMsg]).members.array();
                        
                                    var usrList = await role.filter(m => m.presence.status == "online")
                        
                                    if (usrList.length > 0) {
                                        const embed = new discord.RichEmbed()
                                            .setTitle(`Online ${collectedMsg.charAt(0).toUpperCase() + collectedMsg.slice(1)} Laners`)
                                            .setDescription(usrList)
                                            .setAuthor(client.user.username, client.user.displayAvatarURL)
                                            .setColor(0x000ff00)
                                            .setTimestamp();
                                        return msg.embed(embed);
                                    } else {
                                        const embed = new discord.RichEmbed()
                                            .setTitle(`Online ${collectedMsg.charAt(0).toUpperCase() + collectedMsg.slice(1)} Laners`)
                                            .setDescription(`There are no online ${collectedMsg} laners at this time; please check back later!`)
                                            .setAuthor(client.user.username, client.user.displayAvatarURL)
                                            .setColor(0x0ff0000)
                                            .setFooter('Some people here may not be able to play; please contact them yourself')
                                            .setTimestamp();
                                        return msg.embed(embed);
                                    }
                            }
                        })
                    } else {
                        message.edit("Please enter a valid lane role!")
                    }
                })
        })
	}
};