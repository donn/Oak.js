let fs = require("fs");
let mkdirpSync = require("mkdirp").sync;
let { exec } = require("child_process");
let { version } = require("./package.json");

let concatenate = (isBackend) => {
    console.log("Concatenating…");

    if (isBackend) {
        let path = "src/backend.js";
    
        let backendJS = fs.readFileSync(
            path,
            "utf8"
        );

        let zeroPlus  = fs.readFileSync(
            "oak/ZeroPlus.js",
            "utf8"
        );

        fs.writeFileSync(path, backendJS + "\n" + zeroPlus);
    } else {
        let path = "bin/Oak.js"
        let execJS = fs.readFileSync(
            path,
            "utf8"
        );
        fs.writeFileSync(
            "bin/oak",
            `#!/usr/bin/env node\n${
                execJS.
                split("__VERSION__").
                join(version)
            }`,
            "utf8"
        );
        fs.chmodSync(
            "bin/oak",
            "755"
        );
    }
}

let create_tsc = (isBackend) => {
    let invocation = "node ./node_modules/typescript/bin/tsc";
    let flags = "--module amd --pretty --target ES2016 --noEmitOnError";
    let target = isBackend ?
        "oak/Zero.ts --outFile src/backend.js" :
        "--removeComments oak/main.ts --outFile bin/Oak.js"
    ;
    mkdirpSync("bin/");

    let command = `${invocation} ${flags} ${target}`;
    exec(command, (error, stdout, stderr) => {
        console.log(stdout, stderr);
        
        if (error) {
            process.exit(error);
        }

        concatenate(isBackend);

        console.log("\nDone.")
        process.exit(0);
    });
}

let arg = process.argv.slice(2)[0];
console.log(`Building Oak.js for target '${arg}'…`);
if (arg === "backend") {
    create_tsc(true);
}
else if (arg === "exec") {
    create_tsc(false);
}
else if (arg === "all") {
    create_tsc(true);
    create_tsc(false);
}
else {
    console.error(`Target '${arg}' not found.'`)
    process.exit(64);
}