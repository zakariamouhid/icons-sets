let fs = require("fs");
let { JSDOM } = require("jsdom");
let Terser = require("terser");
let svgo = require("./svgo");

let parseTree = svg => {
    let dom = JSDOM.fragment(svg);
    let parseAttrs = el => {
        return Object.fromEntries([...el.attributes].map(a => [a.name, a.value]));
    };
    let parseChilds = el => {
        return [...el.children].map(child => [
            child.tagName,
            parseAttrs(child),
            ...parseChilds(child)
        ]);
    };
    svg = dom.querySelector("svg");
    return [
        "svg",
        parseAttrs(svg),
        ...parseChilds(svg)
    ];
};

let write = async (fileName, varName, json) => {
    if (typeof json !== "string") json = JSON.stringify(json);
    let writeJsonPromise = fs.promises.writeFile(`./dist/${fileName}.json`, json);
    let js = json;
    let stringsVars = ["rect"];
    js = js.replace(new RegExp(`(^|[^\\\\])"(${stringsVars.join("|")})"`, "g"), "$1$2");
    js = js.replace(/\[\["path"\,\{"d"\:"[^"]*?"\}\](\,\["path"\,\{"d"\:"[^"]*?"\}\])*\]/g, s => {
        return `makePaths(${[...s.matchAll(/"d"\:("[^"]*?")/g)].map(a => `${a[1]}`).join(",")})`;
    });
    js = js.replace(/\["path"\,\{"d"\:("[^"]*?")\}\]/g, `makePath($1)`);
    js = `
    function makePath(d) {
        return ["path", {d: d}];
    }
    function makePaths() {
        return Array.from(arguments).map(makePath);
    }
    var ${stringsVars.map(p => `${p} = "${p}"`).join(", ")};
    return ${js};`;
    
    js = `
        (function (global, factory) {
            if (typeof exports === 'object' && typeof module !== 'undefined') {
                module.exports = factory();
            } else if (typeof define === 'function' && define.amd) {
                define(factory);
            } else {
                (global = global || self, global.${varName} = factory());
            }
        }(this, function () {
            ${js}
        }));
    `;
    js = Terser.minify(js).code;
    console.log(js.length, js.length / json.length * 100);
    let writeJsPromise = fs.promises.writeFile(`./dist/${fileName}.js`, js);
    await writeJsPromise;
    await writeJsonPromise;
};

let filterDuplicates = (icons, alias) => {
    let set = new Set();
    let map = new Map();
    return icons.filter(([name, icon]) => {
        if (set.has(icon)) {
            if (alias) {
                let first = map.get(icon);
                if (first !== name && (!alias[first] || alias[first].includes(name))) {
                    if (name === "composer-edit") {
                        console.log("hello", name, first);
                    }
                    if (!alias[first]) alias[first] = [];
                    alias[first].push(name);
                }
            }
            return false;
        }
        if (alias) map.set(icon, name);
        set.add(icon);
        return true;
    });
};

let buildTree = ({ elem, attrs, content = [] }) => {
    return [elem, attrs, ...content.map(buildTree)];
};

let attrsToStr = attrs => {
    return Object.entries(attrs).map(([name, value]) => `${name}="${value}"`).join(" ");
};
let treeToStr = ([tag, attrs, ...childs]) => {
    if (childs.length === 0 && !["svg"].includes(tag)) {
        return `<${tag} ${attrsToStr(attrs)}/>`;
    }
    return `<${tag} ${attrsToStr(attrs)}>${childs.map(treeToStr).join("")}</${tag}>`;
};

let optimizeIcons = icons => {
    icons = icons.map(async ([name, icon]) => {
        try {
            return [name, (await svgo.optimize(icon)).data];
        } catch (err) {
            console.log("error in", name, icon);
            return [name, icon];
        }
    });
    return Promise.all(icons);
};

let minifyTree = (iconsTree, alias) => {
    let tree = Object.entries(iconsTree);
    let svgAttrs = tree[0][1][1];
    tree = tree.map(([name, tree]) => {
        return [name, tree.slice(2)];
    });
    tree = Object.fromEntries(tree);
    return {
        svg: svgAttrs,
        icons: tree,
        alias: alias
    };
};

module.exports = {
    parseTree,
    write,
    filterDuplicates,
    buildTree,
    attrsToStr,
    treeToStr,
    optimizeIcons,
    minifyTree,
};
