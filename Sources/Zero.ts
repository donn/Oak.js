/// <reference path="InstructionSet.ts"/>
/// <reference path="RISCV.ts"/>
// The Zero Interface
// Should be mostly pure Javascript, as it is indeed an interface for Javascript.
// INTERFACE GUIDE: If null, then it looks like it was successful. Else, it is unsuccessful.
var debug = false;
var consoleTests = false;

function h2b(hex) {
	var hexArr = hex.split(' '); // Remove spaces, then seperate characters
	var byteArr = [];
	for (var i=0; i < hexArr.length; i++) {
		let value = parseInt(hexArr[i], 16);
		if (!isNaN(value))
		{
			byteArr.push(value);
		}
	}

	return byteArr;
}

function assemble(core: Core, data: string): ({errorMessage: string, machineCode: number[], size: number})
{
    var token = core.instructionSet.tokenize(data);
    if (debug)
    {
        console.log(token.labels);
        console.log(token.addresses);
    }
    if (token.errorMessage === null)
    {
        return core.instructionSet.assemble(null, 0, token.lines, token.labels, token.addresses);
    }
    else
    {
        return {errorMessage: token.errorMessage, machineCode: null, size: 0};
    }
}

function loadIntoMemory(core: Core, data: number[]): string
{
    if (core.memset(0, data) === null)
        return "Program is too large.";

    return null;
}

function loadMemStep(core: Core, data: number[]): string
{
    var load = loadIntoMemory(core, data);
    if (load !== null)
    {
        return load;
    }

    simulateStep(core);
}

function simulateStep(core: Core): string
{
    var fetch = core.fetch()
    if (fetch !== null)
    {
        return fetch;
    }

    var decode = core.decode();
    if (decode === null)
    {
        return "Address 0x" + (core.pc - 4).toString(16).toUpperCase() + ": Instruction unrecognized or unsupported.";
    }

    core.instructionCallback(decode);

    if (debug)
    {
        console.log(core.pc - 4, decode, core.arguments);
    }

    var execute = core.execute();
    if (execute !== null)
    {
        return execute;
    }

    if (debug)
    {
        //core.registerFile.print();
    }
    
    if (decode == "ECALL")
    {
        return "@Oak_Ecall";
    }
    
    return null;
}

//It is recommended to simulateStep
function simulate(core: Core, data: number[]): string
{
    var load = loadIntoMemory(core, data);
    if (load !== null)
    {
        return load;
    }

    return continueSim(core);
}

function continueSim(core: Core): string
{
    var step = simulateStep(core);
    var i=0;
    for(var i=0; i < 16384 && step === null; i++)
    {
        step = simulateStep(core);
    }
    if (i == 16384) {
        return "ERROR: Possible Infinite Loop";
    }

    if (step !== null)
    {
        return step;
    }
    return null;
}

function registerRead(core: Core, index: number): number
{
    return core.registerFile.read(index);
}

function registerWrite(core: Core, index: number, value: number)
{
    core.registerFile.write(index, value);
}

function getMemory(core: Core)
{
    return core.memory;
}

function getRegisterABINames(core: Core): string[]
{
    return core.registerFile.abiNames;
}

function resetCore(core: Core)
{
    core.reset();
}

interface Array<T> {
Oak_hex(): string;
}

Array.prototype.Oak_hex = function () {
    var hexadecimal = "";
    for (var i = 0; i < this.length; i++)
    {
        var hexRepresentation = this[i].toString(16).toUpperCase();
        if (hexRepresentation.length === 1)
        {
            hexRepresentation = "0" + hexRepresentation;
        }
        hexadecimal += hexRepresentation + " ";
    }
    return hexadecimal;
};

var ecalloutput = "";

function Oak_terminal_eCall()
{
    var core = this;
	var type = registerRead(core, 17);
	var arg = registerRead(core, 10);

	var exit = false;
	
	switch (type) {
	case 1: // Integer
		ecalloutput += arg + "\n";
		break;
	case 4: // String
		var pointer = arg;
		var output = "";
		var char = core.memory[pointer];
		while (char != 0)
		{
			output += String.fromCharCode(char);
			pointer += 1;
			char = core.memory[pointer];
		}
		ecalloutput += output + "\n";
		break;
	case 5:
		registerWrite(core, 17, 4);
        break;
	case 10:
		exit = true;
		break;
	default:
		console.log("Unsupported environment call.");
		break;
	}

	if (!exit) {
		var output = continueSim(core);
		if (output != "@Oak_Ecall" && output !== null && output != undefined) {
			console.log("ERROR: " + output);
		}
	} else {
		console.log("Simulation Complete.");
	}
}


if (consoleTests)
{
    //CLI Test Area
    console.log("Oak.js Console Tests");
    var testCore = new RISCVCore(2048, Oak_terminal_eCall, function(data){});
    var oakHex = assemble(testCore, "main:\naddi a0, zero, 8\naddi a1, zero, 2\njal ra, mydiv\n\nli a7, 10  # calls exit command (code 10)\nSCALL # end of program\n\n## Divides two numbers, storing integer result on t0 and rest on t1\n# a0 Number we will divide\n# a1 Number we will divide for\nmydiv:\nadd t1, zero, zero # i = 0\n\nmydiv_test:\nslt t0, a0, a1 # if ( a < b )\nbne t0, zero, mydiv_end # then get out of here\nsub a0, a0, a1 # else, a = a - b\naddi t1, t1, 1 # and i = i + 1\njal x0, mydiv_test # let's test again\n\nmydiv_end:\nadd a1, zero, a0 # rest = a\nadd a0, zero, t1 # result = i\njalr x0, ra, 0").machineCode;
    var gnuHex = h2b("13 05 80 00 93 05 20 00 EF 00 C0 00 93 08 A0 00 73 00 00 00 33 03 00 00 B3 22 B5 00 63 98 02 00 33 05 B5 40 13 03 13 00 6F F0 1F FF B3 05 A0 00 33 05 60 00 67 80 00 00");
    for (var i = 0; i < oakHex.length; i++)
        {
            if (oakHex[i] !== gnuHex[i])
            {
                console.log("Binaries do not match.")
                break;
            }
        }
    var sim = simulate(testCore, oakHex);
    ecalloutput = "";
    console.log(ecalloutput);
    ecalloutput = "";
}