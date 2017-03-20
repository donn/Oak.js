/// <reference path="InstructionSet.ts"/>
/// <reference path="Utils.ts" />
//The MIPS Instruction Set Architecture

function Oak_gen_MIPS(): InstructionSet
{
    //Formats and Instructions
    var formats: Format[] = [];
    var instructions: Instruction[] = [];
    var pseudoInstructions: PseudoInstruction[] = [];

    //R-Type
    formats.push(
        new Format
        (
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rt", 16, 5, false),
                new BitRange("rd", 11, 5, false),
                new BitRange("funct", 0, 6),
                new BitRange("rs", 21, 5, false, 0),
                new BitRange("shamt", 6, 5, false, 0)
            ],
            ["rd", "rt", "rs", "shamt"],
            [Parameter.register, Parameter.register, Parameter.register, Parameter.immediate],
            /[a-zA-Z]+\s*\$([A-Za-z0-9]+)\s*,\s*\$([A-Za-z0-9]+)\s*,\s*\$?([A-Za-z0-9]+)/,
            "@mnem @arg0, @arg1, @arg2",
            [null, null, function(machineCode: number) { return (machineCode & 63) <= 7 }, function(machineCode: number) { return (machineCode & 63) > 7 }]
        )
    )

     /*
        ARGUMENT PROCESSOR
        Does what it says on the tin. It needs quite a bit of information, but otherwise successfully interprets
        any MIPS argument.
    */
    let process = function(address: number, text: string, type: Parameter, bits: number, labels: string[], addresses: number[])
    {
        let array = text.split(""); //Character View
        var result =
        {
            errorMessage: null,
            value: null
        };
        switch(type)
        {
        case Parameter.register:                
                let registerNo = parseInt(text);                    
                if (isNaN(registerNo))
                {
                    let index = this.abiNames.indexOf(text);
                    if (index !== -1)
                    {
                        result.value = index;
                        return result; 
                    }
                }
                if (array[0] !== "$")
                {
                    result.errorMessage = "Register " + text + " does not exist.";
                    return result;
                }
                registerNo = parseInt(array.splice(1, array.length - 1).join(""));
                if (0 <= registerNo && registerNo <= 31)
                {
                    result.value = registerNo;
                    return result;
                }
                else
                {
                    result.errorMessage = "Register " + text + " does not exist.";
                    return result;
                }


        case Parameter.immediate:
            //Label
            var int = NaN;
            let labelIndex = labels.indexOf(text);
            if (labelIndex !== -1)
            {
                int = addresses[labelIndex];
            }
            else if (array.length === 3 && (array[0] == "\'") && (array[2] == "\'"))
            {
                int = array[1].charCodeAt(0);
            }
            else
            {
                var radix = 10 >>> 0;
                var splice = false;
                
                if (array[0] === "0")
                {
                    if (array[1] == "b")
                    {
                        radix = 2;
                        splice = true;
                    }
                    if (array[1] == "o")
                    {
                        radix = 8;
                        splice = true;
                    }
                    if (array[1] == "d")
                    {
                        radix = 10;
                        splice = true;
                    }
                    if (array[1] == "x")
                    {
                        radix = 16;
                        splice = true;
                    }
                }

                var interpretable = text;
                if (splice)
                {
                    interpretable = array.splice(2, array.length - 2).join("");
                }

                int = parseInt(interpretable, radix);
            }

            if (isNaN(int))
            {     
                result.errorMessage = "Immediate '" + text + "' is not a recognized label, literal or character.";
                return result;
            }

            if (rangeCheck(int, bits))
            {
                result.value = int;
                return result;
            }
            result.errorMessage = "The value of '" + text + "' is out of range.";
            return result;


        case Parameter.offset:
            var int = NaN;
            let labelLocation = labels.indexOf(text);
            if (labelLocation !== -1)
            {
                int = addresses[labelLocation] - address;
            }
            else
            {
                var radix = 10 >>> 0;
                var splice = false;
                
                if (array[0] === "0")
                {
                    if (array[1] == "b")
                    {
                        radix = 2;
                        splice = true;
                    }
                    if (array[1] == "o")
                    {
                        radix = 8;
                        splice = true;
                    }
                    if (array[1] == "d")
                    {
                        radix = 10;
                        splice = true;
                    }
                    if (array[1] == "x")
                    {
                        radix = 16;
                        splice = true;
                    }
                }

                var interpretable = text;
                if (splice)
                {
                    interpretable = array.splice(2, array.length - 2).join("");
                }

                int = parseInt(interpretable, radix);
            }
                
            if (isNaN(int))
            {     
                result.errorMessage = "Offset '" + text + "' is not a recognized label or literal.";
                return result;
            }

            if (rangeCheck(int, bits))
            {
                result.value = int;
                return result;
            }
            result.errorMessage = "The value of '" + text + "' is out of range.";
            return result;

        default:
            return result;
        }
    }

    /*
        TOKENIZER

        This is the assembler's "first pass" -it does
        primtive lexical analysis and creates an
        address table.
    */
    let tokenize = function(file: string)
    {
        var result =
        {
            errorMessage: null,
            labels: [],
            addresses: [],
            lines: [],
            pc: [],
        };

        var address = 0;
        var text = true;
        var lines = file.split("\n");

        for (var i = 0; i < lines.length; i++)
        {  
            
            var labelExtractor = /\s*(([A-Za-z_][A-Za-z0-9_]*):)?(.*)?/.exec(lines[i]);
            if (labelExtractor == null)
            {
                console.log("Congratulations, you broke regular expressions.")
            }
            if (typeof labelExtractor[2] !== 'undefined')
            {
                result.labels.push(labelExtractor[2]);
                result.addresses.push(address);
            }
            lines[i] = labelExtractor[3];
            if (lines[i] == undefined)
            {
                continue;
            }
            var chars = lines[i].split("");


            //Check for unterminated string/char (also comments)
            var inString = false;
            var commentOut = false;

            //Comments
            for (var j = 0; j < chars.length; j++)
            {
                if (!commentOut)
                {
                    if (chars[j] == "\"" || chars[j] == "\'")
                    {
                        inString = !inString;
                    }
                    else if (inString)
                    {                     
                        if (chars[j] == "\\")
                        {
                            j++; //Escape next character
                        }
                        else if (chars[j] == "\n")
                        {
                            result.errorMessage = "Line " + i + ": Unterminated string.";
                            return result;
                        }
                    }
                    else
                    {
                        if (chars[j] == "#")
                        {
                            commentOut = true;
                            chars.splice(j, 1);
                            j--;
                        }
                    }
                }
                else
                {
                    if (chars[j] !== "\n")
                    {
                        chars.splice(j, 1);
                        j--;
                    }
                    else
                    {
                        commentOut = false;
                    }
                }
            }

            lines[i] = chars.join("");
            
            lines[i] = lines[i].split("' '").join("32");
            
            //These are fine for most purposes, but string directives MUST NOT USE THE ARRAY DIRECTIVES BY ANY MEANS.
            let directives = lines[i].split(" ").filter(function(value: string){ return value.length > 0 });
            
            //Check if whitespace
            if (directives.length === 0)
            {
                continue;
            }

            var directiveChars = directives[0].split("");                

            //Calculate size in bytes
            if (text)
            {
                if (directives[0] === ".data")
                {
                    text = false;
                    if (directives[1] !== undefined)
                    {
                        result.errorMessage = "Line " + i + ": " + directives[1] + " is extraneous. .data does not take any arguments.";
                        return result;
                    }
                }
                else if (directives[0] === ".text")
                {
                    //Do nothing.
                }
                else if (directiveChars[0] === ".")
                {                        
                    result.errorMessage = "Line " + i + ": " + directives[0] + " cannot be in the text section. Aborting.";
                    return result;
                }
                else 
                {
                    address += 4;
                    let instructionIndex = this.mnemonicSearch(directives[0].toUpperCase());
                    if (instructionIndex === -1)
                    {     
                        result.errorMessage = "Line " + i + ": Instruction " + directives[0] + " not found.";
                        return result;
                    }
                }                    
            }
            else
            {
                if (directives[0] == ".text")
                {
                    text = true;
                    if (directives[1] !== undefined)
                    {
                        result.errorMessage = "Line " + i + ": " + directives[1] + " is extraneous. .text does not take any arguments.";
                        return result;
                    }
                }

                else if (directives[0] === ".data")
                {
                    //Do nothing.
                }
                else if (this.dataDirectives.indexOf(directives[0]) !== -1)
                {
                    let index = this.dataDirectives.indexOf(directives[0]);
                    if (this.dataDirectiveSizes[index] !== 0)
                    {
                        let array = directives.join(" ").split(directives[i]).join("").split(",");
                        address += array.length * this.dataDirectiveSizes[index];
                    }
                    else
                    {
                        switch (directives[0])
                        {   
                            case ".asciiz":
                            case ".ascii":
                                var match = /.([A-Za-z]+?)\s*\"(.*)\"\s*(#.*)?$/.exec(lines[i]);
                                if (match == null)
                                {
                                    result.errorMessage = "Line " + i + ": Malformed string directive.";
                                    return result;
                                }
                                let array = match[1].split("");
                                for (var j = 0; j < array.length; j++)
                                {
                                    if (array[j] == "\\")
                                    {
                                        j++;
                                    }
                                    address += 1;
                                }
                            if (directives[0] == ".asciiz")
                            {
                                address += 1;
                            }
                        }
                    }
                }
                else if (directiveChars[0] === ".")
                {
                    result.errorMessage = "Line " + i + ": Unsupported directive " + directives[0] + ".";
                    return result;
                }
                else
                {
                    result.errorMessage = "Line " + i + ": Unrecognized keyword " + directives[0] + ".";
                    return result;
                }
            }
            result.pc.push(address);
        }
        result.lines = lines;
        return result;
    };

     /*
        ASSEMBLER
        This is the fun part.
    */
    let assemble = function(nester: number = null, address: number, lines: string[], labels: string[], addresses: number[])
    {
        var result =
        {
            errorMessage: null,
            machineCode: [],
            size: 0
        };

        var text = true;

        for (var i = 0; i < lines.length; i++)
        {            
            if (typeof lines[i] == 'undefined')
            {
                continue;
            }      
            let directives = lines[i].split(" ").filter(function(value: string){ return value.length > 0 });
            
            //Check if whitespace
            if (directives.length === 0)
            {
                continue;
            }
            
            //Calculate lengths
            if (text)
            {
                if (directives[0] === ".data")
                {
                    text = false;
                }
                else if (directives[0] === ".text")
                {
                    //\_(ツ)_/
                }
                else 
                {
                    address += 4;
                    let instructionIndex = this.mnemonicSearch(directives[0].toUpperCase());

                    if (instructionIndex === -1)
                    {
                        result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": Instruction " + directives[0] + " not found.";
                        return result;
                    }
                    let instruction = this.instructions[instructionIndex];
                    let format = instruction.format;
                    let bitRanges = format.ranges;
                    let regex = format.regex;
                    let params = format.parameters;
                    let paramTypes = format.parameterTypes;                        
                    var machineCode = instruction.template();

                    var match = regex.exec(lines[i]);
                    if (match == null)
                    {
                        result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": Argument format for " + directives[0] + " violated.";
                        return result;
                    }
                    var args = match.splice(1, params.length);                      

                    for (var j = 0; j < bitRanges.length; j++)
                    {
                        if (!bitRanges[j].instructionDefined)
                        {
                            var startBit = 0;
                            var endBit: number = null;
                            var bits = bitRanges[j].bits;
                            var field = bitRanges[j].field;

                            var limits = /([A-za-z]+)\s*\[\s*(\d+)\s*:\s*(\d+)\s*\]/.exec(bitRanges[j].field);

                            if (limits != null)
                            {
                                field = limits[1];
                                bits = bitRanges[j].limitlessBits;
                            }

                            let index = format.fieldParameterIndex(field);

                            var register = 0;

                            if(paramTypes[index] !== Parameter.special)
                            {
                                let processed = this.processParameter(address, args[index], paramTypes[index], bits, labels, addresses);
                                if (processed.errorMessage !== null)
                                {
                                    result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": " + processed.errorMessage;
                                    return result;                            
                                }
                                register = processed.value;
                            }
                            else
                            {
                                let processed = instruction.format.processSpecialParameter(address, args[index], bits, labels, addresses);
                                if (processed.errorMessage !== null)
                                {
                                    result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": " + processed.errorMessage;
                                    return result;                            
                                }
                                register = processed.value;
                            }

                            if (limits != null)
                            {
                                startBit = parseInt(limits[3]);
                                endBit = parseInt(limits[2]);

                                register = register >>> startBit;
                                register = register & ((1 << (endBit - startBit + 1)) - 1);
                            }

                            machineCode = machineCode | (register << bitRanges[j].start);  

                        }
                    }

                    for (var j = 0; j < 4; j++)
                    {
                        result.machineCode.push(machineCode & 255);
                        machineCode = machineCode >>> 8;
                    }
                }
            }
            else
            {
                if (directives[0] == ".text")
                {
                    text = true;
                }
                else if (this.dataDirectives.indexOf(directives[0]) !== -1)
                {
                    let index = this.dataDirectives.indexOf(directives[0]);
                    
                    if (this.dataDirectiveSizes[index] !== 0)
                    {
                        let size = this.dataDirectiveSizes[index];
                        let array = lines[i].split("' '").join("'$OAK_SPACE_TEMP'").split(directives[0]).join("").split(" ").join("").split("'$OAK_SPACE_TEMP'").join("' '").split(",");
                        for (var j = 0; j < array.length; j++)
                        {
                            var processed = this.processParameter(address, array[j], Parameter.immediate, size * 8, labels, addresses);
                            if (processed.errorMessage !== null)
                            {
                                result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": " + processed.errorMessage;
                                return result;                            
                            }
                            for (var k = 0; k < size; k++)
                            {
                                address += 1;
                                result.machineCode.push(processed.value & 255);
                                processed.value = processed.value >>> 8;
                            }
                        }
                    }
                    else
                    {
                        switch (directives[0])
                        {   
                            case ".asciiz":
                            case ".ascii":
                            var stringMatch = /.([A-Za-z]+?)\s*\"(.*)\"\s*(#.*)?$/.exec(lines[i]);
                            if (stringMatch == null)
                            {
                                result.errorMessage = "Line " + i + ": Malformed string directive.";
                                return result;
                            }
                            if (stringMatch[1] == undefined)
                            {
                                stringMatch[1] = "";
                            }
                            let characters = stringMatch[1].split("");
                            for (var j = 0; j < characters.length; j++)
                            {
                                if (characters[j] == "\\")
                                {
                                    j++;
                                    if (j + 1 < characters.length)
                                    {
                                        switch (characters[j + 1])
                                        {
                                            case 'n':
                                                result.machineCode.push(10 >>> 0);
                                                break;
                                            case '0':
                                                result.machineCode.push(0 >>> 0);
                                                break;
                                            case "'":
                                                result.machineCode.push(39 >>> 0);
                                                break;
                                            case "\\":
                                                result.machineCode.push(92 >>> 0);
                                                break;
                                            default:
                                                result.machineCode.push(characters[j].charCodeAt(0))                                                             
                                        }
                                    }
                                }
                                else
                                {
                                    result.machineCode.push(characters[j].charCodeAt(0));
                                }
                                
                                address += 1;
                            }
                            if (directives[0] == ".asciiz")
                            {
                                result.machineCode.push(0 >>> 0);
                                address += 1;
                            }
                        }
                    }
                }
            }
        }
        result.size = address;
        return result;
    };


    let abiNames = ["$zero", "$at", "$v0", "$v1", "$a0", "$a1", "$a2", "$a3", "$t0", "$t1", "$t2", "$t3", "$t4", "$t5", "$t6", "$t7", "$s0", "$s1", "$s2", "$s3", "$s4", "$s5", "$s6", "$s7", "$t8", "$t9", "$k0", "$k1", "$gp", "$sp", "$fp", "$ra"];

    return new InstructionSet(32, formats, instructions, pseudoInstructions, [".word", ".half", ".byte", ".string"], [4, 2, 1, 0], abiNames, null, null, null);
}
let MIPS = Oak_gen_MIPS();

