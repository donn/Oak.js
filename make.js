let arg = process.argv.slice(2)[0];
var exec = require('child_process').exec, child;

var isWin = process.platform === "win32";

let concatenate = () => {
    let path = "src/backend.js";

    let fs = require('fs');
    function writeData(content) {
        content = content + "\n\nexport { v as VirutalOS, e as Endianness, a as Assembler, cf as CoreFactory, l as AssemblerLine}";
        fs.writeFile(path, content, function(err) {
            if (err) throw err;
            console.log('Complete.');
        });
    }

    function readContent(content) {
        fs.readFile("src/backend/ZeroPlus.js", 'utf8', function (err, data) {
            if (err) throw err;
            writeData(content + "\n" + data);
        });
    }

    fs.readFile(path, 'utf8', function (err, data) {
        if (err) throw err;
        readContent(data);
    });
}

let create_tsc = (isBackend) => {
    let tsc = isWin ? "tsc" : "./node_modules/typescript/bin/tsc";
    let tsc_flags = " --module amd --pretty --target ES2016 --removeComments --noEmitOnError";
    let tsc_target = isBackend ? " src/backend/Zero.ts --outFile src/backend.js" : " src/backend/main.ts --outFile bin/Oak.js";
    exec(tsc + tsc_flags + tsc_target, (error, stdout, stderr) => {
        if (stdout)
            console.log('stdout: ' + stdout);
        
        if (stderr)
            console.log('stderr: ' + stderr);

        if (error)
            console.log('exec error: ' + error);

        if (isBackend)
            concatenate();
        else
            console.log("Complete");
    });
}

console.log("Building Oak.js...");
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
    console.log("Invalid build target")
}