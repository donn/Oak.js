/// <reference path="InstructionSet.ts"/>

namespace Utils {
    /*
        signExt

        Sign extends an n-bit value to fit Javascript limits.
    */
    export function signExt(value: number, bits: number): number {
        let mutableValue = value;
        if ((mutableValue & (1 << (bits - 1))) !== 0) {
            mutableValue = ((~(0) >>> bits) << bits) | value;
        }
        return mutableValue;
    }

    /*
        rangeCheck

        Checks if a value can fit within a certain number of bits.
    */
    export function rangeCheck(value: number, bits: number): boolean {
        if (bits >= 32) {
            return null; // No stable way of checking.
        }
        
        var min = -(1 << bits - 1);
        var max = (1 << bits - 1) - 1;
        value = signExt(value, bits);
        if ((min <= (value >> 0)) && ((value >> 0) <= max)) {
            return true;
        }
        return false;
    }

    /*
        catBytes
        
        Converts bytes stored in a little endian fashion to a proper js integer.
    */
    export function catBytes(bytes: number[], bigEndian: boolean = false): number {
        if (bytes.length > 4) {
            return null;
        }

        if (bigEndian) {
            bytes.reverse();
        }

        let storage = 0 >>> 0;
        for (let i = 0; i < bytes.length; i++) {
            storage = storage | (bytes[i] << (8 * i));
        }
        return storage;
    }

    /*
        pad
        
        Turns a number to a padded string.
    */
    export function pad(number: number, digits: number, radix: number): string {
        let padded = number.toString(radix);
        while (digits > padded.length) {
            padded = "0" + padded
        }
        return padded
    }


    export function hex(array: number[]) {
        let hexadecimal = "";
        for (let i = 0; i < array.length; i++) {
            let hexRepresentation = array[i].toString(16).toUpperCase();
            if (hexRepresentation.length === 1) {
                hexRepresentation = "0" + hexRepresentation;
            }
            hexadecimal += hexRepresentation + " ";
        }
        return hexadecimal;
    }
}

// Prototypes
interface String {
    interpretedBytes(): number[];
    hasPrefix(search: string) : boolean;
}

// Changes a string of hex bytes to an array of numbers.
String.prototype.interpretedBytes = function () {
    let hexes = this.split(' '); // Remove spaces, then seperate characters
	let bytes = [];
	for (let i=0; i < hexes.length; i++) {
		let value = parseInt(hexes[i], 16);
		if (!isNaN(value)) {
			bytes.push(value);
		}
	}
	return bytes;
}

// Check if haystack has needle in the beginning.
String.prototype.hasPrefix = function(needle) {
    return this.substr(0, needle.length) === needle;
};

enum Kind {
    instruction = 0,
    data,
    directive,
    noise
};

class Line {
    number: number;

    addressThisPass: number = null;

    sensitive: boolean = false;
    sensitivityList: Line[];

    machineCode: number[] = [];
    kind: Kind;

    invalidReason: string;

    raw: string;
    label: string;
    processed: string;
    
    possibleInstructions: [Instruction, string[], number[], string][];
    directive: Directive;
    directiveData: string;

    constructor(raw: string, number: number) {
        this.raw = raw;
        this.number = number;
        this.kind = Kind.noise;

        this.sensitivityList = [];
        this.possibleInstructions = [];
    }

    static arrayFromFile(file: string): Line[] {
        return file.split('\n').map((line, index)=> new Line(line, index));
    }

