const Fuse = require("fuse.js");

const get_fuse_result = (category_list, search_term) => {
    let term = search_term;
    console.log("LOG: get_fuse_result -> search_term", search_term);
    category_list.forEach(category => {
        let isAbbrev = category.name
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .toLowerCase();
        if (isAbbrev === search_term.toLowerCase()) term = category.name;
    });
    if (search_term.toLowerCase().includes("hundo")) term = "100%";
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

const get_fuse_result2 = (category_list, search_term) => {
    let term = search_term;
    const options = {
        shouldSort: true,
        tokenize: true,
        maxPatternLength: 200,
        minMatchCharLength: 1
    };
    var fuse = new Fuse(category_list, options);
    return fuse.search(term)[0];
};

module.exports = {
    get_fuse_result,
    get_fuse_result2
};
