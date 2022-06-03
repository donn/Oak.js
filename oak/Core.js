import { Parameter } from "./InstructionSet.js";
import { Utils } from "./Utils.js";

export class CoreFactory {
    constructor() {
        this.ISAs = {};
    }

    getCoreList() {
        return Object.keys(this.ISAs);
    }

    getCore(architecture, memorySize, virtualOS, options = null) {
        let isa = this.ISAs[architecture];
        if (isa === undefined) {
            throw `ISA '${architecture}' not found.`;
        }
        if (options === null) {
            options = isa.options;
        }
        for (let key in options) {
            if (isa.options[key] === undefined) {
                throw `Option '${key}' for ISA ${architecture} is unsupported.`;
            }
        }
        let instructionSet = isa.generator(options);
        return new isa.core(memorySize, virtualOS, instructionSet);
    }
}

export class Core {
    //Returns bytes on success, null on failure
    memcpy(address, bytes) {
        if ((address + bytes) >>> 0 > this.memorySize) {
            return null;
        }
        let result = [];
        for (let i = 0; i < bytes; i++) {
            result.push(this.memory[address + i]);
        }
        return result;
    }
    //Returns boolean indicating success
    //Use to store machine code in memory so it can be executed.
    memset(address, bytes) {
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
    decode() {
        let insts = this.instructionSet.instructions;
        this.decoded = null;
        this.arguments = [];
        for (let i = 0; i < insts.length; i++) {
            if (insts[i].match(this.fetched)) {
                this.decoded = insts[i];
                break;
            }
        }
        if (this.decoded === null) {
            return null;
        }
        let bitRanges = this.decoded.format.ranges;
        for (let i in bitRanges) {
            let range = bitRanges[i];
            if (range.parameter != null) {
                let limit = range.limitStart;
                let value =
                    ((this.fetched >>> range.start) &
                        ((1 << range.bits) - 1)) <<
                    limit;
                if (range.parameterType === Parameter.special) {
                    value = this.decoded.format.decodeSpecialParameter(
                        value,
                        this.pc
                    ); //Unmangle...
                }
                this.arguments[range.parameter] =
                    this.arguments[range.parameter] || 0;
                this.arguments[range.parameter] =
                    this.arguments[range.parameter] | value;
                if (
                    this.decoded.format.ranges[i].signed &&
                    range.parameterType !== Parameter.register
                ) {
                    this.arguments[range.parameter] = Utils.signExt(
                        this.arguments[range.parameter],
                        range.totalBits ? range.totalBits : range.bits
                    );
                }
            }
        }
        return this.instructionSet.disassemble(this.decoded, this.arguments);
    }
    //Returns null on success, error message on error.
    execute() {
        return this.decoded.executor(this);
    }
}

Core.factory = new CoreFactory();