    initialProcess(assembler: Assembler, text: boolean = true): boolean {
        let comment = assembler.keywordRegexes[Keyword.comment];
        let tmp = comment.exec(this.raw)[1];
        let label = assembler.keywordRegexes[Keyword.label];
        let pieces = label.exec(tmp);

        this.label = pieces[1];
        this.processed = pieces[2] || '';

        if (/^s*$/.exec(this.processed) !== null) {
            return text;
        }

        if (assembler.keywordRegexes[Keyword.directive] != null) {
            let captures = RegExp(assembler.keywordRegexes[Keyword.directive]).exec(this.processed);
            if (captures !== null) {
                this.directive = assembler.directives[captures[1]];
                this.directiveData = captures[2]
            }
        }

        if (text) {
            if (this.directive !== undefined) {
                switch(this.directive) {
                case Directive.data:
                    this.kind = Kind.directive;
                    return false;
                case Directive.text:
                    this.kind = Kind.directive;
                    break;
                default:
                    this.invalidReason = "text.unsupportedDirective";
                }
                return true;
            }
            this.kind = Kind.instruction;
            assembler.instructionSet.instructions.forEach(instruction=> {
                let match = instruction.format.regex.exec(this.processed);
                if (match !== null && match[1].toUpperCase() === instruction.mnemonic) {
                    this.possibleInstructions.push([instruction, match.slice(2), [], null]);
                }
                return match !== null ;
            });
            if (this.possibleInstructions.length === 0) {
                this.invalidReason = "text.noMatchingInstructions";
                return true;
            }
            let minimum = this.possibleInstructions[0][0].bytes;
            (this.machineCode = []).length = minimum;
            this.machineCode.fill(0);
            return true;
        } else {
            let count = null; // byte count
            let zeroDelimitedString = 0;
            if (this.directive !== undefined) {
                this.kind = Kind.data;
                switch(this.directive) {
                case Directive.data:
                    this.kind = Kind.directive;
                    break;
                case Directive.text:
                    this.kind = Kind.directive;
                    return true;
                    break;
                case Directive._32bit:
                    count = count || 4;
                case Directive._16bit:
                    count = count || 2;
                case Directive._8bit:
                    count = count || 1;
                    let elements = this.directiveData.split(/\s*,\s*/);
                    (this.machineCode = []).length = (elements.length * count);
                    this.machineCode.fill(0);
                    this.kind = Kind.data;
                    break;
                case Directive.cString:
                    zeroDelimitedString = 1;
                case Directive.string:
                    if (assembler.keywordRegexes[Keyword.string] === null) {
                        this.invalidReason = "isa.noStringTokenDefined";
                    }
                    let match = assembler.keywordRegexes[Keyword.string].exec(this.directiveData);
                    if (match === null) {
                        this.invalidReason = "data.invalidString";
                    } else {
                        let regex = RegExp(assembler.generalCharacters, "g");
                        let characters = []
                        let found = null;
                        while (found = regex.exec(match[1])) {
                            characters.push(found);
                        }
                        (this.machineCode = []).length = (characters.length + zeroDelimitedString);

                        for (let c in characters) {
                            let character = String(characters[c]);
                            let value = character.charCodeAt(0);
                            if (character.length > 2) {
                                value = Assembler.escapedCharacters[character[1]];
                            }
                            this.machineCode[c] = value;
                        }
                        if (zeroDelimitedString === 1) {
                            this.machineCode[this.machineCode.length - 1] = 0;
                        }
                    }
                    this.kind = Kind.data;
                    break;
                default:
                    this.invalidReason = "data.unrecognizedDirective";
                }
            } else {
                let isInstruction = false;
                assembler.instructionSet.instructions.forEach(instruction=> {
                    let match = instruction.format.regex.exec(this.processed);
                    if (match !== null && match[1].toUpperCase() === instruction.mnemonic) {
                        isInstruction = true;
                    }
                });
                if (isInstruction) {
                    this.invalidReason = "data.instruction";
                } else {
                    this.invalidReason = "data.unknownInput";
                }
            }
            return false;
        }
    }

