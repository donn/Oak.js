/// <reference path="Core.ts"/>
/// <reference path="ISAs/MIPS.ts"/>
/// <reference path="ISAs/RISCV.ts"/>
/// <reference path="VirtualOS.ts"/>

let v = VirtualOS;
let e = Endianness;
let a = Assembler;
let rvc = RISCVCore;
let mc = MIPSCore;

export { v as VirutalOS, e as Endianness, a as Assembler, rvc as RISCVCore, mc as MIPSCore, }