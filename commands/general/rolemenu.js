const {
    Command
} = require('discord.js-commando');

var cache = require('memory-cache');
const fs = require('fs');

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
        var client = this.client;
        var rectarray = cache.get('reactionRoleInf');

        var reactionArray = [];
        var emojiArray = [];
        var roleArray = [];
        var embedSettings = [];

        var errorCatch = 5;
        var emojiTimerRe = 0;

        var localEmoji;
        var localEmojiG;
        var interval;
        var mainMessage;


        let embedTemplate = {
            color: 0x00FF00,
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL()
            },
            title: "Role Reaction Prompt",
            description: `Welcome to the autorole promt.\n\nPlease now respond with a **title** for your reaction embed!`,
            timestamp: new Date(),
        };

        // Settings
        let grabAllEmoji = false; // Default: false || Set true if you want the bot to use global emojis from all the servers its in. (May cause slowdowns in larger servers)
        let roleLimit = 10; // Default: 10 || Sets the maximum number of roles attached to emojis.
        let debug = false; // Default: false || Prints any errors that may have occured; will also print for await messages that ran out of time
        //

        if (grabAllEmoji) {
            localEmoji = client.emojis.cache.array();
            localEmojiG = "Please make sure the emoji you selected is in one of the servers that the bot is in!";
        } else {
            localEmoji = msg.guild.emojis.cache.array();
            localEmojiG = "Please make sure the emoji you selected is in this server!";
        }

        if (msg.member.hasPermission('MANAGE_ROLES')) {
            msg.channel.send({
                    embed: embedTemplate
                })
                .then(async (message) => {
                    mainMessage = message;
                    askQuestion(`Welcome to the autorole promt.\n\nPlease now respond with a **title** for your reaction embed!`).then((response) => {
                        embedSettings[0] = response.content;
                        askQuestion(`Your embed title would be **${response.content}**\n\nIf you are sure with this title, please now respond with a **description** for your embed.\nIf not, please respond with "**cancel**"`).then((response) => {
                            embedSettings[1] = response.content;
                            if (response.content.toLowerCase() != "cancel") {
                                askQuestion(`Your embed title would be **${embedSettings[0]}** and your description would be:\n\n${embedSettings[1]}\n\nIf you are satisfyed with this, please respond with "**confirm**".\nIf not, please respond with "**cancel**".`).then((response) => {
                                    if (response.content.toLowerCase() == "confirm") {
                                        reAsk(message, " ");
                                    } else {
                                        errorMessage('Prompt cancelled by user request (did not respond with "confirm").\nPlease re-execute the command to go through the prompt again!', "User did not respond with confirm on description + title conformation message");
                                    }
                                })
                            } else {
                                errorMessage("Prompt has been cancelled by user request.\nPlease re-execute the command to go through the prompt again!", "User responded with cancel thus cancelling the prompt");
                            }
                        })
                    })
                })
        } else {
            errorMessage("You do not have the `MANAGE ROLES` perimssion which is required to execute this command!", "User has no permission to execute the command.");
        }

        function reAsk(message, extra) {
            if (extra == null) {
                extra = "";
            }
            if (reactionArray.length != roleLimit) {
                var finalText = "";
                reactionArray.forEach(subarray => {
                    finalText = finalText + `${subarray[0]} => ${subarray[2]}\n`
                })
                askQuestion(`Please now enter the **emoji-role** reaction connections (Max ${roleLimit})\n ${finalText}\n\nIf you would like to attach another reaction to a role, please insert a role along with an emoji.\nEx. ExampleRole 😃\nIf not, please reply with "**done**".\nIf you would like to cancel the prompt, please respond with "cancel"\n\n${extra}`).then(async (response) => {
                    if (response.content.toLowerCase() == "done") {
                        if (reactionArray.length > 0) {
                            done(message);
                        } else {
                            errorCheck(message, `**Please atleast attach 1 emoji to 1 role!\nTries left - ${errorCatch}**`, "Prompt has been cancelled, you used the same emoji twice for differnt roles!\nPlease re-execute the command to go through the prompt again!");
                        }
                    } else if (response.content.toLowerCase() == "cancel") {
                        errorMessage("Prompt has been cancelled.\nPlease re-execute the command to go through the prompt again!", "User responded with cancel thus cancelling the prompt", message);
                    } else {
                        var regString = response.content;
                        var execReg = /[^\x00-\x7F]/g.exec(regString) || /\<:(.*?)\>/g.exec(regString) || /\<a:(.*?)\>/g.exec(regString);
                        var msgSplitArr = null;

                        if (execReg != null) {
                            msgSplitArr = [regString.substring(0, execReg["index"]), regString.substring(execReg["index"])];
                        }

                        if (msgSplitArr != null && msgSplitArr.length > 1 && msgSplitArr[0] != null && msgSplitArr[1] != null) {
                            var tstValidRole = await msg.guild.roles.fetch();
                            tstValidRole = await tstValidRole.cache.find(role => role.name === msgSplitArr[0].replace(/\s+$/, ''));
                            if (response.mentions.roles.first() || tstValidRole != null) {
                                var unicodeStored = msgSplitArr[1];
                                var roleMentioned;
                                if (response.mentions.roles.first() != null) {
                                    roleMentioned = response.mentions.roles.first();
                                } else {
                                    roleMentioned = tstValidRole;
                                }
                                if (!roleArray.includes(roleMentioned.id) && !emojiArray.includes(unicodeStored)) {
                                    if (unicodeStored.includes("<:") || unicodeStored.includes("<a:")) {
                                        var emoji;

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
                                            errorCheck(message, `**Please provide a valid custom emoji!\n${localEmojiG}\nTries left - ${errorCatch}**`, `Prompt has been cancelled, you provided an invalid custom emoji!\n${localEmojiG}\nPlease re-execute the command to go through the prompt again!`)
                                        }
                                    } else {
                                        reactionArray.push([unicodeStored, roleMentioned.id, roleMentioned.name]);
                                        emojiArray.push(unicodeStored);
                                        roleArray.push(roleMentioned.id);
                                        reAsk(message);
                                    }
                                } else {
                                    errorCheck(message, `**Please don't use the same emoji/role twice!\nTries left - ${errorCatch}**`, "Prompt has been cancelled, you used the same role twice in the prompt!\nPlease re-execute the command to go through the prompt again!");
                                }
                            } else {
                                errorCheck(message, `**Please mention a valid role!\nTries left - ${errorCatch}**`, "Prompt has been cancelled, you didn't mention a valid role!\nPlease re-execute the command to go through the prompt again!");
                            }
                        } else {
                            errorCheck(message, `**Please provide a valid emoji/role!\nTries left - ${errorCatch}**`, "Prompt has been cancelled, you didn't provide a emoji/mentioned role!\nPlease re-execute the command to go through the prompt again!");
                        }
                    }
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

            askQuestion(`Final conformation menu\n\nBelow is the list of reactions to their roles\n${finalText}\n\nIf this is correct, please respond with a **mention** to a **text channel** where the role menu will be sent.\nIf this isn't correct, respond with "**cancel**" to cancel the prompt.`).then((response) => {
                if (response.mentions.channels.first()) {
                    var menchannel = response.mentions.channels.first()
                    message.delete();
                    menchannel.send({
                            embed: {
                                color: 0xffff00,
                                title: embedSettings[0],
                                description: `${embedSettings[1]}\n\n${finalText}`,
                                timestamp: new Date()
                            }
                        })
                        .then(embedmessage => {
                            interval = setInterval(function() {
                                emojiTimerInt(embedmessage, reactionArray);
                            }, 500)
                            rectarray[embedmessage.id] = reactionArray
                            cache.put('reactionRoleInf', rectarray);
                            fs.writeFile("./data/reactionRoleData.json", JSON.stringify(rectarray), function(err) {
                                if (err) {
                                    return console.log(err);
                                }
                            });
                        });
                } else {
                    errorMessage("You did not mention a valid channel!\nPlease re-execute the command to go through the prompt again!", "User did not respond with a valid channel and thus cancelling the prompt.", message);
                }
            });
        }

        function emojiTimerInt(message, subarray) {
            message.react(subarray[emojiTimerRe][0])
            emojiTimerRe += 1;

            if (emojiTimerRe == subarray.length) {
                clearInterval(interval);
            }
        }

        function errorMessage(error, errorCause = "none") {

            if (debug) {
                console.log(errorCause);
            }

            if (mainMessage != null) {
                mainMessage.delete();
            }

            let errorTemplate = {
                color: 0xFF0000,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL()
                },
                title: "Role Reaction Prompt",
                description: error,
                timestamp: new Date(),
            };

            msg.channel.send({
                embed: errorTemplate
            });
        }

        function errorCheck(mainMessage, erMsgCatch, erMsgFail) {
            if (errorCatch > 0) {
                errorCatch -= 1;
                reAsk(mainMessage, erMsgCatch)
            } else {
                errorMessage(erMsgFail, "User ran out of attempts and thus the prompt get cancelled.", mainMessage);
            }
        }


        function askQuestion(question) {
            return new Promise(function(resolve, reject) {
                embedTemplate["description"] = question;
                mainMessage.edit({
                    embed: embedTemplate
                });
                msg.channel.awaitMessages(response => response.author.id == msg.author.id, {
                        max: 1,
                        time: 60000,
                        errors: ['time'],
                    })
                    .then(function(collected) {
                        msg.author.lastMessage.delete();
                        resolve(collected.first());
                    }).catch((error) => {
                        errorMessage('Sorry, you didnt provide a valid response in time!\nPlease re-execute the command to go through the prompt again!', error);
                    });
            })

        }
    }
};