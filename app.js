require('dotenv').load();
const tmi = require('tmi.js');
const commands = require('./all_commands.js');
const tc = require('./tools/title_category')
const options = require('./Private/options.js');
const FileSync = require('lowdb/adapters/FileSync');
const low = require('lowdb');

var client = new tmi.client(options.options);

client.connect();

client.on('connected', (address, port) => {
    console.log(`CONNECTED: ${address}:${port}`);
});

client.on('join', (channel, username, self) => {
    console.log("+" + username);
});
client.on('part', (channel, username, self) => {
    console.log("-" + username);
});

client.on("resub", (channel, username, months, message, userstate, methods) => {
    client.say(channel, "MY MAN! " + username.toUpperCase())
});

client.on('chat', async (channel, userstate, message, self) => {

    const split_msg = message.split(' ');
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
        case '!wr':
            res = await commands.get_wr(info_object);
            client.say(channel, res);
            break;
        case '!pb':
            res = await commands.get_pb(info_object);
            client.say(channel, res);
            break;
        case '!ilwr':
            res = await commands.get_il_wr(info_object);
            client.say(channel, res);
            break;
        case '!ilpb':
            res = await commands.get_il_pb(info_object);
            client.say(channel, res);
            break;
        case '!enable':
            res = await commands.enable_component(info_object);
            client.say(channel, res);
            break;
        case '!disable':
            res = await commands.disable_component(info_object);
            client.say(channel, res);
            break;
        case '!addcmd':
        case '!newcmd':
            res = await commands.new_cc(info_object);
            client.say(channel, res);
            break;
        case '!deletecmd':
        case '!removecmd':
        case '!delcmd':
            res = await commands.delete_cc(info_object);
            client.say(channel, res);
            break;
        case '!uptime':
            res = await commands.get_uptime(info_object);
            client.say(channel, res);
            break;
        case '!title':
            res = await commands.get_title(info_object);
            client.say(channel, res);
            break;
        case '!hl':
        case '!ts':
            res = await commands.set_highlight(info_object);
            client.say(channel, res);
            break;
        case '!hls':
        case '!tslist':
        case '!tss':
            res = await commands.get_highlights(info_object);
            client.say(channel, res);
            break;
        case '!gethl':
        case '!getts':
            res = await commands.get_target_highlight(info_object);
            client.say(channel, res);
            break;
        case '!dhl':
        case '!dts':
            res = await commands.delete_highlight(info_object);
            client.say(channel, res);
            break;
        case '!followage':
            res = await commands.get_followage(info_object);
            client.say(channel, res);
            break;
        case '!slots':
            res = await commands.slots(info_object);
            client.say(channel, res);
            break;
        case '!addperm':
            res = await commands.add_permission(info_object);
            client.say(channel, res);
            break;
        case '!getperm':
            res = await commands.list_permission(info_object, true);
            client.say(channel, res.names_string);
            break;
        case '!time':
            client.say(channel, 'Doesnt work yet');
            break;
        case '!connect':
        case '!join':
            res = commands.join_channel(info_object);
            client.say(channel, res);
            break;
        case '!disconnect':
        case '!part':
        case '!leave':
            res = commands.leave_channel(info_object);
            client.say(channel, res);
            break;
        case '!help':
            res = commands.help_command(info_object);
            client.say(channel, res);
            break;
        default:
            break;
    }
    if (split_msg[0].startsWith("!")) {
        console.log('split_msg[0]: ', split_msg[0]);
        const adapter = new FileSync('./Private/database.json');
        const db = low(adapter);
        if (db.has("reserved-words").value()) {
            const reserved_bool = db.get("reserved-words").value().indexOf(split_msg[0]) >= 0;
            if (!reserved_bool) {
                commands.check_cc(info_object)
                .then(res => { client.say(channel, res) })
                .catch(err => { client.say(channel, "Command not found") })
            }
            console.log('reserved_bool: ', reserved_bool);  
        }
    }
    if (message.indexOf('https://www.youtube.com') > -1) {
        res = await commands.get_youtube_info(info_object);
        client.say(channel, res);
    } else if (message.indexOf('https://youtu.be') > -1) {
        res = await commands.get_youtube_info(info_object, true);
        client.say(channel, res);
    } else if (message.indexOf('twitter.com/') > -1) {
        res = await commands.get_tweet_info(info_object);
        client.say(channel, res);
    }
});