    private assembleText(assembler: Assembler, lines: Line[], address: number): string { 
        let candidates = false;

        testingInstructions: for (let i in this.possibleInstructions) {
            let possibleInstruction = this.possibleInstructions[i];
            let instruction = possibleInstruction[0];
            let args = possibleInstruction[1];

            let machineCode = instruction.template;
            for (var j in instruction.format.ranges) {
                let range = instruction.format.ranges[j];
                if (range.parameter === undefined) {
                    continue;
                }
                let limited = range.totalBits;
                let bits = limited || range.bits;
                let store = assembler.process(args[range.parameter], range.parameterType, bits, address, instruction.bytes);
                if (store.errorMessage !== null) {
                    possibleInstruction[3] = store.errorMessage;
                    continue testingInstructions;
                } else if (store.context !== null && store.value === null) {
                    store.context.sensitivityList.push(this);
                    this.sensitive = true;
                    break testingInstructions;
                } else {
                    let register = store.value;
                    let startBit = range.limitStart;
                    let endBit = range.limitEnd;

                    if (limited !== undefined && startBit !== undefined && endBit !== undefined) {
                        register >>= startBit; // discard start bits bits
                        let bits = (endBit - startBit + 1);
                        register &= (1 << bits) - 1; // mask end - start + 1 bits
                    }
                    machineCode |= register << range.start;
                }
            }

            for (let i = 0; i < instruction.bytes; i += 1) {
                possibleInstruction[2].push(machineCode & 0xFF);
                machineCode >>>= 8;
            }
            candidates = true;
        }

        if (candidates) {
            // Expand machine code if applicable
            let smallestPossibleInstruction = this.possibleInstructions.filter(pi=> pi[3] === null)[0];
            this.machineCode = smallestPossibleInstruction[2];
        }

        // Handle errors
        let errorMessage = null;
        let errorOccurred = !(candidates || this.sensitive);
        if (errorOccurred) {
            errorMessage = this.possibleInstructions[this.possibleInstructions.length - 1][3]; //Typically the most lenient option is last
        }

        return errorMessage;
    }

    assembleData(assembler: Assembler, lines: Line[], address: number): string {
        let errorMessage = null;
        let count: number = null;
        switch(this.directive) {
            case Directive._32bit:
                count = count || 4;
            case Directive._16bit:
                count = count || 2;
            case Directive._8bit:
                count = count || 1;
                let elements = this.directiveData.split(/\s*,\s*/);
                testingElements: for (let i = 0; i < elements.length; i += 1) {
                    let element = elements[i];
                    let bits = count << 3;
                    let store = assembler.process(element, Parameter.immediate, bits, address, 0);
                    if (store.errorMessage !== null) {
                        errorMessage = store.errorMessage;
                        break testingElements;
                    } else if (store.context !== null && store.value === null) {
                        store.context.sensitivityList.push(this);
                        this.sensitive = true;
                        break testingElements;
                    } else {
                        let stored = store.value;
                        for (let j = 0; j < count; j += 1) {
                            let offset = (count * i);
                            this.machineCode[j + offset] = stored & 0xFF;
                            stored >>>= 8;
                        }
                    }
                }
                break;
            case Directive.cString:
            case Directive.string:
                // Already handled in pass 0.
                break;
            default:
                this.invalidReason = "data.unrecognizedDirective";
            }

        return errorMessage;
    }

    assemble(assembler: Assembler, lines: Line[], address: number): [string, boolean] { // [errorMessage, repass]
        this.sensitive = false;
        let result: [string, boolean] = [null, false];

        switch(this.kind) {
        case Kind.instruction:
            result[0] = this.assembleText(assembler, lines, address);
            break;
        case Kind.data:
            result[0] = this.assembleData(assembler, lines, address);
        }

        let lineByLabel = assembler.linesByLabel[this.label];
        if (lineByLabel !== undefined) {
            lineByLabel[1] = address;
        }

        if (result[0] === null) {
            sensitiveList: for (let i in this.sensitivityList) {
                let sensor = this.sensitivityList[i];
                if (sensor.addressThisPass !== null) {
                    let sensorLength = sensor.machineCode.length;
                    let newAssembly = sensor.assemble(assembler, lines, sensor.addressThisPass);
                    if (sensor.sensitive) {
                        // Still sensitive, leave it alone uwu
                    } else {
                        if (newAssembly[1]) {
                            result[1] = true;
                            break sensitiveList;
                        }
                        if (sensor.machineCode.length !== sensorLength) {
                            result[1] = true;
                            break sensitiveList;
                        }
                    }
                }
            }
        } else {
            this.invalidReason = result[0];
        }

        return result;
    }
}

