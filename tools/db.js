const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const cool = {};

cool.getGameByAbbrev = abbrev => {
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    const gameDB = db.get("games");
    const is_gameDB = gameDB.find({ abbrev }).value();

    return is_gameDB;
};

cool.getGameById = id => {
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    const gameDB = db.get("games");
    const is_gameDB = gameDB.find({ id }).value();

    return is_gameDB;
};

cool.saveGame = (speedrun_game, category_list, userstate) => {
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    const categories = category_list.map(cate => ({ id: cate.id, name: cate.name }));
    const game_obj = {
        id: speedrun_game.data.data[0].id,
        abbrev: speedrun_game.data.data[0].abbreviation,
        categories,
        added_by: userstate.username,
        date: new Date()
    };

    db.get("games")
        .push(game_obj)
        .write();
};

cool.getGameCategories = game_id => {
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    this.getGameById(game_id);
};

cool.getSpeedrunnerAlias = name => {
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    let speedrunner = db
        .get("users")
        .find({ name })
        .get("settings.srcName")
        .value();
    if (speedrunner) return speedrunner;
    return name;
};

cool.isRunnerLocal = (info_object, name) => {
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    speedrunner = db
        .get("runners")
        .find({ name: name })
        .value();
    if (speedrunner) {
        info_object.runner = speedrunner;
        return true;
    }
    return false;
};

cool.runnerToDB = (name, id) => {
    const adapter = new FileSync("./private/database.json");
    const db = low(adapter);
    db.get("runners")
        .push({ name, id })
        .write();
};

module.exports = cool;
