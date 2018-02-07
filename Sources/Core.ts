/// <reference path="InstructionSet.ts"/>
/// <reference path="Memory.ts"/>

interface Core
{
    registerFile: RegisterFile;
    instructionSet: InstructionSet;
    pc: number;
    memory: number[];
    defaultEcallRegType: number;
    defaultEcallRegArg: number;
    aceStyle: string;
    defaultCode: string;

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