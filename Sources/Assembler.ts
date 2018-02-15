enum Keyword
{
    directive = 0,
    comment,
    label,
    stringMarker,
    charMarker,
    register,
    blockCommentBegin,
    blockCommentEnd,

    //Only send as keywordRegexes,
    string,
    char,
    data
}

enum Directive
{
    text = 0,
    data,
    string,
    cString, //Null terminated

    //Ints and chars,
    _8bit,
    _16bit,
    _32bit,
    _64bit,

    //Fixed point decimals,
    fixedPoint,
    floatingPoint,

    //Custom,
    custom
}

class Assembler
{
}