const util = require("./util.js");
const fetching = require("./fetching.js");
const FileSync = require("lowdb/adapters/FileSync");
const low = require("lowdb");
const d = require("./db.js");

async function fetch_pb(info_object) {
    let { game_id, category_id, category, runner } = info_object;

    let lb_url = `https://www.speedrun.com/api/v1/leaderboards/${game_id}/category/${category_id}`;
    const category_leaderboard = await fetching.fetch_speedrun_uri(lb_url);

    runner = d.getSpeedrunnerAlias(runner);
    let speedrunner = d.getRunnerLocal(runner);

    if (!speedrunner) {
        speedrunner = await fetching.get_speedrunner(runner);
        speedrunner = speedrunner.data.data.find(rnr => rnr.names.international.toLowerCase() === runner);
        if (speedrunner) {
            d.runnerToDB(speedrunner.names.international.toLowerCase(), speedrunner.id);
        }
    }
    if (!speedrunner) {
        speedrunner = await fetching.get_speedrunner_twitch(runner);
        if (speedrunner.data.data.length > 0) {
            speedrunner = runner.data.data[0];
            d.runnerToDB(speedrunner.toLowerCase(), speedrunner.id);
        }
    }
    if (!speedrunner) {
        speedrunner = await fetching.get_speedrunner_lookup(runner);
        speedrunner = speedrunner.data.data.find(rnr => rnr.names.international.toLowerCase() === runner);
        if (runner) {
            d.runnerToDB(speedrunner.names.international.toLowerCase(), speedrunner.id);
        }
    }
    if (!speedrunner.id) return `${runner} cannot be found`;
    let target_run = category_leaderboard.data.data.runs.find(run => run.run.players[0].id === speedrunner.id);
    if (!target_run) return `${runner} has no PB for ${category}`;
    const pb_time = util.secondsToString2(target_run.run.times.primary_t);
    const days_ago = Math.floor((new Date() - new Date(target_run.run.date)) / 86400000);

    return `${runner}'s ${category} PB: ${pb_time} - #${target_run.place} - ${days_ago} days ago`;
}

module.exports = {
    fetch_pb
};
