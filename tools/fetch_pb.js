const util = require('./util.js');
const fetching = require('./fetching.js');

async function fetch_pb(info_object) {
    let { channel, userstate, message, split_msg, game_id, category_id, fuse_hit, speedrun_game, runner } = info_object;
    const speedrunner = await fetching.get_speedrunner(channel);
    const pbs_uri = util.get_game_link(speedrunner.data.data[0], 'personal-bests');
    const speedrunners_pbs = await fetching.fetch_speedrun_uri(pbs_uri);
    const the_run = speedrunners_pbs.data.data.find(sub => sub.run.category === category_id);
    const pb_time = util.secondsToString(the_run.run.times.primary_t);
    const days_ago = Math.floor((new Date() - new Date(the_run.run.date)) / 86400000)

    return `${channel}'s ${fuse_hit.category} PB: ${pb_time}, ${days_ago} days ago`

}

module.exports = {
    fetch_pb: fetch_pb
}
