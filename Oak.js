/// <reference path="InstructionSet.ts"/>
/// <reference path="Memory.ts"/>
/// <reference path="Core.ts"/>
var Parameter;
(function (Parameter) {
    Parameter[Parameter["immediate"] = 0] = "immediate";
    Parameter[Parameter["register"] = 1] = "register";
    Parameter[Parameter["condition"] = 2] = "condition";
    Parameter[Parameter["offset"] = 3] = "offset";
    Parameter[Parameter["special"] = 4] = "special";
    Parameter[Parameter["optional"] = 5] = "optional"; //Also Not in RISC-V,
})(Parameter || (Parameter = {}));
;
var BitRange = (function () {
    function BitRange(field, start, bits, instructionDefined, limitlessBits) {
        if (instructionDefined === void 0) { instructionDefined = true; }
        if (limitlessBits === void 0) { limitlessBits = null; }
        this.field = field;
        this.start = start;
        this.bits = bits;
        this.instructionDefined = instructionDefined;
        this.limitlessBits = limitlessBits;
    }
    return BitRange;
}());
;
var Format = (function () {
    function Format(ranges, parameters, parameterTypes, regex, disassembly, processSpecialParameter, decodeSpecialParameter) {
        if (processSpecialParameter === void 0) { processSpecialParameter = null; }
        if (decodeSpecialParameter === void 0) { decodeSpecialParameter = null; }
        this.parameters = parameters;
        this.ranges = ranges;
        this.parameterTypes = parameterTypes;
        this.regex = regex;
        this.disassembly = disassembly;
        this.processSpecialParameter = processSpecialParameter;
        this.decodeSpecialParameter = decodeSpecialParameter;
    }
    Format.prototype.disassemble = function (mnemonic, args, abiNames) {
        var output = this.disassembly;
        output = output.replace("@mnem", mnemonic);
        for (var i = 0; i < this.parameters.length; i++) {
            if ((args[i] == null) || (output.search("@arg") === -1)) {
                console.log("Disassembler note: Argument mismatch.");
                break;
            }
            output = output.replace("@arg", (this.parameterTypes[i] === Parameter.register) ? abiNames[args[i]] : args[i].toString());
        }
        return output;
    };
    Format.prototype.parameterBitRangeIndex = function (parameter) {
        for (var i = 0; i < this.ranges.length; i++) {
            if (this.ranges[i].field === parameter) {
                return i;
            }
            var limits = /([A-za-z]+)\s*\[\s*(\d+)\s*:\s*(\d+)\s*\]/.exec(this.ranges[i].field);
            if (limits !== null) {
                if (limits[1] === parameter) {
                    return i;
                }
            }
        }
        return null;
    };
    Format.prototype.fieldParameterIndex = function (range) {
        for (var i = 0; i < this.parameters.length; i++) {
            if (this.parameters[i] == range) {
                return i;
            }
        }
        return null;
    };
    return Format;
}());
;
var Instruction = (function () {
    function Instruction(mnemonic, format, constants, constValues, executor, signed, available) {
        if (signed === void 0) { signed = true; }
        if (available === void 0) { available = true; }
        this.mnemonic = mnemonic;
        this.format = format;
        this.constants = constants;
        this.constValues = constValues;
        this.available = available;
        this.signed = signed;
        this.executor = executor;
    }
    Instruction.prototype.pad = function (str, length) {
        var padded = str;
        for (var i = 0; i < length - str.length; i++) {
            padded = "0" + padded;
        }
        return padded;
    };
    Instruction.prototype.mask = function () {
        var str = "";
        for (var i = 0; i < this.format.ranges.length; i++) {
            var index = this.constants.indexOf(this.format.ranges[i].field);
            if (index !== -1) {
                str += this.pad(this.constValues[index].toString(2), this.format.ranges[i].bits);
            }
            else {
                for (var j = 0; j < this.format.ranges[i].bits; j++) {
                    str += "X";
                }
            }
        }
        return str;
    };
    ;
    Instruction.prototype.match = function (machineCode) {
        var machineCodeMutable = machineCode >>> 0;
        var maskBits = this.mask().split("");
        for (var i = 31; i >= 0; i--) {
            if (maskBits[i] === "X") {
                machineCodeMutable = machineCodeMutable >>> 1;
                continue;
            }
            if (parseInt(maskBits[i]) !== (machineCodeMutable & 1)) {
                return false;
            }
            machineCodeMutable = machineCodeMutable >>> 1;
        }
        //console.log("Match Log: Matched 0b" + (machineCode >>> 0).toString(2) + " with " + this.mnemonic + ".");
        return true;
    };
    Instruction.prototype.template = function () {
        return parseInt(this.mask().split("X").join("0"), 2);
    };
    ;
    return Instruction;
}());
;
var PseudoInstruction //We don't have to use this here but I should probably backport it to Swift.
 = (function () {
    function PseudoInstruction //We don't have to use this here but I should probably backport it to Swift.
        (mnemonic, parameters, expansion) {
        this.mnemonic = mnemonic;
        this.parameters = parameters;
        this.expansion = expansion;
    }
    /*
    Example:
    mnemonic: li
    parameters: ['__oakasm__rd', '__oakasm__imm']
    expansion: ['add __oakasm__rd, __oakasm__rd, __oakasm__imm']
    */
    PseudoInstruction //We don't have to use this here but I should probably backport it to Swift.
    .prototype.expand = function (line) {
        return null;
    };
    return PseudoInstruction //We don't have to use this here but I should probably backport it to Swift.
    ;
}());
;
var InstructionSet = (function () {
    /*
        InstructionSet initializer
    */
    function InstructionSet(bits, formats, instructions, pseudoInstructions, dataDirectives, dataDirectiveSizes, abiNames, process, tokenize, assemble, disassemble) {
        this.bits = bits;
        this.formats = formats;
        this.instructions = instructions;
        this.pseudoInstructions = pseudoInstructions;
        this.dataDirectives = dataDirectives;
        this.dataDirectiveSizes = dataDirectiveSizes;
        this.abiNames = abiNames;
        this.processParameter = process;
        this.tokenize = tokenize;
        this.assemble = assemble;
        this.disassemble = disassemble;
    }
    //Return Mnemonic Index (pseudo)
    InstructionSet.prototype.pseudoMnemonicSearch = function (mnemonic) {
        for (var i = 0; i < this.pseudoInstructions.length; i++) {
            if (this.pseudoInstructions[i].mnemonic == mnemonic) {
                return i;
            }
        }
        return -1;
    }; //Worst case = instructions.length
    //Return Mnemonic Index (True)
    InstructionSet.prototype.mnemonicSearch = function (mnemonic) {
        for (var i = 0; i < this.instructions.length; i++) {
            if (this.instructions[i].mnemonic == mnemonic) {
                return i;
            }
        }
        return -1;
    }; //Worst case = instructions.length
    return InstructionSet;
}());
;
/// <reference path="InstructionSet.ts"/>
//The RISC-V Instruction Set Architecture, Version 2.1
function Oak_gen_RISCV() {
    //Formats and Instructions
    var formats = [];
    var instructions = [];
    var pseudoInstructions = [];
    //R-Type
    formats.push(new Format([
        new BitRange("funct7", 25, 7),
        new BitRange("rs2", 20, 5, false),
        new BitRange("rs1", 15, 5, false),
        new BitRange("funct3", 12, 3),
        new BitRange("rd", 7, 5, false),
        new BitRange("opcode", 0, 7)
    ], ["rd", "rs1", "rs2"], [Parameter.register, Parameter.register, Parameter.register], /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+)/, "@mnem @arg, @arg, @arg"));
    var rType = formats[formats.length - 1];
    instructions.push(new Instruction("ADD", rType, ["opcode", "funct3", "funct7"], [parseInt("0110011", 2), parseInt("000", 2), parseInt("0000000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) + core.registerFile.read(core.arguments[2]));
        return null;
    }));
    instructions.push(new Instruction("SUB", rType, ["opcode", "funct3", "funct7"], [parseInt("0110011", 2), parseInt("000", 2), parseInt("0100000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) - core.registerFile.read(core.arguments[2]));
        return null;
    }));
    instructions.push(new Instruction("SLL", rType, ["opcode", "funct3", "funct7"], [parseInt("0110011", 2), parseInt("001", 2), parseInt("0000000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) << core.registerFile.read(core.arguments[2]));
        return null;
    }));
    instructions.push(new Instruction("SLT", rType, ["opcode", "funct3", "funct7"], [parseInt("0110011", 2), parseInt("010", 2), parseInt("0000000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], (core.registerFile.read(core.arguments[1]) < core.registerFile.read(core.arguments[2])) ? 1 : 0);
        return null;
    }));
    instructions.push(new Instruction("SLTU", rType, ["opcode", "funct3", "funct7"], [parseInt("0110011", 2), parseInt("011", 2), parseInt("0000000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], (core.registerFile.read(core.arguments[1]) < core.registerFile.read(core.arguments[2])) ? 1 : 0);
        return null;
    }, false));
    instructions.push(new Instruction("XOR", rType, ["opcode", "funct3", "funct7"], [parseInt("0110011", 2), parseInt("100", 2), parseInt("0000000", 2)], function (core) {
        //
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) ^ core.registerFile.read(core.arguments[2]));
        return null;
    }));
    instructions.push(new Instruction("SRL", rType, ["opcode", "funct3", "funct7"], [parseInt("0110011", 2), parseInt("101", 2), parseInt("0000000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) >>> core.registerFile.read(core.arguments[2]));
        return null;
    }));
    instructions.push(new Instruction("SRA", rType, ["opcode", "funct3", "funct7"], [parseInt("0110011", 2), parseInt("101", 2), parseInt("0100000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) >> core.registerFile.read(core.arguments[2]));
        return null;
    }));
    instructions.push(new Instruction("OR", rType, ["opcode", "funct3", "funct7"], [parseInt("0110011", 2), parseInt("110", 2), parseInt("0000000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) | core.registerFile.read(core.arguments[2]));
        return null;
    }));
    instructions.push(new Instruction("AND", rType, ["opcode", "funct3", "funct7"], [parseInt("0110011", 2), parseInt("111", 2), parseInt("0000000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) & core.registerFile.read(core.arguments[2]));
        return null;
    }));
    //I-Type
    formats.push(new Format([
        new BitRange("imm", 20, 12, false),
        new BitRange("rs1", 15, 5, false),
        new BitRange("funct3", 12, 3),
        new BitRange("rd", 7, 5, false),
        new BitRange("opcode", 0, 7)
    ], ["rd", "rs1", "imm"], [Parameter.register, Parameter.register, Parameter.immediate], /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+),\s*(-?[a-zA-Z0-9_]+)/, "@mnem @arg, @arg, @arg"));
    var iType = formats[formats.length - 1];
    instructions.push(new Instruction("JALR", iType, ["opcode", "funct3"], [parseInt("1100111", 2), parseInt("000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.pc);
        core.pc = (core.registerFile.read(core.arguments[1]) + signExt(core.arguments[2], 12));
        return null;
    }));
    instructions.push(new Instruction("ADDI", iType, ["opcode", "funct3"], [parseInt("0010011", 2), parseInt("000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) + core.arguments[2]);
        return null;
    }));
    instructions.push(new Instruction("SLTI", iType, ["opcode", "funct3"], [parseInt("0010011", 2), parseInt("010", 2)], function (core) {
        core.registerFile.write(core.arguments[0], (core.registerFile.read(core.arguments[1]) < core.arguments[2]) ? 1 : 0);
        return null;
    }));
    instructions.push(new Instruction("SLTIU", iType, ["opcode", "funct3"], [parseInt("0010011", 2), parseInt("011", 2)], function (core) {
        core.registerFile.write(core.arguments[0], ((core.registerFile.read(core.arguments[1]) >>> 0) < (core.arguments[2] >>> 0) ? 1 : 0));
        return null;
    }, false));
    instructions.push(new Instruction("XORI", iType, ["opcode", "funct3"], [parseInt("0010011", 2), parseInt("100", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) ^ core.arguments[2]);
        return null;
    }));
    instructions.push(new Instruction("ORI", iType, ["opcode", "funct3"], [parseInt("0010011", 2), parseInt("110", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) | core.arguments[2]);
        return null;
    }));
    instructions.push(new Instruction("ANDI", iType, ["opcode", "funct3"], [parseInt("0010011", 2), parseInt("111", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) & core.arguments[2]);
        return null;
    }));
    //IL Subtype
    formats.push(new Format([
        new BitRange("imm", 20, 12, false),
        new BitRange("rs1", 15, 5, false),
        new BitRange("funct3", 12, 3),
        new BitRange("rd", 7, 5, false),
        new BitRange("opcode", 0, 7)
    ], ["rd", "imm", "rs1"], [Parameter.register, Parameter.immediate, Parameter.register], /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*(-?0?[boxd]?[0-9A-F]+)\s*\(\s*([A-Za-z0-9]+)\s*\)/, "@mnem @arg, @arg(@arg)"));
    var ilSubtype = formats[formats.length - 1];
    instructions.push(new Instruction("LB", ilSubtype, ["opcode", "funct3"], [parseInt("0000011", 2), parseInt("000", 2)], function (core) {
        var bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 1);
        if (bytes === null) {
            return "Illegal memory access.";
        }
        core.registerFile.write(core.arguments[0], signExt(bytes[0], 8));
        return null;
    }));
    instructions.push(new Instruction("LH", ilSubtype, ["opcode", "funct3"], [parseInt("0000011", 2), parseInt("001", 2)], function (core) {
        var bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 2);
        if (bytes === null) {
            return "Illegal memory access.";
        }
        core.registerFile.write(core.arguments[0], signExt(catBytes(bytes), 16));
        return null;
    }));
    instructions.push(new Instruction("LW", ilSubtype, ["opcode", "funct3"], [parseInt("0000011", 2), parseInt("010", 2)], function (core) {
        var bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 2);
        if (bytes === null) {
            return "Illegal memory access.";
        }
        core.registerFile.write(core.arguments[0], catBytes(bytes));
        return null;
    }));
    instructions.push(new Instruction("LBU", ilSubtype, ["opcode", "funct3"], [parseInt("0000011", 2), parseInt("000", 2)], function (core) {
        var bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 1);
        if (bytes === null) {
            return "Illegal memory access.";
        }
        core.registerFile.write(core.arguments[0], bytes[0]);
        return null;
    }));
    instructions.push(new Instruction("LHU", ilSubtype, ["opcode", "funct3"], [parseInt("0000011", 2), parseInt("001", 2)], function (core) {
        var bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 2);
        if (bytes === null) {
            return "Illegal memory access.";
        }
        core.registerFile.write(core.arguments[0], catBytes(bytes));
        return null;
    }));
    // IS Subtype
    formats.push(new Format([
        new BitRange("funct7", 25, 7),
        new BitRange("shamt", 20, 5, false),
        new BitRange("rs1", 15, 5, false),
        new BitRange("funct3", 12, 3),
        new BitRange("rd", 7, 5, false),
        new BitRange("opcode", 0, 7)
    ], ["rd", "rs1", "shamt"], [Parameter.register, Parameter.register, Parameter.immediate], /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+),\s*(-?0?[boxd]?[0-9A-F]+)/, "@mnem @arg, @arg, @arg"));
    var isSubtype = formats[formats.length - 1];
    instructions.push(new Instruction("SLLI", isSubtype, ["opcode", "funct3", "funct7"], [parseInt("0010011", 2), parseInt("001", 2), parseInt("0000000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) << core.arguments[2]);
        return null;
    }, false));
    instructions.push(new Instruction("SRLI", isSubtype, ["opcode", "funct3", "funct7"], [parseInt("0010011", 2), parseInt("101", 2), parseInt("0000000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) >>> core.arguments[2]);
        return null;
    }, false));
    instructions.push(new Instruction("SRAI", isSubtype, ["opcode", "funct3", "funct7"], [parseInt("0010011", 2), parseInt("101", 2), parseInt("0100000", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) >> core.arguments[2]);
        return null;
    }, false));
    //S-Type
    formats.push(new Format([
        new BitRange("imm[11:5]", 25, 7, false, 12),
        new BitRange("rs2", 20, 5, false),
        new BitRange("rs1", 15, 5, false),
        new BitRange("funct3", 12, 3),
        new BitRange("imm[4:0]", 7, 5, false, 12),
        new BitRange("opcode", 0, 7)
    ], ["rs1", "imm", "rs2"], [Parameter.register, Parameter.immediate, Parameter.register], /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*(-?0?[boxd]?[0-9A-F]+)\(\s*([A-Za-z0-9]+)\s*\)/, "@mnem @arg, @arg(@arg)"));
    var sType = formats[formats.length - 1];
    instructions.push(new Instruction("SB", sType, ["opcode", "funct3"], [parseInt("0100011", 2), parseInt("000", 2)], function (core) {
        var bytes = [];
        bytes.push(core.registerFile.read(core.arguments[0]) & 255);
        if (core.memset(core.registerFile.read(core.arguments[2]) + core.arguments[1], bytes)) {
            return null;
        }
        return "Illegal memory access.";
    }));
    instructions.push(new Instruction("SH", sType, ["opcode", "funct3"], [parseInt("0100011", 2), parseInt("001", 2)], function (core) {
        var bytes = [];
        var value = core.registerFile.read(core.arguments[0]);
        bytes.push(value & 255);
        value = value >>> 8;
        bytes.push(value & 255);
        if (core.memset(core.registerFile.read(core.arguments[2]) + core.arguments[1], bytes)) {
            return null;
        }
        return "Illegal memory access.";
    }));
    instructions.push(new Instruction("SW", sType, ["opcode", "funct3"], [parseInt("0100011", 2), parseInt("010", 2)], function (core) {
        var bytes = [];
        var value = core.registerFile.read(core.arguments[0]);
        bytes.push(value & 255);
        value = value >>> 8;
        bytes.push(value & 255);
        value = value >>> 8;
        bytes.push(value & 255);
        value = value >>> 8;
        bytes.push(value & 255);
        if (core.memset(core.registerFile.read(core.arguments[2]) + core.arguments[1], bytes)) {
            return null;
        }
        return "Illegal memory access.";
    }));
    //U-Type
    formats.push(new Format([
        new BitRange("imm", 12, 20, false),
        new BitRange("rd", 7, 5, false),
        new BitRange("opcode", 0, 7)
    ], ["rd", "imm"], [Parameter.register, Parameter.offset], /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([a-zA-Z0-9_]+)/, "@mnem @arg, @arg"));
    var uType = formats[formats.length - 1];
    instructions.push(new Instruction("LUI", uType, ["opcode"], [parseInt("0110111", 2)], function (core) {
        core.registerFile.write(core.arguments[0], (core.arguments[1] << 12));
        return null;
    }));
    instructions.push(new Instruction("AUIPC", uType, ["opcode"], [parseInt("0010111", 2)], function (core) {
        core.registerFile.write(core.arguments[0], (core.arguments[1] << 12) + core.pc - 4);
        return null;
    }));
    //SB-Type
    formats.push(new Format([
        new BitRange("imm[11:5]", 25, 7, false, 13),
        new BitRange("rs2", 20, 5, false),
        new BitRange("rs1", 15, 5, false),
        new BitRange("funct3", 12, 3),
        new BitRange("imm[4:0]", 7, 5, false, 13),
        new BitRange("opcode", 0, 7)
    ], ["rs1", "rs2", "imm"], [Parameter.register, Parameter.register, Parameter.special], /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+)\s*,\s*([a-zA-Z0-9_]+)/, "@mnem @arg, @arg, @arg", function (address, text, bits, labels, addresses) {
        var array = text.split(""); //Character View
        var result = {
            errorMessage: null,
            value: null
        };
        var int = NaN;
        var labelLocation = labels.indexOf(text);
        if (labelLocation !== -1) {
            int = addresses[labelLocation] - address + 4;
        }
        else {
            var radix = 10 >>> 0;
            var splice = false;
            if (array[0] === "0") {
                if (array[1] == "b") {
                    radix = 2;
                    splice = true;
                }
                if (array[1] == "o") {
                    radix = 8;
                    splice = true;
                }
                if (array[1] == "d") {
                    radix = 10;
                    splice = true;
                }
                if (array[1] == "x") {
                    radix = 16;
                    splice = true;
                }
            }
            var interpretable = text;
            if (splice) {
                interpretable = array.splice(2, array.length - 2).join("");
            }
            int = parseInt(interpretable, radix);
        }
        if (isNaN(int)) {
            result.errorMessage = "Offset '" + text + "' is not a recognized label or literal.";
            return result;
        }
        if (rangeCheck(int, 13)) {
            var mangle = int & 2046; //mangle[10:1] = int[10:1];
            mangle = mangle | ((int >>> 11) & 1); //mangle[0] = int[11]
            mangle = mangle | ((int >>> 12) & 1) << 11; //mangle[11] = int[12];
            result.value = mangle;
            return result;
        }
        result.errorMessage = "The value of '" + text + "' is out of range.";
        return result;
    }, function (value) {
        var unmangle = (value & 1) << 11; //unmangle[11]; = value[0];
        unmangle = unmangle | ((value >>> 11) << 12); //unmangle[12] = value[12];
        unmangle = unmangle | (value & 2046); //unmangle[10:1] = value[10:1];
        return unmangle;
    }));
    var sbType = formats[formats.length - 1];
    // var test = 24;
    // console.log(test.toString(2));
    // var mangled = sbType.processSpecialParameter(0, test.toString(), 0, [], []);
    // console.log(mangled.errorMessage);
    // console.log(mangled.value.toString(2));
    // console.log(sbType.decodeSpecialParameter(mangled.value).toString(2));
    instructions.push(new Instruction("BEQ", sbType, ["opcode", "funct3"], [parseInt("1100011", 2), parseInt("000", 2)], function (core) {
        if (core.registerFile.read(core.arguments[0]) === core.registerFile.read(core.arguments[1])) {
            core.pc += core.arguments[2];
            core.pc -= 4;
        }
        return null;
    }));
    instructions.push(new Instruction("BNE", sbType, ["opcode", "funct3"], [parseInt("1100011", 2), parseInt("001", 2)], function (core) {
        if (core.registerFile.read(core.arguments[0]) !== core.registerFile.read(core.arguments[1])) {
            core.pc += core.arguments[2];
            core.pc -= 4;
        }
        return null;
    }));
    instructions.push(new Instruction("BLT", sbType, ["opcode", "funct3"], [parseInt("1100011", 2), parseInt("100", 2)], function (core) {
        if (core.registerFile.read(core.arguments[0]) < core.registerFile.read(core.arguments[1])) {
            core.pc += core.arguments[2];
            core.pc -= 4;
        }
        return null;
    }));
    instructions.push(new Instruction("BGE", sbType, ["opcode", "funct3"], [parseInt("1100011", 2), parseInt("101", 2)], function (core) {
        if (core.registerFile.read(core.arguments[0]) >= core.registerFile.read(core.arguments[1])) {
            core.pc += core.arguments[2];
            core.pc -= 4;
        }
        return null;
    }));
    instructions.push(new Instruction("BLTU", sbType, ["opcode", "funct3"], [parseInt("1100011", 2), parseInt("110", 2)], function (core) {
        if ((core.registerFile.read(core.arguments[0]) >>> 0) < (core.registerFile.read(core.arguments[1]) >>> 0)) {
            core.pc += core.arguments[2];
            core.pc -= 4;
        }
        return null;
    }));
    instructions.push(new Instruction("BGEU", sbType, ["opcode", "funct3"], [parseInt("1100011", 2), parseInt("111", 2)], function (core) {
        if ((core.registerFile.read(core.arguments[0]) >>> 0) >= (core.registerFile.read(core.arguments[1]) >>> 0)) {
            core.pc += core.arguments[2];
            core.pc -= 4;
        }
        return null;
    }));
    //UJ-Type
    formats.push(new Format([
        new BitRange("imm", 12, 20, false, 21),
        new BitRange("rd", 7, 5, false),
        new BitRange("opcode", 0, 7)
    ], ["rd", "imm"], [Parameter.register, Parameter.special], /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([a-zA-Z0-9_]+)/, "@mnem @arg, @arg", function (address, text, bits, labels, addresses) {
        var array = text.split(""); //Character View
        var result = {
            errorMessage: null,
            value: null
        };
        var int = NaN;
        var labelLocation = labels.indexOf(text);
        if (labelLocation !== -1) {
            int = addresses[labelLocation] - address + 4;
        }
        else {
            var radix = 10 >>> 0;
            var splice = false;
            if (array[0] === "0") {
                if (array[1] == "b") {
                    radix = 2;
                    splice = true;
                }
                if (array[1] == "o") {
                    radix = 8;
                    splice = true;
                }
                if (array[1] == "d") {
                    radix = 10;
                    splice = true;
                }
                if (array[1] == "x") {
                    radix = 16;
                    splice = true;
                }
            }
            var interpretable = text;
            if (splice) {
                interpretable = array.splice(2, array.length - 2).join("");
            }
            int = parseInt(interpretable, radix);
        }
        if (isNaN(int)) {
            result.errorMessage = "Offset '" + text + "' is not a recognized label or literal.";
            return result;
        }
        if (rangeCheck(int, 21)) {
            var mangle = ((int >> 12) & 255); //mangle[7:0] = int[19:12] 
            mangle = mangle | (((int >> 11) & 1) << 8); //mangle[8] = int[11];
            mangle = mangle | (((int >> 1) & 1023) << 9); //mangle[18:9] = int[10:1];
            mangle = mangle | (((int >> 20) & 1) << 19); //mangle[19] = int[20];
            result.value = mangle;
            return result;
        }
        result.errorMessage = "The value of '" + text + "' (" + int.toString() + ")is out of range.";
        return result;
    }, function (value) {
        var unmangle = ((value >> 8) & 1) << 11; //unmangle[11]; = value[8];
        unmangle = unmangle | (((value >>> 19) & 1) << 20); //unmangle[20] = value[19];
        unmangle = unmangle | (((value >>> 0) & 255) << 12); //unmangle[19:12] = value[7:0];
        unmangle = unmangle | (((value >>> 9) & 1023) << 1); //unmangle[10:1] = value[18:9];
        return unmangle;
    }));
    var ujType = formats[formats.length - 1];
    // let test = parseInt("4", 16);
    // console.log("before", test.toString(2));
    // let op = ujType.processSpecialParameter(0, test.toString(), 0, [], []);
    // console.log(op.value.toString(2));
    // console.log("after", ujType.decodeSpecialParameter(op.value).toString(2));
    instructions.push(new Instruction("JAL", ujType, ["opcode"], [parseInt("1101111", 2)], function (core) {
        core.registerFile.write(core.arguments[0], core.pc);
        //console.log(core.pc);
        core.pc += core.arguments[1];
        core.pc -= 4;
        //console.log(core.arguments[1]);
        return null;
    }));
    //System Type
    //All-Const Type
    formats.push(new Format([
        new BitRange("const", 0, 32)
    ], [], [], /[a-zA-Z]+/, "@mnem"));
    var allConstSubtype = formats[formats.length - 1];
    instructions.push(new Instruction("SCALL", allConstSubtype, ["const"], [parseInt("00000000000000000000000001110011", 2)], function (core) {
        core.syscall();
        return null;
    }));
    //PseudoInstructions
    //This is a far from ideal implementation of pseudoinstructions and is only there for demo purposes.
    //MV
    formats.push(new Format([
        new BitRange("funct7", 25, 7),
        new BitRange("rs2", 20, 5, false),
        new BitRange("rs1", 15, 5),
        new BitRange("funct3", 12, 3),
        new BitRange("rd", 7, 5, false),
        new BitRange("opcode", 0, 7)
    ], ["rd", "rs2"], [Parameter.register, Parameter.register], /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+)/, "@mnem @arg, @arg"));
    var mvPseudo = formats[formats.length - 1];
    instructions.push(new Instruction("MV", mvPseudo, ["opcode", "funct3", "rs1", "funct7"], [parseInt("0110011", 2), parseInt("000", 2), parseInt("00000"), parseInt("0000000", 2)], function (core) {
        return null; //Captured by and
    }));
    //LI
    formats.push(new Format([
        new BitRange("imm", 20, 12, false),
        new BitRange("rs1", 15, 5),
        new BitRange("funct3", 12, 3),
        new BitRange("rd", 7, 5, false),
        new BitRange("opcode", 0, 7)
    ], ["rd", "imm"], [Parameter.register, Parameter.immediate], /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*(-?[a-zA-Z0-9_]+)/, "@mnem @arg, @arg"));
    var liPseudo = formats[formats.length - 1];
    instructions.push(new Instruction("LI", liPseudo, ["opcode", "funct3", "rs1"], [parseInt("0010011", 2), parseInt("000", 2), parseInt("00000", 2)], function (core) {
        return null; //Captured by andi
    }));
    instructions.push(new Instruction("LA", liPseudo, ["opcode", "funct3", "rs1"], [parseInt("0010011", 2), parseInt("000", 2), parseInt("00000", 2)], function (core) {
        return null; //Captured by andi
    }));
    //JR pseudo
    formats.push(new Format([
        new BitRange("imm", 20, 12),
        new BitRange("rs1", 15, 5, false),
        new BitRange("funct3", 12, 3),
        new BitRange("rd", 7, 5),
        new BitRange("opcode", 0, 7)
    ], ["rs1"], [Parameter.register], /[a-zA-Z]+\s*([A-Za-z0-9]+)/, "@mnem @arg"));
    var jrPseudo = formats[formats.length - 1];
    instructions.push(new Instruction("JR", jrPseudo, ["opcode", "rd", "funct3", "imm"], [parseInt("1100111", 2), parseInt("00000", 2), parseInt("000", 2), parseInt("000000000000", 2)], function (core) {
        return null; //captured by jalr
    }));
    /*
        ARGUMENT PROCESSOR
        Does what it says on the tin. It needs quite a bit of information, but otherwise successfully interprets
        any RISC-V argument.
    */
    var process = function (address, text, type, bits, labels, addresses) {
        var array = text.split(""); //Character View
        var result = {
            errorMessage: null,
            value: null
        };
        switch (type) {
            case Parameter.register:
                var registerNo = parseInt(text);
                if (isNaN(registerNo)) {
                    var index = this.abiNames.indexOf(text);
                    if (index !== -1) {
                        result.value = index;
                        return result;
                    }
                }
                if (array[0] !== "x") {
                    result.errorMessage = "Register " + text + " does not exist.";
                    return result;
                }
                registerNo = parseInt(array.splice(1, array.length - 1).join(""));
                if (0 <= registerNo && registerNo <= 31) {
                    result.value = registerNo;
                    return result;
                }
                else {
                    result.errorMessage = "Register " + text + " does not exist.";
                    return result;
                }
            case Parameter.immediate:
                //Label
                var int = NaN;
                var labelIndex = labels.indexOf(text);
                if (labelIndex !== -1) {
                    int = addresses[labelIndex];
                }
                else if (array.length === 3 && (array[0] == "\'") && (array[2] == "\'")) {
                    int = array[1].charCodeAt(0);
                }
                else {
                    var radix = 10 >>> 0;
                    var splice = false;
                    if (array[0] === "0") {
                        if (array[1] == "b") {
                            radix = 2;
                            splice = true;
                        }
                        if (array[1] == "o") {
                            radix = 8;
                            splice = true;
                        }
                        if (array[1] == "d") {
                            radix = 10;
                            splice = true;
                        }
                        if (array[1] == "x") {
                            radix = 16;
                            splice = true;
                        }
                    }
                    var interpretable = text;
                    if (splice) {
                        interpretable = array.splice(2, array.length - 2).join("");
                    }
                    int = parseInt(interpretable, radix) >>> 0;
                }
                if (isNaN(int)) {
                    result.errorMessage = "Immediate '" + text + "' is not a recognized label, literal or character.";
                    return result;
                }
                if (rangeCheck(int, bits)) {
                    result.value = int;
                    return result;
                }
                result.errorMessage = "The value of '" + text + "' is out of range.";
                return result;
            case Parameter.offset:
                var int = NaN;
                var labelLocation = labels.indexOf(text);
                if (labelLocation !== -1) {
                    int = addresses[labelLocation] - address + 4;
                }
                else {
                    var radix = 10 >>> 0;
                    var splice = false;
                    if (array[0] === "0") {
                        if (array[1] == "b") {
                            radix = 2;
                            splice = true;
                        }
                        if (array[1] == "o") {
                            radix = 8;
                            splice = true;
                        }
                        if (array[1] == "d") {
                            radix = 10;
                            splice = true;
                        }
                        if (array[1] == "x") {
                            radix = 16;
                            splice = true;
                        }
                    }
                    var interpretable = text;
                    if (splice) {
                        interpretable = array.splice(2, array.length - 2).join("");
                    }
                    int = parseInt(interpretable, radix);
                }
                if (isNaN(int)) {
                    result.errorMessage = "Offset '" + text + "' is not a recognized label or literal.";
                    return result;
                }
                if (rangeCheck(int, bits)) {
                    result.value = int;
                    return result;
                }
                result.errorMessage = "The value of '" + text + "' is out of range.";
                return result;
            default:
                return result;
        }
    };
    /*
        TOKENIZER

        This is the assembler's "first pass" -it does
        primtive lexical analysis and creates an
        address table.
    */
    var tokenize = function (file) {
        var result = {
            errorMessage: null,
            labels: [],
            addresses: [],
            lines: [],
            pc: []
        };
        var address = 0;
        var text = true;
        var lines = file.split("\n");
        for (var i = 0; i < lines.length; i++) {
            var labelExtractor = /(([A-Za-z_][A-Za-z0-9_]*):)?(.*)?/.exec(lines[i]);
            if (labelExtractor == null) {
                console.log("Congratulations, you broke regular expressions.");
            }
            if (typeof labelExtractor[2] !== 'undefined') {
                result.labels.push(labelExtractor[2]);
                result.addresses.push(address);
            }
            lines[i] = labelExtractor[3];
            if (lines[i] == undefined) {
                continue;
            }
            var chars = lines[i].split("");
            //Check for unterminated string/char (also comments)
            var inString = false;
            var commentOut = false;
            var colonIndex = -1;
            //Comments
            for (var j = 0; j < chars.length; j++) {
                if (!commentOut) {
                    if (chars[j] == "\"" || chars[j] == "\'") {
                        inString = !inString;
                    }
                    else if (inString) {
                        if (chars[j] == "\\") {
                            j++; //Escape next character
                        }
                        else if (chars[j] == "\n") {
                            result.errorMessage = "Line " + j + ": Unterminated string.";
                            return result;
                        }
                    }
                    else {
                        if (chars[j] == "#") {
                            commentOut = true;
                            chars.splice(j, 1);
                            j--;
                        }
                    }
                }
                else {
                    if (chars[j] !== "\n") {
                        chars.splice(j, 1);
                        j--;
                    }
                    else {
                        commentOut = false;
                    }
                }
            }
            lines[i] = chars.join("");
            lines[i] = lines[i].split("' '").join("32");
            //These are fine for most purposes, but string directives MUST NOT USE THE ARRAY DIRECTIVES BY ANY MEANS.
            var directives = lines[i].split(" ").filter(function (value) { return value.length > 0; });
            //Check if whitespace
            if (directives.length === 0) {
                continue;
            }
            var directiveChars = directives[0].split("");
            //Calculate size in bytes
            if (text) {
                if (directives[0] === ".data") {
                    text = false;
                    if (directives[1] !== undefined) {
                        result.errorMessage = "Line " + i + ": " + directives[1] + " is extraneous. .data does not take any arguments.";
                        return result;
                    }
                }
                else if (directives[0] === ".text") {
                }
                else if (directiveChars[0] === ".") {
                    result.errorMessage = "Line " + i + ": " + directives[0] + " cannot be in the text section. Aborting.";
                    return result;
                }
                else {
                    var instructionIndex = this.mnemonicSearch(directives[0].toUpperCase());
                    if (instructionIndex === -1) {
                        var pseudoInstructionIndex = this.pseudoMnemonicSearch(directives[0].toUpperCase());
                        if (pseudoInstructionIndex !== -1) {
                            address += this.pseudoInstructions[pseudoInstructionIndex].expansion.length * 4;
                        }
                        else {
                            result.errorMessage = "Line " + i + ": Instruction " + directives[0] + " not found.";
                            return result;
                        }
                    }
                    else {
                        address += 4;
                    }
                }
            }
            else {
                if (directives[0] == ".text") {
                    text = true;
                    if (directives[1] !== undefined) {
                        result.errorMessage = "Line " + i + ": " + directives[1] + " is extraneous. .text does not take any arguments.";
                        return result;
                    }
                }
                else if (directives[0] === ".data") {
                }
                else if (this.dataDirectives.indexOf(directives[0]) !== -1) {
                    var index = this.dataDirectives.indexOf(directives[0]);
                    if (this.dataDirectiveSizes[index] !== 0) {
                        var array = directives.join(" ").split(directives[i]).join("").split(",");
                        address += array.length * this.dataDirectiveSizes[index];
                    }
                    else {
                        switch (directives[0]) {
                            case ".string":
                                var match = /.string\s*\"(.*)\"\s*(#.*)?$/.exec(lines[i]);
                                if (match == null) {
                                    result.errorMessage = "Line " + i + ": Malformed string directive.";
                                    return result;
                                }
                                var array = match[1].split("");
                                for (var j = 0; j < array.length; j++) {
                                    if (array[j] == "\\") {
                                        j++;
                                    }
                                    address += 1;
                                }
                                address += 1;
                        }
                    }
                }
                else if (directiveChars[0] === ".") {
                    result.errorMessage = "Line " + i + ": Unsupported directive " + directives[0] + ".";
                    return result;
                }
                else {
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
    var assemble = function (nester, address, lines, labels, addresses) {
        if (nester === void 0) { nester = null; }
        var result = {
            errorMessage: null,
            machineCode: [],
            size: 0
        };
        var text = true;
        for (var i = 0; i < lines.length; i++) {
            if (typeof lines[i] == 'undefined') {
                continue;
            }
            var directives = lines[i].split(" ").filter(function (value) { return value.length > 0; });
            //Check if whitespace
            if (directives.length === 0) {
                continue;
            }
            var directiveChars = directives[0].split("");
            //Calculate lengths
            if (text) {
                if (directives[0] === ".data") {
                    text = false;
                }
                else if (directives[0] === ".text") {
                }
                else {
                    address += 4;
                    var instructionIndex = this.mnemonicSearch(directives[0].toUpperCase());
                    if (instructionIndex === -1) {
                        result.errorMessage = "Line " + ((nester == null) ? "" : (nester + ":")) + i + ": Instruction " + directives[0] + " not found.";
                        return result;
                    }
                    var instruction = this.instructions[instructionIndex];
                    var format = instruction.format;
                    var bitRanges = format.ranges;
                    var regex = format.regex;
                    var params = format.parameters;
                    var paramTypes = format.parameterTypes;
                    var machineCode = instruction.template();
                    var match = regex.exec(lines[i]);
                    if (match == null) {
                        result.errorMessage = "Line " + ((nester == null) ? "" : (nester + ":")) + i + ": Argument format for " + directives[0] + " violated.";
                        return result;
                    }
                    var args = match.splice(1, params.length);
                    for (var j = 0; j < bitRanges.length; j++) {
                        if (!bitRanges[j].instructionDefined) {
                            var startBit = 0;
                            var endBit = null;
                            var bits = bitRanges[j].bits;
                            var field = bitRanges[j].field;
                            var limits = /([A-za-z]+)\s*\[\s*(\d+)\s*:\s*(\d+)\s*\]/.exec(bitRanges[j].field);
                            if (limits != null) {
                                field = limits[1];
                                bits = bitRanges[j].limitlessBits;
                            }
                            var index = format.fieldParameterIndex(field);
                            var register = 0;
                            if (paramTypes[index] !== Parameter.special) {
                                var processed_1 = this.processParameter(address, args[index], paramTypes[index], bits, labels, addresses);
                                if (processed_1.errorMessage !== null) {
                                    result.errorMessage = "Line " + ((nester == null) ? "" : (nester + ":")) + i + ": " + processed_1.errorMessage;
                                    return result;
                                }
                                register = processed_1.value;
                            }
                            else {
                                var processed_2 = instruction.format.processSpecialParameter(address, args[index], bits, labels, addresses);
                                if (processed_2.errorMessage !== null) {
                                    result.errorMessage = "Line " + ((nester == null) ? "" : (nester + ":")) + i + ": " + processed_2.errorMessage;
                                    return result;
                                }
                                register = processed_2.value;
                            }
                            if (limits != null) {
                                startBit = parseInt(limits[3]);
                                endBit = parseInt(limits[2]);
                                register = register >>> startBit;
                                register = register & ((1 << (endBit - startBit + 1)) - 1);
                            }
                            machineCode = machineCode | (register << bitRanges[j].start);
                        }
                    }
                    for (var j = 0; j < 4; j++) {
                        result.machineCode.push(machineCode & 255);
                        machineCode = machineCode >>> 8;
                    }
                }
            }
            else {
                if (directives[0] == ".text") {
                    text = true;
                }
                else if (this.dataDirectives.indexOf(directives[0]) !== -1) {
                    var index = this.dataDirectives.indexOf(directives[0]);
                    var bytes = [];
                    if (this.dataDirectiveSizes[index] !== 0) {
                        var size = this.dataDirectiveSizes[index];
                        var array = lines[i].split("' '").join("'$OAK_SPACE_TEMP'").split(directives[0]).join("").split(" ").join("").split("'$OAK_SPACE_TEMP'").join("' '").split(",");
                        for (var j = 0; j < array.length; j++) {
                            var processed = this.processParameter(address, array[j], Parameter.immediate, size * 8, labels, addresses);
                            if (processed.errorMessage !== null) {
                                result.errorMessage = "Line " + ((nester == null) ? "" : (nester + ":")) + i + ": " + processed.errorMessage;
                                return result;
                            }
                            for (var k = 0; k < size; k++) {
                                address += 1;
                                result.machineCode.push(processed.value & 255);
                                processed.value = processed.value >>> 8;
                            }
                        }
                    }
                    else {
                        switch (directives[0]) {
                            case ".string":
                                var stringMatch = /.string\s*\"(.*)\"\s*(#.*)?$/.exec(lines[i]);
                                if (stringMatch == null) {
                                    result.errorMessage = "Line " + i + ": Malformed string directive.";
                                    return result;
                                }
                                if (stringMatch[1] == undefined) {
                                    stringMatch[1] = "";
                                }
                                var characters = stringMatch[1].split("");
                                for (var j = 0; j < characters.length; j++) {
                                    if (characters[j] == "\\") {
                                        j++;
                                        if (j + 1 < characters.length) {
                                            switch (characters[j + 1]) {
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
                                                    result.machineCode.push(characters[j].charCodeAt(0));
                                            }
                                        }
                                    }
                                    else {
                                        result.machineCode.push(characters[j].charCodeAt(0));
                                    }
                                    address += 1;
                                }
                                result.machineCode.push(0 >>> 0);
                                address += 1;
                        }
                    }
                }
            }
        }
        result.size = address;
        return result;
    };
    var disassemble = function (machineCode) {
        return "";
    };
    var abiNames = ['zero', 'ra', 'sp', 'gp', 'tp', 't0', 't1', 't2', 's0', 's1', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 't3', 't4', 't5', 't6'];
    return new InstructionSet(32, formats, instructions, pseudoInstructions, [".word", ".half", ".byte", ".string"], [4, 2, 1, 0], abiNames, process, tokenize, assemble, disassemble);
}
var RISCV = Oak_gen_RISCV();
function rangeCheck(value, bits) {
    if (bits == 32) {
        return true; //No other option.
    }
    if (bits > 32) {
        return false; //Impossible.
    }
    var min = -(1 << bits - 1);
    var max = (1 << bits - 1) - 1;
    value = signExt(value, bits);
    if (((value >> 0) <= max) && ((value >> 0) >= min)) {
        return true;
    }
    return false;
}
/*
    signExt

    Sign extends an n-bit value to fit Javascript limits.

    Usage signExt(value, n)
*/
function signExt(value, bits) {
    var mutableValue = value;
    if ((mutableValue & (1 << (bits - 1))) !== 0) {
        mutableValue = ((~(0) >>> bits) << bits) | value;
    }
    return mutableValue;
}
/*
    catBytes
    
    Converts bytes stored in a little endian fashion to a proper js integer.
*/
function catBytes(bytes) {
    if (bytes.length > 4) {
        return null;
    }
    var storage = 0 >>> 0;
    for (var i = 0; i < bytes.length; i++) {
        storage = storage | (bytes[i] << (8 * i));
    }
    return storage;
}
var RISCVRegisterFile = (function () {
    function RISCVRegisterFile(memorySize, abiNames) {
        this.physicalFile = [];
        for (var i = 0; i < 32; i++) {
            this.physicalFile.push(0);
        }
        this.memorySize = memorySize;
        this.physicalFile[2] = memorySize; //stack pointer
        this.abiNames = abiNames;
    }
    RISCVRegisterFile.prototype.print = function () {
        console.log("Registers\n------");
        for (var i = 0; i < 32; i++) {
            console.log(i, this.abiNames[i], this.physicalFile[i]);
        }
        console.log("------");
    };
    RISCVRegisterFile.prototype.read = function (registerNumber) {
        if (registerNumber === 0) {
            return 0;
        }
        else {
            return this.physicalFile[registerNumber];
        }
    };
    RISCVRegisterFile.prototype.write = function (registerNumber, value) {
        this.physicalFile[registerNumber] = value;
    };
    RISCVRegisterFile.prototype.getRegisterCount = function () {
        return 32;
    };
    RISCVRegisterFile.prototype.reset = function () {
        for (var i = 0; i < 32; i++) {
            this.physicalFile[i] = 0;
        }
        this.physicalFile[2] = this.memorySize;
    };
    return RISCVRegisterFile;
}());
;
var RISCVCore //: Core
 = (function () {
    function RISCVCore //: Core
        (memorySize, syscall, instructionCallback) {
        this.instructionSet = RISCV;
        this.pc = 0 >>> 0;
        this.memorySize = memorySize;
        this.syscall = syscall;
        this.instructionCallback = instructionCallback;
        this.registerFile = new RISCVRegisterFile(memorySize, RISCV.abiNames);
        this.memory = new Array(memorySize);
        for (var i = 0; i < memorySize; i++) {
            this.memory[i] = 0;
        }
    }
    RISCVCore //: Core
    .prototype.reset = function () {
        this.pc = 0;
        this.memory = [];
        for (var i = 0; i < this.memorySize; i++) {
            this.memory[i] = 0;
        }
        this.registerFile.reset();
    };
    //Returns bytes on success, null on failure
    RISCVCore //: Core
    .prototype.memcpy = function (address, bytes) {
        if (address + bytes > this.memorySize) {
            return null;
        }
        var result = [];
        for (var i = 0; i < bytes; i++) {
            result.push(this.memory[address + i]);
        }
        return result;
    };
    //Returns boolean indicating success
    //Use to store machine code in memory so it can be executed.
    RISCVCore //: Core
    .prototype.memset = function (address, bytes) {
        if (address < 0) {
            return false;
        }
        if (address + bytes.length > this.memorySize) {
            return false;
        }
        var result = [];
        for (var i = 0; i < bytes.length; i++) {
            this.memory[address + i] = bytes[i];
        }
        return true;
    };
    RISCVCore //: Core
    .prototype.fetch = function () {
        if (this.pc < 0) {
            return "Fetch Error: Negative program counter.";
        }
        var arr = this.memcpy(this.pc, 4);
        if (arr == null) {
            return "Fetch Error: Illegal memory access.";
        }
        this.pc += 4;
        this.fetched = catBytes(arr);
        return null;
    };
    //Returns the disassembly. If the decoding fails, null.
    RISCVCore //: Core
    .prototype.decode = function () {
        var insts = this.instructionSet.instructions;
        this.decoded = null;
        this.arguments = [];
        for (var i = 0; i < insts.length; i++) {
            if (insts[i].match(this.fetched)) {
                this.decoded = insts[i];
                break;
            }
        }
        if (this.decoded == null) {
            return null;
        }
        var format = this.decoded.format;
        var bitRanges = format.ranges;
        var params = format.parameters;
        var paramTypes = format.parameterTypes;
        for (var i = 0; i < bitRanges.length; i++) {
            if (!bitRanges[i].instructionDefined) {
                var limit = 0;
                var field = bitRanges[i].field;
                var limits = /([A-za-z]+)\s*\[\s*(\d+)\s*:\s*(\d+)\s*\]/.exec(bitRanges[i].field);
                if (limits != null) {
                    field = limits[1];
                    limit = parseInt(limits[3]) >>> 0;
                }
                var index = format.fieldParameterIndex(field);
                var bits = bitRanges[i].bits;
                var value = ((this.fetched >>> bitRanges[i].start) & ((1 << bitRanges[i].bits) - 1)) << limit;
                if (paramTypes[index] === Parameter.special) {
                    value = this.decoded.format.decodeSpecialParameter(value); //Unmangle...
                }
                this.arguments[index] = this.arguments[index] | value;
            }
        }
        for (var i = 0; i < params.length; i++) {
            var rangeIndex = format.parameterBitRangeIndex(params[i]);
            if (rangeIndex === -1) {
                console.log("Internal error: No field found for parameter " + params[i] + ".");
            }
            var bits = bitRanges[rangeIndex].bits;
            if (bitRanges[rangeIndex].limitlessBits != null) {
                bits = bitRanges[rangeIndex].limitlessBits;
            }
            if (this.decoded.signed && paramTypes[i] != Parameter.register) {
                this.arguments[i] = signExt(this.arguments[i], bits);
            }
        }
        // for (var i = 0; i < this.decoded.format.parameters.length; i++)
        // {
        //     var bitRange: BitRange = this.decoded.format.ranges[this.decoded.format.parameterBitRangeIndex(this.decoded.format.parameters[i])];
        //     if (bitRange == null)
        //     {
        //         return null;
        //     }
        //     var value = (this.fetched >>> bitRange.start) & ((1 << bitRange.bits) - 1);
        //     if (this.decoded.signed)
        //     {
        //         value = signExt(value, bitRange.bits);
        //     }
        //     if (this.decoded.format.parameterTypes[i] == Parameter.offset)
        //     {
        //         value = this.pc + value;
        //     }
        //     this.arguments.push(value);
        //     var strValue = value.toString();
        //     if (this.decoded.format.parameterTypes[i] == Parameter.register)
        //     {
        //         strValue = "x" + strValue;
        //     }
        //     str += strValue;
        //     if (i !== this.decoded.format.parameters.length - 1)
        //     {
        //         str += ", ";
        //     }
        // }
        return format.disassemble(this.decoded.mnemonic, this.arguments, this.instructionSet.abiNames);
    };
    //Returns null on success, error message on error.
    RISCVCore //: Core
    .prototype.execute = function () {
        return this.decoded.executor(this);
    };
    return RISCVCore //: Core
    ;
}());
/// <reference path="InstructionSet.ts"/>
/// <reference path="RISCV.ts"/>
// The Zero Interface
// Should be mostly pure Javascript, as it is indeed an interface for Javascript.
// INTERFACE GUIDE: If null, then it looks like it was successful. Else, it is unsuccessful.
var debug = false;
var consoleTests = false;
function h2b(hex) {
    var hexArr = hex.split(' '); // Remove spaces, then seperate characters
    var byteArr = [];
    for (var i = 0; i < hexArr.length; i++) {
        var value = parseInt(hexArr[i], 16);
        if (!isNaN(value)) {
            byteArr.push(value);
        }
    }
    return byteArr;
}
function assemble(core, data) {
    var token = core.instructionSet.tokenize(data);
    if (debug) {
        console.log(token.labels);
        console.log(token.addresses);
    }
    if (token.errorMessage === null) {
        return core.instructionSet.assemble(null, 0, token.lines, token.labels, token.addresses);
    }
    else {
        return { errorMessage: token.errorMessage, machineCode: null, size: 0 };
    }
}
function loadIntoMemory(core, data) {
    if (core.memset(0, data) === null)
        return "Program is too large.";
    return null;
}
function loadMemStep(core, data) {
    var load = loadIntoMemory(core, data);
    if (load !== null) {
        return load;
    }
    simulateStep(core);
}
function simulateStep(core) {
    var fetch = core.fetch();
    if (fetch !== null) {
        return fetch;
    }
    var decode = core.decode();
    if (decode === null) {
        return "Address 0x" + core.pc.toString(16) + ": Instruction unrecognized or unsupported.";
    }
    core.instructionCallback(decode);
    if (debug) {
        console.log(core.pc - 4, decode, core.arguments);
    }
    var execute = core.execute();
    if (execute !== null) {
        return execute;
    }
    if (debug) {
        core.registerFile.print();
    }
    if (decode == "SCALL") {
        return "SCALL";
    }
    return null;
}
//It is recommended to simulateStep
function simulate(core, data) {
    var load = loadIntoMemory(core, data);
    if (load !== null) {
        return load;
    }
    continueSim(core);
}
function continueSim(core) {
    var step = simulateStep(core);
    var i = 0;
    for (var i = 0; i < 16384 && step === null; i++) {
        step = simulateStep(core);
    }
    if (i == 16384) {
        return "ERROR: Possible Infinite Loop";
    }
    if (step !== null) {
        return step;
    }
    return null;
}
function registerRead(core, index) {
    return core.registerFile.read(index);
}
function registerWrite(core, index, value) {
    core.registerFile.write(index, value);
}
function getMemory(core) {
    return core.memory;
}
function getRegisterABINames(core) {
    return core.registerFile.abiNames;
}
function resetCore(core) {
    core.reset();
}
Array.prototype.Oak_hex = function () {
    var hexadecimal = "";
    for (var i = 0; i < this.length; i++) {
        var hexRepresentation = this[i].toString(16).toUpperCase();
        if (hexRepresentation.length === 1) {
            hexRepresentation = "0" + hexRepresentation;
        }
        hexadecimal += hexRepresentation + " ";
    }
    return hexadecimal;
};
var scalloutput = "";
function terminal_sysCall() {
    var core = this;
    var type = registerRead(core, 17);
    var arg = registerRead(core, 10);
    var exit = false;
    switch (type) {
        case 1:
            scalloutput += arg + "\n";
            break;
        case 4:
            var pointer = arg;
            var output = "";
            var char = core.memory[pointer];
            while (char != 0) {
                output += String.fromCharCode(char);
                pointer += 1;
                char = core.memory[pointer];
            }
            scalloutput += output + "\n";
            break;
        case 5:
            registerWrite(core, 17, 4);
            break;
        case 10:
            exit = true;
            break;
        default:
            console.log("Unsupported syscall.");
            break;
    }
    if (!exit) {
        var output = continueSim(core);
        if (output != "SCALL" && output !== null && output != undefined) {
            console.log("ERROR: " + output);
        }
    }
    else {
        console.log("Simulation Complete.");
    }
}
if (consoleTests) {
    //CLI Test Area
    console.log("Oak.js Console Tests");
    var testCore = new RISCVCore(2048, terminal_sysCall, function (data) { });
    var oakHex = assemble(testCore, "main:\naddi a0, zero, 8\naddi a1, zero, 2\njal ra, mydiv\n\nli a7, 10  # calls exit command (code 10)\nSCALL # end of program\n\n## Divides two numbers, storing integer result on t0 and rest on t1\n# a0 Number we will divide\n# a1 Number we will divide for\nmydiv:\nadd t1, zero, zero # i = 0\n\nmydiv_test:\nslt t0, a0, a1 # if ( a < b )\nbne t0, zero, mydiv_end # then get out of here\nsub a0, a0, a1 # else, a = a - b\naddi t1, t1, 1 # and i = i + 1\njal x0, mydiv_test # let's test again\n\nmydiv_end:\nadd a1, zero, a0 # rest = a\nadd a0, zero, t1 # result = i\njalr x0, ra, 0").machineCode;
    var gnuHex = h2b("13 05 80 00 93 05 20 00 EF 00 C0 00 93 08 A0 00 73 00 00 00 33 03 00 00 B3 22 B5 00 63 98 02 00 33 05 B5 40 13 03 13 00 6F F0 1F FF B3 05 A0 00 33 05 60 00 67 80 00 00");
    for (var i = 0; i < oakHex.length; i++) {
        if (oakHex[i] !== gnuHex[i]) {
            console.log("Binaries do not match.");
            break;
        }
    }
    var sim = simulate(testCore, oakHex);
    console.log(scalloutput);
}
