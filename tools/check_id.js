const fs = require('fs');
const fetch_wr = require('./fetch_wr.js');

// const check_game_id = (channel, msg_game, msg_category) => {
const check_game_id = (info_object) => {
    let { channel, userstate, message, msg_game, msg_category } = info_object;
    let found_game = false;
    const game_id_string = fs.readFileSync('./tools/game_id_list.txt', 'utf8');
    const game_id_list = game_id_string.slice(0, -1).split('\n');

    var game_id_array = [];
    game_id_list.forEach(game => {
        // const game_key = game.split(':')[0];
        // const game_value = game.split(':')[1];
        const [ game_key, game_value ] = game.split(':');
        game_id_array.push([game_key, game_value]);
    });

    if (msg_game) {
        console.log('GAME IS SPECIFIED');
        found_game = game_id_array.find(item => {
            // console.log('Found game: ' + item);
            return item[0] === msg_game;
        });
        if (found_game) {
            const found_game_id = found_game[1];
            info_object.found_game_id = found_game_id;
            const found_game_promise = fetch_wr.fetch_wr(info_object);

            return found_game_promise.then(data => {
                return { channel: channel, data: data }
            })
        } else {
            const new_game_promise = fetch_wr.fetch_wr(info_object);

            return new_game_promise.then(data => {
                fs.appendFileSync('./bot_commands/fetch_speedrun/game_id_list.txt', msg_game + ':' + data.data.data.id + '\n')
                return { channel: channel, data: data };
            })
        }
    } else if (!msg_game) {
        const current_game = fetch_wr.fetch_wr(info_object)
        return current_game
    }
    console.log('TRYING...');
    // MrDestructoid make_bot = 1; MrDestructoid
};

module.exports = {
    check_game_id: check_game_id
}
