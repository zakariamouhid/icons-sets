let carbon = require("@carbon/icons");

let {
    parseTree,
    write,
    filterDuplicates,
    buildTree,
    treeToStr,
    optimizeIcons,
    minifyTree,
} = require("./helpers");

module.exports = async () => {
    global.carbon = carbon;

    let iconsTree = Object.entries(carbon);
    iconsTree = iconsTree.filter(a => a[1].size === 32);
    iconsTree = iconsTree.map(([name, icon]) => {
        delete icon.attrs.width;
        delete icon.attrs.height;
        delete icon.attrs.xmlns;
        return [icon.name.toLowerCase().replace(/--/g, "-"), buildTree(icon)];
    });
    
    let icons = iconsTree.map(([name, icon]) => [name, treeToStr(icon)]);

    icons = await optimizeIcons(icons);

    let alias = {};
    icons = filterDuplicates(icons, alias);
    
    iconsTree = icons.map(([name, icon]) => [name, parseTree(icon)]);

    icons = Object.fromEntries(icons);
    iconsTree = Object.fromEntries(iconsTree);

    await write("carbon-icons", "carbonIcons", {
        icons,
        alias
    });

    await write("carbon-icons-tree", "carbonIconsTree", minifyTree(iconsTree, alias));

};