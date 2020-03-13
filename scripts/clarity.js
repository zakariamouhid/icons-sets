
let clarityIcons = require("@clr/icons/shapes/all-shapes").AllShapes;
let svgo = require("./svgo");

Object.assign(global, {
    clarityIcons,
    svgo
});

let { JSDOM } = require("jsdom");

let {
    parseTree,
    write,
    filterDuplicates,
    optimizeIcons,
    minifyTree,
} = require("./helpers");

module.exports = async () => {
    clarityIcons["tape-drive"] = clarityIcons["tape-drive"].replace(/"class=/, '" class=');

    let icons = Object.entries(clarityIcons);

    icons = await optimizeIcons(icons);

    const dom = new JSDOM(
        icons.map(([name, icon]) => `<div data-name="${name}">${icon}</div>`).join("")
    );

    const document = dom.window.document;

    document.querySelectorAll(`
    .clr-i-badge,
    .clr-i-alert,
    .clr-i-outline--alerted,
    .clr-i-outline--badged,
    .clr-i-solid--alerted,
    .clr-i-solid--badged,
    .clr-i-outline-alerted,
    path[d="M0 0h36v36H0z"],
    div[data-name="vm-bug"]
    `).forEach(
        el => el.remove()
    );

    document.querySelectorAll(".can-badge, .can-alert").forEach(
        el => el.classList.remove("can-badge", "can-alert")
    );
    
    document.querySelectorAll("svg.has-solid").forEach(svg1 => {
        svg1.classList.remove("has-solid");
        let div1 = svg1.parentElement;
        let div2 = div1.cloneNode(true);
        let svg2 = div2.querySelector("svg");
        div1.parentElement.append(div2);
        div2.setAttribute("data-name", div2.getAttribute("data-name") + "-solid");
        svg1.querySelectorAll(`.clr-i-solid, [class*="clr-i-solid-"]`).forEach(el => el.remove());
        svg2.querySelectorAll(`.clr-i-outline, [class*="clr-i-outline-"]`).forEach(el => el.remove());
        svg2.querySelectorAll("*").forEach(el => {
            el.classList.remove(
                ...[...el.classList].filter(cls => cls.startsWith("clr-i-solid"))
            );
        });
    });

    document.querySelectorAll(`svg *`).forEach(el => {
        el.classList.remove(
            ...[...el.classList].filter(cls => cls.startsWith("clr-i-outline"))
        );
    });

    document.querySelectorAll("svg[xmlns]").forEach(svg => {
        svg.removeAttribute("xmlns");
    });
    
    icons = [...document.querySelectorAll("div[data-name]")];

    icons = icons.map(div => [div.getAttribute("data-name"), div.innerHTML]);

    icons = await optimizeIcons(icons);
    
    let alias = {};

    icons = filterDuplicates(icons, alias);

    let iconsTree = Object.fromEntries(icons.map(([name, icon]) => [name, parseTree(icon)]));

    icons = Object.fromEntries(icons);

    await write("clarity-icons", "clarityIcons", {
        icons,
        alias
    });

    await write("clarity-icons-tree", "clarityIconsTree", minifyTree(iconsTree, alias));
    
};