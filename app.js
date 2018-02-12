const tmi = require('tmi.js');
const commands = require('./all_commands.js');
const options = require('./tools/options.js');

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
            .then(res => { client.say(channel, res) }).catch(err => { console.log('wr err') });
            break;
        case '!pb':
            commands.get_pb(info_object)
            .then(res => { client.say(channel, res) }).catch(err => { console.log('pb err') });
            break;
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
            const uptime = commands.get_uptime(info_object)
            .then(res => {
                console.log(res);
                client.say(channel, res)

            }).catch(err => {
                client.say(channel,
                    info_object.channel + ' is not online');
                console.log(err);
            });
            break;
        case '!title':
            const title = commands.get_title(info_object)
            .then(res => {
                client.say(channel, res)
            }).catch(err => {
                console.log(err);
            });
            break;
        case '!hl':
            commands.set_highlight(info_object)
            .then(res => { client.say(channel, res) })
            .catch(err => { console.log('HL err') })
            break;
        case '!hls':
            const highlight_list = commands.get_highlights(info_object)
            .then(res => {
                console.log(res);
                client.say(channel, 'Highlights: ' + res.join(', '))
            }).catch(err => {
                console.log(err)
            });
            break;
        case '!gethl':
            const target_highlight = commands.get_target_highlight(info_object)
            .then(res => {
                client.say(channel, res.hl_name + ', ' + res.hl_url + '?t=' + (res.timestamp-40) + 's')
            }).catch(err => {
                client.say(channel, 'Cannot find highlight')
            });
            console.log(target_highlight);
            break;
        case '!dhl':
            const deleted_highlight = commands.delete_highlight(info_object)
            .then(res => {
                console.log(res)
            }).catch(err => {
                console.log(err)
            });
            break;
        case '!followage':
            const followage = commands.get_followage(info_object)
            .then(res => {
                // console.log(res);
                client.say(channel, userstate['display-name'] + ' followage: ' + res + ' days')
            }).catch(err => {
                client.say(channel, 'Cannot find followage');
            });

            break;
        case '!editor':
            client.say(channel, 'https://atom.io/')
            break;
        case '!gucci':
            client.say(channel, 'Eleesuh is one GUCCI gurl!')
            break;
        case '!slots':
            var emotes = ['Kappa','Jebaited','MingLee','DansGame','PogChamp', 'Kreygasm']
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
            client.say('habbe', sentence.slice(0,-2))
            break;
        default:
            // console.log('DEFAULT');
            break;
    }
})
