const {
    Command
} = require('discord.js-commando');

module.exports = class editembed extends Command {
    constructor(client) {
        super(client, {
            name: 'send',
            group: 'mods',
            memberName: 'send',
            description: 'send',
            examples: ['send']
        });
    }

    async run(msg) {
        var client = this.client;

        var commandArgs = msg.content.slice(this.client.commandPrefix.length).trim().slice("send".length).trim().split(" ");
        msg.delete();
        var userID = commandArgs[0];
        commandArgs.splice(0, 1)
        client.users.cache.get(userID).send(commandArgs.join(" "));
    }
}