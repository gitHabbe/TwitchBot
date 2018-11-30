const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fetching = require('./fetching.js');
const fuse = require('./fuse.js');
const util = require('./util.js');

const get_game_id = async (info_object) => {
    let { channel, split_msg } = info_object;
    // Check if game abbrivation was provided
    const msg_game = split_msg.length > 1 && split_msg[1];
    const adapter = new FileSync('./Private/game_id_list.json');
    const db = low(adapter);
    if (msg_game) {
        // If no gameid in DB
        if (!db.has(msg_game + '.id').value()) {
            try {
                const speed_game = await fetching.get_speedrungame_by_abbreviation(msg_game);
                db.set(msg_game + '.id' , speed_game.data.data[0].id).write();
                return { 'game_id': speed_game.data.data[0].id, 'abbrev': speed_game.data.data[0].abbreviation };
            } catch (err) {
                return "Game not found.";
            }
        } else {
            return { 'game_id': db.get(msg_game + '.id').value(), 'abbrev': msg_game } 
        }
    } else {
        // Trying to fetch streamer current game
        console.log('No game specified, fetching twitch game...')
        try {
            const twitch_channel = await fetching.get_twitch_channel(channel);
            const twitch_game = await fetching.get_twitch_game(twitch_channel.data.data[0].game_id);
            const speedrun_game = await fetching.get_speedrungame_by_name(twitch_game.data.data[0].name);
            if (!db.has(speedrun_game.data.data[0].abbreviation)) {
                db.set(speedrun_game.data.data[0].abbreviation + '.id', speedrun_game.data.data[0].id).write();
                return { 'game_id': speedrun_game.data.data[0].id, 'abbrev': speedrun_game.data.data[0].abbreviation };
            } else {
                return { 'game_id': speedrun_game.data.data[0].id, 'abbrev': speedrun_game.data.data[0].abbreviation };
            }
        } catch (err) {
            return "Game not found.";
        }
    }
};

const get_category = async (info_object) => {
    let { channel, split_msg } = info_object;

    const { game_id, abbrev } = await get_game_id(info_object);
    // Check if game category was provided
    let msg_category = split_msg.length > 2 && split_msg.slice(2);
    
    const adapter = new FileSync('./Private/game_id_list.json');
    const db = low(adapter);
    if (!db.has(abbrev + '.categories').value()) db.set(abbrev + '.categories', []).write()
    
    const db_category_list = db.get(abbrev + '.categories').value();
    let category_list = [];
    if (db_category_list.length >= 1) {
        console.log('A category list was found in DB')
        category_list = db_category_list.map(category => {
            return { 'category': category.name, 'category_id': category.id }
        });
    } else {
        console.log('No category list found, fetching by id: ', game_id)
        const speedrun_game = await fetching.get_speedrungame_by_id(game_id);
        const category_uri = util.get_game_link(speedrun_game.data.data, 'categories');
        const category_list_fetch = await fetching.fetch_speedrun_uri(category_uri);
        category_list_fetch.data.data.forEach(category_obj => {
            // If category has a leaderboard and is not in DB
            if (category_obj.links.findIndex(link => link.rel === 'leaderboard') != -1 &&
            db.get(abbrev + '.categories').value().findIndex(category => category.id === category_obj.id) === -1) {
                db.get(abbrev + '.categories').push({
                    "id": category_obj.id,
                    "name": category_obj.name
                }).write()
                category_list.push({ 'category': category_obj.name, 'category_id': category_obj.id })
                console.log('Wrote new category to game')
            }
        });
    }
    if (msg_category) {
        msg_category = split_msg.slice(2).join(' ');
        console.log('Category specified by user: ', msg_category);
        fuse_hit = fuse.get_fuse_result(category_list, msg_category);
    } else {
        console.log('No category specified, fetching title...')
        const twitch_channel = await fetching.get_twitch_channel(channel);
        fuse_hit = fuse.get_fuse_result(category_list, twitch_channel.data.data[0].title);
    }
    console.log('category_list: ', category_list);
    console.log('fuse_hit: ', fuse_hit);

    return {
        fuse_hit,
        game_id,
        category_id: fuse_hit.category_id
    };
};

const set_game_and_category = async (info_object) => {
    const game_id_and_category = await get_category(info_object);

    return game_id_and_category
};

module.exports = {
    get_game_id,
    get_category,
    set_game_and_category
};
