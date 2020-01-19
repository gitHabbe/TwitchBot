const Fuse = require("fuse.js");

// const set_fuse_list = (game_list) => {
//     return game_list.filter(game => {
//         // console.log(game.links);
//         if (game.links.find(link => link.rel === 'leaderboard')) {
//             return game
//         }
//     }).map(game => {
//         // console.log(game.links);
//         return {
//             'category': game.name,
//             'category_id': game.id
//         }
//     })
// };

const get_fuse_result = (category_list, search_term) => {
    let term = search_term;
    category_list.forEach(category => {
        let test = category.name
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .toLowerCase();
        if (test === search_term.toLowerCase()) term = category.name;
    });
    const options = {
        shouldSort: true,
        tokenize: true,
        maxPatternLength: 200,
        minMatchCharLength: 1,
        keys: ["name"]
    };
    // console.log(category_list);
    var fuse = new Fuse(category_list, options);
    return fuse.search(term)[0];
};

module.exports = {
    // set_fuse_list: set_fuse_list,
    get_fuse_result: get_fuse_result
};
