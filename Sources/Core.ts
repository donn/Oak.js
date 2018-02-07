/// <reference path="InstructionSet.ts"/>
/// <reference path="Memory.ts"/>

interface Core
{
    registerFile: RegisterFile;
    instructionSet: InstructionSet;
    pc: number;
    memory: number[];
    default_ecall_reg_type: number;
    default_ecall_reg_arg: number;
    ace_style: string;

    memcpy(address: number, bytes: number): number[];
    memset(address: number, bytes: number[]): boolean;    
    reset();

    fetched: number;
    decoded: Instruction;
    arguments: number[];

    fetch();
    decode();
    execute();
    instructionCallback(data: string): void;
    ecall(): void;
    
}