class Assembler {
    instructionSet: InstructionSet;

    generalCharacters: string;
    keywordRegexes: RegExp[]; //Map<Keyword, RegExp>;
    directives: Directive[]; //Map<string, Directive>;

    endianness: Endianness;
    incrementOnFetch: boolean;
    memoryMap: number[];

    static radixes = {
        'b': 2,
        'o': 8,
        'd': 10,
        'h': 16
    }
    static radixList = Object.keys(Assembler.radixes).join("")

    static escapedCharacters = {
        '0': 0,
        't': 9,
        'n': 10,
        'r': 13,
        '\'': 47,
        '\"': 42
    }
    static escapedCharacterList = Object.keys(Assembler.escapedCharacters).join("")

    //Returns number on success, string on failure
    process(text: string, type: Parameter, bits: number, address: number, instructionLength: number) {
        let result = {
            errorMessage: null,
            value: null,
            context: null
        };
        switch(type) {
        case Parameter.register:  
            let index = this.instructionSet.abiNames.indexOf(text);
            if (index !== -1) {
                result.value = index;
                return result; 
            }
            
            let registerNo = null;
            if (this.keywordRegexes[Keyword.register]) {
                registerNo = new RegExp(this.keywordRegexes[Parameter.register]).exec(text)[1];
            } else {
                result.errorMessage = `args.registerDoesNotExist(${text})`;
                return result;
            }
            registerNo = parseInt(registerNo);
            if ((registerNo & (~0 << bits)) !== 0) {
                result.errorMessage = `args.registerDoesNotExist(${text})`;
                return result;
            }
            result.value = registerNo;
            return result;

        case Parameter.offset:
        case Parameter.immediate:
            //Label
            let value = null;
            let reference = this.linesByLabel[text];
            if (reference !== undefined) {
                result.context = reference[0]
                if (reference[1] === null) {
                    return result;
                }
                value = reference[1];
            }
            if (value === null && this.keywordRegexes[Keyword.char]) {
                let extraction = RegExp(this.keywordRegexes[Keyword.char]).exec(text);
                if (extraction !== null && extraction[1] !== undefined) {
                    value = extraction[1].charCodeAt(0);
                    if (value > 255) {
                        result.errorMessage = "Non-ascii character " + extraction[1] + " unsupported.";
                        return result;
                    }
                }
            }
            if (value === null && this.keywordRegexes[Keyword.numeric] !== undefined) {
                let array = RegExp(this.keywordRegexes[Keyword.numeric]).exec(text);
                
                if (array !== null) {
                    let radix = Assembler.radixes[array[2]] || 10;
                    let interpretable = array[1];
    
                    value = parseInt(interpretable, radix);
                }
            }

            if (value !== null && type === Parameter.offset) {
                value -= address;
                if (this.incrementOnFetch) {
                    value += instructionLength;
                }
            }

            if (value === null || isNaN(value)) {     
                result.errorMessage = `args.valueUnrecognized(${text})`;
                return result;
            } else if (Utils.rangeCheck(value, bits) === false) {
                result.errorMessage = `args.outOfRange(${text})`;
                return result;
            }
            
            result.value = value;
            return result;

        default:
            result.errorMessage = "oak.paramUnsupported";
            return result;
        }
    }

    static options(list: string[]): string {
        if (list.length == 0) {
            return null
        }

        let options = ""

        for (let i = 0; i < list.length; i++) {
            let keyword = list[i];

            if (keyword == "\\") {
                console.log("INSTRUCTION SET WARNING: '\\' used as keyword. This behavior is undefined.")
                return null;
            }
            if (options == "") {
                options = "(?:";
            }
            else {
                options += "|";
            }
            options += keyword;
        }

        return options + ")";
    }

    linesByLabel: [Line[], number][] = [];

