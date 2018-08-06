/// <reference path="Core.ts"/>

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
};

enum Keyword {
    directive = 0,
    comment,
    label,
    stringMarker,
    charMarker,
    register,

    //Only send as keywordRegexes,
    string,
    char,
    numeric
};

enum Directive {
    text = 0,
    data,
    string,
    cString, //Null terminated

    //Ints and chars,
    _8bit,
    _16bit,
    _32bit,
    _64bit,

    //Fixed point decimals,
    fixedPoint,
    floatingPoint,

    //Custom,
    custom
};

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
    constants: number[];
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
            let constant = this.constants[this.format.ranges[i].field];
            if (constant !== undefined)
            {
                str += this.pad(constant.toString(2), this.format.ranges[i].bits);
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
        
        return true;
    }

    template(): number {
        var temp = 0 >>> 0;

        for (var i = 0; i < this.format.ranges.length; i++) {
            let constant = this.constants[this.format.ranges[i].field];
            if (constant !== undefined) {
                temp |= (constant << this.format.ranges[i].start)
            }
        }

        return temp
    };


    constructor(mnemonic: string, format: Format, constants: string[], constValues: number[], executor: (core: Core) => string, signatoryOverride: boolean = null) {
        this.mnemonic = mnemonic;
        this.format = format;
        this.constants = [];
        for (var constant in constants) { this.constants[constants[constant]] = constValues[constant]; }
        this.executor = executor;        
        this.signatoryOverride = signatoryOverride;
    }
};

class PseudoInstruction { //Note: Redo

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

    public instructionPrefixing(line: string): Instruction {
        for (var i in this.instructions) {
            var instruction = this.instructions[i];
            if (line.toUpperCase().hasPrefix(instruction.mnemonic)) {
                var captures = instruction.format.regex.exec(line);
                if (captures && captures[1].toUpperCase() == instruction.mnemonic) {
                    return instruction
                }
            }
        }

        return null;
    }

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
        assemble: (nester: number, address: number, lines: string[], labels: string[], addresses: number[]) => ({errorMessage: string, machineCode: number[], size: number}),
        keywords: string[][],
        directives: Directive[]
    ) {
        this.name = name
        this.bits = bits       
        this.formats = formats
        this.instructions = instructions
        this.pseudoInstructions = pseudoInstructions
        this.dataDirectives = dataDirectives
        this.dataDirectiveSizes = dataDirectiveSizes
        this.abiNames = abiNames
        this.keywords = keywords
        this.directives = directives
    }
};