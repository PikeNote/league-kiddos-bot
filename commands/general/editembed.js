const {
    Command
} = require('discord.js-commando');

module.exports = class editembed extends Command {
    constructor(client) {
        super(client, {
            name: 'editembed',
            group: 'mods',
            memberName: 'editembed',
            description: 'Edits an embed',
            examples: ['editembed  #channel 23623632723 title Insert Title','editembed #channel 23623632723 description Insert Description']
        });
    }

    async run(msg) {
        var client = this.client;

        var commandArgs = msg.content.slice(this.client.commandPrefix.length).trim().slice("editembed".length).trim().split(" ");
        var textChannel = msg.mentions.channels.first();

        if (textChannel != null) {
            var channelMessage = await textChannel.messages.fetch(commandArgs[1]);
            var channelEmbed = channelMessage.embeds[0];

            if (commandArgs[2].toLowerCase().includes("title") || commandArgs[2].toLowerCase().includes("description")) {


                switch(commandArgs[2].toLowerCase()) {
                    case "title":
                        channelEmbed.title = commandArgs.slice(3).join(" ");
                        break;
                    case "description":
                        channelEmbed.description = commandArgs.slice(3).join(" ");
                        break;
                }
                channelMessage.edit({embed: channelEmbed});
            } else {
                errorMessage("You did not select what to edit!\n(Title/Description)")
            }
            msg.delete();
        } else {
            errorMessage("Please mention a valid text channel!")
        }

        function errorMessage(error) {
            let errorTemplate = {
                color: 0xFF0000,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL()
                },
                title: "Edit Embed",
                description: error,
                timestamp: new Date(),
            };

            msg.channel.send({
                embed: errorTemplate
            });
        }
    }
}