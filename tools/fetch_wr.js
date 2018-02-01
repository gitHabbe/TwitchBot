const util = require('./util.js');
const fetching = require('./fetching.js');
const fuse = require('./fuse.js');

const get_game_link = (object, link_name) => {
    // return object.links.find(link => link.rel === link_name).uri;
    return object.links.find(link => {
        return link.rel === link_name
    }).uri;
};

const get_correct_category = (category_list, title) => {
    // console.log('TITLE: ' + title.toLowerCase());
    let found_category = category_list.find(category => {
        // console.log('CATEGORY: ' + category.name.toLowerCase());
        return title.toLowerCase().includes(category.name.toLowerCase())
    })
    // console.log(found_category);
    return { uri: get_game_link(found_category, 'leaderboard'), name: found_category.name }
};

async function fetch_wr(info_object) {
    let { channel, userstate, message } = info_object;
    // channel = 'Kiwikiller67';
    console.log('ASDF');
    const twitch_channel = await fetching.get_twitch_channel(channel);
    const twitch_game = await fetching.get_twitch_game(twitch_channel.data.data[0].game_id);
    const speedrun_game = await fetching.get_speedrungame_by_name(twitch_game.data.data[0].name);
    const category_uri = get_game_link(speedrun_game.data.data[0], 'categories');
    const category_list = await fetching.fetch_speedrun_uri(category_uri);
    const fuse_list = fuse.set_fuse_list(category_list.data.data);
    const asdf = fuse.get_fuse_result(fuse_list, twitch_channel.data.data[0].title)
    const leaderboard_object = get_correct_category(category_list.data.data, asdf[0].category);
    const category_leaderboard = await fetching.fetch_speedrun_uri(leaderboard_object.uri);
    const wr_holder = await fetching.fetch_speedrun_uri(category_leaderboard.data.data.runs[0].run.players[0].uri);

    const date = new Date(category_leaderboard.data.data.runs[0].run.date)
    const days_ago = Math.floor((new Date() - date) / 86400000)

    return {
        player: wr_holder.data.data.names.international,
        time: util.secondsToString(category_leaderboard.data.data.runs[0].run.times.primary_t),
        category: leaderboard_object.name,
        // game: category_leaderboard.data.data[0].name,
        date: category_leaderboard.data.data.runs[0].run.date,
        days_ago: days_ago
    };
}

module.exports = {
    fetch_wr: fetch_wr
};
