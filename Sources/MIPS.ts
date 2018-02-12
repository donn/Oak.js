/// <reference path="InstructionSet.ts"/>
/// <reference path="Utils.ts" />
//The MIPS Instruction Set Architecture

function Oak_gen_MIPS(): InstructionSet
{
    //Formats and Instructions
    var formats: Format[] = [];
    var instructions: Instruction[] = [];
    var pseudoInstructions: PseudoInstruction[] = [];

    //R-Type
    formats.push
    (
        new Format
        (
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5, 1),
                new BitRange("rt", 16, 5, 2),
                new BitRange("rd", 11, 5, 0),
                new BitRange("shamt", 6, 5, null, 0),
                new BitRange("funct", 0, 6)
            ],
            ["rd", "rt", "rs"],
            [Parameter.register, Parameter.register, Parameter.register],
            /[a-zA-Z]+\s*(\$[A-Za-z0-9]+)\s*,\s*(\$[A-Za-z0-9]+)\s*,\s*(\$[A-Za-z0-9]+)/,
            "@mnem @arg, @arg, @arg"
        )
    );

    let rType = formats[formats.length - 1];

    instructions.push
    (
        new Instruction
        (
            "ADD",
            rType,
            ["opcode", "funct"],
            [0x0, 0x20],
            function(core)
            {
                core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) + core.registerFile.read(core.arguments[2]));
                return null;
            }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "ADDU",
            rType,
            ["opcode", "funct"],
            [0x0, 0x21],
            function(core)
            {
                core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) + core.registerFile.read(core.arguments[2]));
                return null;
            }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "SUB",
            rType,
            ["opcode", "funct"],
            [0x0, 0x22],
            function(core)
            {
                core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) - core.registerFile.read(core.arguments[2]));
                return null;
            }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "SUBU",
            rType,
            ["opcode", "funct"],
            [0x0, 0x23],
            function(core)
            {
                core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) - core.registerFile.read(core.arguments[2]));
                return null;
            }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "AND",
            rType,
            ["opcode", "funct"],
            [0x0, 0x24],
            function(core)
            {
                core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) & core.registerFile.read(core.arguments[2]));
                return null;
            }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "OR",
            rType,
            ["opcode", "funct"],
            [0x0, 0x25],
            function(core)
            {
                core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) | core.registerFile.read(core.arguments[2]));
                return null;
            }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "NOR",
            rType,
            ["opcode", "funct"],
            [0x0, 0x27],
            function(core)
            {
                core.registerFile.write(core.arguments[0], ~(core.registerFile.read(core.arguments[1]) | core.registerFile.read(core.arguments[2])));
                return null;
            }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "XOR",
            rType,
            ["opcode", "funct"],
            [0x0, 0x26],
            function(core)
            {
                core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) ^ core.registerFile.read(core.arguments[2]));
                return null;
            }
        )
    );

    instructions.push(new Instruction(
       "SLT",
       rType,
       ["opcode","funct"],
       [0x0,0x2A],
       function(core)
       {
           core.registerFile.write(core.arguments[0], (core.registerFile.read(core.arguments[1]) < core.registerFile.read(core.arguments[2]))? 1: 0);
           return null;
       }
    ));

    instructions.push(new Instruction(
        "SLLV",
        rType,
        ["opcode","funct"],
        [0x0,0x04],
        function(core)
        {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) << core.registerFile.read(core.arguments[2]));
                return null;
        }
    ));

    instructions.push(new Instruction(
        "SRLV",
        rType,
        ["opcode","funct"],
        [0x0,0x06],
        function(core)
        {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) >>> core.registerFile.read(core.arguments[2]));
            return null;
        }
    ));
    
    instructions.push(new Instruction(
        "SRAV",
        rType,
        ["opcode","funct"],
        [0x0, 0x07],
        function(core)
        {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) >> core.registerFile.read(core.arguments[2]));
            return null;
        }
    ));



    //R-Jump Subtype
    formats.push
    (
        new Format
        (
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5, 0),
                new BitRange("rt", 16, 5, null, 0),
                new BitRange("rd", 11, 5, null, 0),
                new BitRange("shamt", 6, 5, null, 0),
                new BitRange("funct", 0, 6)
            ],
            ["rs"],
            [Parameter.register],
            /[a-zA-Z]+\s*(\$[A-Za-z0-9]+)/,
            "@mnem @arg"
        )
    );

    let rjSubtype = formats[formats.length - 1];

    instructions.push(new Instruction(
        "JR",
        rjSubtype,
        ["opcode","funct"],
        [0x0, 0x08],
        function(core)
        {
            core.pc = core.registerFile.read(core.arguments[0]);
            return null;
        }
    ));

    //R-Shift Subtype
    formats.push
    (
        new Format
        (
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5, null, 0),
                new BitRange("rt", 16, 5, 1),
                new BitRange("rd", 11, 5, 0),
                new BitRange("shamt", 6, 5, 2),
                new BitRange("funct", 0, 6)
            ],
            ["rd", "rt", "shamt"],
            [Parameter.register, Parameter.register, Parameter.immediate],
            /[a-zA-Z]+\s*(\$[A-Za-z0-9]+)\s*,\s*(\$[A-Za-z0-9]+)\s*,\s*([0-9]+)/,
            "@mnem @arg, @arg, @arg"
        )
    );

    let rsSubtype = formats[formats.length - 1];

    instructions.push(new Instruction(
        "SLL",
        rsSubtype,
        ["opcode","funct"],
        [0x0,0x00],
        function(core)
        {
            core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) << core.arguments[2]);
                return null;
        }
    ));

    instructions.push(new Instruction(
        "SRL",
        rsSubtype,
        ["opcode","funct"],
        [0x0,0x02],
        function(core)
        {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) >>> core.arguments[2]);
            return null;
        }
    ));

    instructions.push(new Instruction(
        "SRA",
        rsSubtype,
        ["opcode","funct"],
        [0x0,0x02],
        function(core)
        {
        core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) >> core.arguments[2]);
            return null;
        }
    ));

    //R-Constant Subtype
    formats.push
    (
        new Format
        (
            [
                new BitRange("funct", 0, 32)
            ],
            [],
            [],
            /[a-zA-Z]+/,
            "@mnem"
        )
    );

    let rcSubtype = formats[formats.length - 1];

    instructions.push
    (
        new Instruction
        (
            "SYSCALL",
            rcSubtype,
            ["funct"],
            [0xC],
            function(core)
            {
                core.ecall();
                return null;
            }
        )
    );

    //I-Type
    formats.push
    (
        new Format
        (
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5, 1),
                new BitRange("rt", 16, 5, 0),
                new BitRange("imm", 0, 16, 2)
            ],
            ["rt", "rs", "imm"],
            [Parameter.register, Parameter.register, Parameter.immediate],
            /[a-zA-Z]+\s*(\$[A-Za-z0-9]+)\s*,\s*(\$[A-Za-z0-9]+)\s*,\s*(-?[a-zA-Z0-9_]+)/,
            "@mnem @arg, @arg, @arg"
        )
    );


    let iType = formats[formats.length - 1];

    //I-type instructions
    instructions.push
    (
        new Instruction
        (
            "ADDI",
            iType,
            ["opcode"],
            [0x8],
            function(core)
            {
                core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) + core.arguments[2]);
                return null;
            }
        )

    );

    instructions.push
    (
        new Instruction
        (
            "ADDIU",
            iType,
            ["opcode"],
            [0x9],
            function(core)
            {
                core.registerFile.write(core.arguments[0], core.registerFile.read(core.arguments[1]) + core.arguments[2]);
                return null;
            }
        )

    );

    instructions.push
    (
        new Instruction
        (
            "SLTI",
            iType,
            ["opcode"],
            [0x0A],
            function(core)
            {
                core.registerFile.write(core.arguments[0], (core.registerFile.read(core.arguments[1]) < core.arguments[2])? 1 : 0);
                return null;
            }
        )

    );

    instructions.push
    (
        new Instruction
        (
            "SLTIU",
            iType,
            ["opcode"],
            [0x0B],
            function(core)
            {
                core.registerFile.write(core.arguments[0], (core.registerFile.read(core.arguments[1]) < core.arguments[2])? 1 : 0);
                return null;
            }
        )

    );

    instructions.push
    (
        new Instruction
        (
            "ANDI",
            iType,
            ["opcode"],
            [0x0C],
            function(core)
            {
                core.registerFile.write(core.arguments[0], ((core.registerFile.read(core.arguments[1]) >>> 0) & core.arguments[2]));
                return null;
            }
        )

    );

    instructions.push
    (
        new Instruction
        (
            "ORI",
            iType,
            ["opcode"],
            [0x0D],
            function(core)
            {
                    core.registerFile.write(core.arguments[0], (core.registerFile.read(core.arguments[1]) >>> 0) | core.arguments[2]);
                    return null;
            }
        )

    );

    

    instructions.push
    (
        new Instruction
        (
            "XORI",
            iType,
            ["opcode"],
            [0x0E],
            function(core)
            {
                core.registerFile.write(core.arguments[0], (core.registerFile.read(core.arguments[1]) >>> 0) ^ core.arguments[2]);
                return null;
            }
        )

    );

    //I-Branch Subtype
    formats.push
    (
        new Format
        (
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5, 0),
                new BitRange("rt", 16, 5, 1),
                new BitRange("imm", 0, 16, 2)
            ],
            ["rt", "rs", "imm"],
            [Parameter.register, Parameter.register, Parameter.special],
            /[a-zA-Z]+\s*(\$[A-Za-z0-9]+)\s*,\s*(\$[A-Za-z0-9]+)\s*,\s*(-?[a-zA-Z0-9_]+)/,
            "@mnem @arg, @arg, @arg",
            function(address: number, text: string, bits: number, labels: string[], addresses: number[])
            {
                let array = text.split(""); //Character View
                var result =
                {
                    errorMessage: null,
                    value: null
                };

                var int = NaN;
                let labelLocation = labels.indexOf(text);
                if (labelLocation !== -1)
                {
                    int = addresses[labelLocation];
                }
                else
                {
                    var radix = 10 >>> 0;
                    var splice = false;
                    
                    if (array[0] === "0")
                    {
                        if (array[1] == "b")
                        {
                            radix = 2;
                            splice = true;
                        }
                        if (array[1] == "o")
                        {
                            radix = 8;
                            splice = true;
                        }
                        if (array[1] == "d")
                        {
                            radix = 10;
                            splice = true;
                        }
                        if (array[1] == "x")
                        {
                            radix = 16;
                            splice = true;
                        }
                    }

                    var interpretable = text;
                    if (splice)
                    {
                        interpretable = array.splice(2, array.length - 2).join("");
                    }
                    int = parseInt(interpretable, radix);
                }
                    
                if (isNaN(int))
                {     
                    result.errorMessage = "Offset '" + text + "' is not a recognized label or literal.";
                    return result;
                }

                if ((int & 3) != 0)
                {
                    result.errorMessage = "Branches must be word-aligned.";
                    return result;
                }
                
                int -= address;

                int >>= 2;

                if (rangeCheck(int, 16))
                {
                    result.value = int;
                    return result;
                }
                result.errorMessage = "The value of '" + text + "' is out of range.";
                return result;
            },
            function(value: number, address: number)
            {
                return value << 2;
            }
        )
    );

    let ibSubtype = formats[formats.length - 1];

    instructions.push
    (
        new Instruction
        (
            "BEQ",
            ibSubtype,
            ["opcode"],
            [0x04],
            function(core)
            {
                if (core.registerFile.read(core.arguments[0]) === core.registerFile.read(core.arguments[1]))
                {
                    core.pc += core.arguments[2];
                }
                return null;
            }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "BNE",
            ibSubtype,
            ["opcode"],
            [0x05],
            function(core)
            {
                if (core.registerFile.read(core.arguments[0]) !== core.registerFile.read(core.arguments[1]))
                {
                    core.pc += core.arguments[2];
                }
                return null;
            }
        )

    );

    //I Load Upper Immediate Subtype
    formats.push
    (
        new Format
        (
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5, null, 0),
                new BitRange("rt", 16, 5, 0),
                new BitRange("imm", 0, 16, 1)
            ],
            ["rt", "imm"],
            [Parameter.register, Parameter.immediate],
            /[a-zA-Z]+\s*(\$[A-Za-z0-9]+)\s*,\s*(-?[a-zA-Z0-9_]+)/,
            "@mnem @arg, @arg"
        )
    );

    let iluiSubtype = formats[formats.length - 1];

    instructions.push
    (
        new Instruction
        (
            "LUI",
            iluiSubtype,
            ["opcode"],
            [0x0F],
            function(core)
            {
                core.registerFile.write(core.arguments[0], (core.arguments[1] << 16));
                return null;
            }
        )

    );

    //I Load/Store Subtype
    formats.push
    (
        new Format
        (
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5, 2),
                new BitRange("rt", 16, 5, 0),
                new BitRange("imm", 0, 16, 1)
            ],
            ["rt", "imm", "rs"],
            [Parameter.register, Parameter.immediate, Parameter.register],
            /[a-zA-Z]+\s*(\$[A-Za-z0-9]+)\s*,\s*(-?0?[boxd]?[0-9A-F]+)\(\s*(\$[A-Za-z0-9]+)\s*\)/,
            "@mnem @arg, @arg(@arg)"
        )
    );

    let ilsSubtype = formats[formats.length - 1];


    //TO-DO: Verify function(core) functionality

    instructions.push
    (
        new Instruction
        (
            "LB",
            ilsSubtype,
            ["opcode"],
            [0x20],
            function(core)
            {
                let bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 1);
                if (bytes === null)
                {
                    return "Illegal memory access.";
                }
                core.registerFile.write(core.arguments[0], signExt(bytes[0], 8));
                return null;
            }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "LH",
            ilsSubtype,
            ["opcode"],
            [0x21],
            function(core)
            {
                let bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 2);
                if (bytes === null)
                {
                    return "Illegal memory access.";
                }
                core.registerFile.write(core.arguments[0], signExt(catBytes(bytes), 16));
                return null;
            }
        )
    );
    
    instructions.push
    (
        new Instruction
        (
            "LW",
            ilsSubtype,
            ["opcode"],
            [0x23],
            function(core)
            {
                let bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 4);
                if (bytes === null)
                {
                    return "Illegal memory access.";
                }
                core.registerFile.write(core.arguments[0], catBytes(bytes));
                return null;
            }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "LBU",
            ilsSubtype,
            ["opcode"],
            [0x24],
            function(core)
            {
              let bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 1);
              if (bytes === null)
              {
                  return "Illegal memory access.";
              }
              core.registerFile.write(core.arguments[0], bytes[0]);
              return null;
          }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "LHU",
            ilsSubtype,
            ["opcode"],
            [0x25],
            function(core)
            {
             let bytes = core.memcpy(core.registerFile.read(core.arguments[2]) + core.arguments[1], 2);
             if (bytes === null)
             {
                 return "Illegal memory access.";
             }
             core.registerFile.write(core.arguments[0], catBytes(bytes));
             return null;
         }
        )
   );

    instructions.push
    (
        new Instruction
        (
            "SB",
            ilsSubtype,
            ["opcode"],
            [0x28],
            function(core)
            {
                var bytes = [];
                bytes.push(core.registerFile.read(core.arguments[0]) & 255);
                if(core.memset(core.registerFile.read(core.arguments[2]) + core.arguments[1], bytes))
                {
                    return null;
                }
                return "Illegal memory access.";
            }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "SH",
            ilsSubtype,
            ["opcode"],
            [0x29],
            function(core)
            {
              var bytes = [];
              var value = core.registerFile.read(core.arguments[0]);
              bytes.push(value & 255);
              value = value >>> 8;
              bytes.push(value & 255);
              if(core.memset(core.registerFile.read(core.arguments[2]) + core.arguments[1], bytes))
              {
                  return null;
              }
              return "Illegal memory access.";
            }
        )
    );

    instructions.push
    (
        new Instruction
        (
            "SW",
            ilsSubtype,
            ["opcode"],
            [0x2B],
            function(core)
            {
                var bytes = [];
                var value = core.registerFile.read(core.arguments[0]);
                bytes.push(value & 255);
                value = value >>> 8;
                bytes.push(value & 255);
                value = value >>> 8;
                bytes.push(value & 255);
                value = value >>> 8;
                bytes.push(value & 255);
                if(core.memset(core.registerFile.read(core.arguments[2]) + core.arguments[1], bytes))
                {
                    return null;
                }
                return "Illegal memory access.";
            }
        )
    );

    

    //J-Type
    formats.push
    (
        new Format
        (
            [
                new BitRange("opcode", 26, 6),
                new BitRange("imm", 0, 26, 0, null, 32)
            ],
            ["imm"],
            [Parameter.special],
            /[A-z]+\s*([A-Za-z0-9_]+)/,
            "@mnem @arg",
            function(address: number, text: string, bits: number, labels: string[], addresses: number[])
            {
                let array = text.split(""); //Character View
                var result =
                {
                    errorMessage: null,
                    value: null
                };

                var int = NaN;
                let labelLocation = labels.indexOf(text);
                if (labelLocation !== -1)
                {
                    int = addresses[labelLocation];
                }
                else
                {
                    var radix = 10 >>> 0;
                    var splice = false;
                    
                    if (array[0] === "0")
                    {
                        if (array[1] == "b")
                        {
                            radix = 2;
                            splice = true;
                        }
                        if (array[1] == "o")
                        {
                            radix = 8;
                            splice = true;
                        }
                        if (array[1] == "d")
                        {
                            radix = 10;
                            splice = true;
                        }
                        if (array[1] == "x")
                        {
                            radix = 16;
                            splice = true;
                        }
                    }

                    var interpretable = text;
                    if (splice)
                    {
                        interpretable = array.splice(2, array.length - 2).join("");
                    }
                    int = parseInt(interpretable, radix);
                }
                    
                if (isNaN(int))
                {     
                    result.errorMessage = "Offset '" + text + "' is not a recognized label or literal.";
                    return result;
                }

                if ((int >>> 28) == (address >>> 28))
                {
                    if ((int & 3 ) == 0)
                    {
                        result.value = (int & 0x0ffffffc) >>> 2;
                        return result;
                    }
                    result.errorMessage = "Jumps must be word-aligned.";
                    return result;
                }
                result.errorMessage = "The value of '" + text + "' is out of range.";
                return result;
            },
            function(value: number, address: number)
            {
                return (value << 2) | (address & 0xf0000000);
            }
        )
    );

    let jType = formats[formats.length - 1];

    instructions.push(new Instruction(
        "J",
        jType,
        ["opcode"],
        [0x2],
        function(core) {
            core.pc = core.arguments[0];
            return null;
        }
    ));

    instructions.push(new Instruction(
        "JAL",
        jType,
        ["opcode"],
        [0x3],
        function(core) {
            core.registerFile.write(31, core.pc);
            core.pc = core.arguments[0];
            return null;
        }
    ));

    //Pseudoinstructions
    //MV
    formats.push
    (
        new Format
        (
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5, 1),
                new BitRange("rt", 16, 5, null, 0),
                new BitRange("rd", 11, 5, 0),
                new BitRange("shamt", 6, 5, null, 0),
                new BitRange("funct", 0, 6)
            ],
            ["rd", "rs"],
            [Parameter.register, Parameter.register],
            /[a-zA-Z]+\s*(\$[A-Za-z0-9]+)\s*,\s*(\$[A-Za-z0-9]+)/,
            "@mnem @arg, @arg"
        )
    );

    let mvPseudo = formats[formats.length - 1];    
    instructions.push
    (
        new Instruction
        (
            "MV",
            mvPseudo,
            ["opcode", "funct"],
            [0x0, 0x20],
            function(core)
            {
                //Captured by ADD
                return null;
            }
        )
    );

    //LI/LA
    formats.push
    (
        new Format
        (
            [
                new BitRange("opcode", 26, 6),
                new BitRange("rs", 21, 5, null, 0),
                new BitRange("rt", 16, 5, 0),
                new BitRange("imm", 0, 16, 1)
            ],
            ["rt", "imm"],
            [Parameter.register, Parameter.immediate],
            /[a-zA-Z]+\s*(\$[A-Za-z0-9]+)\s*,\s*(-?[a-zA-Z0-9_]+)/,
            "@mnem @arg, @arg"
        )
    );
    let liPseudo = formats[formats.length - 1];

    instructions.push
    (
        new Instruction
        (
            "LI",
            liPseudo,
            ["opcode"],
            [0x8],
            function(core)
            {
                //Captured by ADDI
                return null;
            }
        )

    );
    
    instructions.push
    (
        new Instruction
        (
            "LA",
            liPseudo,
            ["opcode"],
            [0x8],
            function(core)
            {
                //Captured by ADDI
                return null;
            }
        )

    );


    /*
        ARGUMENT PROCESSOR
        Does what it says on the tin. It needs quite a bit of information, but otherwise successfully interprets
        any MIPS argument.
    */
    let process = function(address: number, text: string, type: Parameter, bits: number, labels: string[], addresses: number[])
    {
        let array = text.split(""); //Character View
        var result =
        {
            errorMessage: null,
            value: null
        };
        switch(type)
        {
        case Parameter.register:
                var registerNo: number;
                let index = this.abiNames.indexOf(text);
                if (index !== -1)
                {
                    result.value = index;
                    return result;
                }
                if (array[0] !== "$")
                {
                    result.errorMessage = "Register " + text + " does not exist.";
                    return result;
                }
                registerNo = parseInt(array.splice(1, array.length - 1).join(""));
                if (0 <= registerNo && registerNo <= 31)
                {
                    result.value = registerNo;
                    return result;
                }
                else
                {
                    result.errorMessage = "Register " + text + " does not exist.";
                    return result;
                }


        case Parameter.immediate:
            //Label
            var int = NaN;
            let labelIndex = labels.indexOf(text);
            if (labelIndex !== -1)
            {
                int = addresses[labelIndex];
            }
            else if (array.length === 3 && (array[0] == "\'") && (array[2] == "\'"))
            {
                int = array[1].charCodeAt(0);
            }
            else
            {
                var radix = 10 >>> 0;
                var splice = false;

                if (array[0] === "0")
                {
                    if (array[1] == "b")
                    {
                        radix = 2;
                        splice = true;
                    }
                    if (array[1] == "o")
                    {
                        radix = 8;
                        splice = true;
                    }
                    if (array[1] == "d")
                    {
                        radix = 10;
                        splice = true;
                    }
                    if (array[1] == "x")
                    {
                        radix = 16;
                        splice = true;
                    }
                }

                var interpretable = text;
                if (splice)
                {
                    interpretable = array.splice(2, array.length - 2).join("");
                }

                int = parseInt(interpretable, radix);
            }

            if (isNaN(int))
            {
                result.errorMessage = "Immediate '" + text + "' is not a recognized label, literal or character.";
                return result;
            }

            if (rangeCheck(int, bits))
            {
                result.value = int;
                return result;
            }
            result.errorMessage = "The value of '" + text + "' is out of range.";
            return result;


        case Parameter.offset:
            var int = NaN;
            let labelLocation = labels.indexOf(text);
            if (labelLocation !== -1)
            {
                int = addresses[labelLocation] - address;
            }
            else
            {
                var radix = 10 >>> 0;
                var splice = false;

                if (array[0] === "0")
                {
                    if (array[1] == "b")
                    {
                        radix = 2;
                        splice = true;
                    }
                    if (array[1] == "o")
                    {
                        radix = 8;
                        splice = true;
                    }
                    if (array[1] == "d")
                    {
                        radix = 10;
                        splice = true;
                    }
                    if (array[1] == "x")
                    {
                        radix = 16;
                        splice = true;
                    }
                }

                var interpretable = text;
                if (splice)
                {
                    interpretable = array.splice(2, array.length - 2).join("");
                }

                int = parseInt(interpretable, radix);
            }

            if (isNaN(int))
            {
                result.errorMessage = "Offset '" + text + "' is not a recognized label or literal.";
                return result;
            }

            if (rangeCheck(int, bits))
            {
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
    let tokenize = function(file: string)
    {
        var result =
        {
            errorMessage: null,
            labels: [],
            addresses: [],
            lines: [],
            pc: [],
        };

        var address = 0;
        var text = true;
        var lines = file.split("\n");

        for (var i = 0; i < lines.length; i++)
        {  
            
            var labelExtractor = /\s*(([A-Za-z_][A-Za-z0-9_]*):)?(.*)?/.exec(lines[i]);
            if (labelExtractor == null)
            {
                console.log("Congratulations, you broke regular expressions.")
            }
            if (typeof labelExtractor[2] !== 'undefined')
            {
                result.labels.push(labelExtractor[2]);
                result.addresses.push(address);
            }
            lines[i] = labelExtractor[3];
            if (lines[i] == undefined)
            {
                continue;
            }
            var chars = lines[i].split("");


            //Check for unterminated string/char (also comments)
            var inString = false;
            var commentOut = false;

            //Comments
            for (var j = 0; j < chars.length; j++)
            {
                if (!commentOut)
                {
                    if (chars[j] == "\"" || chars[j] == "\'")
                    {
                        inString = !inString;
                    }
                    else if (inString)
                    {                     
                        if (chars[j] == "\\")
                        {
                            j++; //Escape next character
                        }
                        else if (chars[j] == "\n")
                        {
                            result.errorMessage = "Line " + i + ": Unterminated string.";
                            return result;
                        }
                    }
                    else
                    {
                        if (chars[j] == "#")
                        {
                            commentOut = true;
                            chars.splice(j, 1);
                            j--;
                        }
                    }
                }
                else
                {
                    if (chars[j] !== "\n")
                    {
                        chars.splice(j, 1);
                        j--;
                    }
                    else
                    {
                        commentOut = false;
                    }
                }
            }

            lines[i] = chars.join("");
            
            lines[i] = lines[i].split("' '").join("32");
            
            //These are fine for most purposes, but string directives MUST NOT USE THE ARRAY DIRECTIVES BY ANY MEANS.
            let directives = lines[i].split(/\s+/).filter(function(value: string){ return value.length > 0 });
            
            //Check if whitespace
            if (directives.length === 0)
            {
                continue;
            }

            var directiveChars = directives[0].split("");                

            //Calculate size in bytes
            if (text)
            {
                if (directives[0] === ".data")
                {
                    text = false;
                    if (directives[1] !== undefined)
                    {
                        result.errorMessage = "Line " + i + ": " + directives[1] + " is extraneous. .data does not take any arguments.";
                        return result;
                    }
                }
                else if (directives[0] === ".text")
                {
                    //Do nothing.
                }
                else if (directiveChars[0] === ".")
                {                        
                    result.errorMessage = "Line " + i + ": " + directives[0] + " cannot be in the text section. Aborting.";
                    return result;
                }
                else 
                {
                    address += 4;
                    let instructionIndex = this.mnemonicSearch(directives[0].toUpperCase());
                    if (instructionIndex === -1)
                    {     
                        result.errorMessage = "Line " + i + ": Instruction " + directives[0] + " not found.";
                        return result;
                    }
                }                    
            }
            else
            {
                if (directives[0] == ".text")
                {
                    text = true;
                    if (directives[1] !== undefined)
                    {
                        result.errorMessage = "Line " + i + ": " + directives[1] + " is extraneous. .text does not take any arguments.";
                        return result;
                    }
                }

                else if (directives[0] === ".data")
                {
                    //Do nothing.
                }
                else if (this.dataDirectives.indexOf(directives[0]) !== -1)
                {
                    let index = this.dataDirectives.indexOf(directives[0]);
                    if (this.dataDirectiveSizes[index] !== 0)
                    {
                        let array = directives.join(" ").split(directives[i]).join("").split(",");
                        address += array.length * this.dataDirectiveSizes[index];
                    }
                    else
                    {
                        switch (directives[0])
                        {   
                            case ".asciiz":
                            case ".ascii":
                                var match = /.([A-Za-z]+?)\s*\"(.*)\"\s*(#.*)?$/.exec(lines[i]);
                                if (match == null)
                                {
                                    result.errorMessage = "Line " + i + ": Malformed string directive.";
                                    return result;
                                }
                                let array = match[1].split("");
                                for (var j = 0; j < array.length; j++)
                                {
                                    if (array[j] == "\\")
                                    {
                                        j++;
                                    }
                                    address += 1;
                                }
                            if (directives[0] == ".asciiz")
                            {
                                address += 1;
                            }
                        }
                    }
                }
                else if (directiveChars[0] === ".")
                {
                    result.errorMessage = "Line " + i + ": Unsupported directive " + directives[0] + ".";
                    return result;
                }
                else
                {
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
    let assemble = function(nester: number = null, address: number, lines: string[], labels: string[], addresses: number[])
    {
        var result =
        {
            errorMessage: null,
            machineCode: [],
            size: 0
        };

        var text = true;

        for (var i = 0; i < lines.length; i++)
        {            
            if (typeof lines[i] == 'undefined')
            {
                continue;
            }      
            let directives = lines[i].split(/\s+/).filter(function(value: string){ return value.length > 0 });
            
            //Check if whitespace
            if (directives.length === 0)
            {
                continue;
            }
            
            if (text)
            {
                if (directives[0] === ".data")
                {
                    text = false;
                }
                else if (directives[0] === ".text")
                {
                    //\_(ツ)_/
                }
                else 
                {
                    address += 4;
                    let instructionIndex = this.mnemonicSearch(directives[0].toUpperCase());

                    if (instructionIndex === -1)
                    {
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
                    if (match == null)
                    {
                        result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": Argument format for " + directives[0] + " violated.";
                        return result;
                    }
                    var args = match.splice(1, params.length);  

                    for (var j = 0; j < bitRanges.length; j++)
                    {                                             
                        if (bitRanges[j].parameter != null)
                        {
                            var startBit = 0;
                            var endBit: number = null;
                            var bits = bitRanges[j].bits;
                            var field = bitRanges[j].field;

                            var limits = /([A-za-z]+)\s*\[\s*(\d+)\s*:\s*(\d+)\s*\]/.exec(bitRanges[j].field);

                            if (limits != null)
                            {
                                field = limits[1];
                                bits = bitRanges[j].limitlessBits;
                            }

                            let index = format.fieldParameterIndex(field);

                            var register = 0;
                            
                            if(paramTypes[index] !== Parameter.special)
                            {
                                let processed = this.processParameter(address, args[bitRanges[j].parameter], paramTypes[index], bits, labels, addresses);
                                if (processed.errorMessage !== null)
                                {
                                    result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": " + processed.errorMessage;
                                    return result;                            
                                }
                                register = processed.value;
                            }
                            else
                            {
                                let processed = instruction.format.processSpecialParameter(address, args[index], bits, labels, addresses);
                                if (processed.errorMessage !== null)
                                {
                                    result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": " + processed.errorMessage;
                                    return result;                            
                                }
                                register = processed.value;
                            }

                            if (limits != null)
                            {
                                startBit = parseInt(limits[3]);
                                endBit = parseInt(limits[2]);

                                register = register >>> startBit;
                                register = register & ((1 << (endBit - startBit + 1)) - 1);
                            }
                            machineCode = machineCode | ((register & ((1 << bitRanges[j].bits) - 1)) << bitRanges[j].start);  

                        }
                    }

                    for (var j = 0; j < 4; j++)
                    {
                        result.machineCode.push(machineCode & 255);
                        machineCode = machineCode >>> 8;
                    }
                }
            }
            else
            {
                if (directives[0] == ".text")
                {
                    text = true;
                }
                else if (this.dataDirectives.indexOf(directives[0]) !== -1)
                {
                    let index = this.dataDirectives.indexOf(directives[0]);
                    
                    if (this.dataDirectiveSizes[index] !== 0)
                    {
                        let size = this.dataDirectiveSizes[index];
                        let array = lines[i].split("' '").join("'$OAK_SPACE_TEMP'").split(directives[0]).join("").split(" ").join("").split("'$OAK_SPACE_TEMP'").join("' '").split(",");
                        for (var j = 0; j < array.length; j++)
                        {
                            var processed = this.processParameter(address, array[j], Parameter.immediate, size * 8, labels, addresses);
                            if (processed.errorMessage !== null)
                            {
                                result.errorMessage = "Line " + ((nester == null)? "": (nester + ":")) + i + ": " + processed.errorMessage;
                                return result;                            
                            }
                            for (var k = 0; k < size; k++)
                            {
                                address += 1;
                                result.machineCode.push(processed.value & 255);
                                processed.value = processed.value >>> 8;
                            }
                        }
                    }
                    else
                    {
                        switch (directives[0])
                        {   
                            case ".asciiz":
                            case ".ascii":
                            var stringMatch = /\s*(\.asciiz?)\s*\"(.*)\"\s*(#.*)?$/.exec(lines[i]);
                            if (stringMatch == null)
                            {
                                result.errorMessage = "Line " + i + ": Malformed string directive.";
                                return result;
                            }
                            if (stringMatch[2] == undefined)
                            {
                                stringMatch[2] = "";
                            }
                            let characters = stringMatch[2].split("");
                            for (var j = 0; j < characters.length; j++)
                            {
                                if (characters[j] == "\\")
                                {
                                    j++;
                                    if (j + 1 < characters.length)
                                    {
                                        switch (characters[j + 1])
                                        {
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
                                else
                                {
                                    result.machineCode.push(characters[j].charCodeAt(0));
                                }
                                
                                address += 1;
                            }
                            if (stringMatch[1] == ".asciiz")
                            {
                                result.machineCode.push(0 >>> 0);
                                address += 1;
                            }
                        }
                    }
                }
            }
        }
        result.size = address;
        return result;
    };


    let abiNames = ["$zero", "$at", "$v0", "$v1", "$a0", "$a1", "$a2", "$a3", "$t0", "$t1", "$t2", "$t3", "$t4", "$t5", "$t6", "$t7", "$s0", "$s1", "$s2", "$s3", "$s4", "$s5", "$s6", "$s7", "$t8", "$t9", "$k0", "$k1", "$gp", "$sp", "$fp", "$ra"];

    return new InstructionSet("mips", 32, formats, instructions, pseudoInstructions, [".word", ".half", ".byte", ".asciiz"], [4, 2, 1, 0], abiNames, process, tokenize, assemble);
}
let MIPS = Oak_gen_MIPS();

class MIPSRegisterFile
{
    private memorySize: number;
    physicalFile: number[];
    abiNames: string[];
    modifiedRegisters: boolean[];

    print()
    {
        console.log("Registers\n------");
        for (var i = 0; i < 32; i++)
        {
            console.log("$" + i.toString(), this.abiNames[i], this.physicalFile[i].toString(), (this.physicalFile[i] >>> 0).toString(16).toUpperCase());
        }
        console.log("------");
    }
    
    read(registerNumber: number)
    {
        if (registerNumber === 0)
        {
            return 0;
        }
        else
        {
            return this.physicalFile[registerNumber];
        }
    }

    write(registerNumber: number, value: number)
    {
        this.physicalFile[registerNumber] = value;
        this.modifiedRegisters[registerNumber] = true;
    }

    getRegisterCount():number
    {
        return 32;
    }


    getModifiedRegisters():boolean[]
    {
        var modReg = this.modifiedRegisters.slice();
        for (var i = 0; i < this.getRegisterCount(); i++) {
            this.modifiedRegisters[i] = false;
        }
        return modReg;
    }

    reset()
    {
        for (var i = 0; i < 32; i++)
        {
            this.physicalFile[i] = 0;
            this.modifiedRegisters[i] = false;
        }
        this.physicalFile[29] = this.memorySize;

    }

    constructor(memorySize: number, abiNames: string[])
    {
        this.physicalFile = [];
        this.modifiedRegisters = [];
        for (var i = 0; i < 32; i++)
        {
            this.physicalFile.push(0);
            this.modifiedRegisters.push(false);
        }
        this.memorySize = memorySize;
        this.physicalFile[29] = memorySize; //stack pointer
        this.abiNames = abiNames;
    }
};

class MIPSCore //: Core
{
    //Permanent
    instructionSet: InstructionSet;
    registerFile: MIPSRegisterFile;
    memorySize: number;

    // Default Environment Call Regs
    defaultEcallRegType: number;
    defaultEcallRegArg: number;

    // Editor Info
    aceStyle: string;
    defaultCode: string;
    defaultMachineCode: string;

    //Transient
    pc: number;
    memory: number[];

    //Environment Call Lambda
    ecall: () => void;

    //Instruction Callback
    instructionCallback: (data: string) => void;
    
    reset()
    {
        this.pc = 0;
        this.memory = [];
        for (var i = 0; i < this.memorySize; i++)
        {
            this.memory[i] = 0;
        }
        this.registerFile.reset();
    }

    //Returns bytes on success, null on failure
    memcpy(address: number, bytes: number): number[]
    {
        if (address + bytes > this.memorySize)
        {
            return null;
        }
        
        var result: number[] = [];
        for (var i = 0; i < bytes; i++)
        {
            result.push(this.memory[address + i]);
        }
        return result;
    }

    //Returns boolean indicating success
    //Use to store machine code in memory so it can be executed.
    memset(address: number, bytes: number[]): boolean
    {
        if (address < 0)
        {
            return false;
        }

        if (address + bytes.length > this.memorySize)
        {
            return false;
        }

        for (var i = 0; i < bytes.length; i++)
        {
            this.memory[address + i] = bytes[i];
        }
        return true;
    }
    
    fetched: number;

    fetch(): string
    {
        if (this.pc < 0)
        {
            return "Fetch Error: Negative program counter.";
        }
        let arr = this.memcpy(this.pc, 4);
        if (arr == null)
        {
            return "Fetch Error: Illegal memory access.";
        }
        this.pc += 4;

        this.fetched = catBytes(arr);
        return null;
    }

    decoded: Instruction;
    arguments: number[];

    //Returns the disassembly. If the decoding fails, null.
    decode(): string
    {
        let insts = this.instructionSet.instructions;
        this.decoded = null;
        this.arguments = [];
        for (var i = 0; i < insts.length; i++)
        {
            if (insts[i].match(this.fetched))
            {
                this.decoded = insts[i];
                break;
            }
        }
        if (this.decoded == null)
        {
            return null;
        }

        let format = this.decoded.format;
        let bitRanges = format.ranges;
        let params = format.parameters;
        let paramTypes = format.parameterTypes;

        for (var i = 0; i < bitRanges.length; i++)
        {
            if (bitRanges[i].parameter != null)
            {
                var limit = 0;
                var field = bitRanges[i].field;

                var limits = /([A-za-z]+)\s*\[\s*(\d+)\s*:\s*(\d+)\s*\]/.exec(bitRanges[i].field);

                if (limits != null)
                {
                    field = limits[1];
                    limit = parseInt(limits[3]) >>> 0;
                }

                let index = format.fieldParameterIndex(field);
                var bits = bitRanges[i].bits;

                var value = ((this.fetched >>> bitRanges[i].start) & ((1 << bitRanges[i].bits) - 1)) << limit;
                
                if(paramTypes[index] === Parameter.special)
                {
                    value = this.decoded.format.decodeSpecialParameter(value, this.pc); //Unmangle...
                }

                this.arguments[bitRanges[i].parameter] = this.arguments[bitRanges[i].parameter] | value;
            }
        }

        for (var i = 0; i < params.length; i++)
        {
            let rangeIndex = format.parameterBitRangeIndex(params[i]);
            if (rangeIndex === -1)
            {
                console.log("Internal error: No field found for parameter " + params[i] + ".");
            }

            var bits = bitRanges[rangeIndex].bits;
            if (bitRanges[rangeIndex].limitlessBits != null)
            {
                bits = bitRanges[rangeIndex].limitlessBits;
            }

            if (this.decoded.signed && paramTypes[i] != Parameter.register)
            {
                this.arguments[i] = signExt(this.arguments[i], bits);
            }
        }

        return format.disassemble(this.decoded.mnemonic, this.arguments, this.instructionSet.abiNames);

    }

    //Returns null on success, error message on error.
    execute(): string
    {
        return this.decoded.executor(this)
    }


    constructor(memorySize: number, ecall: () => void, instructionCallback: (data: string) => void)
    {
        this.defaultEcallRegType     = 2;
        this.defaultEcallRegArg      = 4;
        this.aceStyle = "ace/mode/mips";
        this.defaultCode = "    la $a0, str\n    li $v0, 4 #4 is the string print service number...\n    syscall\n    li $v0, 10 #...and 10 is the program termination service number!\n    syscall\n.data\nstr:\    .asciiz \"Hello, World!\"";
        this.defaultMachineCode = "14 00 04 20 04 00 02 20 0C 00 00 00 0A 00 02 20 0C 00 00 00 48 65 6C 6C 6F 2C 20 57 6F 72 6C 64 21 00 ";

        this.instructionSet = MIPS;
        this.pc = 0 >>> 0;
        this.memorySize = memorySize;
        this.ecall = ecall;
        this.instructionCallback = instructionCallback;
        this.registerFile = new MIPSRegisterFile(memorySize, MIPS.abiNames);
        
        this.memory = new Array(memorySize);
        for (var i = 0; i < memorySize; i++)
        {
            this.memory[i] = 0;
        }         
    }
}