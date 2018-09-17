/// <reference path="Memory.ts"/>

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
        case 1:
            this.outputInt(args[0]);
            break;
        case 4:
            let iterator = args[0];
            let array = [];
            let char = null;
            do {
                char = core.memcpy(iterator, 1);
                array.push(char);
            } while (char !== 0);
            let outStr = array.map(c=> String.fromCharCode(c)).join('');
            this.outputString(outStr);
        case 10:
            return "HALT";
        }

        let j = 0;
        for (let i = core.virtualOSArgumentVectorStart; i <= core.virtualOSArgumentVectorEnd; i += 1) {
            core.registerFile.write(i, args[j]);
            j += 1;
        }

        return null;
    }
}

let cliVirtualOS = new VirtualOS();
cliVirtualOS.outputInt = (number) => {
    console.log(number);
};
cliVirtualOS.outputString = (string) => {
    console.log(string);
};