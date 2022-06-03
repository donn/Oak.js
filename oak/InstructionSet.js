import { Enum } from "./Enum.js";
import { Utils } from "./Utils.js";

export const Parameter = new Enum({
    immediate: 0,
    register: 1,
    condition: 2,
    offset: 3,
    special: 4,
    fpImmediate: 5,
});

export const Endianness = new Enum({
    little: 0,
    big: 1,
    bi: 2,
});

export const Keyword = new Enum({
    directive: 0,
    comment: 1,
    label: 2,
    stringMarker: 3,
    charMarker: 4,
    register: 5,

    string: 6,
    char: 7,
    numberic: 8,
});

export const Directive = new Enum({
    text: 0,
    data: 1,
    string: 2,
    cString: 3,

    _8bit: 4,
    _16bit: 5,
    _32bit: 6,
    _64bit: 7,

    fixedPoint: 8,
    floatingPoint: 9,

    custom: 10,
});

export class BitRange {
    constructor(field, start, bits, constant = null, signed = false) {
        this.field = field;
        this.start = start;
        this.bits = bits;
        this.constant = constant;
        this.signed = signed;
    }
    get end() {
        return this.start + this.bits - 1;
    }
    limited(totalBits, limitStart = null, limitEnd = null) {
        this.totalBits = totalBits;
        this.limitStart = limitStart;
        this.limitEnd = limitEnd;
        return this;
    }
    parameterized(parameter, parameterType, parameterDefaultValue = null) {
        this.parameter = parameter;
        this.parameterDefaultValue = parameterDefaultValue;
        this.parameterType = parameterType;
        return this;
    }
}

export class Format {
    constructor(
        ranges,
        regex,
        disassembly,
        processSpecialParameter = null,
        decodeSpecialParameter = null
    ) {
        this.ranges = ranges;
        this.regex = regex;
        this.disassembly = disassembly;
        this.processSpecialParameter = processSpecialParameter;
        this.decodeSpecialParameter = decodeSpecialParameter;
    }
}

export class Instruction {
    constructor(
        mnemonic,
        format,
        constants,
        constValues,
        executor,
        signatoryOverride = null,
        pseudoInstructionFor = []
    ) {
        this.computedBits = null;
        /*
         Mask
         
         It's basically the bits of each format, but with Xs replacing parts that aren't constant in every instruction.
         For example, if an 8-bit ISA defines 5 bits for the register and 3 bits for the opcode, and the opcode for ADD is 101 then the ADD instruction's mask is XXXXX101.
        */
        this.computedMask = null;
        this.computedTemplate = null;
        this.mnemonic = mnemonic;
        this.format = format;
        this.constants = [];
        for (let i in constants) {
            this.constants[constants[i]] = constValues[i];
        }
        this.executor = executor;
        this.signatoryOverride = signatoryOverride;
        this.pseudoInstructionFor = pseudoInstructionFor;
    }
    pad(str, length) {
        let padded = str;
        for (let i = 0; i < length - str.length; i++) {
            padded = "0" + padded;
        }
        return padded;
    }
    get bits() {
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
    get bytes() {
        return Math.ceil(this.bits / 8);
    }
    get mask() {
        if (this.computedMask !== null) {
            return this.computedMask;
        }
        var string = "";
        for (let i = 0; i < this.bits; i += 1) {
            string += "X";
        }
        for (let i in this.format.ranges) {
            let range = this.format.ranges[i];
            let constant = this.constants[range.field];
            if (constant === null) {
                constant = range.constant;
            }
            if (constant != null) {
                let before = string.substr(0, this.bits - range.end - 1);
                let addition = Utils.pad(constant, range.bits, 2);
                let after =
                    range.start === 0 ? "" : string.substr(-range.start);
                string = before + addition + after;
            }
        }
        this.computedMask = string;
        return this.computedMask;
    }
    match(machineCode) {
        let machineCodeMutable = machineCode >>> 0;
        let maskBits = this.mask.split("");
        for (let i = this.bits - 1; i >= 0; i--) {
            let bit = machineCodeMutable & 1;
            machineCodeMutable >>= 1;
            if (maskBits[i] === "X") {
                continue;
            }
            if (parseInt(maskBits[i], 10) !== bit) {
                return false;
            }
        }
        return true;
    }
    get template() {
        if (this.computedTemplate != null) {
            return this.computedTemplate;
        }
        let temp = 0 >>> 0;
        for (let i in this.format.ranges) {
            let range = this.format.ranges[i];
            let constant = this.constants[range.field];
            if (constant === null) {
                constant = range.constant;
            }
            if (constant != null) {
                temp |= constant << range.start;
            }
        }
        this.computedTemplate = temp;
        return temp;
    }
}

export class PseudoInstruction {}

export class InstructionSet {
    /*
        InstructionSet initializer
    */
    constructor(
        bits,
        formats,
        instructions,
        pseudoInstructions,
        abiNames,
        keywords,
        directives,
        incrementOnFetch,
        exampleCode
    ) {
        this.bits = bits;
        this.formats = formats;
        this.instructions = instructions;
        instructions.sort((a, b) => a.bytes - b.bytes);
        this.pseudoInstructions = pseudoInstructions;
        this.abiNames = abiNames;
        this.keywords = keywords;
        this.directives = directives;
        this.incrementOnFetch = incrementOnFetch;
        this.exampleCode = exampleCode;
    }
    //Return Mnemonic Index (pseudo)
    pseudoMnemonicSearch(mnemonic) {
        return -1;
    } //Worst case = instructions.length
    //Return Mnemonic Index (True)
    mnemonicSearch(mnemonic) {
        for (let i = 0; i < this.instructions.length; i++) {
            if (this.instructions[i].mnemonic === mnemonic) {
                return i;
            }
        }
        return -1;
    } //Worst case = instructions.length
    instructionsPrefixing(line) {
        var result = [];
        for (let i in this.instructions) {
            let instruction = this.instructions[i];
            if (line.toUpperCase().hasPrefix(instruction.mnemonic)) {
                let captures = instruction.format.regex.exec(line);
                if (
                    captures &&
                    captures[1].toUpperCase() === instruction.mnemonic
                ) {
                    result.push(instruction);
                }
            }
        }
        return result;
    }
    disassemble(instruction, args) {
        let output = instruction.format.disassembly;
        output = output.replace("@mnem", instruction.mnemonic);
        for (let i = 0; i < instruction.format.ranges.length; i++) {
            let range = instruction.format.ranges[i];
            let parameter = range.parameter;
            if (parameter != null) {
                output = output.replace(
                    "@arg" + range.parameter,
                    range.parameterType === Parameter.register
                        ? this.abiNames[args[parameter]]
                        : args[parameter].toString()
                );
            }
        }
        return output;
    }
}
