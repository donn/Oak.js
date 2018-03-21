/// <reference path="Core.ts"/>
/// <reference path="Assembler.ts"/>

enum Parameter {
    immediate = 0,
    register = 1,
    condition = 2,
    offset = 3,
    special = 4,
    fpImmediate = 5
};

enum Endianness {
    little = 0,
    big,
    bi
}

class BitRange {
    field: string;
    start: number;
    bits: number;
    
    totalBits: number;
    limitStart: number;
    limitEnd: number;
    
    constant: number;
    
    parameter: number;
    parameterDefaultValue: number;
    parameterType: Parameter;

    signed: boolean;

    constructor(field: string, start: number, bits: number, constant: number = null, signed: boolean = false) {
        this.field = field;
        this.start = start;
        this.bits = bits;
        this.constant = constant;
        this.signed = signed;
    }

    public limited(totalBits: number, limitStart: number = null, limitEnd: number = null): BitRange {
        this.totalBits = totalBits;
        this.limitStart = limitStart;
        this.limitEnd = limitEnd;
        return this;
    }

    public parameterized(parameter: number, parameterType: Parameter, parameterDefaultValue: number = null): BitRange {
        this.parameter = parameter;
        this.parameterDefaultValue = parameterDefaultValue;
        this.parameterType = parameterType;
        return this;
    }
};

class Format {   
    ranges: BitRange[];
    regex: RegExp;
    disassembly: string; 

    processSpecialParameter: (address: number, text: string, bits: number, labels: string[], addresses: number[]) => ({errorMessage: string, value: number});
    decodeSpecialParameter: (value: number, address: number) => number;

    constructor
    (
        ranges: BitRange[],
        regex: RegExp,
        disassembly: string,
        processSpecialParameter: (address: number, text: string, bits: number, labels: string[], addresses: number[]) => ({errorMessage: string, value: number}) = null,
        decodeSpecialParameter: (value: number, address: number) => number = null
    )
    {
        this.ranges = ranges;
        this.regex = regex;
        this.disassembly = disassembly;
        this.processSpecialParameter = processSpecialParameter;
        this.decodeSpecialParameter = decodeSpecialParameter;
    }        
};

class Instruction {
    mnemonic: string;
    format: Format;
    constants: string[];
    constValues: number[];
    available: boolean;
    signatoryOverride: boolean; //Optional, if true/false overrides default signing behavior for bitranges

    executor: (core: Core) => string;

    private pad(str: string, length: number): string {
        var padded = str;
        for (var i = 0; i < length - str.length; i++)
        {
            padded = "0" + padded;
        }
        return padded;
    }

    mask(): string {
        var str = "";
        for (var i = 0; i < this.format.ranges.length; i++)
        {
            let index = this.constants.indexOf(this.format.ranges[i].field);
            if (index !== -1)
            {
                str += this.pad(this.constValues[index].toString(2), this.format.ranges[i].bits);
            }
            else if (this.format.ranges[i].constant != null)
            {
                str += this.pad(this.format.ranges[i].constant.toString(2), this.format.ranges[i].bits);
            }
            else {
                for (var j = 0; j < this.format.ranges[i].bits; j++)
                {
                    str += "X";
                }
            }
        }

        return str;
    };

    match(machineCode: number): boolean {
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

    template(): number {
        var temp = 0 >>> 0;

        for (var i = 0; i < this.format.ranges.length; i++)
        {
            let index = this.constants.indexOf(this.format.ranges[i].field);
            if (index !== -1)
            {
                
            }
        }

        return parseInt(this.mask().split("X").join("0"), 2);
    };


    constructor(mnemonic: string, format: Format, constants: string[], constValues: number[], executor: (core: Core) => string, signatoryOverride: boolean = null)
    {
        this.mnemonic = mnemonic;
        this.format = format;
        this.constants = constants;
        this.constValues = constValues;
        this.executor = executor;        
        this.signatoryOverride = signatoryOverride;
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

class InstructionSet {
    name: string;
    formats: Format[];   
    instructions: Instruction[];
    pseudoInstructions: PseudoInstruction[];
    dataDirectives: string[];
    dataDirectiveSizes: number[];            

    //Return Mnemonic Index (pseudo)
    public pseudoMnemonicSearch(mnemonic: string): number {
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
    public mnemonicSearch(mnemonic: string): number {
        for (var i = 0; i < this.instructions.length; i++)
        {
            if (this.instructions[i].mnemonic == mnemonic)
            {
                return i;
            }
        }
        return -1;
    } //Worst case = instructions.length

    public disassemble(instruction: Instruction, args: number[]): string {
        var output = instruction.format.disassembly;
        output = output.replace("@mnem", instruction.mnemonic);
        for (var i = 0; i < instruction.format.ranges.length; i++)
        {
            let range = instruction.format.ranges[i];
            if (range.parameter != null)
            {
                output = output.replace("@arg" + range.parameter, (range.parameterType === Parameter.register)? this.abiNames[args[i]] : args[i].toString());
            }            
        }
        return output;
    }

    //Validates Parameter, returns value in binary
    processParameter: (address: number, text: string, type: Parameter, bits: number, labels: string[], addresses: number[]) => ({errorMessage: string, value: number});

    //Number of bits.
    bits: number;

    //Closures to assemble a file
    tokenize: (file: string) => ({errorMessage: string, labels: string[], addresses: number[], lines: string[], pc: number[]});
    assemble: (nester: number, address: number, lines: string[], labels: string[], addresses: number[]) => ({errorMessage: string, machineCode: number[], size: number});

    //Register abiNames
    abiNames: string[];

    //Endianness
    endianness: Endianness;

    //Syntax
    keywordRegexes: string[]; //Map<Keyword, string>;
    keywords: string[][]; //Map<Keyword, string[]>;
    directives: Directive[]; //Map<string, Directive>;

    //Assembly Conventions
    incrementOnFetch: boolean;
    
    /*
        InstructionSet initializer
    */
    constructor(
        name: string,
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
        this.name = name
        this.bits = bits       
        this.formats = formats
        this.instructions = instructions
        this.pseudoInstructions = pseudoInstructions
        this.dataDirectives = dataDirectives
        this.dataDirectiveSizes = dataDirectiveSizes
        this.abiNames = abiNames

        this.processParameter = process       
        this.tokenize = tokenize
        this.assemble = assemble
    }
};