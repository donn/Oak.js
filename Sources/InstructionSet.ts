/// <reference path="Core.ts"/>

enum Parameter
{
    immediate = 0,
    register = 1,
    condition = 2, //Not in RISC-V
    offset = 3,
    special = 4, 
    optional = 5 //Also Not in RISC-V,
};

class BitRange
{
    field: string;
    start: number;
    bits: number;
    defaultValue: number; //If it's a parameter and the condition to use it fails;
    limitlessBits: number;
    instructionDefined: boolean;
    
    constructor(field: string, start: number, bits: number, instructionDefined: boolean = true,  defaultValue: number = null, limitlessBits: number = null)
    {
        this.field = field;
        this.start = start;
        this.bits = bits;
        this.defaultValue = defaultValue;
        this.instructionDefined = instructionDefined;
        this.limitlessBits = limitlessBits;
    }
};

class Format
{   
    ranges: BitRange[];
    parameters: string[];
    parameterTypes: Parameter[];
    parameterConditions: (machineCode: number) => (boolean)[];
    regex: RegExp;
    disassembly: string; 

    disassemble(mnemonic: string, args: number[], abiNames: string[]): string
    {
        var output = this.disassembly;
        output = output.replace("@mnem", mnemonic);
        for (var i = 0; i < this.parameters.length; i++)
        {
            if ((args[i] == null) || (output.search("@arg") === -1))
            {
                console.log("Disassembler note: Argument mismatch.");
                break;
            }
            output = output.replace("@arg", (this.parameterTypes[i] === Parameter.register)? abiNames[args[i]] : args[i].toString());            
        }
        return output;
    }

    parameterBitRangeIndex(parameter: string): number
    {
        for (var i = 0; i < this.ranges.length; i++)
        {
            if (this.ranges[i].field === parameter)
            {
                return i;
            }
            var limits = /([A-za-z]+)\s*\[\s*(\d+)\s*:\s*(\d+)\s*\]/.exec(this.ranges[i].field);
            if (limits !== null)
            {
                if (limits[1] === parameter)
                {
                    return i;
                }
            }
        }
        return null;
    }

    fieldParameterIndex(range: string): number
    {
        for (var i = 0; i < this.parameters.length; i++)
        {
            if (this.parameters[i] == range)
            {
                return i;
            }
        }
        return null;
    }

    processSpecialParameter: (address: number, text: string, bits: number, labels: string[], addresses: number[]) => ({errorMessage: string, value: number});
    decodeSpecialParameter: (value: number) => number;

    constructor
    (
        ranges: BitRange[],
        parameters: string[],
        parameterTypes: Parameter[],
        regex: RegExp,
        disassembly: string,
        parameterConditions: (machineCode: number) => (boolean)[] = null,
        processSpecialParameter: (address: number, text: string, bits: number, labels: string[], addresses: number[]) => ({errorMessage: string, value: number}) = null,
        decodeSpecialParameter: (value: number) => number = null
    )
    {
        this.parameters = parameters;
        this.ranges = ranges;
        this.parameterTypes = parameterTypes;
        this.parameterConditions = parameterConditions;
        this.regex = regex;
        this.disassembly = disassembly;
        this.processSpecialParameter = processSpecialParameter;
        this.decodeSpecialParameter = decodeSpecialParameter;
    }        
};

class Instruction
{
    mnemonic: string;
    format: Format;
    constants: string[];
    constValues: number[];
    available: boolean;
    signed: boolean;

    executor: (core: Core) => string;

    private pad(str: string, length: number): string
    {
        var padded = str;
        for (var i = 0; i < length - str.length; i++)
        {
            padded = "0" + padded;
        }
        return padded;
    }

    mask(): string
    {
        var str = "";
        for (var i = 0; i < this.format.ranges.length; i++)
        {
            let index = this.constants.indexOf(this.format.ranges[i].field);
            if (index !== -1)
            {
                str += this.pad(this.constValues[index].toString(2), this.format.ranges[i].bits);
            }
            else
            {
                for (var j = 0; j < this.format.ranges[i].bits; j++)
                {
                    str += "X";
                }
            }
        }

        return str;
    };

