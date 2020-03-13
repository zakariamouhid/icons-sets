
let feather = require("feather-icons");

let {
    parseTree,
    write,
    filterDuplicates,
    treeToStr,
    optimizeIcons,
    minifyTree,
} = require("./helpers");

module.exports = async () => {

    global.feather = feather;

    let icons = Object.keys(feather.icons).map(name => [name, feather.icons[name].toSvg()]);

    icons = await optimizeIcons(icons);

    icons = icons.map(([name, icon]) => [name, parseTree(icon)]);

    let assert = (cond, msg) => {
        if (!cond) throw `[assert faild]: ${msg}`;
    };

    icons.forEach(([name, [, attrs]]) => {
        let expectedAttrs = {
            fill: "none",
            stroke: "currentColor",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            viewBox: "0 0 24 24",
            class: "feather feather-" + name,
            xmlns: "http://www.w3.org/2000/svg"
        };
        for (let key of Object.keys(expectedAttrs).concat(Object.keys(attrs))) {
            assert(
                attrs[key] === expectedAttrs[key],
                `svg ${name} got ${key}="${attrs[key]}" expect "${expectedAttrs[key]}"`
            );
        }
    });

    icons.forEach(([name, icon]) => {
        delete icon[1].xmlns;
        delete icon[1].class;
    });

    let iconsTree = icons;

    icons = iconsTree.map(([name, icon]) => [name, treeToStr(icon)]);

    let alias = {};
    icons = filterDuplicates(icons, alias);

    iconsTree = icons.map(([name, icon]) => [name, parseTree(icon)]);

    icons = Object.fromEntries(icons);
    iconsTree = Object.fromEntries(iconsTree);

    await write("feather-icons", "featherIcons", {
        icons,
        alias
    });

    await write("feather-icons-tree", "featherIconsTree", minifyTree(iconsTree, alias));
    
};
