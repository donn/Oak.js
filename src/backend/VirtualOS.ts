/// <reference path="Memory.ts"/>
/// <reference path="Core.ts" />

class VirtualOS {
    outputInt: (arg: number) => (void);
    outputString: (arg: string) => (void);
    inputInt: () => (number);
    inputString: () => (string);

    ecall(core: Core): string {
        let service = core.registerFile.read(core.virtualOSServiceRegister);
        let args = [];
        for (let i = core.virtualOSArgumentVectorStart; i <= core.virtualOSArgumentVectorEnd; i += 1) {
            args.push(core.registerFile.read(i));
        }

        switch (service) {
        case 1: {
            this.outputInt(args[0]);
            break;
        }
        case 4: {
            let iterator = args[0];
            let array = [];
            let char = null;
            do {
                char = core.memcpy(iterator, 1)[0];
                array.push(char);
                iterator += 1;
            } while (char !== 0);
            let outStr = array.map(c=> String.fromCharCode(c)).join('');
            this.outputString(outStr);
            break;
        }
        case 5: {
            this.inputInt();
            break;
        }
        case 8: {
            this.inputString();
            return "WAIT";
        }   
        case 10:
            return "HALT";
        default:
            return "UNHANDLED";
        }

        let j = 0;
        for (let i = core.virtualOSArgumentVectorStart; i <= core.virtualOSArgumentVectorEnd; i += 1) {
            core.registerFile.write(i, args[j]);
            j += 1;
        }

        return null;
    }

    continueInputString = (core: Core, val: string) => {
        let reg = core.virtualOSArgumentVectorStart;
        let arg = core.registerFile.read(reg);
            
        let array = [];
        for (let i = 0; i < val.length; ++i) {
            array.push(val[i]);
        }

        core.memset(arg, array);
    }

    continueInputInt = (core: Core, val: number) => {
        let reg = core.virtualOSArgumentVectorStart;
        core.registerFile.write(reg, val);
    }
}