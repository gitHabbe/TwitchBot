const fetching = require("./fetching.js");
const fuse = require("./fuse.js");
const util = require("./util.js");
const d = require("./db.js");

const get_game_id = async info_object => {
    let { channel, userstate, split_msg } = info_object;
    let is_gameDB;
    const msg_game = split_msg.length > 1 && split_msg[1];
    if (!msg_game) {
        const twitch_channel = await fetching.get_twitch_channel(channel);
        // const twitch_channel = await fetching.get_twitch_channel("Taggo");
        info_object.title = twitch_channel.data.data[0].title;
        const twitch_game = await fetching.get_twitch_game(twitch_channel.data.data[0].game_id);
        const speedrun_game = await fetching.get_speedrungame_by_name(twitch_game.data.data[0].name);
        if (speedrun_game.data.data.length === 0) {
            info_object.error = `${twitch_game.data.data[0].name} is not a speedrun game.`;
        }
        is_gameDB = d.getGameById(speedrun_game.data.data[0].id);
        if (!is_gameDB) {
            const category_uri = speedrun_game.data.data[0].links.find(link => link.rel === "categories");
            let category_list = await fetching.fetch_speedrun_uri(category_uri.uri);
            category_list = category_list.data.data.filter(cate => {
                return cate.links.find(link => {
                    return link.rel === "leaderboard";
                });
            });
            d.saveGame(speedrun_game, category_list, userstate);
        }
        is_gameDB = d.getGameById(speedrun_game.data.data[0].id);
    } else {
        is_gameDB = d.getGameByAbbrev(msg_game);
    }
    info_object.game = is_gameDB;
    info_object.game_id = is_gameDB.id;
    info_object.abbrev = is_gameDB.abbrev;
};

const get_category = async info_object => {
    await get_game_id(info_object);
    let { split_msg, title, game } = info_object;
    let msg_category = split_msg.length > 2 && split_msg.slice(2);
    let fuse_hit;
    if (!msg_category) {
        fuse_hit = fuse.get_fuse_result(game.categories, title);
    } else {
        msg_category = msg_category.join(" ");
        console.log("LOG: msg_category", msg_category);
        fuse_hit = fuse.get_fuse_result(game.categories, msg_category);
    }

    info_object.category_id = fuse_hit.id;
    info_object.category = fuse_hit.name;
};

module.exports = {
    get_game_id,
    get_category
};
