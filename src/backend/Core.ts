/// <reference path="InstructionSet.ts"/>
/// <reference path="Memory.ts"/>
abstract class Core {
    //Permanent
    instructionSet: InstructionSet;
    registerFile: RegisterFile;
    memorySize: number;

    // Default Environment Call Regs
    virtualOSServiceRegister: number;
    virtualOSArgumentVectorStart: number;
    virtualOSArgumentVectorEnd: number;

    //Transient
    pc: number;
    memory: number[];

    //Returns bytes on success, null on failure
    memcpy(address: number, bytes: number): number[] {
        if (((address + bytes) >>> 0) > this.memorySize) {
            return null;
        }
        
        let result: number[] = [];
        for (let i = 0; i < bytes; i++) {
            result.push(this.memory[address + i]);
        }
        return result;
    }

    //Returns boolean indicating success
    //Use to store machine code in memory so it can be executed.
    memset(address: number, bytes: number[]): boolean {
        if (address < 0) {
            return false;
        }

        if (address + bytes.length > this.memorySize) {
            return false;
        }

        for (let i = 0; i < bytes.length; i++) {
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
        for (let i = 0; i < insts.length; i++) {
            if (insts[i].match(this.fetched)) {
                this.decoded = insts[i];
                break;
            }
        }
        if (this.decoded == null) {
            return null;
        }
        
        let bitRanges = this.decoded.format.ranges;

        for (let i in bitRanges) {
            let range = bitRanges[i];
            if (range.parameter != null) {
                let limit = range.limitStart;

                let value = ((this.fetched >>> range.start) & ((1 << range.bits) - 1)) << limit;
                
                if (range.parameterType === Parameter.special) {
                    value = this.decoded.format.decodeSpecialParameter(value, this.pc); //Unmangle...
                }

                this.arguments[range.parameter] = this.arguments[range.parameter] || 0;
                this.arguments[range.parameter] = this.arguments[range.parameter] | value;

                if (this.decoded.format.ranges[i].signed && range.parameterType !== Parameter.register) {
                    this.arguments[range.parameter] = Utils.signExt(this.arguments[range.parameter], range.totalBits? range.totalBits: range.bits);
                }
            }
        }

        return this.instructionSet.disassemble(this.decoded, this.arguments);
    }

    //Returns null on success, error message on error.
    execute() {
        return this.decoded.executor(this);
    }


    //Environment Call Lambda
    ecall: () => string;
    
}