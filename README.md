![Oak.js](Images/logo.png)

A port of [Oak](https://github.com/Skyus/Oak) to TypeScript used for multiple school projects. It supports both RISCV (RV32I) and MIPS (Core Instruction Set).

Unlike the Swift version, the TypeScript version is less flexible, but developed faster.

The assembler and simulator were designed by [@skyus](https://github.com/skyus) and the user interface was designed by [@KarimIO](https://github.com/KarimIO).

Special thanks to [@alikhaled96](https://github.com/alikhaled96) for helping me implement MIPS.

Oak.js is a sister project of [RiscBEE](https://github.com/skyus/RiscBEE).

# Usage
Compile:

    chmod +x compile.sh
    ./compile.sh

Test:

    node Oak.js

Clean:

    chmod +x clean.sh
    ./clean.sh

# Requirements
TypeScript 2 or above, UglifyJS 2 or above, and a compatible version of Node.js. It was tested with Node v7.

If you just want to use Oak.js, it should work fine on any modern browser, bar modern versions of Internet Explorer.

## Dependencies
(aka how to use Node.js 101)

### macOS
It is recommended to use the [Homebrew package manager](https://brew.sh). Type in your terminal:

    brew install node
    npm install -g typescript
    npm install -g uglify-js

### Debian-based OSes (incl. Ubuntu)
Again, in the terminal:

    sudo apt install nodejs npm
    sudo ln -s /usr/bin/nodejs /usr/bin/node
    sudo npm install -g typescript
    sudo npm install -g uglify-js   
    
### Windows
Please use Bash on Ubuntu on Windows 10 and follow the instructions for Debian-based OSes.

# License
Mozilla Public License 2.0. Check LICENSE.