    match(machineCode: number): boolean
    {
        var machineCodeMutable = machineCode >>> 0;
        let maskBits = this.mask().split("");
        for (var i = 31; i >= 0; i--)
        {
            if (maskBits[i] === "X")
            {
                machineCodeMutable = machineCodeMutable >>> 1;
                continue;
            }
            if (parseInt(maskBits[i]) !== (machineCodeMutable & 1))
            {
                return false;
            }
            machineCodeMutable = machineCodeMutable >>> 1;
        }
        //console.log("Match Log: Matched 0b" + (machineCode >>> 0).toString(2) + " with " + this.mnemonic + ".");
        return true;
    }

    template(): number
    {
        return parseInt(this.mask().split("X").join("0"), 2);
    };


    constructor(mnemonic: string, format: Format, constants: string[], constValues: number[], executor: (core: Core) => string, signed: boolean = true, available: boolean = true)
    {
        this.mnemonic = mnemonic;
        this.format = format;
        this.constants = constants;
        this.constValues = constValues;
        this.available = available;
        this.signed = signed;
        this.executor = executor;        
    }
};

class PseudoInstruction //We don't have to use this here but I should probably backport it to Swift.
{    
    mnemonic: string;
    parameters: string[];
    expansion: string[];

    /*
    Example:
    mnemonic: li
    parameters: ['__oakasm__rd', '__oakasm__imm']        
    expansion: ['add __oakasm__rd, __oakasm__rd, __oakasm__imm']
    */

    expand(line: String)
    {
        return null; 
    }

    constructor(mnemonic: string, parameters: string[], expansion: string[])
    {
        this.mnemonic = mnemonic;
        this.parameters = parameters;
        this.expansion = expansion;
    }

};

class InstructionSet
{
    formats: Format[];   
    instructions: Instruction[];
    pseudoInstructions: PseudoInstruction[];
    dataDirectives: string[];
    dataDirectiveSizes: number[];            

    //Return Mnemonic Index (pseudo)
    private pseudoMnemonicSearch(mnemonic: string): number
    {
        for (var i = 0; i < this. pseudoInstructions.length; i++)
        {
            if (this. pseudoInstructions[i].mnemonic == mnemonic)
            {
                return i;
            }
        }
        return -1;
    } //Worst case = instructions.length
    
    //Return Mnemonic Index (True)
    private mnemonicSearch(mnemonic: string): number
    {
        for (var i = 0; i < this.instructions.length; i++)
        {
            if (this.instructions[i].mnemonic == mnemonic)
            {
                return i;
            }
        }
        return -1;
    } //Worst case = instructions.length

    //Validates Parameter, returns value in binary
    processParameter: (address: number, text: string, type: Parameter, bits: number, labels: string[], addresses: number[]) => ({errorMessage: string, value: number});

    //Number of bits.
    bits: number;

    //Closures to assemble a file
    tokenize: (file: string) => ({errorMessage: string, labels: string[], addresses: number[], lines: string[], pc: number[]});
    assemble: (nester: number, address: number, lines: string[], labels: string[], addresses: number[]) => ({errorMessage: string, machineCode: number[], size: number});

    //Register abiNames
    abiNames: string[];
    
    /*
        InstructionSet initializer
    */
    constructor(
        bits: number,
        formats: Format[],
        instructions: Instruction[],
        pseudoInstructions: PseudoInstruction[],
        dataDirectives: string[],
        dataDirectiveSizes: number[],
        abiNames: string[],
        process: (address: number, text: string, type: Parameter, bits: number, labels: string[], addresses: number[]) => ({errorMessage: string, value: number}),
        tokenize: (file: string) => ({errorMessage: string, labels: string[], addresses: number[], lines: string[], pc: number[]}),
        assemble: (nester: number, address: number, lines: string[], labels: string[], addresses: number[]) => ({errorMessage: string, machineCode: number[], size: number})
    )
    {
        this.bits = bits       
        this.formats = formats
        this.instructions = instructions
        this.pseudoInstructions = pseudoInstructions;
        this.dataDirectives = dataDirectives
        this.dataDirectiveSizes = dataDirectiveSizes
        this.abiNames = abiNames;

        this.processParameter = process;        
        this.tokenize = tokenize
        this.assemble = assemble
    }
};