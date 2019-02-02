/// <reference path="Memory.ts"/>
/// <reference path="Core.ts" />

class VirtualOS {
    outputInt: (arg: number) => (void);
    outputString: (arg: string) => (void);
    inputInt: () => (number);
    inputString: () => (string);

    ecall(core: Core): string {
        let service = core.registerFile.read(core.virtualOSServiceRegister);
        const start = core.virtualOSArgumentVectorStart;
        
        switch (service) {
        case 1: {
            let val = core.registerFile.read(start);
            this.outputInt(val);
            break;
        }
        case 4: {
            let iterator = core.registerFile.read(start);
            let array = [];
            let char = null;
            while ((char = core.memcpy(iterator, 1)[0]) !== 0) {
                array.push(char);
                iterator += 1;
            }
            let outStr = array.map(c=> String.fromCharCode(c)).join('');
            this.outputString(outStr);
            return null;
        }
        case 5: {
            this.inputInt();
            return null;
        }
        case 8: {
            this.inputString();
            return null;
        }   
        case 10:
            return "HALT";
        default:
            return "UNHANDLED";
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