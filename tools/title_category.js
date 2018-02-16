const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fetching = require('./fetching.js');
const fuse = require('./fuse.js');
const util = require('./util.js');

const get_game_id = async (info_object) => {
    let { channel, userstate, message, split_msg } = info_object;
    const msg_game = split_msg.length > 1 && split_msg[1];
    const adapter = new FileSync('game_id_list.json');
    const db = low(adapter);
    console.log('msg_game: ' + msg_game);
    if (msg_game) {
        if (!db.has(msg_game).value()) {
            return fetching.get_speedrungame_by_abbreviation(msg_game)
            .then(res => {
                db.set(msg_game, res.data.data[0].id).write()
                return res.data.data[0].id
            });
        } else {
            console.log('Found game');
            return db.get(msg_game).value()
        }

    } else {
        const twitch_channel = await fetching.get_twitch_channel(channel);
        const twitch_game = await fetching.get_twitch_game(twitch_channel.data.data[0].game_id);
        const speedrun_game = await fetching.get_speedrungame_by_name(twitch_game.data.data[0].name);
        if (!db.has(speedrun_game.data.data[0].abbreviation)) {
            db.set(speedrun_game.data.data[0].abbreviation, speedrun_game.data.data[0].id).write();
            return speedrun_game.data.data[0].id;
        } else {
            return speedrun_game.data.data[0].id;
        }
    }
};

const get_category = async (info_object) => {
    let { channel, userstate, message, split_msg } = info_object;
    let msg_category = split_msg.length > 2 && split_msg[2];
    const game_id = await get_game_id(info_object)
    const speedrun_game = await fetching.get_speedrungame_by_id(game_id)
    const category_uri = util.get_game_link(speedrun_game.data.data, 'categories')
    const category_list = await fetching.fetch_speedrun_uri(category_uri);
    const fuse_list = fuse.set_fuse_list(category_list.data.data);
    // console.log(fuse_list);
    let fuse_shit;
    if (msg_category) {
        msg_category = split_msg.slice(1).join(' ')
        fuse_hit = fuse.get_fuse_result(fuse_list, msg_category)
    } else {
        const twitch_channel = await fetching.get_twitch_channel(channel);
        fuse_hit = fuse.get_fuse_result(fuse_list, twitch_channel.data.data[0].title)
    }
    return {
        fuse_hit: fuse_hit,
        game_id: game_id,
        category_id: fuse_hit.category_id,
        speedrun_game: speedrun_game
    }
};

const set_game_and_category = async (info_object) => {
    let { channel, userstate, message, split_msg } = info_object;
    const msg_game = split_msg.length > 1 && split_msg[1];
    const msg_category = split_msg.length > 2 && split_msg[2];
    const game_id_and_category = await get_category(info_object);

    return game_id_and_category
};

module.exports = {
    get_game_id: get_game_id,
    get_category: get_category,
    set_game_and_category: set_game_and_category
}
