function rangeCheck(value: number, bits: number): boolean
{
    if (bits == 32)
    {
        return true; //No other option.
    }
    if (bits > 32)
    {
        return false; //Impossible.
    }
    
    var min = -(1 << bits - 1);
    var max = (1 << bits - 1) - 1;
    value = signExt(value, bits);
    if (((value >> 0) <= max) && ((value >> 0) >= min))
    {
        return true;
    }
    return false;
}

/*
    signExt

    Sign extends an n-bit value to fit Javascript limits.

    Usage signExt(value, n)
*/
function signExt(value: number, bits: number): number
{
    var mutableValue = value;
    if ((mutableValue & (1 << (bits - 1))) !== 0)
    {
        mutableValue = ((~(0) >>> bits) << bits) | value;
    }
    return mutableValue;
}

/*
    catBytes
    
    Converts bytes stored in a little endian fashion to a proper js integer.
*/
function catBytes(bytes: number[]): number
{
    if (bytes.length > 4)
    {
        return null;
    }

    var storage = 0 >>> 0;
    for (var i = 0; i < bytes.length; i++)
    {
        storage = storage | (bytes[i] << (8 * i));
    }
    return storage;
}

