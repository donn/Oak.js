/// <reference path="InstructionSet.ts"/>
/// <reference path="Utils.ts" />
/// <reference path="Assembler.ts" />
//The RISC-V Instruction Set Architecture, Version 2.1

function Oak_gen_RISCV(): InstructionSet {
    //Formats and Instructions
    let formats: Format[] = [];
    let instructions: Instruction[] = [];
    let pseudoInstructions: PseudoInstruction[] = [];

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
            core.pc = (core.registerFile.read(core.arguments[1]) + Utils.signExt(core.arguments[2], 12));
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
            core.registerFile.write(core.arguments[0], Utils.signExt(bytes[0], 8));
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
            core.registerFile.write(core.arguments[0], Utils.signExt(Utils.catBytes(bytes), 16));
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
            core.registerFile.write(core.arguments[0], Utils.catBytes(bytes));
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
            core.registerFile.write(core.arguments[0], Utils.catBytes(bytes));
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
            let bytes = [];
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
            let bytes = [];
            let value = core.registerFile.read(core.arguments[0]);
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
            let bytes = [];
            let value = core.registerFile.read(core.arguments[0]);
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
                let result = {
                    errorMessage: null,
                    value: null
                };

                let int = NaN;
                let labelLocation = labels.indexOf(text);
                if (labelLocation !== -1) {
                    int = addresses[labelLocation] - address + 4;
                }
                else {
                    let radix = 10 >>> 0;
                    let splice = false;
                    
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

                    let interpretable = text;
                    if (splice) {
                        interpretable = array.splice(2, array.length - 2).join("");
                    }
                    int = parseInt(interpretable, radix);
                }
                    
                if (isNaN(int)) {     
                    result.errorMessage = "Offset '" + text + "' is not a recognized label or literal.";
                    return result;
                }

                if (Utils.rangeCheck(int, 13)) {
                    let mangle = int & 2046; //mangle[10:1] = int[10:1];
                    mangle = mangle | ((int >>> 11) & 1); //mangle[0] = int[11]
                    mangle = mangle | ((int >>> 12) & 1) << 11; //mangle[11] = int[12];
                    result.value = mangle;
                    return result;
                }
                result.errorMessage = "The value of '" + text + "' is out of range.";
                return result;
            },
            function(value: number) {
                let unmangle = (value & 1) << 11; //unmangle[11]; = value[0];
                unmangle = unmangle | ((value >>> 11) << 12); //unmangle[12] = value[12];
                unmangle = unmangle | (value & 2046); //unmangle[10:1] = value[10:1];
                return unmangle;
            }
        )
    );


    let sbType = formats[formats.length - 1];

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
                let result = {
                    errorMessage: null,
                    value: null
                };

                let int = NaN;
                let labelLocation = labels.indexOf(text);
                if (labelLocation !== -1) {
                    int = addresses[labelLocation] - address + 4;
                }
                else {
                    let radix = 10 >>> 0;
                    let splice = false;
                    
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

                    let interpretable = text;
                    if (splice) {
                        interpretable = array.splice(2, array.length - 2).join("");
                    }
                    int = parseInt(interpretable, radix);
                }
                    
                if (isNaN(int)) {     
                    result.errorMessage = "Offset '" + text + "' is not a recognized label or literal.";
                    return result;
                }

                if (Utils.rangeCheck(int, 21)) {
                    let mangle = ((int >> 12) & 255); //mangle[7:0] = int[19:12] 
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
                let unmangle = ((value >> 8) & 1) << 11; //unmangle[11]; = value[8];
                unmangle = unmangle | (((value >>> 19) & 1) << 20); //unmangle[20] = value[19];
                unmangle = unmangle | (((value >>> 0) & 255) << 12); //unmangle[19:12] = value[7:0];
                unmangle = unmangle | (((value >>> 9) & 1023) << 1); //unmangle[10:1] = value[18:9];
                return unmangle;

            }
        )
    );

    let ujType = formats[formats.length - 1];

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

    let abiNames = ['zero', 'ra', 'sp', 'gp', 'tp', 't0', 't1', 't2', 's0', 's1', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 't3', 't4', 't5', 't6'];

    let keywords: string[][] = [];
        keywords[Keyword.directive] = ["\\."];
        keywords[Keyword.comment] = ["#"];
        keywords[Keyword.label] = ["\\:"];
        keywords[Keyword.stringMarker] = ["\\\""];
        keywords[Keyword.charMarker] = ["\\\'"];
        keywords[Keyword.register] = ["x"];

    let directives: Directive[] = [];
        directives["text"] = Directive.text;
        directives["data"] = Directive.data;
        directives["string"] = Directive.cString;
        directives["byte"] = Directive._8bit;
        directives["half"] = Directive._16bit;
        directives["word"] = Directive._32bit;

    return new InstructionSet("rv32i", 32, formats, instructions, pseudoInstructions, [".word", ".half", ".byte", ".string"], [4, 2, 1, 0], abiNames, process, null, null, keywords, directives);
}
let RISCV = Oak_gen_RISCV();

class RISCVRegisterFile implements RegisterFile {
    private memorySize: number;
    physicalFile: number[];
    abiNames: string[];
    modifiedRegisters: boolean[];

    print() {
        console.log("Registers\n------");
        for (let i = 0; i < 32; i++) {
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
        this.physicalFile[2] = this.memorySize;

    }

    constructor(memorySize: number, abiNames: string[]) {
        this.physicalFile = [];
        this.modifiedRegisters = [];
        for (let i = 0; i < 32; i++) {
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
        for (let i = 0; i < this.memorySize; i++) {
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

        this.fetched = Utils.catBytes(arr);
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
        for (let i = 0; i < memorySize; i++) {
            this.memory[i] = 0;
        }         
    }
}