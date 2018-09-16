namespace Utils {

    /*
        signExt

        Sign extends an n-bit value to fit Javascript limits.
    */
    export function signExt(value: number, bits: number): number {
        let mutableValue = value;
        if ((mutableValue & (1 << (bits - 1))) !== 0) {
            mutableValue = ((~(0) >>> bits) << bits) | value;
        }
        return mutableValue;
    }

    /*
        rangeCheck

        Checks if a value can fit within a certain number of bits.
    */
    export function rangeCheck(value: number, bits: number): boolean {
        if (bits >= 32) {
            return null; // No stable way of checking.
        }
        
        let min = -(1 << (bits - 1));
        let max = ((1 << (bits - 1)) - 1);
        value = signExt(value, bits);
        if ((min <= value) && (value <= max)) {
            return true;
        }
        return false;
    }

    /*
        catBytes
        
        Converts bytes stored in a little endian fashion to a proper js integer.
    */
    export function catBytes(bytes: number[], bigEndian: boolean = false): number {
        if (bytes.length > 4) {
            return null;
        }

        if (bigEndian) {
            bytes.reverse();
        }

        let storage = 0 >>> 0;
        for (let i = 0; i < bytes.length; i++) {
            storage = storage | (bytes[i] << (8 * i));
        }
        return storage;
    }

    /*
        pad
        
        Turns a number to a padded string.
    */
    export function pad(number: number, digits: number, radix: number): string {
        let padded = number.toString(radix);
        if (digits > padded.length) {
            padded = "0" + padded
        }
        return padded
    }


    export function hex(array: number[]) {
        let hexadecimal = "";
        for (let i = 0; i < array.length; i++) {
            let hexRepresentation = array[i].toString(16).toUpperCase();
            if (hexRepresentation.length === 1) {
                hexRepresentation = "0" + hexRepresentation;
            }
            hexadecimal += hexRepresentation + " ";
        }
        return hexadecimal;
    }
}

// Prototypes
interface String {
    interpretedBytes(): number[];
    hasPrefix(search: string) : boolean;
}

// Changes a string of hex bytes to an array of numbers.
String.prototype.interpretedBytes = function () {
    let hexes = this.split(' '); // Remove spaces, then seperate characters
	let bytes = [];
	for (let i=0; i < hexes.length; i++) {
		let value = parseInt(hexes[i], 16);
		if (!isNaN(value)) {
			bytes.push(value);
		}
	}
	return bytes;
}

// Check if haystack has needle in the beginning.
String.prototype.hasPrefix = function(needle) {
    return this.substr(0, needle.length) === needle;
};