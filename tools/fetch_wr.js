const util = require("./util.js");
const fetching = require("./fetching.js");

async function fetch_wr(info_object) {
    let { game_id, category_id, fuse_hit } = info_object;
    const speedrun = await fetching.get_leaderboard(game_id, category_id, true);
    const speedrunner = await fetching.fetch_speedrun_uri(
        speedrun.data.data.runs[0].run.players[0].uri
    );
    const wr_time = util.secondsToString2(
        speedrun.data.data.runs[0].run.times.primary_t
    );
    const days_ago = Math.floor(
        (new Date() - new Date(speedrun.data.data.runs[0].run.date)) / 86400000
    );
    return `${fuse_hit.category} WR: ${wr_time} \
by ${speedrunner.data.data.names.international} \
${days_ago} days ago`;
}

module.exports = {
    fetch_wr: fetch_wr
};
