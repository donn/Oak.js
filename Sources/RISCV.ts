/// <reference path="InstructionSet.ts"/>
/// <reference path="Utils.ts" />
//The RISC-V Instruction Set Architecture, Version 2.1

function Oak_gen_RISCV(): InstructionSet {
    //Formats and Instructions
    var formats: Format[] = [];
    var instructions: Instruction[] = [];
    var pseudoInstructions: PseudoInstruction[] = [];

    //R-Type
    formats.push (
        new Format (
            [
                new BitRange("funct7", 25, 7),
                new BitRange("rs2", 20, 5).parameterized(2, Parameter.register),
                new BitRange("rs1", 15, 5).parameterized(1, Parameter.register),
                new BitRange("funct3", 12, 3),
                new BitRange("rd", 7, 5).parameterized(0, Parameter.register),
                new BitRange("opcode", 0, 7)
            ],
            /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+)/,
            "@mnem @arg0, @arg1, @arg2"
        )
    );
    
    let rType = formats[formats.length - 1];

    instructions.push(new Instruction(
        "ADD",
        rType,
        ["opcode", "funct3", "funct7"],
        [0b0110011, 0b000, 0b0000000],
        function(core) {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) + core.registerFile.read(core.arguments[2]));core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "SUB",
        rType,
        ["opcode", "funct3", "funct7"],
        [0b0110011, 0b000, 0b0100000],
        function(core) {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) - core.registerFile.read(core.arguments[2]));core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "SLL",
        rType,
        ["opcode", "funct3", "funct7"],
        [0b0110011, 0b001, 0b0000000],
        function(core) {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) << core.registerFile.read(core.arguments[2]));core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "SLT",
        rType,
        ["opcode", "funct3", "funct7"],
        [0b0110011, 0b010, 0b0000000],
        function(core) {
            core.registerFile.write(core.arguments[0], (core.registerFile.read(core.arguments[1]) < core.registerFile.read(core.arguments[2]))? 1: 0);core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "SLTU",
        rType,
        ["opcode", "funct3", "funct7"],
        [0b0110011, 0b011, 0b0000000],
        function(core) {
            core.registerFile.write(core.arguments[0], ((core.registerFile.read(core.arguments[1]) >>> 0) < (core.registerFile.read(core.arguments[2]) >>> 0))? 1: 0);core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "XOR",
        rType,
        ["opcode", "funct3", "funct7"],
        [0b0110011, 0b100, 0b0000000],
        function(core) {
            //
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) ^ core.registerFile.read(core.arguments[2]));core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "SRL",
        rType,
        ["opcode", "funct3", "funct7"],
        [0b0110011, 0b101, 0b0000000],
        function(core) {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) >>> core.registerFile.read(core.arguments[2]));core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "SRA",
        rType,
        ["opcode", "funct3", "funct7"],
        [0b0110011, 0b101, 0b0100000],
        function(core) {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) >> core.registerFile.read(core.arguments[2]));core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "OR",
        rType,
        ["opcode", "funct3", "funct7"],
        [0b0110011, 0b110, 0b0000000],
        function(core) {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) | core.registerFile.read(core.arguments[2]));core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "AND",
        rType,
        ["opcode", "funct3", "funct7"],
        [0b0110011, 0b111, 0b0000000],
        function(core) {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) & core.registerFile.read(core.arguments[2]));core.pc += 4;
            return null;
        }
    ));

    //I-Type
    formats.push (
        new Format (
            [
                new BitRange("imm", 20, 12, null, true).parameterized(2, Parameter.immediate),
                new BitRange("rs1", 15, 5).parameterized(1, Parameter.register),
                new BitRange("funct3", 12, 3),
                new BitRange("rd", 7, 5).parameterized(0, Parameter.register),
                new BitRange("opcode", 0, 7)
            ],
            /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+),\s*(-?[a-zA-Z0-9_]+)/,
            "@mnem @arg0, @arg1, @arg2"
        )
    );

    let iType = formats[formats.length - 1];

    instructions.push(new Instruction(
        "JALR",
        iType,
        ["opcode", "funct3"],
        [0b1100111, 0b000],
        function(core) {
            core.registerFile.write(core.arguments[0], core.pc);
            core.pc = (core.registerFile.read(core.arguments[1]) + signExt(core.arguments[2], 12));
            return null;
        }
    ));

    instructions.push(new Instruction(
        "ADDI",
        iType,
        ["opcode", "funct3"],
        [0b0010011, 0b000],
        function(core) {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) + core.arguments[2]);
            core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "SLTI",
        iType,
        ["opcode", "funct3"],
        [0b0010011, 0b010],
        function(core) {
            core.registerFile.write(core.arguments[0], (core.registerFile.read(core.arguments[1]) < core.arguments[2])? 1 : 0);
            core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "SLTIU",
        iType,
        ["opcode", "funct3"],
        [0b0010011, 0b011],
        function(core) {
            core.registerFile.write(core.arguments[0], ((core.registerFile.read(core.arguments[1]) >>> 0) < (core.arguments[2] >>> 0)? 1 : 0));
            core.pc += 4;
            return null;
        },
        false
    ));

    instructions.push(new Instruction(
        "XORI",
        iType,
        ["opcode", "funct3"],
        [0b0010011, 0b100],
        function(core) {
            core.registerFile.write(core.arguments[0], (core.registerFile.read(core.arguments[1]) >>> 0) ^ core.arguments[2]);
            core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "ORI",
        iType,
        ["opcode", "funct3"],
        [0b0010011, 0b110],
        function(core) {
            core.registerFile.write(core.arguments[0], (core.registerFile.read(core.arguments[1]) >>> 0) | core.arguments[2]);
            core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "ANDI",
        iType,
        ["opcode", "funct3"],
        [0b0010011, 0b111],
        function(core) {
            core.registerFile.write(core.arguments[0], ((core.registerFile.read(core.arguments[1]) >>> 0) & core.arguments[2]));
            core.pc += 4;
            return null;
        }
    ));

    //IL Subtype
    formats.push (
        new Format (
            [
                new BitRange("imm", 20, 12, null, true).parameterized(1, Parameter.immediate),
                new BitRange("rs1", 15, 5).parameterized(2, Parameter.register),
                new BitRange("funct3", 12, 3),
                new BitRange("rd", 7, 5).parameterized(0, Parameter.register),
                new BitRange("opcode", 0, 7)
            ],
            /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*(-?0?[boxd]?[0-9A-F]+)\s*\(\s*([A-Za-z0-9]+)\s*\)/,
            "@mnem @arg0, @arg2(@arg1)"
        )
    );

    let ilSubtype = formats[formats.length - 1];

    instructions.push(new Instruction(
        "LB",
        ilSubtype,
        ["opcode", "funct3"],
        [0b0000011, 0b000],
        function(core) {
            let bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 1);
            if (bytes === null) {
                return "Illegal memory access.";
            }
            core.registerFile.write(core.arguments[0], signExt(bytes[0], 8));
            core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "LH",
        ilSubtype,
        ["opcode", "funct3"],
        [0b0000011, 0b001],
        function(core) {
            let bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 2);
            if (bytes === null) {
                return "Illegal memory access.";
            }
            core.registerFile.write(core.arguments[0], signExt(catBytes(bytes), 16));
            core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "LW",
        ilSubtype,
        ["opcode", "funct3"],
        [0b0000011, 0b010],
        function(core) {
            let bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 4);
            if (bytes === null) {
                return "Illegal memory access.";
            }
            core.registerFile.write(core.arguments[0], catBytes(bytes));
            core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "LBU",
        ilSubtype,
        ["opcode", "funct3"],
        [0b0000011, 0b100],
        function(core) {
            let bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 1);
            if (bytes === null) {
                return "Illegal memory access.";
            }
            core.registerFile.write(core.arguments[0], bytes[0]);
            core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "LHU",
        ilSubtype,
        ["opcode", "funct3"],
        [0b0000011, 0b101],
        function(core) {
            let bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 2);
            if (bytes === null) {
                return "Illegal memory access.";
            }
            core.registerFile.write(core.arguments[0], catBytes(bytes));
            core.pc += 4;
            return null;
        }
    ));

    // IS Subtype
    formats.push (
        new Format (
            [
                new BitRange("funct7", 25, 7),
                new BitRange("shamt", 20, 5).parameterized(2, Parameter.immediate),
                new BitRange("rs1", 15, 5).parameterized(1, Parameter.register),
                new BitRange("funct3", 12, 3),
                new BitRange("rd", 7, 5).parameterized(0, Parameter.register),
                new BitRange("opcode", 0, 7)
            ],
            /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+),\s*(-?0?[boxd]?[0-9A-F]+)/,
            "@mnem @arg0, @arg1, @arg2"
        )
    );

    let isSubtype = formats[formats.length - 1];

    instructions.push(new Instruction(
        "SLLI",
        isSubtype,
        ["opcode", "funct3", "funct7"],
        [0b0010011, 0b001, 0b0000000],
        function(core) {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) << core.arguments[2]);
            core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "SRLI",
        isSubtype,
        ["opcode", "funct3", "funct7"],
        [0b0010011, 0b101, 0b0000000],
        function(core) {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) >>> core.arguments[2]);
            core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "SRAI",
        isSubtype,
        ["opcode", "funct3", "funct7"],
        [0b0010011, 0b101, 0b0100000],
        function(core) {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) >> core.arguments[2]);
            core.pc += 4;
            return null;
        }
    ));


    //S-Type
    formats.push (
        new Format (
            [
                new BitRange("imm", 25, 7, null, true).parameterized(1, Parameter.immediate).limited(12, 5, 11),
                new BitRange("rs2", 20, 5).parameterized(0, Parameter.register),
                new BitRange("rs1", 15, 5).parameterized(2, Parameter.register),
                new BitRange("funct3", 12, 3),
                new BitRange("imm", 7, 5, null, true).parameterized(1, Parameter.immediate).limited(12, 0, 4),
                new BitRange("opcode", 0, 7)
            ],
            /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*(-?0?[boxd]?[0-9A-F]+)\(\s*([A-Za-z0-9]+)\s*\)/,
            "@mnem @arg0, @arg2(@arg1)"
        )
    );

    let sType = formats[formats.length - 1];

    instructions.push(new Instruction(
        "SB",
        sType,
        ["opcode", "funct3"],
        [0b0100011, 0b000],
        function(core) {
            var bytes = [];
            bytes.push(core.registerFile.read(core.arguments[0]) & 255);
            if(core.memset(core.registerFile.read(core.arguments[2]) + core.arguments[1], bytes)) {
                core.pc += 4;
                return null;
            }
            return "Illegal memory access.";
        }
    ));

    instructions.push(new Instruction(
        "SH",
        sType,
        ["opcode", "funct3"],
        [0b0100011, 0b001],
        function(core) {
            var bytes = [];
            var value = core.registerFile.read(core.arguments[0]);
            bytes.push(value & 255);
            value = value >>> 8;
            bytes.push(value & 255);
            if(core.memset(core.registerFile.read(core.arguments[2]) + core.arguments[1], bytes)) {
                core.pc += 4;
                return null;
            }
            return "Illegal memory access.";
        }
    ));

    instructions.push(new Instruction(
        "SW",
        sType,
        ["opcode", "funct3"],
        [0b0100011, 0b010],
        function(core) {
            var bytes = [];
            var value = core.registerFile.read(core.arguments[0]);
            bytes.push(value & 255);
            value = value >>> 8;
            bytes.push(value & 255);
            value = value >>> 8;
            bytes.push(value & 255);
            value = value >>> 8;
            bytes.push(value & 255);
            if(core.memset(core.registerFile.read(core.arguments[2]) + core.arguments[1], bytes)) {
                core.pc += 4;
                return null;
            }
            return "Illegal memory access.";
        }
    ));



    //U-Type
    formats.push (
        new Format (
            [
                new BitRange("imm", 12, 20, null, true).parameterized(1, Parameter.immediate),
                new BitRange("rd", 7, 5).parameterized(0, Parameter.offset),
                new BitRange("opcode", 0, 7)
            ],
            /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([a-zA-Z0-9_]+)/,
            "@mnem @arg0, @arg1"
        )
    );

    let uType = formats[formats.length - 1];

    instructions.push(new Instruction(
        "LUI",
        uType,
        ["opcode"],
        [0b0110111],
        function(core) {
            core.registerFile.write(core.arguments[0], (core.arguments[1] << 12));
            core.pc += 4;
            return null;
        }
    ));

    instructions.push(new Instruction(
        "AUIPC",
        uType,
        ["opcode"],
        [0b0010111],
        function(core) {
            core.registerFile.write(core.arguments[0], (core.arguments[1] << 12) + core.pc);
            core.pc += 4;
            return null;
        }
    ));

    //SB-Type
    formats.push (
        new Format (
            [
                new BitRange("imm", 25, 7, null, true).parameterized(2, Parameter.special).limited(13, 5, 11),
                new BitRange("rs2", 20, 5).parameterized(1, Parameter.register),
                new BitRange("rs1", 15, 5).parameterized(0, Parameter.register),
                new BitRange("funct3", 12, 3),
                new BitRange("imm", 7, 5, null, true).parameterized(2, Parameter.special).limited(13, 0, 4),
                new BitRange("opcode", 0, 7)
            ],
            /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+)\s*,\s*([a-zA-Z0-9_]+)/,
            "@mnem @arg0, @arg1, @arg2",
            function(address: number, text: string, bits: number, labels: string[], addresses: number[]) {
                let array = text.split(""); //Character View
                var result = {
                    errorMessage: null,
                    value: null
                };

                var int = NaN;
                let labelLocation = labels.indexOf(text);
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
            },
            function(value: number) {
                var unmangle = (value & 1) << 11; //unmangle[11]; = value[0];
                unmangle = unmangle | ((value >>> 11) << 12); //unmangle[12] = value[12];
                unmangle = unmangle | (value & 2046); //unmangle[10:1] = value[10:1];
                return unmangle;
            }
        )
    );


    let sbType = formats[formats.length - 1];


    // var test = 24;
    // console.log(test.toString(2));
    // var mangled = sbType.processSpecialParameter(0, test.toString(), 0, [], []);
    // console.log(mangled.errorMessage);
    // console.log(mangled.value.toString(2));
    // console.log(sbType.decodeSpecialParameter(mangled.value).toString(2));

    instructions.push(new Instruction(
        "BEQ",
        sbType,
        ["opcode", "funct3"],
        [0b1100011, 0b000],
        function(core) {
            if (core.registerFile.read(core.arguments[0]) === core.registerFile.read(core.arguments[1])) {
                core.pc += core.arguments[2];
            }
            return null;
        }
    ));

    instructions.push(new Instruction(
        "BNE",
        sbType,
        ["opcode", "funct3"],
        [0b1100011, 0b001],
        function(core) {
            if (core.registerFile.read(core.arguments[0]) !== core.registerFile.read(core.arguments[1])) {
                core.pc += core.arguments[2];
            }
            return null;
        }
    ));

    instructions.push(new Instruction(
        "BLT",
        sbType,
        ["opcode", "funct3"],
        [0b1100011, 0b100],
        function(core) {
            if (core.registerFile.read(core.arguments[0]) < core.registerFile.read(core.arguments[1])) {
                core.pc += core.arguments[2];
            }
            return null;
        }
    ));

    instructions.push(new Instruction(
        "BGE",
        sbType,
        ["opcode", "funct3"],
        [0b1100011, 0b101],
        function(core) {
            if (core.registerFile.read(core.arguments[0]) >= core.registerFile.read(core.arguments[1])) {
                core.pc += core.arguments[2];
            }
            return null;
        }
    ));

    instructions.push(new Instruction(
        "BLTU",
        sbType,
        ["opcode", "funct3"],
        [0b1100011, 0b110],
        function(core) {
            if ((core.registerFile.read(core.arguments[0]) >>> 0) < (core.registerFile.read(core.arguments[1]) >>> 0)) {
                core.pc += core.arguments[2];
            }
            return null;
        }
    ));

    instructions.push(new Instruction(
        "BGEU",
        sbType,
        ["opcode", "funct3"],
        [0b1100011, 0b111],
        function(core) {
            if ((core.registerFile.read(core.arguments[0]) >>> 0) >= (core.registerFile.read(core.arguments[1]) >>> 0)) {
                core.pc += core.arguments[2];
            }
            return null;
        }
    ));

    //UJ-Type
    formats.push (
        new Format (
            [
                new BitRange("imm", 12, 20, null, true).parameterized(1, Parameter.special).limited(21),
                new BitRange("rd", 7, 5).parameterized(0, Parameter.register),
                new BitRange("opcode", 0, 7)
            ],
            /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([a-zA-Z0-9_]+)/,
            "@mnem @arg0, @arg1",
            function(address: number, text: string, bits: number, labels: string[], addresses: number[]) {
                let array = text.split(""); //Character View
                var result = {
                    errorMessage: null,
                    value: null
                };

                var int = NaN;
                let labelLocation = labels.indexOf(text);
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
                    mangle = mangle | (((int >> 20) & 1) << 19 ); //mangle[19] = int[20];
                    result.value = mangle;
                    return result;
                }
                result.errorMessage = "The value of '" + text + "' (" + int.toString() + ")is out of range.";
                return result;
            },
            function(value: number) {
                var unmangle = ((value >> 8) & 1) << 11; //unmangle[11]; = value[8];
                unmangle = unmangle | (((value >>> 19) & 1) << 20); //unmangle[20] = value[19];
                unmangle = unmangle | (((value >>> 0) & 255) << 12); //unmangle[19:12] = value[7:0];
                unmangle = unmangle | (((value >>> 9) & 1023) << 1); //unmangle[10:1] = value[18:9];
                return unmangle;

            }
        )
    );

    let ujType = formats[formats.length - 1];

    // let test = parseInt("4", 16);
    // console.log("before", test.toString(2));
    // let op = ujType.processSpecialParameter(0, test.toString(), 0, [], []);
    // console.log(op.value.toString(2));
    // console.log("after", ujType.decodeSpecialParameter(op.value).toString(2));

    instructions.push(new Instruction(
        "JAL",
        ujType,
        ["opcode"],
        [0b1101111],
        function(core) {
            core.registerFile.write(core.arguments[0], core.pc);
            //console.log(core.pc);
            core.pc += core.arguments[1];
            //console.log(core.arguments[1]);
            return null;
        }
    ));

    //System Type
    //All-Const Type
    formats.push (
        new Format (
            [
                new BitRange("const", 0, 32)
            ],
            /[a-zA-Z]+/,
            "@mnem"
        )
    );

    let allConstSubtype = formats[formats.length - 1];

    instructions.push (
        new Instruction (
            "ECALL",
            allConstSubtype,
            ["const"],
            [0b00000000000000000000000001110011],
            function(core) {
                core.ecall();
                core.pc += 4;
                return null;
            }
            
        )
    )

    //PseudoInstructions
    //This is a far from ideal implementation of pseudoinstructions and is only there for demo purposes.
    //MV
    formats.push (
        new Format (
            [
                new BitRange("funct7", 25, 7),
                new BitRange("rs2", 20, 5).parameterized(1, Parameter.register),
                new BitRange("rs1", 15, 5),
                new BitRange("funct3", 12, 3),
                new BitRange("rd", 7, 5).parameterized(0, Parameter.register),
                new BitRange("opcode", 0, 7)
            ],
            /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*([A-Za-z0-9]+)/,
            "@mnem @arg0, @arg1"
        )
    );

    let mvPseudo = formats[formats.length - 1];

    instructions.push(new Instruction(
        "MV",
        mvPseudo,
        ["opcode", "funct3", "rs1", "funct7"],
        [0b0110011, 0b000, parseInt("00000"), 0b0000000],
        function(core) {
            return null; //Captured by and
        }
    ));

    //LI
    formats.push (
        new Format (
            [
                new BitRange("imm", 20, 12, null, true).parameterized(1, Parameter.register),
                new BitRange("rs1", 15, 5),
                new BitRange("funct3", 12, 3),
                new BitRange("rd", 7, 5).parameterized(0, Parameter.register),
                new BitRange("opcode", 0, 7)
            ],
            /[a-zA-Z]+\s*([A-Za-z0-9]+)\s*,\s*(-?[a-zA-Z0-9_]+)/,
            "@mnem @arg0, @arg1"
        )
    );

    let liPseudo = formats[formats.length - 1];

    instructions.push(new Instruction(
        "LI",
        liPseudo,
        ["opcode", "funct3", "rs1"],
        [0b0010011, 0b000, 0b00000],
        function(core) {
            return null; //Captured by andi
        }
    ));

    instructions.push(new Instruction(
        "LA",
        liPseudo,
        ["opcode", "funct3", "rs1"],
        [0b0010011, 0b000, 0b00000],
        function(core) {
            return null; //Captured by andi
        }
    ));

    //JR pseudo
    formats.push (
        new Format (
            [
                new BitRange("imm", 20, 12, null, true),
                new BitRange("rs1", 15, 5).parameterized(0, Parameter.register),
                new BitRange("funct3", 12, 3),
                new BitRange("rd", 7, 5),
                new BitRange("opcode", 0, 7)
            ],
            /[a-zA-Z]+\s*([A-Za-z0-9]+)/,
            "@mnem @arg0"
        )
    );

    let jrPseudo = formats[formats.length - 1];

    instructions.push(new Instruction(
        "JR",
        jrPseudo,
        ["opcode", "rd", "funct3", "imm"],
        [0b1100111, 0b00000, 0b000, 0b000000000000],
        function(core) {
            return null; //captured by jalr
        }
    ));
    
    //Scall, Syscall both as PseudoInstructions

    instructions.push (
        new Instruction (
            "SCALL",
            allConstSubtype,
            ["const"],
            [0b00000000000000000000000001110011],
            function(core) {
                return null; //captured by ecall
            }
            
        )
    )

    instructions.push (
        new Instruction (
            "SYSCALL",
            allConstSubtype,
            ["const"],
            [0b00000000000000000000000001110011],
            function(core) {
                return null; //captured by ecall
            }
            
        )
    )
    

    /*
        ARGUMENT PROCESSOR
        Does what it says on the tin. It needs quite a bit of information, but otherwise successfully interprets
        any RISC-V argument.
    */
    let process = function(address: number, text: string, type: Parameter, bits: number, labels: string[], addresses: number[]) {
        let array = text.split(""); //Character View
        var result = {
            errorMessage: null,
            value: null
        };
        switch(type) {
        case Parameter.register:                
                let registerNo = parseInt(text);                    
                if (isNaN(registerNo)) {
                    let index = this.abiNames.indexOf(text);
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
            let labelIndex = labels.indexOf(text);
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

                int = parseInt(interpretable, radix);
            }

            if (isNaN(int)) {     
                result.errorMessage = "Immediate '" + text + "' is not a recognized label, literal or character.";
                return result;
            }

            console.log(text, int, bits);

            if (rangeCheck(int, bits)) {
                result.value = int;
                return result;
            }
            result.errorMessage = "The value of '" + text + "' is out of range.";
            return result;


        case Parameter.offset:
            var int = NaN;
            let labelLocation = labels.indexOf(text);
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
    }

    /*
        TOKENIZER

        This is the assembler's "first pass" -it does
        primtive lexical analysis and creates an
        address table.
    */
    let tokenize = function(file: string) {
        var result = {
            errorMessage: null,
            labels: [],
            addresses: [],
            lines: [],
            pc: [],
        };

        var address = 0;
        var text = true;
        var lines = file.split("\n");

        for (var i = 0; i < lines.length; i++) {  
            
            var labelExtractor = /\s*(([A-Za-z_][A-Za-z0-9_]*):)?(.*)?/.exec(lines[i]);
            if (labelExtractor == null) {
                console.log("Congratulations, you broke regular expressions.")
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
                            result.errorMessage = "Line " + i + ": Unterminated string.";
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
            let directives = lines[i].split(/\s+/).filter(function(value: string){ return value.length > 0 });
            
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
                    //Do nothing.
                }
                else if (directiveChars[0] === ".") {                        
                    result.errorMessage = "Line " + i + ": " + directives[0] + " cannot be in the text section. Aborting.";
                    return result;
                }
                else {
                    let instructionIndex = this.mnemonicSearch(directives[0].toUpperCase());
                    if (instructionIndex === -1) {
                        let pseudoInstructionIndex = this.pseudoMnemonicSearch(directives[0].toUpperCase());
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
                    //Do nothing.
                }
                else if (this.dataDirectives.indexOf(directives[0]) !== -1) {
                    let index = this.dataDirectives.indexOf(directives[0]);
                    if (this.dataDirectiveSizes[index] !== 0) {
                        let array = directives.join(" ").split(directives[i]).join("").split(",");
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
                                let array = match[1].split("");
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
        This is where the fun begins.
    */
    let assemble = function(nester: number = null, address: number, lines: string[], labels: string[], addresses: number[]) {
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
            let directives = lines[i].split(/\s+/).filter(function(value: string){ return value.length > 0 });
            
            //Check if whitespace
            if (directives.length === 0) {
                continue;
            }
            
            //Calculate lengths
            if (text) {
                if (directives[0] === ".data") {
                    text = false;
                }
                else if (directives[0] === ".text") {
                    //\_(ツ)_/
                }
                else {
                    address += 4;
                    let instructionIndex = this.mnemonicSearch(directives[0].toUpperCase());

                    if (instructionIndex === -1) {
                        result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": Instruction " + directives[0] + " not found.";
                        return result;
                    }
                    let instruction = this.instructions[instructionIndex];
                    let format = instruction.format;
                    let bitRanges = format.ranges;
                    let regex = format.regex;
                    let params = format.parameters;
                    let paramTypes = format.parameterTypes;                        
                    var machineCode = instruction.template();

                    var match = regex.exec(lines[i]);
                    if (match == null) {
                        result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": Argument format for " + directives[0] + " violated.";
                        return result;
                    }
                    var args = match.splice(1, params.length);                      

                    for (var j = 0; j < bitRanges.length; j++) {
                        if (bitRanges[j].parameter != null) {
                            var startBit = 0;
                            var endBit: number = null;
                            var bits = bitRanges[j].bits;
                            var field = bitRanges[j].field;

                            var limits = /([A-za-z]+)\s*\[\s*(\d+)\s*:\s*(\d+)\s*\]/.exec(bitRanges[j].field);

                            if (limits != null) {
                                field = limits[1];
                                bits = bitRanges[j].limitlessBits;
                            }

                            let index = format.fieldParameterIndex(field);

                            var register = 0;

                            if(paramTypes[index] !== Parameter.special) {
                                let processed = this.processParameter(address, args[index], paramTypes[index], bits, labels, addresses);
                                if (processed.errorMessage !== null) {
                                    result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": " + processed.errorMessage;
                                    return result;                            
                                }
                                register = processed.value;
                            }
                            else {
                                let processed = instruction.format.processSpecialParameter(address, args[index], bits, labels, addresses);
                                if (processed.errorMessage !== null) {
                                    result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": " + processed.errorMessage;
                                    return result;                            
                                }
                                register = processed.value;
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
                    let index = this.dataDirectives.indexOf(directives[0]);
                    
                    if (this.dataDirectiveSizes[index] !== 0) {
                        let size = this.dataDirectiveSizes[index];
                        let array = lines[i].split("' '").join("'$OAK_SPACE_TEMP'").split(directives[0]).join("").split(" ").join("").split("'$OAK_SPACE_TEMP'").join("' '").split(",");
                        for (var j = 0; j < array.length; j++) {
                            var processed = this.processParameter(address, array[j], Parameter.immediate, size * 8, labels, addresses);
                            if (processed.errorMessage !== null) {
                                result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": " + processed.errorMessage;
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
                            let characters = stringMatch[1].split("");
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
                                                result.machineCode.push(characters[j].charCodeAt(0))                                                             
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

    let abiNames = ['zero', 'ra', 'sp', 'gp', 'tp', 't0', 't1', 't2', 's0', 's1', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 't3', 't4', 't5', 't6'];

    return new InstructionSet("rv32i", 32, formats, instructions, pseudoInstructions, [".word", ".half", ".byte", ".string"], [4, 2, 1, 0], abiNames, process, tokenize, assemble);
}
let RISCV = Oak_gen_RISCV();

class RISCVRegisterFile implements RegisterFile {
    private memorySize: number;
    physicalFile: number[];
    abiNames: string[];
    modifiedRegisters: boolean[];

    print() {
        console.log("Registers\n------");
        for (var i = 0; i < 32; i++) {
            console.log("x" + i.toString(), this.abiNames[i], this.physicalFile[i].toString(), (this.physicalFile[i] >>> 0).toString(16).toUpperCase());
        }
        console.log("------");
    }
    
    read(registerNumber: number) {
        if (registerNumber === 0) {
            return 0;
        }
        else {
            return this.physicalFile[registerNumber];
        }
    }

    write(registerNumber: number, value: number) {
        this.physicalFile[registerNumber] = value;
        this.modifiedRegisters[registerNumber] = true;
    }

    getRegisterCount():number {
        return 32;
    }


    getModifiedRegisters():boolean[] {
        var modReg = this.modifiedRegisters.slice();
        for (var i = 0; i < this.getRegisterCount(); i++) {
            this.modifiedRegisters[i] = false;
        }
        return modReg;
    }

    reset() {
        for (var i = 0; i < 32; i++) {
            this.physicalFile[i] = 0;
            this.modifiedRegisters[i] = false;
        }
        this.physicalFile[2] = this.memorySize;

    }

    constructor(memorySize: number, abiNames: string[]) {
        this.physicalFile = [];
        this.modifiedRegisters = [];
        for (var i = 0; i < 32; i++) {
            this.physicalFile.push(0);
            this.modifiedRegisters.push(false);
        }
        this.memorySize = memorySize;
        this.physicalFile[2] = memorySize; //stack pointer
        this.abiNames = abiNames;
    }
};

class RISCVCore extends Core {
    reset() {
        this.pc = 0;
        this.memory = [];
        for (var i = 0; i < this.memorySize; i++) {
            this.memory[i] = 0;
        }
        this.registerFile.reset();
    }

    fetch(): string {
        if (this.pc < 0) {
            return "Fetch Error: Negative program counter.";
        }
        let arr = this.memcpy(this.pc, 4);
        if (arr == null) {
            return "Fetch Error: Illegal memory access.";
        }

        this.fetched = catBytes(arr);
        return null;
    }

    constructor(memorySize: number, ecall: () => void, instructionCallback: (data: string) => void) {
        super();
        this.defaultEcallRegType     = 17;
        this.defaultEcallRegArg      = 10;
        this.aceStyle = "ace/mode/riscv";
        this.defaultCode = "    la a0, str\n    li a7, 4 #4 is the string print service number...\n    ecall\n    li a7, 10 #...and 10 is the program termination service number!\n    ecall\n.data\nstr:\    .string \"Hello, World!\"";
        this.defaultMachineCode = "13 05 40 01 93 08 40 00 73 00 00 00 93 08 A0 00 73 00 00 00 48 65 6C 6C 6F 2C 20 57 6F 72 6C 64 21 00 ";
        this.instructionSet = RISCV;
        this.pc = 0 >>> 0;
        this.memorySize = memorySize;
        this.ecall = ecall;
        this.instructionCallback = instructionCallback;
        this.registerFile = new RISCVRegisterFile(memorySize, RISCV.abiNames);
        
        this.memory = new Array(memorySize);
        for (var i = 0; i < memorySize; i++) {
            this.memory[i] = 0;
        }         
    }
}