/// <reference path="ISAs/MIPS.ts"/>
/// <reference path="ISAs/RISCV.ts"/>

class CoreFactory {
    static ISAs = {
        "RISC-V": {
            generator: RISCV,
            core: RISCVCore,
            options: ["C", "M", "D"]
        },
        "MIPS": {
            generator: MIPS,
            core: MIPSCore,
            options: []
        }
    };
    static getCore(architecture: string, memorySize: number, virtualOS: VirtualOS, options: boolean[]): Core {
        let isa = this.ISAs[architecture];
        if (isa === undefined) {
            return null;
        }

        for (let key in options) {
            if (!isa.options.include(key)) {
                return null;
            }
        }

        let instructionSet = isa.generator(options);

        console.log(virtualOS);

        return new isa.core(memorySize, virtualOS, instructionSet);
    }
}