class MIPSRegisterFile
{
    private memorySize: number;
    physicalFile: number[];
    abiNames: string[];
    modifiedRegisters: boolean[];

    print()
    {
        console.log("Registers\n------");
        for (var i = 0; i < 32; i++)
        {
            console.log("$" + i.toString(), this.abiNames[i], this.physicalFile[i].toString(), (this.physicalFile[i] >>> 0).toString(16).toUpperCase());
        }
        console.log("------");
    }
    
    read(registerNumber: number)
    {
        if (registerNumber === 0)
        {
            return 0;
        }
        else
        {
            return this.physicalFile[registerNumber];
        }
    }

    write(registerNumber: number, value: number)
    {
        this.physicalFile[registerNumber] = value;
        this.modifiedRegisters[registerNumber] = true;
    }

    getRegisterCount():number
    {
        return 32;
    }


    getModifiedRegisters():boolean[]
    {
        var modReg = this.modifiedRegisters.slice();
        for (var i = 0; i < this.getRegisterCount(); i++) {
            this.modifiedRegisters[i] = false;
        }
        return modReg;
    }

    reset()
    {
        for (var i = 0; i < 32; i++)
        {
            this.physicalFile[i] = 0;
            this.modifiedRegisters[i] = false;
        }
        this.physicalFile[29] = this.memorySize;

    }

