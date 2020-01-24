const Fuse = require("fuse.js");

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
    var fuse = new Fuse(category_list, options);
    return fuse.search(term)[0];
};

module.exports = {
    get_fuse_result
};
