"use strict";
import {
    Parameter,
    Keyword,
    Directive,
    Instruction,
    InstructionSet,
    Format,
    BitRange,
} from "../oak/InstructionSet.js";
import { Core } from "../oak/Core.js";
import { Utils } from "../oak/Utils.js";
import JSBI from "jsbi";

//The MIPS Instruction Set Architecture
function MIPS(options) {
    let opts = options || [];
    //Formats and Instructions
    let formats = [];
    let instructions = [];
    let pseudoInstructions = [];
    //R-Type
    formats.push(
        new Format(
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5).parameterized(1, Parameter.register),
                new BitRange("rt", 16, 5).parameterized(2, Parameter.register),
                new BitRange("rd", 11, 5).parameterized(0, Parameter.register),
                new BitRange("shamt", 6, 5, 0),
                new BitRange("funct", 0, 6),
            ],
            /^\s*([a-zA-Z]+)\s*(\$[A-Za-z0-9]+)\s*,\s*(\$[A-Za-z0-9]+)\s*,\s*(\$[A-Za-z0-9]+)\s*$/,
            "@mnem @arg0, @arg1, @arg2"
        )
    );
    let rType = formats[formats.length - 1];
    instructions.push(
        new Instruction(
            "ADD",
            rType,
            ["opcode", "funct"],
            [0x0, 0x20],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    JSBI.toNumber(
                        JSBI.bitwiseAnd(
                            JSBI.add(
                                JSBI.BigInt(
                                    core.registerFile.read(core.arguments[1])
                                ),
                                JSBI.BigInt(
                                    core.registerFile.read(core.arguments[2])
                                )
                            ),
                            JSBI.BigInt("0xFFFFFFFF")
                        )
                    )
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "ADDU",
            rType,
            ["opcode", "funct"],
            [0x0, 0x21],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    JSBI.toNumber(
                        JSBI.bitwiseAnd(
                            JSBI.add(
                                JSBI.BigInt(
                                    core.registerFile.read(core.arguments[1])
                                ),
                                JSBI.BigInt(
                                    core.registerFile.read(core.arguments[2])
                                )
                            ),
                            JSBI.BigInt("0xFFFFFFFF")
                        )
                    )
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "SUB",
            rType,
            ["opcode", "funct"],
            [0x0, 0x22],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    JSBI.toNumber(
                        JSBI.bitwiseAnd(
                            JSBI.subtract(
                                JSBI.BigInt(
                                    core.registerFile.read(core.arguments[1])
                                ),
                                JSBI.BigInt(
                                    core.registerFile.read(core.arguments[2])
                                )
                            ),
                            JSBI.BigInt("0xFFFFFFFF")
                        )
                    )
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "SUBU",
            rType,
            ["opcode", "funct"],
            [0x0, 0x23],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    JSBI.toNumber(
                        JSBI.bitwiseAnd(
                            JSBI.subtract(
                                JSBI.BigInt(
                                    core.registerFile.read(core.arguments[1])
                                ),
                                JSBI.BigInt(
                                    core.registerFile.read(core.arguments[2])
                                )
                            ),
                            JSBI.BigInt("0xFFFFFFFF")
                        )
                    )
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "AND",
            rType,
            ["opcode", "funct"],
            [0x0, 0x24],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    core.registerFile.read(core.arguments[1]) &
                    core.registerFile.read(core.arguments[2])
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "OR",
            rType,
            ["opcode", "funct"],
            [0x0, 0x25],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    core.registerFile.read(core.arguments[1]) |
                    core.registerFile.read(core.arguments[2])
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "NOR",
            rType,
            ["opcode", "funct"],
            [0x0, 0x27],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    ~(
                        core.registerFile.read(core.arguments[1]) |
                        core.registerFile.read(core.arguments[2])
                    )
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "XOR",
            rType,
            ["opcode", "funct"],
            [0x0, 0x26],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    core.registerFile.read(core.arguments[1]) ^
                    core.registerFile.read(core.arguments[2])
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "SLT",
            rType,
            ["opcode", "funct"],
            [0x0, 0x2a],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    core.registerFile.read(core.arguments[1]) <
                        core.registerFile.read(core.arguments[2])
                        ? 1
                        : 0
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "SLLV",
            rType,
            ["opcode", "funct"],
            [0x0, 0x04],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    core.registerFile.read(core.arguments[1]) <<
                    core.registerFile.read(core.arguments[2])
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "SRLV",
            rType,
            ["opcode", "funct"],
            [0x0, 0x06],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    core.registerFile.read(core.arguments[1]) >>>
                    core.registerFile.read(core.arguments[2])
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "SRAV",
            rType,
            ["opcode", "funct"],
            [0x0, 0x07],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    core.registerFile.read(core.arguments[1]) >>
                    core.registerFile.read(core.arguments[2])
                );
                return null;
            }
        )
    );
    //R-Jump Subtype
    formats.push(
        new Format(
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5).parameterized(0, Parameter.register),
                new BitRange("rt", 16, 5, 0),
                new BitRange("rd", 11, 5, 0),
                new BitRange("shamt", 6, 5, 0),
                new BitRange("funct", 0, 6),
            ],
            /^\s*([a-zA-Z]+)\s*(\$[A-Za-z0-9]+)\s*$/,
            "@mnem @arg0"
        )
    );
    let rjSubtype = formats[formats.length - 1];
    instructions.push(
        new Instruction(
            "JR",
            rjSubtype,
            ["opcode", "funct"],
            [0x0, 0x08],
            function (core) {
                core.pc = core.registerFile.read(core.arguments[0]);
                return null;
            }
        )
    );
    //R-Shift Subtype
    formats.push(
        new Format(
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5, 0),
                new BitRange("rt", 16, 5).parameterized(1, Parameter.register),
                new BitRange("rd", 11, 5).parameterized(0, Parameter.register),
                new BitRange("shamt", 6, 5).parameterized(
                    2,
                    Parameter.immediate
                ),
                new BitRange("funct", 0, 6),
            ],
            /^\s*([a-zA-Z]+)\s*(\$[A-Za-z0-9]+)\s*,\s*(\$[A-Za-z0-9]+)\s*,\s*([0-9]+)\s*$/,
            "@mnem @arg0, @arg1, @arg2"
        )
    );
    let rsSubtype = formats[formats.length - 1];
    instructions.push(
        new Instruction(
            "SLL",
            rsSubtype,
            ["opcode", "funct"],
            [0x0, 0x00],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    core.registerFile.read(core.arguments[1]) <<
                    core.arguments[2]
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "SRL",
            rsSubtype,
            ["opcode", "funct"],
            [0x0, 0x02],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    core.registerFile.read(core.arguments[1]) >>>
                    core.arguments[2]
                );
                return null;
            }
        )
    );
    instructions.push(
        new Instruction(
            "SRA",
            rsSubtype,
            ["opcode", "funct"],
            [0x0, 0x02],
            function (core) {
                core.registerFile.write(
                    core.arguments[0],
                    core.registerFile.read(core.arguments[1]) >>
                    core.arguments[2]
                );
                return null;
            }
        )
    );
    //R-Constant Subtype
    formats.push(
        new Format(
            [new BitRange("funct", 0, 32)],
            /^\s*([a-zA-Z]+)\s*$/,
            "@mnem"
        )
    );
    let rcSubtype = formats[formats.length - 1];
    instructions.push(
        new Instruction("SYSCALL", rcSubtype, ["funct"], [0xc], function (
            core
        ) {
            return core.virtualOS.ecall(core);
        })
    );
    //I-Type
    formats.push(
        new Format(
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5).parameterized(1, Parameter.register),
                new BitRange("rt", 16, 5).parameterized(0, Parameter.register),
                new BitRange("imm", 0, 16, null, true).parameterized(
                    2,
                    Parameter.immediate
                ),
            ],
            /^\s*([a-zA-Z]+)\s*(\$[A-Za-z0-9]+)\s*,\s*(\$[A-Za-z0-9]+)\s*,\s*(-?[a-zA-Z0-9_]+)\s*$/,
            "@mnem @arg0, @arg1, @arg2"
        )
    );
    let iType = formats[formats.length - 1];
    //I-type instructions
    instructions.push(
        new Instruction("ADDI", iType, ["opcode"], [0x8], function (core) {
            core.registerFile.write(
                core.arguments[0],
                core.registerFile.read(core.arguments[1]) + core.arguments[2]
            );
            return null;
        })
    );
    instructions.push(
        new Instruction("ADDIU", iType, ["opcode"], [0x9], function (core) {
            core.registerFile.write(
                core.arguments[0],
                core.registerFile.read(core.arguments[1]) + core.arguments[2]
            );
            return null;
        })
    );
    instructions.push(
        new Instruction("SLTI", iType, ["opcode"], [0x0a], function (core) {
            core.registerFile.write(
                core.arguments[0],
                core.registerFile.read(core.arguments[1]) < core.arguments[2]
                    ? 1
                    : 0
            );
            return null;
        })
    );
    instructions.push(
        new Instruction("SLTIU", iType, ["opcode"], [0x0b], function (core) {
            core.registerFile.write(
                core.arguments[0],
                core.registerFile.read(core.arguments[1]) >>> 0 <
                    core.arguments[2] >>> 0
                    ? 1
                    : 0
            );
            return null;
        })
    );
    instructions.push(
        new Instruction("ANDI", iType, ["opcode"], [0x0c], function (core) {
            core.registerFile.write(
                core.arguments[0],
                (core.registerFile.read(core.arguments[1]) >>> 0) &
                core.arguments[2]
            );
            return null;
        })
    );
    instructions.push(
        new Instruction("ORI", iType, ["opcode"], [0x0d], function (core) {
            core.registerFile.write(
                core.arguments[0],
                (core.registerFile.read(core.arguments[1]) >>> 0) |
                core.arguments[2]
            );
            return null;
        })
    );
    instructions.push(
        new Instruction("XORI", iType, ["opcode"], [0x0e], function (core) {
            core.registerFile.write(
                core.arguments[0],
                (core.registerFile.read(core.arguments[1]) >>> 0) ^
                core.arguments[2]
            );
            return null;
        })
    );
    //I-Branch Subtype
    formats.push(
        new Format(
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5).parameterized(0, Parameter.register),
                new BitRange("rt", 16, 5).parameterized(1, Parameter.register),
                new BitRange("imm", 0, 16, null, true)
                    .parameterized(2, Parameter.offset)
                    .limited(18, 2, 17),
            ],
            /^\s*([a-zA-Z]+)\s*(\$[A-Za-z0-9]+)\s*,\s*(\$[A-Za-z0-9]+)\s*,\s*(-?[a-zA-Z0-9_]+)\s*$/,
            "@mnem @arg0, @arg1, @arg2"
        )
    );
    let ibSubtype = formats[formats.length - 1];
    instructions.push(
        new Instruction("BEQ", ibSubtype, ["opcode"], [0x04], function (core) {
            if (
                core.registerFile.read(core.arguments[0]) ===
                core.registerFile.read(core.arguments[1])
            ) {
                core.pc += core.arguments[2];
            }
            return null;
        })
    );
    instructions.push(
        new Instruction("BNE", ibSubtype, ["opcode"], [0x05], function (core) {
            if (
                core.registerFile.read(core.arguments[0]) !==
                core.registerFile.read(core.arguments[1])
            ) {
                core.pc += core.arguments[2];
            }
            return null;
        })
    );
    //I Load Upper Immediate Subtype
    formats.push(
        new Format(
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5, 0),
                new BitRange("rt", 16, 5).parameterized(0, Parameter.register),
                new BitRange("imm", 0, 16, null, true).parameterized(
                    1,
                    Parameter.register
                ),
            ],
            /^\s*([a-zA-Z]+)\s*(\$[A-Za-z0-9]+)\s*,\s*(-?[a-zA-Z0-9_]+)\s*$/,
            "@mnem @arg0, @arg1"
        )
    );
    let iluiSubtype = formats[formats.length - 1];
    instructions.push(
        new Instruction("LUI", iluiSubtype, ["opcode"], [0x0f], function (
            core
        ) {
            core.registerFile.write(core.arguments[0], core.arguments[1] << 16);
            return null;
        })
    );
    //I Load/Store Subtype
    formats.push(
        new Format(
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5).parameterized(2, Parameter.register),
                new BitRange("rt", 16, 5).parameterized(0, Parameter.register),
                new BitRange("imm", 0, 16, null, true).parameterized(
                    1,
                    Parameter.immediate
                ),
            ],
            /^\s*([a-zA-Z]+)\s*(\$[A-Za-z0-9]+)\s*,\s*(-?0?[boxd]?[0-9A-F]+)\(\s*(\$[A-Za-z0-9]+)\s*\)\s*$/,
            "@mnem @arg0, @arg1(@arg2)"
        )
    );
    let ilsSubtype = formats[formats.length - 1];
    //TO-DO: Verify function(core) functionality
    instructions.push(
        new Instruction("LB", ilsSubtype, ["opcode"], [0x20], function (core) {
            let bytes = core.memcpy(
                core.registerFile.read(core.arguments[2]) + core.arguments[1],
                1
            );
            if (bytes === null) {
                return "Illegal memory access.";
            }
            core.registerFile.write(
                core.arguments[0],
                Utils.signExt(bytes[0], 8)
            );
            return null;
        })
    );
    instructions.push(
        new Instruction("LH", ilsSubtype, ["opcode"], [0x21], function (core) {
            let bytes = core.memcpy(
                core.registerFile.read(core.arguments[2]) + core.arguments[1],
                2
            );
            if (bytes === null) {
                return "Illegal memory access.";
            }
            core.registerFile.write(
                core.arguments[0],
                Utils.signExt(Utils.catBytes(bytes), 16)
            );
            return null;
        })
    );
    instructions.push(
        new Instruction("LW", ilsSubtype, ["opcode"], [0x23], function (core) {
            let bytes = core.memcpy(
                core.registerFile.read(core.arguments[2]) + core.arguments[1],
                4
            );
            if (bytes === null) {
                return "Illegal memory access.";
            }
            core.registerFile.write(core.arguments[0], Utils.catBytes(bytes));
            return null;
        })
    );
    instructions.push(
        new Instruction("LBU", ilsSubtype, ["opcode"], [0x24], function (core) {
            let bytes = core.memcpy(
                core.registerFile.read(core.arguments[2]) + core.arguments[1],
                1
            );
            if (bytes === null) {
                return "Illegal memory access.";
            }
            core.registerFile.write(core.arguments[0], bytes[0]);
            return null;
        })
    );
    instructions.push(
        new Instruction("LHU", ilsSubtype, ["opcode"], [0x25], function (core) {
            let bytes = core.memcpy(
                core.registerFile.read(core.arguments[2]) + core.arguments[1],
                2
            );
            if (bytes === null) {
                return "Illegal memory access.";
            }
            core.registerFile.write(core.arguments[0], Utils.catBytes(bytes));
            return null;
        })
    );
    instructions.push(
        new Instruction("SB", ilsSubtype, ["opcode"], [0x28], function (core) {
            let bytes = [];
            bytes.push(core.registerFile.read(core.arguments[0]) & 255);
            let writeAddress =
                core.registerFile.read(core.arguments[2]) + core.arguments[1];
            if (core.memset(writeAddress, bytes)) {
                // console.log("A0 ", core.registerFile.read(core.instructionSet.abiNames.indexOf("$a0")));
                // console.log("T1 ", core.registerFile.read(core.instructionSet.abiNames.indexOf("$t1")));
                // console.log("Wrote to ", writeAddress.toString(16));
                return null;
            }
            return "Illegal memory access.";
        })
    );
    instructions.push(
        new Instruction("SH", ilsSubtype, ["opcode"], [0x29], function (core) {
            let bytes = [];
            let value = core.registerFile.read(core.arguments[0]);
            bytes.push(value & 255);
            value = value >>> 8;
            bytes.push(value & 255);
            if (
                core.memset(
                    core.registerFile.read(core.arguments[2]) +
                    core.arguments[1],
                    bytes
                )
            ) {
                return null;
            }
            return "Illegal memory access.";
        })
    );
    instructions.push(
        new Instruction("SW", ilsSubtype, ["opcode"], [0x2b], function (core) {
            let bytes = [];
            let value = core.registerFile.read(core.arguments[0]);
            bytes.push(value & 255);
            value = value >>> 8;
            bytes.push(value & 255);
            value = value >>> 8;
            bytes.push(value & 255);
            value = value >>> 8;
            bytes.push(value & 255);
            if (
                core.memset(
                    core.registerFile.read(core.arguments[2]) +
                    core.arguments[1],
                    bytes
                )
            ) {
                return null;
            }
            return "Illegal memory access.";
        })
    );
    //J-Type
    formats.push(
        new Format(
            [
                new BitRange("opcode", 26, 6),
                new BitRange("imm", 0, 26).parameterized(0, Parameter.special),
            ],
            /^\s*([A-Za-z]+)\s*([A-Za-z0-9_]+)\s*$/,
            "@mnem @arg0",
            function (text, type, bits, address, assembler) {
                let result = {
                    errorMessage: null,
                    context: null,
                    value: null,
                };
                //Label
                let value = null;
                let reference = assembler.linesByLabel[text];
                if (reference !== undefined) {
                    result.context = reference[0];
                    if (reference[1] === null) {
                        return result;
                    }
                    value = reference[1];
                }
                if (value === null && assembler.keywordRegexes[Keyword.char]) {
                    let extraction =
                        assembler.keywordRegexes[Keyword.char].exec(text);
                    if (extraction !== null && extraction[1] !== undefined) {
                        value = extraction[1].charCodeAt(0);
                        if (value > 255) {
                            result.errorMessage =
                                "Non-ascii character " +
                                extraction[1] +
                                " unsupported.";
                            return result;
                        }
                    }
                }
                if (
                    value === null &&
                    assembler.keywordRegexes[Keyword.numeric] !== undefined
                ) {
                    let array =
                        assembler.keywordRegexes[Keyword.numeric].exec(text);
                    if (array !== null) {
                        let radix = Assembler.radixes[array[2]] || 10;
                        let interpretable = array[1];
                        value = parseInt(interpretable, radix);
                    }
                }
                if (value === null || isNaN(value)) {
                    result.errorMessage = `args.valueUnrecognized(${text})`;
                    return result;
                }
                if (value >>> 28 === address >>> 28) {
                    if ((value & 3) === 0) {
                        result.value = (value & 0x0ffffffc) >>> 2;
                    } else {
                        result.errorMessage = `mips.wordUnlignedJump(${text})`;
                    }
                } else {
                    result.errorMessage = `args.outOfRange(${text})`;
                }
                return result;
            },
            function (value, address) {
                return (value << 2) | (address & 0xf0000000);
            }
        )
    );
    let jType = formats[formats.length - 1];
    instructions.push(
        new Instruction("J", jType, ["opcode"], [0x2], function (core) {
            core.pc = core.arguments[0];
            return null;
        })
    );
    instructions.push(
        new Instruction("JAL", jType, ["opcode"], [0x3], function (core) {
            core.registerFile.write(31, core.pc);
            core.pc = core.arguments[0];
            return null;
        })
    );

    //"Pseudoinstructions"
    //MV
    formats.push(
        new Format(
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5).parameterized(1, Parameter.register),
                new BitRange("rt", 16, 5, 0),
                new BitRange("rd", 11, 5).parameterized(0, Parameter.register),
                new BitRange("shamt", 6, 5, 0),
                new BitRange("funct", 0, 6),
            ],
            /^\s*([a-zA-Z]+)\s*(\$[A-Za-z0-9]+)\s*,\s*(\$[A-Za-z0-9]+)\s*$/,
            "@mnem @arg0, @arg1"
        )
    );
    let mvPseudo = formats[formats.length - 1];
    instructions.push(
        new Instruction(
            "MV",
            mvPseudo,
            ["opcode", "funct"],
            [0x0, 0x20],
            function (core) {
                //Captured by ADD
                return null;
            }
        )
    );
    //LI/LA
    formats.push(
        new Format(
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5, 0),
                new BitRange("rt", 16, 5).parameterized(0, Parameter.register),
                new BitRange("imm", 0, 16, null, true).parameterized(
                    1,
                    Parameter.immediate
                ),
            ],
            /^\s*([a-zA-Z]+)\s*(\$[A-Za-z0-9]+)\s*,\s*(-?[a-zA-Z0-9_]+)\s*$/,
            "@mnem @arg0, @arg1"
        )
    );
    let liPseudo = formats[formats.length - 1];
    instructions.push(
        new Instruction("LI", liPseudo, ["opcode"], [0x8], function (core) {
            //Captured by ADDI
            return null;
        })
    );
    instructions.push(
        new Instruction("LA", liPseudo, ["opcode"], [0x8], function (core) {
            //Captured by ADDI
            return null;
        })
    );
    let keywords = [];
    keywords[Keyword.directive] = ["\\."];
    keywords[Keyword.comment] = ["#"];
    keywords[Keyword.label] = ["\\:"];
    keywords[Keyword.stringMarker] = ['\\"'];
    keywords[Keyword.charMarker] = ["\\'"];
    keywords[Keyword.register] = ["x"];
    let directives = [];
    directives["text"] = Directive.text;
    directives["data"] = Directive.data;
    directives["asciiz"] = Directive.cString;
    directives["byte"] = Directive._8bit;
    directives["half"] = Directive._16bit;
    directives["word"] = Directive._32bit;
    let abiNames = [
        "$zero",
        "$at",
        "$v0",
        "$v1",
        "$a0",
        "$a1",
        "$a2",
        "$a3",
        "$t0",
        "$t1",
        "$t2",
        "$t3",
        "$t4",
        "$t5",
        "$t6",
        "$t7",
        "$s0",
        "$s1",
        "$s2",
        "$s3",
        "$s4",
        "$s5",
        "$s6",
        "$s7",
        "$t8",
        "$t9",
        "$k0",
        "$k1",
        "$gp",
        "$sp",
        "$fp",
        "$ra",
    ];
    return new InstructionSet(
        32,
        formats,
        instructions,
        pseudoInstructions,
        abiNames,
        keywords,
        directives,
        true,
        `    la $a0, str
    li $v0, 4 #4 is the string print service number...
    syscall
    li $v0, 10 #...and 10 is the program termination service number!
    syscall
.data
str:    .asciiz "Hello, World!"`
    );
}
class MIPSRegisterFile {
    constructor(memorySize, abiNames) {
        this.physicalFile = [];
        this.modifiedRegisters = [];
        for (let i = 0; i < 32; i++) {
            this.physicalFile.push(0);
            this.modifiedRegisters.push(false);
        }
        this.memorySize = memorySize;
        this.physicalFile[29] = memorySize; //stack pointer
        this.abiNames = abiNames;
    }
    print() {
        console.log("Registers\n------");
        for (let i = 0; i < 32; i++) {
            console.log(
                "$" + i.toString(),
                this.abiNames[i],
                this.physicalFile[i].toString(),
                (this.physicalFile[i] >>> 0).toString(16).toUpperCase()
            );
        }
        console.log("------");
    }
    read(registerNumber) {
        if (registerNumber === 0) {
            return 0;
        } else {
            return this.physicalFile[registerNumber];
        }
    }
    write(registerNumber, value) {
        this.physicalFile[registerNumber] = value;
        this.modifiedRegisters[registerNumber] = true;
    }
    getRegisterCount() {
        return 32;
    }
    getModifiedRegisters() {
        let modReg = this.modifiedRegisters.slice();
        for (let i = 0; i < this.getRegisterCount(); i++) {
            this.modifiedRegisters[i] = false;
        }
        return modReg;
    }
    reset() {
        for (let i = 0; i < 32; i++) {
            this.physicalFile[i] = 0;
            this.modifiedRegisters[i] = false;
        }
        this.physicalFile[29] = this.memorySize;
    }
}
class MIPSCore extends Core {
    reset() {
        this.pc = 0;
        this.memory = [];
        for (let i = 0; i < this.memorySize; i++) {
            this.memory[i] = 0;
        }
        this.registerFile.reset();
    }
    fetch() {
        let arr = this.memcpy(this.pc >>> 0, 4);
        if (arr === null) {
            return `Attempting to fetch from illegal memory address @${this.pc}`;
        }
        this.pc += 4;
        this.fetched = Utils.catBytes(arr);
        return null;
    }
    constructor(memorySize, virtualOS, instructionSet) {
        super();
        this.virtualOSServiceRegister = 2;
        this.virtualOSArgumentVectorStart = 4;
        this.virtualOSArgumentVectorEnd = 7;
        this.instructionSet = instructionSet;
        this.pc = 0 >>> 0;
        this.memorySize = memorySize;
        this.virtualOS = virtualOS;
        this.registerFile = new MIPSRegisterFile(
            memorySize,
            instructionSet.abiNames
        );
        this.memory = new Array(memorySize);
        for (let i = 0; i < memorySize; i++) {
            this.memory[i] = 0;
        }
    }
}
Core.factory.ISAs["MIPS"] = {
    generator: MIPS,
    core: MIPSCore,
    options: [],
};
