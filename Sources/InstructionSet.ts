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

    get end(): number {
        return this.start + this.bits - 1
    }
    
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

    processSpecialParameter: (text: string, bits: number, Line: Line[]) => any;
    decodeSpecialParameter: (value: number, address: number) => number;

    constructor (
        ranges: BitRange[],
        regex: RegExp,
        disassembly: string,
        processSpecialParameter: (text: string, bits: number, lines: Line[]) => any = null,
        decodeSpecialParameter: (value: number, address: number) => number = null
    ) {
        this.ranges = ranges;
        this.regex = regex;
        this.disassembly = disassembly;
        this.processSpecialParameter = processSpecialParameter;
        this.decodeSpecialParameter = decodeSpecialParameter;
    }        
};

class Instruction {
    mnemonic: string;
    pseudoInstructionFor: string[];

    format: Format;
    constants: number[];
    available: boolean;
    signatoryOverride: boolean; //Optional, if true/false overrides default signing behavior for bitranges

    executor: (core: Core) => string;

    private pad(str: string, length: number): string {
        let padded = str;
        for (let i = 0; i < length - str.length; i++)
        {
            padded = "0" + padded;
        }
        return padded;
    }

    computedBits: number = null;
    get bits(): number {
        if (this.computedBits !== null) {
            return this.computedBits;
        }
        let count = 0;
        for (var i in this.format.ranges) {
            count += this.format.ranges[i].bits;
        }
        this.computedBits = count;
        return this.computedBits;
    }

    get bytes(): number {
        return Math.ceil(this.bits / 8)
    }

    /*
     Mask
     
     It's basically the bits of each format, but with Xs replacing parts that aren't constant in every instruction.
     For example, if an 8-bit ISA defines 5 bits for the register and 3 bits for the opcode, and the opcode for ADD is 101 then the ADD instruction's mask is XXXXX101.
    */
    computedMask: string = null
    get mask(): string {
        if (this.computedMask !== null) {
            return this.computedMask;
        }

            var string = '';
            for (let i = 0; i < this.bits; i += 1) {
                string += 'X';
            }

            for (let i in this.format.ranges) {
                let range = this.format.ranges[i];
                let constant = this.constants[range.field];
                if (constant == null) {
                    constant = range.constant;
                }
                if (constant != null) {
                    let start = this.bits - range.end - 1;
                    let end = this.bits - range.start - 1;
                    string = string.substr(0, start) + Utils.pad(constant, range.bits, 2) + string.substr(end, 0);
                }
            }
            this.computedMask = string
            return this.computedMask;
    };

    match(machineCode: number): boolean {
        let machineCodeMutable = machineCode >>> 0;
        let maskBits = this.mask.split("");
        for (let i = 31; i >= 0; i--)
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

    computedTemplate: number = null;
    get template(): number {
        if (this.computedTemplate != null) {
            return 0;
        }
        let temp = 0 >>> 0;

        for (let i in this.format.ranges) {
            let range = this.format.ranges[i];
            let constant = this.constants[range.field];
            if (constant == null) {
                constant = range.constant;
            }
            if (constant != null) {
                temp |= (constant << range.start)
            }
        }

        return temp
    };

    constructor(mnemonic: string, format: Format, constants: string[], constValues: number[], executor: (core: Core) => string, signatoryOverride: boolean = null, pseudoInstructionFor: string[] = []) {
        this.mnemonic = mnemonic;
        this.format = format;
        this.constants = [];
        for (let i in constants) { this.constants[constants[i]] = constValues[i]; }
        this.executor = executor;        
        this.signatoryOverride = signatoryOverride;
        this.pseudoInstructionFor = pseudoInstructionFor;
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
        for (let i = 0; i < this.instructions.length; i++)
        {
            if (this.instructions[i].mnemonic == mnemonic)
            {
                return i;
            }
        }
        return -1;
    } //Worst case = instructions.length

    public instructionsPrefixing(line: string): Instruction[] {
        var result = [];
        for (let i in this.instructions) {
            let instruction = this.instructions[i];
            if (line.toUpperCase().hasPrefix(instruction.mnemonic)) {
                let captures = instruction.format.regex.exec(line);
                if (captures && captures[1].toUpperCase() == instruction.mnemonic) {
                    result.push(instruction);
                }
            }
        }

        return result;
    }

    public disassemble(instruction: Instruction, args: number[]): string {
        let output = instruction.format.disassembly;
        output = output.replace("@mnem", instruction.mnemonic);
        for (let i = 0; i < instruction.format.ranges.length; i++)
        {
            let range = instruction.format.ranges[i];
            if (range.parameter != null)
            {
                output = output.replace("@arg" + range.parameter, (range.parameterType === Parameter.register)? this.abiNames[args[i]] : args[i].toString());
            }            
        }
        return output;
    }

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
    keywordRegexes: RegExp[]; //Map<Keyword, string>;
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
        abiNames: string[],
        keywords: string[][],
        directives: Directive[]
    ) {
        this.name = name
        this.bits = bits       
        this.formats = formats
        this.instructions = instructions
        instructions.sort((a, b)=> a.bytes-b.bytes);
        this.pseudoInstructions = pseudoInstructions
        this.abiNames = abiNames
        this.keywords = keywords
        this.directives = directives
    }
};