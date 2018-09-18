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

    let cliVirtualOS = new VirtualOS(); // The virtual OS handles ecalls. It takes a bunch of callbacks: output Int, output String, etcetera...
    cliVirtualOS.outputInt = (number) => {
        console.log(number);
    };
    cliVirtualOS.outputString = (string) => {
        console.log(string);
    };

    let cpu = new CoreModel(2048, ()=> cliVirtualOS.ecall(cpu)); // CPU: Memory, Virtual OS

    let file = Filesystem.readFileSync(args[0]).toString();


    let assembler = new Assembler(cpu.instructionSet, Endianness.little); // Create new assembler

    let lines = Line.arrayFromFile(file); // Process file into new object "Line" array

    let passZero = assembler.assemble(lines, 0); // Assembler Pass 0. Returns Line array with errored lines, which are in line.invalidReason
    if (passZero.length !== 0) {
        for (let i in passZero) {
            let line = passZero[i];
            console.log(line.number, line.invalidReason);
            process.exit(65);
        }
    }
    let pass = null;
    let passCounter = 1;
    do { // Subsequent assembler passes. Typically one pass is needed, but when there's a lot of variance in ISA word sizes, another pass might be needed.
        pass = assembler.assemble(lines, passCounter);
        if (pass.length !== 0) {
            for (let i in passZero) {
                let line = passZero[i];
                console.log(line.number, line.invalidReason);
                process.exit(65);
            }
        }
        passCounter += 1;
    } while (pass === null);

    let machineCode = lines.map(line=> line.machineCode).reduce((a, b)=> a.concat(b), []); // Get machine code from lines
    cpu.memset(0, machineCode); // memset

    running: while (true) {
        let fetch = cpu.fetch();
        if (fetch !== null) {
            console.log(fetch);
            break running;
        }

        let decode = cpu.decode(); // Decode has the decoded instruction on success

        if (decode === null) {
            console.log("decode.failure");
            break running;
        }

        let execute = cpu.execute();
        if (execute !== null) {
            if (execute !== 'HALT') { // If HALT, then an environment call has been executed.
                console.log(execute);
            }
            break running;
        }
    }
    
    process.exit(0);

} else {
    console.log("Running from browser, suppressing terminal interface...")
    // If running from browser, you should implement something to what's above in the UI.
}