    constructor(memorySize: number, abiNames: string[])
    {
        this.physicalFile = [];
        this.modifiedRegisters = [];
        for (var i = 0; i < 32; i++)
        {
            this.physicalFile.push(0);
            this.modifiedRegisters.push(false);
        }
        this.memorySize = memorySize;
        this.physicalFile[29] = memorySize; //stack pointer
        this.abiNames = abiNames;
    }
};

class MIPSCore //: Core
{
    //Permanent
    instructionSet: InstructionSet;
    registerFile: MIPSRegisterFile;
    memorySize: number;

    //Transient
    pc: number;
    memory: number[];

    //Environment Call Lambda
    ecall: () => void;

    //Instruction Callback
    instructionCallback: (data: string) => void;


    reset()
    {
        this.pc = 0;
        this.memory = [];
        for (var i = 0; i < this.memorySize; i++)
        {
            this.memory[i] = 0;
        }
        this.registerFile.reset();
    }

    //Returns bytes on success, null on failure
    memcpy(address: number, bytes: number): number[]
    {
        if (address + bytes > this.memorySize)
        {
            return null;
        }
        
        var result: number[] = [];
        for (var i = 0; i < bytes; i++)
        {
            result.push(this.memory[address + i]);
        }
        return result;
    }

    //Returns boolean indicating success
    //Use to store machine code in memory so it can be executed.
    memset(address: number, bytes: number[]): boolean
    {
        if (address < 0)
        {
            return false;
        }

        if (address + bytes.length > this.memorySize)
        {
            return false;
        }

        for (var i = 0; i < bytes.length; i++)
        {
            this.memory[address + i] = bytes[i];
        }
        return true;
    }
    
