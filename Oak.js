import "./isas/MIPS.js";
import "./isas/RISCV.js";

import { Endianness } from "./oak/InstructionSet.js";
import { VirtualOS } from "./oak/VirtualOS.js";
import { Line, Assembler, Kind } from "./oak/Assembler.js";
import { Core } from "./oak/Core.js";
import { Utils } from "./oak/Utils.js"
import NodeGetopt from "node-getopt";
import Filesystem from "fs";

let opt = NodeGetopt.create([
    ['a', 'instructionSetArchitecture=ARG', 'String name of the instruction set architecture to use.', 'RISCV'],
    // ['d', 'debug', 'Turn on debug mode. (Beta)', false],
    ['o', 'archOptions=ARG+', 'Special options for the instruction set architecture.', []],
    ['h', 'help', 'Show this message and exit.', false],
    ['v', 'verbose', 'Verbose operation mode.', false],
    ['V', 'version', 'Show this message and exit.', false],
    [null, 'ppmc', 'Pretty prints the machine code for your viewing pleasure.', false]
]) // create Getopt instance
    .bindHelp() // bind option 'help' to default action
    .parseSystem(); // parse command line

let options = opt.options;
let args = opt.argv;
if (opt.options.version) {
    console.log(`Oak.js · 2.1.0`);
    console.log("All rights reserved.");
    console.log("You should have obtained a copy of the Mozilla Public License with your app.");
    console.log("If you did not, a verbatim copy should be available at https://www.mozilla.org/en-US/MPL/2.0/.");
    process.exit(0);
}

//Requires
let cliVirtualOS = new VirtualOS(); // The virtual OS handles ecalls. It takes a bunch of callbacks: output Int, output String, etcetera...
cliVirtualOS.outputInt = (number) => {
    console.log(number);
};
cliVirtualOS.outputString = (string) => {
    console.log(string);
};
cliVirtualOS.handleHalt = () => {
    console.log("Halting execution...");
};
let cpu = null;
try {
    cpu = Core.factory.getCore(options.instructionSetArchitecture.toUpperCase(), 2048, cliVirtualOS, options.archOptions); // CPU: Memory, Virtual OS
}
catch (err) {
    console.error(err);
    process.exit(64);
}
let file = Filesystem.readFileSync(args[0]).toString();
let assembler = new Assembler(cpu.instructionSet, Endianness.little); // Create new assembler
let lines = Line.arrayFromFile(file); // Process file into new object "Line" array
let passZero = assembler.assemble(lines, 0); // Assembler Pass 0. Returns Line array with errored lines, which are in line.invalidReason
if (passZero.length !== 0) {
    for (let i in passZero) {
        let line = passZero[i];
        console.error(`${args[0]}:${line.number}: ${line.invalidReason}`);
        console.error(`\t${line.raw}`);
    }
    process.exit(65);
}
let pass = null;
let passCounter = 1;
do { // Subsequent assembler passes. Typically one pass is needed, but when there's a lot of variance in ISA word sizes, another pass might be needed.
    pass = assembler.assemble(lines, passCounter);
    if (pass.length !== 0) {
        for (let i in pass) {
            let line = pass[i];
            console.error(`${args[0]}:${line.number}: ${line.invalidReason}`);
            console.error(`\t${line.raw}`);
        }
        process.exit(65);
    }
    passCounter += 1;
} while (pass === null);
let machineCode = lines.map(line => line.machineCode).reduce((a, b) => a.concat(b), []); // Get machine code from lines
if (options.ppmc) {
    lines.map(line => {
        if (line.kind == Kind.data || line.kind == Kind.instruction) {
            console.log(Utils.hex(line.machineCode));
        }
    });
}
cpu.memset(0, machineCode); // memset
running: while (true) {
    let fetch = cpu.fetch();
    if (options.verbose) {
        console.log(`@ ${Utils.pad(cpu.pc, 8, 16)}:`);
    }
    if (fetch !== null) {
        console.error(fetch);
        break running;
    }
    let decode = cpu.decode(); // Decode has the decoded instruction on success
    if (decode === null) {
        console.error(`Failed to decode instruction at ${Utils.pad(cpu.pc, 8, 16)}`);
        process.exit(65);
    }
    if (options.verbose) {
        console.log(decode);
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
