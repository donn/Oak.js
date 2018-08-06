/// <reference path="InstructionSet.ts"/>
/// <reference path="Utils.ts" />

class Assembler {
    instructionSet: InstructionSet;
    keywordRegexes: string[]; //Map<Keyword, string>;
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
        'r': 13
    }
    static escapedCharacterList = Object.keys(Assembler.escapedCharacters).join("")

    //Returns number on success, string on failure
    process(text: string, address: number, instructionLength: number, type: Parameter, bits: number, labels: number[]): any  {
        let array = text.split(""); //Character View
        var result = {
            errorMessage: null,
            value: null
        };
        switch(type) {
        case Parameter.register:                
            let index = this.instructionSet.abiNames.indexOf(text);
            if (index !== -1) {
                result.value = index;
                return result; 
            }
            
            var registerNo = null;
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
            var value: number = labels[text];
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
                value = value - (address + (this.incrementOnFetch? instructionLength: 0));
            }

            if (isNaN(value)) {     
                result.errorMessage = "Immediate '" + text + "' is not a recognized label, literal or character.";
                return result;
            } else if (!rangeCheck(value, bits)) {
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

        var options = ""

        for (var i = 0; i < list.length; i++) {
            var keyword = list[i];

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
    

    constructor(instructionSet: InstructionSet, endianness: Endianness, memoryMap: number[] = null) {
        this.incrementOnFetch = instructionSet.incrementOnFetch;
        this.keywordRegexes = [];
        this.memoryMap = memoryMap;

        if (instructionSet.keywordRegexes) {
            this.keywordRegexes = instructionSet.keywordRegexes;
        }
        else if (instructionSet.keywords) {
            let words = instructionSet.keywords;
            this.keywordRegexes = new Array<string>();
            
            if (words[Keyword.directive]) {
                let options = Assembler.options(instructionSet.keywords[Keyword.directive]);
                if (options) {
                    this.keywordRegexes[Keyword.directive] = options + "([^\\s]+)\\s*(.+)*";
                }
            }
                    
            if (words[Keyword.stringMarker]) {
                let options = Assembler.options(words[Keyword.stringMarker]);
                if (options) {
                    this.keywordRegexes[Keyword.string] = options + "(.*?)" + options;
                }
            }

            if (words[Keyword.comment]) {
                let options = Assembler.options(words[Keyword.comment]);
                if (options) {
                    this.keywordRegexes[Keyword.comment] = "(.*?)(" + options + ".*)";
                }
            }

            if (words[Keyword.label]) {
                let options = Assembler.options(words[Keyword.label]);
                if (options) {
                    this.keywordRegexes[Keyword.label] = "(([A-Za-z_][A-Za-z0-9_]*)" + options + ")?\\s*(.*)?";
                }
            }
            
            if (words[Keyword.register]) {
                let options = Assembler.options(words[Keyword.register]);
                if (options) {
                    this.keywordRegexes[Keyword.register] = options + "([0-9]+)";
                }
            }

            this.keywordRegexes[Keyword.numeric] = "(?:0([" + Assembler.radixList + "]))?([A-F0-9]+)";

            if (words[Keyword.charMarker]) {
                let options = Assembler.options(words[Keyword.charMarker]);
                if (options) {
                    var escapable = options.length > 1 ? "": "\\" + options
                    this.keywordRegexes[Keyword.char] = options + "((?:.)|(\\\\[\\\\" + Assembler.escapedCharacterList + escapable + "]))" + options;
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