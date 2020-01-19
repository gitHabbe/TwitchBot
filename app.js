require("dotenv").load();
const tmi = require("tmi.js");
const commands = require("./all_commands.js");
const options = require("./options.js");
const FileSync = require("lowdb/adapters/FileSync");
const low = require("lowdb");

var client = new tmi.client(options);

client.connect();

client.on("connected", (address, port) => {
    console.log(`CONNECTED: ${address}:${port}`);
});

// client.on("join", (channel, username, self) => {
//     console.log(username + " joined!");
// });
// client.on("part", (channel, username, self) => {
//     console.log(username + " left.");
// });

client.on("resub", (channel, username, months, message, userstate, methods) => {
    client.say(channel, "MY MAN! " + username.toUpperCase());
});
client.on("chat", async (channel, userstate, message, self) => {
    const split_msg = message.split(" ");
    let info_object = {
        channel: channel.slice(1),
        userstate,
        message,
        split_msg,
        self
    };
    let res;
    if (self) return;
    switch (split_msg[0]) {
        case "!test":
            await commands.list_permission(info_object);
            break;
        case "!wr":
            res = await commands.get_wr(info_object);
            client.say(channel, res);
            break;
        case "!pb":
            res = await commands.get_pb(info_object);
            client.say(channel, res);
            break;
        case "!ilwr":
            commands
                .get_il_wr(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;
        case "!ilpb":
            commands
                .get_il_pb(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;
        case "!enable":
            commands
                .enable_component(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;
        case "!disable":
            commands
                .disable_component(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;
        case "!addcmd":
        case "!newcmd":
            commands
                .new_cc(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log("New CC err");
                });
            break;
        case "!deletecmd":
        case "!removecmd":
        case "!delcmd":
            commands
                .delete_cc(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log("Delete CC err");
                });
            break;
        case "!uptime":
            commands
                .get_uptime(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    client.say(channel, info_object.channel + " is not online");
                });
            break;
        case "!title":
            commands
                .get_title(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;
        case "!hl":
            commands
                .set_highlight(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log("HL err");
                });
            break;
        case "!hls":
            commands
                .get_highlights(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;
        case "!gethl":
            commands
                .get_target_highlight(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    client.say(channel, "Cannot find highlight");
                });
            // console.log(target_highlight);
            break;
        case "!dhl":
            commands
                .delete_highlight(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;
        case "!followage":
            commands
                .get_followage(info_object)
                .then(res => {
                    client.say(channel, userstate["display-name"] + " followage: " + res + " days");
                })
                .catch(err => {
                    client.say(channel, "Cannot find followage");
                });
            break;
        case "!slots":
            commands
                .slots(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;
        case "!addperm":
            commands
                .add_permission(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;
        case "!getperm":
            commands
                .list_permission_string(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;
        case "!time":
            client.say(channel, "Doesnt work yet");
            // commands.get_timezone(info_object)
            // .then(res => { client.say(channel, res) }).catch(err => { console.log(err) })
            break;
        case "!connect":
        case "!join":
            commands
                .join_channel(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;

        case "!disconnect":
        case "!part":
        case "!leave":
            commands
                .leave_channel(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;
        case "!help":
            commands
                .help_command(info_object)
                .then(res => {
                    client.say(channel, res);
                })
                .catch(err => {
                    console.log(err);
                });
            break;
        default:
            // console.log('DEFAULT');
            break;
    }
    if (split_msg[0].startsWith("!")) {
        console.log("INSIDE");
        const adapter = new FileSync("./private/database.json");
        const db = low(adapter);
        if (db.has("reserved-words").value()) {
            const reserved_bool =
                db
                    .get("reserved-words")
                    .value()
                    .indexOf(split_msg[0]) >= 0;
            if (!reserved_bool) {
                commands
                    .check_cc(info_object)
                    .then(res => {
                        client.say(channel, res);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
            console.log("reserved_bool: ", reserved_bool);
        }
        console.log("AFTER IF");
    }
    if (message.indexOf("https://www.youtube.com") > -1) {
        commands
            .get_youtube_info(info_object)
            .then(res => {
                client.say(channel, res);
            })
            .catch(err => {
                console.log(err);
            });
    } else if (message.indexOf("https://youtu.be") > -1) {
        commands
            .get_youtube_info(info_object, true)
            .then(res => {
                client.say(channel, res);
            })
            .catch(err => {
                console.log(err);
            });
    } else if (message.indexOf("twitter.com/") > -1) {
        console.log("twitter");
        commands
            .get_tweet_info(info_object)
            .then(res => {
                client.say(channel, res);
            })
            .catch(err => {
                console.log(err);
            });
    }
});
