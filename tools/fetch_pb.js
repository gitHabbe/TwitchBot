const util = require("./util.js");
const fetching = require("./fetching.js");

async function fetch_pb(info_object) {
    let { game_id, category_id, category, runner } = info_object;
    let speedrunner = await fetching.get_speedrunner(runner);
    console.log("LOG: functionfetch_pb -> speedrunner.data.data", speedrunner.data.data.length);
    speedrunner = speedrunner.data.data.find(
        srunner => srunner.names.international.toLowerCase() === runner.toLowerCase()
    );

    const pbs_uri = util.get_game_link(speedrunner, "personal-bests");
    const speedrunners_pbs = await fetching.fetch_speedrun_uri(pbs_uri);
    const the_run = speedrunners_pbs.data.data.find(sub => sub.run.category === category_id);
    const pb_time = util.secondsToString2(the_run.run.times.primary_t);
    const days_ago = Math.floor((new Date() - new Date(the_run.run.date)) / 86400000);

    return `${runner}'s ${category} PB: ${pb_time}, ${days_ago} days ago`;
}

module.exports = {
    fetch_pb
};
