/// <reference path="Core.ts"/>

class CoreFactory {
    static ISAs = {
    };
    static getCore(architecture: string, memorySize: number, virtualOS: VirtualOS, options: boolean[]): Core {
        let isa = this.ISAs[architecture];
        if (isa === undefined) {
            throw "oak.unregisteredISA";
        }

        for (let key in options) {
            if (isa.options[key] === undefined) {
                throw "isa.unsupportedOptions";
            }
        }

        let instructionSet = isa.generator(options);

        return new isa.core(memorySize, virtualOS, instructionSet);
    }
}
