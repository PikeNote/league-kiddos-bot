const {
    Command
} = require('discord.js-commando');
var cache = require('memory-cache');

module.exports = class rolemenu extends Command {
    constructor(client) {
        super(client, {
            name: 'rolemenu',
            group: 'mods',
            memberName: 'rolemenu',
            description: 'Sets a role reaction menu.',
            examples: ['rolemenu']
        });
    }
    
    run(msg) {
        if (msg.member.permissions.has("MANAGE_MESSAGES")) {
            let reactionArray = [];
            let rectarray = cache.get('reactionRoleInf')
            let emojiArray = [];
            let roleArray = [];
            let errorCatch = 5;
            let localEmoji = msg.guild.emojis.array();
            let localEmojiG = "Please make sure the emoji you selected is in this server!";
            let emojiTimerRe = 0;
            var interval;
            let regex = /[^\u0000-\u00ff]/;
            const fs = require('fs');

            function specCheck(str) {
                if (!str.length) return false;
                if (str.charCodeAt(0) > 255) return true;
                return regex.test(str);
            }




            msg.channel.send(`Welcome to the autorole promt.\nPlease now mention/name a role (case sensitive) along with an emoji.\nEx. @role/role ✅`)
                .then((message) => {
                    msg.channel.awaitMessages(response => response.author.id == msg.author.id, {
                            max: 1,
                            time: 60000,
                            errors: ['time'],
                        })
                        .then(async function(collected) {
                            msg.author.lastMessage.delete();
                            if (collected.first().content.split(/ +/g).length > 1) {
                                if (collected.first().content.split(/ +/g)[0] != null) {
                                    const tstValidRole = await msg.guild.roles.find(role => role.name === collected.first().content.split(/ +/g)[0]);
                                    if (collected.first().mentions.roles.first() || tstValidRole != null) {
                                        var unicodeStored = collected.first().content.split(/ +/g)[1];
                                        var roleMentioned;
                                        if (collected.first().mentions.roles.first() != null) {
                                            roleMentioned = collected.first().mentions.roles.first();
                                        } else {
                                            roleMentioned = tstValidRole;
                                        }
                                        if (specCheck(unicodeStored) || unicodeStored.includes("<:") || unicodeStored.includes("<a:")) {
                                            var emoji;
                                            if (unicodeStored.includes("<:") || unicodeStored.includes("<a:")) {
                                                unicodeStored = unicodeStored.replace(/\D/g, '');
                                                emoji = localEmoji.filter(emojiT => emojiT.id == unicodeStored);
                                                if (emoji.length > 0) {
                                                    unicodeStored = emoji[0];
                                                    delete unicodeStored['guild']
                                                    reactionArray.push([unicodeStored, roleMentioned.id, roleMentioned.name]);
                                                    emojiArray.push(unicodeStored);
                                                    roleArray.push(roleMentioned.id);
                                                    message.edit(`You have attached the role **${roleMentioned.name}** to the reaction ${unicodeStored}.\nIf this is correct, please respond "confirm".\nIf not, please respond "cancel" to cancel the prompt.`);
                                                    msg.channel.awaitMessages(response => response.author.id == msg.author.id, {
                                                            max: 1,
                                                            time: 60000,
                                                            errors: ['time'],
                                                        })
                                                        .then((collected) => {
                                                            msg.author.lastMessage.delete();
                                                            if (collected.first().content.toLowerCase() == "confirm") {
                                                                reAsk(message)
                                                            } else if (collected.first().content.toLowerCase() == "cancel") {
                                                                message.delete();
                                                                msg.channel.send("Prompt has been cancelled.\nPlease re-execute the command to go through the prompt again!");
                                                            } else {
                                                                message.delete();
                                                                msg.channel.send("Prompt has been cancelled, you didn't provide a valid response!\nPlease re-execute the command to go through the prompt again!");
                                                            }
                                                        }).catch(() => {
                                                            message.delete();
                                                            msg.channel.send('Sorry, you didnt provide a valid response in time!\nPlease re-execute the command to go through the prompt again!');
                                                        });
                                                } else {
                                                    message.delete();
                                                    msg.channel.send(`Prompt has been cancelled, you didn't provide a custom emoji!\n${localEmojiG}\nPlease re-execute the command to go through the prompt again!`);
                                                }
                                            } else {
                                                reactionArray.push([unicodeStored, roleMentioned.id, roleMentioned.name]);
                                                emojiArray.push(unicodeStored);
                                                roleArray.push(roleMentioned.id);
                                                message.edit(`You have attached the role **${roleMentioned.name}** to the reaction ${unicodeStored}.\nIf this is correct, please respond "confirm".\nIf not, please respond "cancel" to cancel the prompt.`);
                                                msg.channel.awaitMessages(response => response.author.id == msg.author.id, {
                                                        max: 1,
                                                        time: 60000,
                                                        errors: ['time'],
                                                    })
                                                    .then((collected) => {
                                                        msg.author.lastMessage.delete();
                                                        if (collected.first().content.toLowerCase() == "confirm") {
                                                            reAsk(message)
                                                        } else if (collected.first().content.toLowerCase() == "cancel") {
                                                            message.delete();
                                                            msg.channel.send("Prompt has been cancelled.\nPlease re-execute the command to go through the prompt again!");
                                                        } else {
                                                            message.delete();
                                                            msg.channel.send("Prompt has been cancelled, you didn't provide a valid response!\nPlease re-execute the command to go through the prompt again!");
                                                        }
                                                    }).catch(() => {
                                                        message.delete();
                                                        msg.channel.send('Sorry, you didnt provide a valid response in time!\nPlease re-execute the command to go through the prompt again!');
                                                    });
                                            }
                                        } else {
                                            message.delete();
                                            msg.channel.send("Prompt has been cancelled, you didn't provide a valid emoji!\nPlease re-execute the command to go through the prompt again!");
                                        }

                                    } else {
                                        message.delete();
                                        msg.channel.send("Prompt has been cancelled, you didn't provide a valid response!\nPlease re-execute the command to go through the prompt again!");
                                    }
                                } else {
                                    message.delete();
                                    msg.channel.send("Prompt has been cancelled, you didn't provide a valid mentioned role!\nPlease re-execute the command to go through the prompt again!");
                                }
                            } else {
                                message.delete();
                                msg.channel.send("Prompt has been cancelled, you didn't provide a emoji/mentioned role!\nPlease re-execute the command to go through the prompt again!");
                            }
                        }).catch((error) => {
                            console.log(error);
                            message.delete();
                            msg.channel.send('Sorry, you didnt provide a valid response in time!\nPlease re-execute the command to go through the prompt again!');
                        });
                })

            function reAsk(message, extra) {
                if (extra == null) {
                    extra = " ";
                }
                if (reactionArray.length != 10) {
                    var finalText = "";
                    reactionArray.forEach(subarray => {
                        finalText = finalText + `${subarray[0]} => ${subarray[2]}\n`
                    })
                    message.edit(`So far you have the following connections (Max 10)\n ${finalText}\n\nIf you would like to attach another reaction to a role, please insert a role along with an emoji.\nIf not, please reply with "done".\nIf you would like to cancel the prompt, please respond with "cancel"\n${extra}`);
                    msg.channel.awaitMessages(response => response.author.id == msg.author.id, {
                            max: 1,
                            time: 60000,
                            errors: ['time'],
                        })
                        .then(async function(collected) {
                            msg.author.lastMessage.delete();
                            if (collected.first().content.toLowerCase() == "done") {
                                done(message)
                            } else if (collected.first().content.toLowerCase() == "cancel") {
                                message.delete();
                                msg.channel.send("Prompt has been cancelled.\nPlease re-execute the command to go through the prompt again!");
                            } else {
                                if (collected.first().content.split(/ +/g).length > 1) {
                                    const tstValidRole = await msg.guild.roles.find(role => role.name === collected.first().content.split(/ +/g)[0]);
                                    if (collected.first().mentions.roles.first() || tstValidRole != null) {
                                        var unicodeStored = collected.first().content.split(/ +/g)[1];
                                        var roleMentioned;
                                        if (collected.first().mentions.roles.first() != null) {
                                            roleMentioned = collected.first().mentions.roles.first();
                                        } else {
                                            roleMentioned = tstValidRole;
                                        }
                                        if (unicodeStored != null) {
                                            if (!emojiArray.includes(unicodeStored)) {
                                                if (!roleArray.includes(roleMentioned.id)) {
                                                    if (specCheck(unicodeStored) || unicodeStored.includes("<:") || unicodeStored.includes("<a:")) {
                                                        var emoji;
                                                        if (unicodeStored.includes("<:") || unicodeStored.includes("<a:")) {
                                                            unicodeStored = unicodeStored.replace(/\D/g, '');
                                                            emoji = localEmoji.filter(emojiT => emojiT.id == unicodeStored);
                                                            if (emoji.length > 0) {
                                                                unicodeStored = emoji[0];
                                                                delete unicodeStored['guild']
                                                                reactionArray.push([unicodeStored, roleMentioned.id, roleMentioned.name]);
                                                                emojiArray.push(unicodeStored);
                                                                roleArray.push(roleMentioned.id);
                                                                reAsk(message);
                                                            } else {
                                                                if (errorCatch > 0) {
                                                                    errorCatch -= 1;
                                                                    reAsk(message, `Please provide a valid custom emoji!\n${localEmojiG}\nTries left - ${errorCatch}`);
                                                                } else {
                                                                    message.delete();
                                                                    msg.channel.send(`Prompt has been cancelled, you provided an invalid custom emoji!\n${localEmojiG}\nPlease re-execute the command to go through the prompt again!`);
                                                                }
                                                            }
                                                        } else {
                                                            reactionArray.push([unicodeStored, roleMentioned.id, roleMentioned.name]);
                                                            emojiArray.push(unicodeStored);
                                                            roleArray.push(roleMentioned.id);
                                                            reAsk(message);
                                                        }

                                                    } else {

                                                        if (errorCatch > 0) {
                                                            errorCatch -= 1;
                                                            reAsk(message, `Please don't use the same emoji twice!\nTries left - ${errorCatch}`)
                                                        } else {
                                                            message.delete();
                                                            msg.channel.send("Prompt has been cancelled, you used the same emoji twice for differnt roles!\nPlease re-execute the command to go through the prompt again!");
                                                        }
                                                    }
                                                } else {
                                                    if (errorCatch > 0) {
                                                        errorCatch -= 1;
                                                        reAsk(message, `Please don't use the same role twice!\nTries left - ${errorCatch}`)
                                                    } else {
                                                        message.delete();
                                                        msg.channel.send("Prompt has been cancelled, you used the same role twice in the prompt!\nPlease re-execute the command to go through the prompt again!");
                                                    }
                                                }
                                            } else {
                                                if (errorCatch > 0) {
                                                    errorCatch -= 1;
                                                    reAsk(message, `Please provide a valid emoji!\nTries left - ${errorCatch}`)
                                                } else {
                                                    message.delete();
                                                    msg.channel.send("Prompt has been cancelled, you didn't provide a valid emoji!\nPlease re-execute the command to go through the prompt again!");
                                                }
                                            }
                                        }
                                    } else {
                                        if (errorCatch > 0) {
                                            errorCatch -= 1;
                                            reAsk(message, `Please mention a valid role!\nTries left - ${errorCatch}`)
                                        } else {
                                            message.delete();
                                            msg.channel.send("Prompt has been cancelled, you didn't mention a valid role!\nPlease re-execute the command to go through the prompt again!");
                                        }
                                    }
                                } else {
                                    if (errorCatch > 0) {
                                        errorCatch -= 1;
                                        reAsk(message, `Please provide a valid emoji/role!\nTries left - ${errorCatch}`)
                                    } else {
                                        message.delete();
                                        msg.channel.send("Prompt has been cancelled, you didn't provide a emoji/mentioned role!\nPlease re-execute the command to go through the prompt again!");
                                    }
                                }
                            }
                        }).catch((error) => {
                            console.log(error);
                            message.delete();
                            msg.channel.send('Sorry, you didnt provide a valid response in time!\nPlease re-execute the command to go through the prompt again!');
                        });
                } else {
                    done(message);
                }

            }

            function done(message) {
                var finalText = "";
                reactionArray.forEach(subarray => {
                    finalText = finalText + `${subarray[0]} => ${subarray[2]}\n`
                })
                message.edit(`Final conformation menu\n\nBelow is the list of reactions to their roles\n${finalText}\n\nIf this is correct, please respond with a mention to a text channel where the role menu will be sent.\nIf this isn't correct, respond with "cancel" to cancel the prompt.`)
                msg.channel.awaitMessages(response => response.author.id == msg.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ['time'],
                    })
                    .then((collected) => {
                        msg.author.lastMessage.delete();
                        if (collected.first().mentions.channels.first()) {
                            var menchannel = collected.first().mentions.channels.first()
                            message.delete();
                            menchannel.send({
                                    embed: {
                                        color: 0xffff00,
                                        title: "Role Reaction Menu",
                                        description: `React with the reaction listed to get the listed role for that reaction.\n${finalText}`,
                                        timestamp: new Date()
                                    }
                                })
                                .then(embedmessage => {
                                    interval = setInterval(function() {
                                        emojiTimerInt(embedmessage, reactionArray);
                                    }, 500)
                                    rectarray[embedmessage.id] = reactionArray
                                    cache.put('reactionRoleInf', rectarray);
                                    fs.writeFile("./resources/reactionRoleData.json", JSON.stringify(rectarray), function(err) {
                                        if (err) {
                                            return console.log(err);
                                        }
                                    });
                                })
                        } else if (collected.first().content == "cancel") {
                            message.delete();
                            msg.channel.send("Prompt has been cancelled.\nPlease re-execute the command to go through the prompt again!");
                        } else {
                            message.delete();
                            msg.channel.send("Prompt has been cancelled, you didn't provide a valid response!\nPlease re-execute the command to go through the prompt again!");
                        }
                    }).catch(() => {
                        message.delete();
                        msg.channel.send('Sorry, you didnt provide a valid response in time!\nPlease re-execute the command to go through the prompt again!');
                    });
            }

            function emojiTimerInt(message, subarray) {
                message.react(subarray[emojiTimerRe][0])
                emojiTimerRe += 1;

                if (emojiTimerRe == subarray.length) {
                    clearInterval(interval);
                }
            }
        }
    }
};