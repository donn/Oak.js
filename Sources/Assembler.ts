/// <reference path="InstructionSet.ts"/>
/// <reference path="Utils.ts" />

class Line {
    finalAddress: number;
    label: string;
    raw: string;
    processed: string;
    possibleInstructions: Instruction[];
    machineCode: number[];
    sensitivityList: Line[];

    constructor(raw: string) {
        this.raw = raw;
    }

    static arrayFromFile(file: string): Line[] {
        return file.split('\n').map(line=> new Line(line));
    }

    initialProcess(assembler: Assembler, text: boolean = true) {
        var comment = assembler.keywordRegexes[Keyword.comment];
        var tmp = comment.exec(this.raw)[1];

        var label = assembler.keywordRegexes[Keyword.label];
        var pieces = label.exec(tmp);

        this.label = pieces[2];
        this.processed = pieces[3];
    }
}

class Assembler {
    instructionSet: InstructionSet;
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
    process(text: string, instructionLength: number, type: Parameter, bits: number, lines: Line[]): any {
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
                result.errorMessage = "Register " + text + " does not exist.";
                return result;
            }
            registerNo = parseInt(registerNo);
            if ((registerNo & (~0 << bits)) !== 0) {
                result.errorMessage = "Register " + text + " does not exist.";
                return result;
            }
            result.value = registerNo;
            return result;

        case Parameter.offset:
        case Parameter.immediate:
            //Label
            let reference = lines.filter(line=> line.label == text)[0];
            if (reference !== undefined) {
                result.context = reference;
                return result;
            }
            let value = 0;
            if (value === undefined && this.keywordRegexes[Keyword.char]) {
                let extraction = RegExp(this.keywordRegexes[Keyword.char]).exec(text);
                if (extraction !== null && extraction[1] !== undefined) {
                    value = extraction[1].charCodeAt(0);
                    if (value > 255) {
                        result.errorMessage = "Non-ascii character " + extraction[1] + " unsupported.";
                        return result;
                    }
                }
            }
            if (type != Parameter.offset && value === undefined && this.keywordRegexes[Keyword.numeric] !== undefined) {
                let array = RegExp(this.keywordRegexes[Keyword.numeric]).exec(text);
                let radix = Assembler.radixes[array[1]];
                let interpretable = array[2];

                value = parseInt(interpretable, radix);
            }

            if (type == Parameter.offset) {
                result.context = self;
                return result;
            }

            if (isNaN(value)) {     
                result.errorMessage = "Immediate '" + text + "' is not a recognized label, literal or character.";
                return result;
            } else if (!Utils.rangeCheck(value, bits)) {
                result.errorMessage = "The value of '" + value + "' is out of range.";
                return result;
            }
            
            result.value = value;
            return result;

        default:
            result.errorMessage = "Oak Error: Parameter type unsupported.";
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
                console.log("Instruction Set Error: Escape character \\ cannot be used as a keyword.")
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

    assemble(lines: Line[]): boolean {
        var data = [];
        var text = [];

        
        return false;
    }



    constructor(instructionSet: InstructionSet, endianness: Endianness, memoryMap: number[] = null) {
        this.incrementOnFetch = instructionSet.incrementOnFetch;
        this.keywordRegexes = [];
        this.memoryMap = memoryMap;

        if (instructionSet.keywordRegexes) {
            this.keywordRegexes = instructionSet.keywordRegexes;
        }
        else if (instructionSet.keywords) {
            let words = instructionSet.keywords;
            this.keywordRegexes = [];
            
            if (words[Keyword.directive]) {
                let options = Assembler.options(instructionSet.keywords[Keyword.directive]);
                if (options) {
                    this.keywordRegexes[Keyword.directive] = RegExp(options + "([^\\s]+)\\s*(.+)*");
                }
            }
                    
            if (words[Keyword.stringMarker]) {
                let options = Assembler.options(words[Keyword.stringMarker]);
                if (options) {
                    this.keywordRegexes[Keyword.string] = RegExp(options + "(.*?)" + options);
                }
            }

            if (words[Keyword.comment]) {
                let options = Assembler.options(words[Keyword.comment]);
                if (options) {
                    this.keywordRegexes[Keyword.comment] = RegExp("(.*?)(" + options + ".*)");
                }
            }

            if (words[Keyword.label]) {
                let options = Assembler.options(words[Keyword.label]);
                if (options) {
                    this.keywordRegexes[Keyword.label] = RegExp("(([A-Za-z_][A-Za-z0-9_]*)" + options + ")?\\s*(.*)?");
                }
            }
            
            if (words[Keyword.register]) {
                let options = Assembler.options(words[Keyword.register]);
                if (options) {
                    this.keywordRegexes[Keyword.register] = RegExp(options + "([0-9]+)");
                }
            }

            this.keywordRegexes[Keyword.numeric] = RegExp("(?:0([" + Assembler.radixList + "]))?([A-F0-9]+)");

            if (words[Keyword.charMarker]) {
                let options = Assembler.options(words[Keyword.charMarker]);
                if (options) {
                    let escapable = options.length > 1 ? "": "\\" + options
                    this.keywordRegexes[Keyword.char] = RegExp(options + "((?:.)|(\\\\[\\\\" + Assembler.escapedCharacterList + escapable + "]))" + options);
                }

            }
        }
        else {
            console.log("Instruction Set Warning: This instruction set doesn't define any keywords.\nTo suppress this warning, pass an empty [:] to \"keywords\"");
        }
        this.directives = instructionSet.directives;
        this.endianness = (endianness) ? endianness : instructionSet.endianness;
        this.instructionSet = instructionSet;
    }    
}