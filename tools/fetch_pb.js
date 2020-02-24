const util = require("./util.js");
const fetching = require("./fetching.js");
const FileSync = require("lowdb/adapters/FileSync");
const low = require("lowdb");

const runner_to_db = (db, name, id) => {
    // console.log("LOG: runner_to_db -> runner", runner);
    db.get("runners")
        .push({ name, id })
        .write();
};

async function fetch_pb(info_object) {
    let { game_id, category_id, category, runner } = info_object;
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);

    let lb_url = `https://www.speedrun.com/api/v1/leaderboards/${game_id}/category/${category_id}`;
    const category_leaderboard = await fetching.fetch_speedrun_uri(lb_url);
    let speedrunner = db
        .get("users")
        .find({ name: runner })
        .get("settings.srcName")
        .value();

    if (speedrunner) runner = speedrunner;

    speedrunner = db
        .get("runners")
        .find({ name: runner })
        .value();

    if (!speedrunner) {
        speedrunner = await fetching.get_speedrunner(runner);
        speedrunner = speedrunner.data.data.find(rnr => rnr.names.international.toLowerCase() === runner);
        if (speedrunner) {
            runner_to_db(db, speedrunner.names.international.toLowerCase(), speedrunner.id);
        }
    }
    if (!speedrunner) {
        speedrunner = await fetching.get_speedrunner_twitch(runner);
        if (speedrunner.data.data.length > 0) {
            speedrunner = speedrunner.data.data[0];
            runner_to_db(db, runner.toLowerCase(), speedrunner.id);
        } else {
            speedrunner = false;
        }
    }
    if (!speedrunner) {
        speedrunner = await fetching.get_speedrunner_lookup(runner);
        speedrunner = speedrunner.data.data.find(rnr => rnr.names.international.toLowerCase() === runner);
        if (speedrunner) runner_to_db(db, speedrunner.names.international.toLowerCase(), speedrunner.id);
    }
    let target_run = category_leaderboard.data.data.runs.find(run => run.run.players[0].id === speedrunner.id);
    if (!target_run) return `${runner} has no PB for ${category}`;
    const pb_time = util.secondsToString2(target_run.run.times.primary_t);
    const days_ago = Math.floor((new Date() - new Date(target_run.run.date)) / 86400000);

    return `${runner}'s ${category} PB: ${pb_time}, ${days_ago} days ago - place: ${target_run.place}`;
}

module.exports = {
    fetch_pb
};
