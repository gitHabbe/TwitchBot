const tmi = require('tmi.js');
const options = require('./options.js');
const commands = require('./bot_commands/all_commands.js');

var client = new tmi.client(options.options);

client.connect();

client.on('connected', (address, port) => {
    console.log(`CONNECTED: ${address}:${port}`);
})

// client.on('join', (channel, username, self) => {
//     console.log(username + ' has joined!');
// })
// client.on('part', (channel, username, self) => {
//     console.log(username + ' has left...');
// })

client.on('chat', (channel, userstate, message, self) => {

    let info_object = {
        channel: channel,
        userstate: userstate,
        message: message,
        self: self
    }

    if (self) return;

    const split_msg = message.split(' ');
    if (split_msg[0] === '!wr') {
        const game_info = commands.get_wr(info_object)
        .then(res => {
            // console.log(res);
            client.say(
                channel, res.category +
                ' WR: ' + res.time + ' by ' + res.player +
                ' ' + res.days_ago + ' days ago')
        })
        .catch(err => {
            // client.say(channel, 'Cannot find run')
            console.log(err);
        });

    } else if (message.startsWith('!slots')) {
        var emotes = ['Kappa','Jebaited','MingLee','DansGame','PogChamp', 'Kreygasm']
        var rolls = [];

        for (var i = 0; i < 3; i++) {
            var randomNr = Math.floor(Math.random() * 5)
            console.log(randomNr);
            rolls.push(randomNr)
        }
        var sentence = '';
        for (var i = 0; i < rolls.length; i++) {
            sentence += emotes[rolls[i]] + ' | ';
        }
        client.say('habbe', sentence.slice(0,-2))
    }
})
