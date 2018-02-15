/// <reference path="InstructionSet.ts"/>
/// <reference path="Memory.ts"/>

enum Endianness
{
    little = 0,
    big,
    bi
}

abstract class Core
{
    //Permanent
    instructionSet: InstructionSet;
    registerFile: RegisterFile;
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

    abstract reset();

    fetched: number;
    decoded: Instruction;
    arguments: number[];

    abstract fetch(): string;

    decode(): string {
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

        for (var i = 0; i < bitRanges.length; i++)
        {
            if (bitRanges[i].parameter != null)
            {
                var limit = bitRanges[i].limitStart;
                var field = bitRanges[i].field;
                var bits = bitRanges[i].bits;

                var value = ((this.fetched >>> bitRanges[i].start) & ((1 << bitRanges[i].bits) - 1)) << limit;
                
                if (bitRanges[i].parameterType === Parameter.special)
                {
                    value = this.decoded.format.decodeSpecialParameter(value, this.pc); //Unmangle...
                }

                this.arguments[bitRanges[i].parameter] = this.arguments[bitRanges[i].parameter] | value;

                if (this.decoded.signed && bitRanges[i].parameterType !== Parameter.register) {
                    this.arguments[bitRanges[i].parameter] = signExt(this.arguments[i], bitRanges[i].totalBits? bitRanges[i].totalBits: bitRanges[i].bits);
                }
            }
        }

        return this.instructionSet.disassemble(this.decoded, this.arguments);
    }

    //Returns null on success, error message on error.
    execute(): string
    {
        return this.decoded.executor(this)
    }


    //Environment Call Lambda
    ecall: () => void;

    //Instruction Callback
    instructionCallback: (data: string) => void;
    
}