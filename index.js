let clarity = require("./scripts/clarity");
let carbon = require("./scripts/carbon");
let feather = require("./scripts/feather");

let main = async () => {

    console.time("done!");

    let run = async (fn, name) => {
        console.time(name);
        await fn();console.log(name + " done!");
        console.timeEnd(name);
    };

    await run(feather, "feather");
    await run(carbon, "carbon");
    await run(clarity, "clarity");

    console.timeEnd("done!");
    
};

main();
