/// <reference path="InstructionSet.ts"/>

enum Keyword {
    directive = 0,
    comment,
    label,
    stringMarker,
    charMarker,
    register,
    blockCommentBegin,
    blockCommentEnd,

    //Only send as keywordRegexes,
    string,
    char,
    data
}

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
}

class Assembler {
    instructionSet: InstructionSet;
    keywordRegexes: string[]; //Map<Keyword, string>;
    directives: Directive[]; //Map<string, Directive>;
    endianness: Endianness;
    incrementOnFetch: boolean;

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

    constructor(instructionSet: InstructionSet, endianness: Endianness) {
        this.incrementOnFetch = instructionSet.incrementOnFetch;
        this.keywordRegexes = [];

        if (instructionSet.keywordRegexes) {
            this.keywordRegexes = instructionSet.keywordRegexes;
        }
        else if (instructionSet.keywords) {
            let words = instructionSet.keywords;
            this.keywordRegexes = new Array<string>();
            
            if (words[Keyword.directive]) {
                let options = Assembler.options(instructionSet.keywords[Keyword.directive]);
                if (options) {
                    this.keywordRegexes[Keyword.directive] = "\(options)([^\\s]+)\\s*(.+)*";
                }
            }
                    
            if (words[Keyword.stringMarker]) {
                let options = Assembler.options(words[Keyword.stringMarker]);
                if (options) {
                    this.keywordRegexes[Keyword.string] = "\(options)(.*?)\(options)";
                }
            }

            if (words[Keyword.comment]) {
                let options = Assembler.options(words[Keyword.comment]);
                if (options) {
                    this.keywordRegexes[Keyword.comment] = "(.*?)(\(options).*)";
                }
            }

            if (words[Keyword.label]) {
                let options = Assembler.options(words[Keyword.label]);
                if (options) {
                    this.keywordRegexes[Keyword.label] = "(([A-Za-z_][A-Za-z0-9_]*)\(options))?\\s*(.*)?";
                }
            }
            
            if (words[Keyword.register]) {
                let options = Assembler.options(words[Keyword.register]);
                if (options) {
                    this.keywordRegexes[Keyword.register] = "\(options)([0-9]+)";
                }
            }

            this.keywordRegexes[Keyword.data] = "((?:0[bodx])?[A-F0-9]+)|([_A-Za-z][_A-Za-z0-9]+)"
            if (words[Keyword.charMarker]) {
                let options = Assembler.options(words[Keyword.charMarker]);
                if (options) {
                    this.keywordRegexes[Keyword.data] = "(\(options)..?\(options))|((?:0[bodx])?[A-F0-9]+)|([_A-Za-z][_A-Za-z0-9]+)";
                    this.keywordRegexes[Keyword.char] = "\(options)(..?)\(options)";
                }

            }

            if (words[Keyword.blockCommentBegin]) {
                let options0 = Assembler.options(words[Keyword.blockCommentBegin]) 
                if (options0) {
                    if (words[Keyword.blockCommentEnd]) {
                        let options1 = Assembler.options(words[Keyword.blockCommentEnd]);
                        if (options1) {
                            console.log("Oak Warning: Oak does not support block comments just yet, so please do not use them in your code.");
                        }
                    }
                }
            }
        }
        else {
            console.log("Instruction Set Warning: This instruction set doesn't define any keywords.\nTo suppress this warning, pass an empty [:] to \"keywords\".");
        }
        this.directives = instructionSet.directives;
        this.endianness = (endianness) ? endianness : instructionSet.endianness;
        this.instructionSet = instructionSet;
    }    
}