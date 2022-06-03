export class Utils {
    /*
        signExt

        Sign extends an n-bit value to fit Javascript limits.
    */
    static signExt(value, bits) {
        let mutableValue = value;
        if ((mutableValue & (1 << (bits - 1))) !== 0) {
            mutableValue = ((~0 >>> bits) << bits) | value;
        }
        return mutableValue;
    }

    /*
        rangeCheck

        Checks if a value can fit within a certain number of bits.
    */
    static rangeCheck(value, bits) {
        if (bits >= 32) {
            return null; // No stable way of checking.
        }
        if (Math.abs(value).toString(2).length > bits) {
            return false;
        }
        var min = -(1 << (bits - 1));
        var max = (1 << (bits - 1)) - 1;
        value = this.signExt(value, bits);
        if (min <= value >> 0 && value >> 0 <= max) {
            return true;
        }
        return false;
    }

    /*
        catBytes
        
        Converts bytes stored in a little endian fashion to a proper js integer.
    */
    static catBytes(bytes, bigEndian = false) {
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
    static pad(number, digits, radix) {
        let padded = number.toString(radix);
        while (digits > padded.length) {
            padded = "0" + padded;
        }
        return padded;
    }

    static hex(array) {
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
