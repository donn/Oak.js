![Oak.js](Images/logo.png)

A port of [Oak](https://github.com/Skyus/Oak) to TypeScript used for multiple school projects. It supports both RISCV (RV32I) and MIPS (Core Instruction Set).

Unlike the Swift version, the TypeScript version is less flexible, but developed faster.

The assembler and simulator were designed by [@skyus](https://github.com/skyus) and the user interface was designed by [@KarimIO](https://github.com/KarimIO).

Special thanks to [@alikhaled96](https://github.com/alikhaled96) for helping me implement MIPS.

Oak.js is a sister project of [RiscBEE](https://github.com/skyus/RiscBEE).

# Requirements
Make, TypeScript 2 or above, UglifyJS 2 or above, and a compatible version of Node.js. It was tested with Node v7.

If you just want to use Oak.js, it should work fine on any modern browser, bar modern versions of Internet Explorer.

## Installing Dependencies
(aka how to use Node.js 101)

### macOS
It is recommended to use the [Homebrew package manager](https://brew.sh) first. Type in your terminal:

    brew install node
    npm install -g typescript
    npm install -g uglify-js

### Debian-based OSes (incl. Ubuntu)
Again, in the terminal:

    sudo apt-get install nodejs npm
    sudo npm install -g typescript
    sudo npm install -g uglify-js   

For other Linux-based OSes, substitute aptitudes's syntax with that of your package manager's.
If you get errors about node not being found, try running the following: `ln -s /usr/bin/nodejs /usr/bin/node`.
    
### Windows
Please use Bash on Ubuntu on Windows 10 and follow the instructions for Debian-based OSes for a supported and tested workflow. If you do not wish to use the Linux subsystem, try first installing Node.js from [their website](http://nodejs.org/) and then, in PowerShell:

    npm install -g typescript
    npm install -g uglify-js

Like Debian-based OSes, you may neeed administrative privileges for this.

# Usage
To use Oak.js, either visit the [GitHub Page](https://skyus.github.io/Oak.js) or download this repository and open index.html using your web browser.

To compile and clean, `make` or `make clean` respectively.

# License
Mozilla Public License 2.0. Check LICENSE.

# Note
Yes, I did patch the Ace text editor to support 0-based numbering. No, I don't remember how.