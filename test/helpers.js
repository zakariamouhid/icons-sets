
let sortSolidIcons = (icons, fn) => {
    return Object.fromEntries(Object.entries(icons).sort((a, b) => {
        let isA = fn(a[0]), isB = fn(b[0]);
        if (isA && !isB) return 1;
        if (!isA && isB) return -1;
        return 0;
    }));
};

let showIcons = (icons, container) => {
    Object.entries(icons).forEach(([name, icon]) => {
        let div = document.createElement("div");
        div.innerHTML = icon;
        container.append(div);
        div.setAttribute("title", name);
        // div.append(name);
    });
};

let addClass = (svg, cls) => {
    return svg.replace(/<svg/, () => `<svg class="${cls}"`);
};

let iconsAddClass = (icons, cls) => {
    console.time("addClass");
    Object.entries(icons).forEach(([name, icon]) => {
        let icon2 = addClass(icon, cls);
    });
    console.timeEnd("addClass");
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

let treeIconsToStr = (iconsTree, iconsStr) => {
    console.time("treeToStr");
    Object.entries(iconsTree.icons).forEach(([name, icon]) => {
        let icon2 = treeToStr(["svg", iconsTree.svg, ...icon]);
        if (iconsStr.icons[name] === icon2) return;
        throw { tree: icon2, origin: iconsStr.icons[name] };
    });
    console.timeEnd("treeToStr");
};
