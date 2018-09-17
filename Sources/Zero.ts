/// <reference path="Core.ts"/>
/// <reference path="ISAs/MIPS.ts"/>
/// <reference path="ISAs/RISCV.ts"/>
/// <reference path="VirtualOS.ts"/>

let debug = false;
let tests = false;
declare let require: any
declare let process: any

if (typeof process === 'object' && process + '' === '[object process]') { //Is Node.js
    let args = process.argv.slice(2);

    console.log("Oak.js · 2.0-dev")
    console.log("All rights reserved.")
    console.log("You should have obtained a copy of the Mozilla Public License with your app.")
    console.log("If you did not, a verbatim copy should be available at https://www.mozilla.org/en-US/MPL/2.0/.")

    //Requires
    let { performance } = require('perf_hooks');
    let Filesystem = require('fs');
    let Prompt = require('prompt-sync')();
    
    let CoreModel = RISCVCore;

    let cpu = new CoreModel(2048, ()=> cliVirtualOS.ecall(cpu), null);

    let file = Filesystem.readFileSync(args[0]).toString();
    let assembler = new Assembler(cpu.instructionSet, Endianness.little);
    let lines = Line.arrayFromFile(file);

    let passZero = assembler.assemble(lines, 0);
    if (passZero.length !== 0) {
        for (let i in passZero) {
            let line = passZero[i];
            console.log(line.number, line.invalidReason);
        }
    }
    let pass = null;
    let passCounter = 1;
    do {
        pass = assembler.assemble(lines, passCounter);
        if (pass.length !== 0) {
            for (let i in passZero) {
                let line = passZero[i];
                console.log(line.number, line.invalidReason);
            }
        }
    } while (pass === null);

    let machineCode = lines.map(line=> line.machineCode).reduce((a, b)=> a.concat(b), []);
    cpu.memset(0, machineCode);

    running: while (true) {
        let fetch = cpu.fetch();
        if (fetch !== null) {
            console.log(fetch);
            break running;
        }

        let decode = cpu.decode();
        // console.log(decode);

        if (decode === null) {
            console.log("decode.failure");
            break running;
        }

        let execute = cpu.execute();
        if (execute !== null) {
            if (execute !== 'HALT') {
                console.log(execute);
            }
            break running;
        }
        // let x= Prompt('>');
        // console.log(x);
        // if (x === null) {
        //      break running;
        // }
    }
    
    process.exit(0);

} else {
    console.log("Running from browser, suppressing terminal interface...")
}