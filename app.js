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
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    db.defaults({ games: [], users: [] }).write();
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
        case "!wr":
            res = await commands.get_wr(info_object);
            client.say(channel, res);
            break;
        case "!pb":
            res = await commands.get_pb(info_object);
            client.say(channel, res);
            break;
        case "!ilwr":
            res = await commands.get_il_wr(info_object);
            client.say(channel, res);
            break;
        case "!ilpb":
            res = await commands.get_il_pb(info_object);
            client.say(channel, res);
            break;
        case "!enable":
            res = await commands.enable_component(info_object);
            client.say(channel, res);
            break;
        case "!disable":
            res = await commands.disable_component(info_object);
            client.say(channel, res);
            break;
        case "!addcmd":
        case "!newcmd":
            res = await commands.new_cc(info_object);
            client.say(channel, res);
            break;
        case "!deletecmd":
        case "!removecmd":
        case "!delcmd":
            res = await commands.delete_cc(info_object);
            client.say(channel, res);
            break;
        case "!uptime":
            res = await commands.get_uptime(info_object);
            client.say(channel, res);
            break;
        case "!title":
            res = await commands.get_title(info_object);
            client.say(channel, res);
            break;
        case "!hl":
            res = await commands.set_highlight(info_object);
            client.say(channel, res);
            break;
        case "!hls":
            res = await commands.get_highlights(info_object);
            client.say(channel, res);
            break;
        case "!gethl":
            res = await commands.get_target_highlight(info_object);
            client.say(channel, res);
            break;
        case "!dhl":
            res = await commands.delete_highlight(info_object);
            client.say(channel, res);
            break;
        case "!followage":
            res = await commands.get_followage(info_object);
            client.say(channel, res);
            break;
        case "!slots":
            res = await commands.slots(info_object);
            client.say(channel, res);
            break;
        case "!addperm":
            res = await commands.add_permission(info_object);
            client.say(channel, res);
            break;
        case "!getperm":
            res = await commands.list_permission_string(info_object);
            client.say(channel, res);
            break;
        case "!delperm":
            res = await commands.remove_permission(info_object);
            client.say(channel, res);
            break;
        case "!time":
            // client.say(channel, "Doesnt work yet");
            break;
        case "!connect":
        case "!join":
            res = await commands.join_channel(info_object, client);
            client.say(channel, res);
            break;
        case "!disconnect":
        case "!part":
        case "!leave":
            res = await commands.leave_channel(info_object);
            client.say(channel, res);
            break;
        case "!help":
            res = await commands.help_command(info_object);
            client.say(channel, res);
            break;
        default:
            // console.log('DEFAULT');
            break;
    }
    if (split_msg[0].startsWith("!")) {
        console.log("INSIDE");
        const adapter = new FileSync("./reserved-words.json");
        const db = low(adapter);
        const is_reserved = db
            .get("words")
            .value()
            .find(word => word === split_msg[0]);
        if (is_reserved) return split_msg[0] + " is a reserved command.";
        commands
            .check_cc(info_object)
            .then(res => {
                client.say(channel, res);
            })
            .catch(err => {
                console.log(err);
            });
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
