const Commando = require('discord.js-commando');
const client = new Commando.Client({
    autoReconnect: true,
    commandPrefix: 'lkt!',
    owner: '141382611518881792',
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
const fs = require('fs');
const path = require('path');
var cache = require('memory-cache');
const settings = require('./settings.json');

cache.put("settings", settings)


//Settings
const dmUserAfter = true; // Default, can be changed to false
var messageSentAdd = 'Successfully added the role {rolename} in {server}';
var messageSentRemove = 'Successfully removed the role {rolename} in {server}';
// The only variables that work rn, {rolename} and {server}

//"top":"675150469286592523",
//"bot":"675150548558807050",
//"support":"675150569685516322",
//"jungle":"675150501574082570",
//"mid":"675150528782794792"

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['lkids', 'Leauge of Legends Commands'],
        ['mods', 'Only used by mods']
    ])

    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));




client.on('error', console.error);

client.once('ready', () => {
    console.log("Bot ready || Online")

    if (fs.existsSync('./data/reactionRoleData.json')) {
        fs.readFile('./data/reactionRoleData.json', function read(err, data) {
            if (err) {
                throw err;
            }
            data = JSON.parse(data)

            cache.put('reactionRoleInf', data);
        });
    } else {
        fs.writeFile("./data/reactionRoleData.json", "{}", function(err) {
            if (err) {
                return console.log(err);
            }
        });
        cache.put('reactionRoleInf', {});
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
            await user.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            return;
        }
    }

    if (!user.bot) {
        const reactionData = cache.get('reactionRoleInf');
        const reactionGuild = reaction.message.guild;
        const reactionMessage = reaction.message;
        if (reactionData.hasOwnProperty(reactionMessage.id)) {
            var emojiName = reaction.emoji.name;
            var roleInData = await reactionData[reactionMessage.id].filter(re => re[0] == emojiName || re[0].name == emojiName)
            if (roleInData.length != 0) {
                var guilduser = await reactionGuild.members.fetch(user);
                var roleData = roleInData[0][1];
                var reactionRole = await reactionGuild.roles.fetch(roleData);

                if (!guilduser.roles.cache.has(roleData)) {
                    guilduser.roles.add(reactionRole);

                    if (dmUserAfter) {
                        guilduser.send(messageSentAdd.replace("{rolename}", `**${reactionRole.name}**`).replace("{server}", `**${reactionGuild.name}**`));
                    }
                }
            }
        }
    }

});

client.on('messageReactionRemove', async (reaction, user)  => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
            await user.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            return;
        }
    }

    if (!user.bot) {
        const reactionData = cache.get('reactionRoleInf');
        const reactionGuild = reaction.message.guild;
        const reactionMessage = reaction.message;
        if (reactionData.hasOwnProperty(reactionMessage.id)) {
            var emojiName = reaction.emoji.name;
            var roleInData = reactionData[reactionMessage.id].filter(re => re[0] == emojiName || re[0].name == emojiName)
            if (roleInData.length != 0) {
                var guilduser = await reactionGuild.members.fetch(user);
                var roleData = roleInData[0][1];
                var reactionRole = await reactionGuild.roles.fetch(roleData);

                if (guilduser.roles.cache.has(roleData)) {
                    guilduser.roles.remove(reactionRole);
                    if (dmUserAfter) {
                        guilduser.send(messageSentRemove.replace("{rolename}", `**${reactionRole.name}**`).replace("{server}", `**${reactionGuild.name}**`));
                    }
                }
            }
        }
    }
});

client.login(settings["bot_token"]);