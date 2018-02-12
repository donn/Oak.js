let MIPS = new InstructionSet("mips", 32, [], [], [], [".word", ".half", ".byte", ".asciiz"], [4, 2, 1, 0], [], function(){ return null }, function(){ return null }, function(){ return null });

class MIPSCore implements Core
{
    registerFile: RegisterFile;
    instructionSet: InstructionSet;
    pc: number;
    memory: number[];
    defaultEcallRegType: number;
    defaultEcallRegArg: number;
    aceStyle: string;
    defaultCode: string;

    memcpy(address: number, bytes: number): number[] {
        return null
    }
    memset(address: number, bytes: number[]): boolean {
        return null
    }  
    reset() {
        return null
    }

    fetched: number;
    decoded: Instruction;
    arguments: number[];

    fetch() {}
    decode() {}
    execute() {}
    instructionCallback(data: string): void {}
    ecall(): void {}
    
}