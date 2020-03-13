let SVGO = require("svgo");

let svgo = new SVGO({
    plugins: [{
        cleanupAttrs: true,
    }, {
        removeDoctype: true,
    },{
        removeXMLProcInst: true,
    },{
        removeComments: true,
    },{
        removeMetadata: true,
    },{
        removeTitle: true,
    },{
        removeDesc: true,
    },{
        removeUselessDefs: true,
    },{
        removeEditorsNSData: true,
    },{
        removeEmptyAttrs: true,
    },{
        removeHiddenElems: true,
    },{
        removeEmptyText: true,
    },{
        removeEmptyContainers: true,
    },{
        removeViewBox: false,
    },{
        cleanupEnableBackground: true,
    },{
        convertStyleToAttrs: true,
    },{
        convertColors: true,
    },{
        convertPathData: true,
    },{
        convertTransform: true,
    },{
        removeUnknownsAndDefaults: true,
    },{
        removeNonInheritableGroupAttrs: true,
    },{
        removeUselessStrokeAndFill: {
            removeNone: true
        },
    },{
        removeUnusedNS: true,
    },{
        cleanupIDs: true,
    },{
        cleanupNumericValues: true,
    },{
        moveElemsAttrsToGroup: true,
    },{
        moveGroupAttrsToElems: true,
    },{
        collapseGroups: true,
    },{
        removeRasterImages: false,
    },{
        mergePaths: {
            // force: true
        },
    },{
        convertShapeToPath: { 
            convertArcs: true 
        },
    },{
        sortAttrs: true,
    },{
        removeDimensions: true,
    },
    // { removeAttrs: {attrs: '(stroke|fill)'}, }
    ]
});

module.exports = svgo;