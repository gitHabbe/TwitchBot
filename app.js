require('dotenv').load();
const tmi = require('tmi.js');
const commands = require('./all_commands.js');
const tc = require('./tools/title_category')
const options = require('./private/options.js');

var client = new tmi.client(options.options);

client.connect();

client.on('connected', (address, port) => {
    console.log(`CONNECTED: ${address}:${port}`);
})

// client.on('join', (channel, username, self) => {
//     console.log(username + ' joined!');
// })
// client.on('part', (channel, username, self) => {
//     console.log(username + ' left.');
// })

client.on("resub", (channel, username, months, message, userstate, methods) => {
    client.say(channel, "MY MAN! " + username.username.toUpperCase())
});



client.on('chat', (channel, userstate, message, self) => {

    const split_msg = message.split(' ');
    let info_object = {
        channel: channel.slice(1),
        userstate: userstate,
        message: message,
        split_msg: split_msg,
        self: self
    };
    if (self) return;

    switch (split_msg[0]) {
        case '!wr':
            commands.get_wr(info_object)
            .then(res => { client.say(channel, res) })
            .catch(err => { console.log('wr err') });
            break;
        case '!pb':
            commands.get_pb(info_object)
            .then(res => { client.say(channel, res) }).catch(err => { console.log('pb err') });
            break;
        case '!addcmd':
        case '!newcmd':
            commands.new_cc(info_object)
            .then(res => { client.say(channel, res) })
            .catch(err => { console.log('New CC err') })
            break;
        case '!delcmd':
            commands.delete_cc(info_object)
            .then(res => { client.say(channel, res) })
            .catch(err => { console.log('Delete CC err') })
            break;
        case '!uptime':
            commands.get_uptime(info_object)
            .then(res => { client.say(channel, res) })
            .catch(err => { client.say(channel, info_object.channel + ' is not online') });
            break;
        case '!title':
            commands.get_title(info_object)
            .then(res => { client.say(channel, res) })
            .catch(err => { console.log(err) });
            break;
        case '!hl':
            commands.set_highlight(info_object)
            .then(res => { client.say(channel, res) })
            .catch(err => { console.log('HL err') })
            break;
        case '!hls':
            commands.get_highlights(info_object)
            .then(res => { client.say(channel, res) })
            .catch(err => { console.log(err) });
            break;
        case '!gethl':
            commands.get_target_highlight(info_object)
            .then(res => { client.say(channel, res.hl_name + ', ' + res.hl_url + '?t=' + (res.timestamp - 150) + 's') })
            .catch(err => { client.say(channel, 'Cannot find highlight') });
            // console.log(target_highlight);
            break;
        case '!dhl':
            commands.delete_highlight(info_object)
            .then(res => { client.say(channel, res) })
            .catch(err => { console.log(err) });
            break;
        case '!followage':
            commands.get_followage(info_object)
            .then(res => { client.say(channel, userstate['display-name'] + ' followage: ' + res + ' days') })
            .catch(err => { client.say(channel, 'Cannot find followage') });
            break;
        case '!slots':
            var emotes = ['Kappa','Jebaited','MingLee','DansGame','PogChamp', 'Kreygasm']
            // emotes = ['Kappa']
            var rolls = [];

            for (var i = 0; i < 3; i++) {
                var randomNr = Math.floor(Math.random() * emotes.length)
                // console.log(randomNr);
                rolls.push(randomNr)
            }
            var sentence = '';
            for (var i = 0; i < rolls.length; i++) {
                sentence += emotes[rolls[i]] + ' | ';
            }
            
            sentence = sentence.slice(0,-2)

            if (rolls[0] === rolls[1] && rolls[1] === rolls[2]) sentence+= ' ---> ' + userstate['display-name'] + ' Legend!'

            client.say('habbe', sentence)
            break;
        case '!addperm':
            commands.add_permission(info_object)
            .then(res => { client.say(channel, res) }).catch(err => { console.log(err) })
            break;
        case '!getperm':
            commands.list_permission(info_object, true)
            .then(res => { client.say(channel, res.names_string) }).catch(err => { console.log(err) })
            break;
        case '!time':
            client.say(channel, 'Doesnt work yet')
            // commands.get_timezone(info_object)
            // .then(res => { client.say(channel, res) }).catch(err => { console.log(err) })
            break;
        case '!connect':
        case '!join':
            commands.join_channel(info_object)
            .then(res => { client.say(channel, res) })
            .catch(err => { console.log(err) })
            break;
        
        case '!disconnect':
        case '!part':
        case '!leave':
            commands.leave_channel(info_object)
            .then(res => { client.say(channel, res) })
            .catch(err => { console.log(err) })
            break;
        default:
        // console.log('DEFAULT');
            break;
    }
    if (message.indexOf('https://www.youtube.com') > -1) {
        commands.get_youtube_info(info_object)
        .then(res => { client.say(channel, res) }).catch(err => { console.log(err) })
    } else if (message.indexOf('https://youtu.be') > -1) {
        commands.get_youtube_info(info_object, true)
        .then(res => { client.say(channel, res) }).catch(err => { console.log(err) })
    } else if (message.indexOf('twitter.com/') > -1) {
        console.log('twitter')
        commands.get_tweet_info(info_object)
        .then(res => { client.say(channel, res) }).catch(err => { console.log(err) })
    }
})