    assemble(lines: Line[], pass: number): Line[] {
        lines.map(line=> line.addressThisPass = null);
        let errors = [];
        let assemblerModeText = true;
        let address = 0;

        for (var i in lines) {
            let line = lines[i];

            switch (pass) {
            case 0: // Zero Pass - Minimum Possible Size
                assemblerModeText = line.initialProcess(this, assemblerModeText);
                if (line.invalidReason !== undefined) {
                    errors.push(line);
                }
                if (line.label !== undefined) {
                    this.linesByLabel[line.label] = [line, null];
                }
                break;
            default:
                line.addressThisPass = address;
                let asm = line.assemble(this, lines, address); // Assumption: Instruction cannot become context-sensitive based on size
                if (asm[0] !== null) {
                    errors.push(line);
                }
                if (asm[1]) {
                    return null; // Repass
                }
                address += line.machineCode.length;
            }
        }
        return errors;
    }

    constructor(instructionSet: InstructionSet, endianness: Endianness, memoryMap: number[] = null) {
        this.incrementOnFetch = instructionSet.incrementOnFetch;
        this.keywordRegexes = [];
        this.memoryMap = memoryMap;

        if (instructionSet.keywordRegexes) {
            this.keywordRegexes = instructionSet.keywordRegexes;
        } else if (instructionSet.keywords) {
            let words = instructionSet.keywords;
            this.keywordRegexes = [];
            
            if (words[Keyword.directive]) {
                let options = Assembler.options(instructionSet.keywords[Keyword.directive]);
                if (options) {
                    this.keywordRegexes[Keyword.directive] = RegExp(options + "([^\\s]+)\\s*(.+)*");
                }
            }

            if (words[Keyword.comment]) {
                let options = Assembler.options(words[Keyword.comment]);
                if (options) {
                    this.keywordRegexes[Keyword.comment] = RegExp("^(.*?)(" + options + ".*)?$");
                }
            }

            if (words[Keyword.label]) {
                let options = Assembler.options(words[Keyword.label]);
                if (options) {
                    this.keywordRegexes[Keyword.label] = RegExp("^(?:([A-Za-z_][A-Za-z0-9_]*)" + options + ")?\\s*(.*)?$");
                }
            }
            
            if (words[Keyword.register]) {
                let options = Assembler.options(words[Keyword.register]);
                if (options) {
                    this.keywordRegexes[Keyword.register] = RegExp(options + "([0-9]+)");
                }
            }

            this.keywordRegexes[Keyword.numeric] = RegExp("(-?(?:0([" + Assembler.radixList + "]))?[A-F0-9]+)");

            if (words[Keyword.charMarker]) {
                let options = Assembler.options(words[Keyword.charMarker]);
                if (options) {
                    let escapable = options.length > 1 ? "": "\\" + options
                    //this.keywordRegexes[Keyword.char] = RegExp(options + "" + options);
                    this.generalCharacters = "(?:(?:\\\\[\\\\" + Assembler.escapedCharacterList + escapable + "])|(?:[\\x20-\\x5b\\x5d-\\x7e]))"
                    this.keywordRegexes[Keyword.char] = RegExp(options + '(' + this.generalCharacters + ')' + options);
                }
            } else {
                this.generalCharacters = "(?:(?:\\\\[\\\\" + Assembler.escapedCharacterList + "])|(?:[\\x20-\\x5b\\x5d-\\x7e]))"
            }
                    
            if (words[Keyword.stringMarker]) {
                let options = Assembler.options(words[Keyword.stringMarker]);
                if (options) {
                    this.keywordRegexes[Keyword.string] = RegExp(options + "(" + this.generalCharacters + "*)" + options);
                }
            }
        }
        else {
            console.log("INSTRUCTION SET WARNING: This instruction set doesn't define any keywords.");
        }
        this.directives = instructionSet.directives;
        this.endianness = (endianness) ? endianness : instructionSet.endianness;
        this.instructionSet = instructionSet;
    }    
}