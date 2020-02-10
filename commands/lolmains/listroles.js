const discord = require("discord.js");
const { Command } = require('discord.js-commando');
var cache = require('memory-cache');
var settings = cache.get("settings");
module.exports = class listroles extends Command {
	constructor(client) {
		super(client, {
			name: 'listroles',
			group: 'lkids',
			memberName: 'listroles',
			description: 'Lists amount of people in each role',
			guildOnly: true,
		});
	}

	run(msg) {
		var top = msg.guild.roles.get(settings.top).members.array();
		var jungle = msg.guild.roles.get(settings.jungle).members.array();
		var mid = msg.guild.roles.get(settings.mid).members.array();
		var bot = msg.guild.roles.get(settings.bot).members.array();
		var support = msg.guild.roles.get(settings.support).members.array();

		const embed = new discord.RichEmbed()
			.setTitle("Number of Players in Each Lane")
            .setDescription(`Top - ${top.length}\nJungle - ${jungle.length}\nMid - ${mid.length}\nBot - ${bot.length}\nSupport - ${support.length}`)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL)
            .setColor(0x00a83f2)
            .setTimestamp();
        return msg.embed(embed);
	}
};