    fetched: number;

    fetch(): string
    {
        if (this.pc < 0)
        {
            return "Fetch Error: Negative program counter.";
        }
        let arr = this.memcpy(this.pc, 4);
        if (arr == null)
        {
            return "Fetch Error: Illegal memory access.";
        }
        this.pc += 4;

        this.fetched = catBytes(arr);
        return null;
    }

    decoded: Instruction;
    arguments: number[];

    //Returns the disassembly. If the decoding fails, null.
    decode(): string
    {
        let insts = this.instructionSet.instructions;
        this.decoded = null;
        this.arguments = [];
        for (var i = 0; i < insts.length; i++)
        {
            if (insts[i].match(this.fetched))
            {
                this.decoded = insts[i];
                break;
            }
        }
        if (this.decoded == null)
        {
            return null;
        }

        let format = this.decoded.format;
        let bitRanges = format.ranges;
        let params = format.parameters;
        let paramTypes = format.parameterTypes;

        for (var i = 0; i < bitRanges.length; i++)
        {
            if (!bitRanges[i].instructionDefined)
            {
                var limit = 0;
                var field = bitRanges[i].field;

                var limits = /([A-za-z]+)\s*\[\s*(\d+)\s*:\s*(\d+)\s*\]/.exec(bitRanges[i].field);

                if (limits != null)
                {
                    field = limits[1];
                    limit = parseInt(limits[3]) >>> 0;
                }

                let index = format.fieldParameterIndex(field);
                var bits = bitRanges[i].bits;

                var value = ((this.fetched >>> bitRanges[i].start) & ((1 << bitRanges[i].bits) - 1)) << limit;
                
                if(paramTypes[index] === Parameter.special)
                {
                    value = this.decoded.format.decodeSpecialParameter(value); //Unmangle...
                }

                this.arguments[index] = this.arguments[index] | value;
            }
        }

        for (var i = 0; i < params.length; i++)
        {
            let rangeIndex = format.parameterBitRangeIndex(params[i]);
            if (rangeIndex === -1)
            {
                console.log("Internal error: No field found for parameter " + params[i] + ".");
            }

            var bits = bitRanges[rangeIndex].bits;
            if (bitRanges[rangeIndex].limitlessBits != null)
            {
                bits = bitRanges[rangeIndex].limitlessBits;
            }

            if (this.decoded.signed && paramTypes[i] != Parameter.register)
            {
                this.arguments[i] = signExt(this.arguments[i], bits);
            }
        }

        return format.disassemble(this.decoded.mnemonic, this.arguments, this.instructionSet.abiNames);

    }

    //Returns null on success, error message on error.
    execute(): string
    {
        return this.decoded.executor(this)
    }


    constructor(memorySize: number, ecall: () => void, instructionCallback: (data: string) => void)
    {
        this.instructionSet = MIPS;
        this.pc = 0 >>> 0;
        this.memorySize = memorySize;
        this.ecall = ecall;
        this.instructionCallback = instructionCallback;
        this.registerFile = new MIPSRegisterFile(memorySize, MIPS.abiNames);
        
        this.memory = new Array(memorySize);
        for (var i = 0; i < memorySize; i++)
        {
            this.memory[i] = 0;
        }         
    }
}