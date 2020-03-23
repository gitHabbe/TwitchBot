const util = require("./util.js");
const fetching = require("./fetching.js");
const FileSync = require("lowdb/adapters/FileSync");
const low = require("lowdb");
const d = require("./db.js");

async function fetch_pb(info_object) {
    let { game_id, category_id, category, runner } = info_object;
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);

    let lb_url = `https://www.speedrun.com/api/v1/leaderboards/${game_id}/category/${category_id}`;
    const category_leaderboard = await fetching.fetch_speedrun_uri(lb_url);
    runner = d.getSpeedrunnerAlias(runner);

    if (!d.isRunnerLocal(info_object, runner)) {
        runner = await fetching.get_speedrunner(runner);
        runner = runner.data.data.find(rnr => rnr.names.international.toLowerCase() === runner);
        if (runner) {
            d.runnerToDB(runner.names.international.toLowerCase(), runner.id);
        }
    }

    if (!runner) {
        runner = await fetching.get_speedrunner(runner);
        runner = runner.data.data.find(rnr => rnr.names.international.toLowerCase() === runner);
        if (runner) {
            d.runnerToDB(runner.names.international.toLowerCase(), runner.id);
        }
    }
    if (!runner) {
        runner = await fetching.get_speedrunner_twitch(runner);
        if (runner.data.data.length > 0) {
            runner = runner.data.data[0];
            d.runnerToDB(runner.toLowerCase(), runner.id);
        } else {
            runner = false;
        }
    }
    if (!runner) {
        runner = await fetching.get_speedrunner_lookup(runner);
        runner = runner.data.data.find(rnr => rnr.names.international.toLowerCase() === runner);
        if (runner) {
            d.runnerToDB(runner.names.international.toLowerCase(), runner.id);
        }
    }
    let target_run = category_leaderboard.data.data.runs.find(run => run.run.players[0].id === runner.id);
    if (!target_run) return `${runner} has no PB for ${category}`;
    const pb_time = util.secondsToString2(target_run.run.times.primary_t);
    const days_ago = Math.floor((new Date() - new Date(target_run.run.date)) / 86400000);

    return `${runner}'s ${category} PB: ${pb_time} - #${target_run.place} - ${days_ago} days ago`;
}

module.exports = {
    fetch_pb
};
