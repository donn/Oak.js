namespace Utils {

    /*
        rangeCheck

        Checks if a value can fit within a certain number of bits.
    */
    export function rangeCheck(value: number, bits: number): boolean {
        if (bits >= 32) {
            return null; // No stable way of checking.
        }
        
        let min = (-(1 << bits - 1)) >>> 0;
        let max = ((1 << bits - 1) - 1) >>> 0;
        value = signExt(value, bits);
        if (((value >>> 0) <= max) && ((value >>> 0) >= min)) {
            return true;
        }
        return false;
    }

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
        catBytes
        
        Converts bytes stored in a little endian fashion to a proper js integer.
    */
    export function catBytes(bytes: number[], endianness: Endianness = Endianness.little): number {
        if (bytes.length > 4) {
            return null;
        }

        if (endianness == Endianness.big) {
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

interface Array<T> {
    hexed(): string;
    fill(fillable: number);
}

// Changes an array of bytes to a hex string of octets.
Array.prototype.hexed = function() {
    let hexadecimal = "";
    for (let i = 0; i < this.length; i++) {
        let hexRepresentation = this[i].toString(16).toUpperCase();
        if (hexRepresentation.length === 1) {
            hexRepresentation = "0" + hexRepresentation;
        }
        hexadecimal += hexRepresentation + " ";
    }
    return hexadecimal;
};

// Polyfill for fill: 
if (!Array.prototype.fill) {
    Object.defineProperty(Array.prototype, 'fill', {
      value: function(value) {
  
        // Steps 1-2.
        if (this == null) {
          throw new TypeError('this is null or not defined');
        }
  
        var O = Object(this);
  
        // Steps 3-5.
        var len = O.length >>> 0;
  
        // Steps 6-7.
        var start = arguments[1];
        var relativeStart = start >> 0;
  
        // Step 8.
        var k = relativeStart < 0 ?
          Math.max(len + relativeStart, 0) :
          Math.min(relativeStart, len);
  
        // Steps 9-10.
        var end = arguments[2];
        var relativeEnd = end === undefined ?
          len : end >> 0;
  
        // Step 11.
        var final = relativeEnd < 0 ?
          Math.max(len + relativeEnd, 0) :
          Math.min(relativeEnd, len);
  
        // Step 12.
        while (k < final) {
          O[k] = value;
          k++;
        }
  
        // Step 13.
        return O;
      }
    });
  }