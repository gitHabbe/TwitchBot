const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const fetching = require("./fetching.js");
const fuse = require("./fuse.js");
const util = require("./util.js");

const get_game_id = async info_object => {
    let { channel, userstate, split_msg } = info_object;
    const msg_game = split_msg.length > 1 && split_msg[1];
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    const gameDB = db.get("games");
    if (msg_game) {
        const is_gameDB = gameDB.find({ abbrev: msg_game }).value();
        if (!is_gameDB) {
            let gameData = await fetching.get_speedrungame_by_abbreviation(msg_game);
            gameData = gameData.data.data;
            if (gameData.length === 0) return msg_game + " is not a valid game.";
            const game_obj = {
                id: gameData[0].id,
                abbrev: gameData[0].abbreviation,
                categories: [],
                added_by: userstate.username,
                date: new Date()
            };
            db.get("games")
                .push(game_obj)
                .write();

            return game_obj;
        }
        return {
            id: is_gameDB.id,
            abbrev: is_gameDB.abbrev
        };
    } else {
        const twitch_channel = await fetching.get_twitch_channel(channel);
        const twitch_game = await fetching.get_twitch_game(twitch_channel.data.data[0].game_id);
        const speedrun_game = await fetching.get_speedrungame_by_name(twitch_game.data.data[0].name);
        const is_gameDB = gameDB.find({ id: speedrun_game.data.data[0].id }).value();
        const game_obj = {
            id: speedrun_game.data.data[0].id,
            abbrev: speedrun_game.data.data[0].abbreviation,
            categories: [],
            added_by: userstate.username,
            date: new Date()
        };
        if (!is_gameDB) {
            db.get("games")
                .push(game_obj)
                .write();
        }
        return game_obj;
    }
};

const get_category = async info_object => {
    let { channel, split_msg } = info_object;
    const gameData = await get_game_id(info_object);
    if (typeof gameData === "string") return gameData;
    const { id, abbrev } = gameData;
    let msg_category = split_msg.length > 2 && split_msg.slice(2);

    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    const gameDB = db.get("games").find({ abbrev });
    const categoriesDB = gameDB.get("categories").value();
    if (categoriesDB.length === 0) {
        // console.log("No category list found, fettching by id: ", id);
        const speedrun_game = await fetching.get_speedrungame_by_id(id);
        const category_uri = util.get_game_link(speedrun_game.data.data, "categories");
        const category_list_fetch = await fetching.fetch_speedrun_uri(category_uri);
        category_list_fetch.data.data.forEach(category_obj => {
            let { id, name, links } = category_obj;
            const hasLeaderboard = links.find(link => link.rel === "leaderboard");
            // const hasCategory = categoriesDB.findIndex(category => category.id === category_obj.id) === -1;
            if (!hasLeaderboard) return;
            gameDB
                .get("categories")
                .push({ id, name })
                .write();
        });
    }
    let fuse_hit;
    let category_list = categoriesDB;
    if (msg_category) {
        msg_category = split_msg.slice(2).join(" ");
        fuse_hit = fuse.get_fuse_result(category_list, msg_category);
    } else {
        category_list = categoriesDB;
        const twitch_channel = await fetching.get_twitch_channel(channel);
        fuse_hit = fuse.get_fuse_result(category_list, twitch_channel.data.data[0].title);
    }

    return {
        category_id: fuse_hit.id,
        game_id: id,
        category: fuse_hit.name
    };
};

const set_game_and_category = async info_object => {
    const game_id_and_category = await get_category(info_object);

    return game_id_and_category;
};

module.exports = {
    get_game_id,
    get_category,
    set_game_and_category
};
