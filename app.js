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
    db.defaults({ games: [], users: [], runners: [] }).write();
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
            return client.say(channel, res);
        case "!pb":
            res = await commands.get_pb(info_object);
            return client.say(channel, res);
        case "!ilwr":
            res = await commands.get_il_wr(info_object);
            return client.say(channel, res);
        case "!ilpb":
            res = await commands.get_il_pb(info_object);
            return client.say(channel, res);
        case "!ttwr":
            res = await commands.get_tt_wr(info_object);
            return client.say(channel, res);
        case "!ttpb":
            res = await commands.get_tt_pb(info_object);
            return client.say(channel, res);
        case "!enable":
            res = await commands.enable_component(info_object);
            return client.say(channel, res);
        case "!disable":
            res = await commands.disable_component(info_object);
            return client.say(channel, res);
        case "!addcmd":
        case "!newcmd":
            res = await commands.new_cc(info_object);
            return client.say(channel, res);
        case "!deletecmd":
        case "!removecmd":
        case "!delcmd":
            res = await commands.delete_cc(info_object);
            return client.say(channel, res);
        case "!uptime":
            res = await commands.get_uptime(info_object);
            return client.say(channel, res);
        case "!title":
            res = await commands.get_title(info_object);
            return client.say(channel, res);
        // case "!hl":
        case "!ts":
            res = await commands.set_highlight(info_object);
            return client.say(channel, res);
        // case "!hls":
        case "!allts":
            res = await commands.get_highlights(info_object);
            return client.say(channel, res);
        // case "!gethl":
        case "!grabts":
            res = await commands.get_target_highlight(info_object);
            return client.say(channel, res);
        // case "!dhl":
        case "!dts":
            res = await commands.delete_highlight(info_object);
            return client.say(channel, res);
        case "!followage":
            res = await commands.get_followage(info_object);
            return client.say(channel, res);
        case "!slots":
            res = await commands.slots(info_object);
            return client.say(channel, res);
        case "!addperm":
            res = await commands.add_permission(info_object);
            return client.say(channel, res);
        case "!getperm":
            res = await commands.list_permission_string(info_object);
            return client.say(channel, res);
        case "!delperm":
            res = await commands.remove_permission(info_object);
            return client.say(channel, res);
        case "!time":
            return; // client.say(channel, "Doesnt work yet");
        case "!connect":
        case "!join":
            res = await commands.join_channel(info_object, client);
            return client.say(channel, res);
        case "!disconnect":
        case "!part":
        case "!leave":
            res = await commands.leave_channel(info_object, client);
            return client.say(channel, res);
        case "!help":
            res = await commands.help_command(info_object);
            return client.say(channel, res);
        case "!setspeedrunner":
            res = await commands.set_username(info_object);
            return client.say(channel, res);
        default:
            // console.log('DEFAULT');
            break;
    }
    if (split_msg[0].startsWith("!")) {
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
