const Commando = require('discord.js-commando');
const client = new Commando.Client({
    autoReconnect: true,
    commandPrefix: 'lk!',
    owner: '141382611518881792'
});
const fs = require('fs');
const path = require('path');
var cache = require('memory-cache');
const settings = require('./settings.json');
const guild = "383159459431710720";

cache.put("settings", settings)

var top;
var jungle;
var mid;
var bot;
var support;


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
    console.log("Bot ready")
    top = client.guilds.get(guild).roles.get(settings.top);
    jungle = client.guilds.get(guild).roles.get(settings.jungle);
    mid = client.guilds.get(guild).roles.get(settings.mid);
    bot = client.guilds.get(guild).roles.get(settings.bot);
    support = client.guilds.get(guild).roles.get(settings.support);

    if (fs.existsSync('./resources/reactionRoleData.json')) {
        fs.readFile('./resources/reactionRoleData.json', function read(err, data) {
            if (err) {
                throw err;
            }
            data = JSON.parse(data)

            cache.put('reactionRoleInf', data);
        });
    } else {
        fs.writeFile("./resources/reactionRoleData.json", "{}", function(err) {
            if (err) {
                return console.log(err);
            }
        });
        cache.put('reactionRoleInf', {});
    }
});

client.on('raw', packet => {
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    const channel = client.channels.get(packet.d.channel_id);
    if (channel.messages.has(packet.d.message_id)) return;
    channel.fetchMessage(packet.d.message_id).then(message => {
        const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        const reaction = message.reactions.get(emoji);
        const reactionUser = client.users.get(packet.d.user_id);
        if (reaction) reaction.users.set(packet.d.user_id, reactionUser);
        if (!reactionUser.bot) {
            if (packet.t === 'MESSAGE_REACTION_ADD') {
                client.emit('messageReactionAdd', reaction, reactionUser);
            }
            if (packet.t === 'MESSAGE_REACTION_REMOVE') {
                client.emit('messageReactionRemove', reaction, reactionUser);
            }
        }
    });
});

client.on('messageReactionAdd', async function(reaction, user) {
    const reactionData = cache.get('reactionRoleInf');
    const reactionGuild = reaction.message.guild;
    const reactionMessage = reaction.message;
    if (reactionData.hasOwnProperty(reactionMessage.id)) {
        var roleInData = reactionData[reactionMessage.id].filter(re => re[0] == reaction.emoji.name || re[0].name == reaction.emoji.name)
        if (roleInData.length != 0) {
            var guilduser = await reactionGuild.fetchMember(user);
            var reactionRole = await reactionGuild.roles.get(roleInData[0][1]);
            if (!guilduser.roles.has(roleInData[0][1])) {
                guilduser.addRole(reactionRole);

                guilduser.send(`Successfully added the position ${reactionRole.name} in ${reactionGuild.name}`)

                var roles = [top, mid, bot, support, jungle];

                roles = roles.filter(rl => rl.name != reactionRole.name);
                var hasOtherRoles = false;
                var itemP = 0;

                roles.forEach(uRole => {
                    if (guilduser.roles.has(uRole.id)) {
                        hasOtherRoles = true;
                    }
                    itemP++;
                    if (itemP === roles.length) {
                        if (!hasOtherRoles) {
                            fs.readFile('./userdata.json', function read(err, data) {
                                if (err) {
                                    throw err;
                                }
                                data = JSON.parse(data);

                                if (!data.hasOwnProperty(user.id)) {
                                    data[user.id] = {}
                                }

                                data[user.id]["mainrole"] = reactionRole.id;
                                fs.writeFile("./userdata.json", JSON.stringify(data), function(err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                });
                            })
                        }
                    }
                })
            }
        }
    }

});

client.on('messageReactionRemove', async function(reaction, user) {
    const reactionData = cache.get('reactionRoleInf');
    const reactionGuild = reaction.message.guild;
    const reactionMessage = reaction.message;
    if (reactionData.hasOwnProperty(reactionMessage.id)) {
        var roleInData = reactionData[reactionMessage.id].filter(re => re[0] == reaction.emoji.name || re[0].name == reaction.emoji.name)
        if (roleInData.length != 0) {
            var guilduser = await reactionGuild.fetchMember(user);
            var reactionRole = await reactionGuild.roles.get(roleInData[0][1]);

            if (guilduser.roles.has(roleInData[0][1])) {
                guilduser.removeRole(reactionRole);

                guilduser.send(`Successfully removed the position ${reactionRole.name} in ${reactionGuild.name}`)
            }
        }
    }
});

client.login(settings["bot_token"]);