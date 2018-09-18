note: needs updating

![Oak.js](Images/logo.png)

A port of [Oak](https://github.com/donn/Oak) to TypeScript used for multiple school projects. It supports both RISCV (RV32I) and MIPS (Core Instruction Set).

Unlike the Swift version, the TypeScript version is less flexible, but developed faster.

The assembler and simulator were designed by [@donn](https://github.com/donn) and the user interface was designed by [@KarimIO](https://github.com/KarimIO).

Special thanks to [@alikhaled96](https://github.com/alikhaled96) for helping me implement MIPS.

Oak.js is a sister project of [RiscBEE](https://github.com/donn/RiscBEE).

# Requirements
Make, TypeScript 2 or above, UglifyJS 2 or above, and a compatible version of Node.js. It was tested with Node v7.

If you just want to use Oak.js, it should work fine on any modern browser, bar modern versions of Internet Explorer.

## Getting Node
### macOS
It is recommended to use the [Homebrew package manager](https://brew.sh) first. Type in your terminal:

    brew install node

### Debian-based OSes (incl. Ubuntu)
Again, in the terminal:

    sudo apt-get install nodejs npm

For other Linux-based OSes, substitute aptitude's syntax with that of your package manager's.
If you get errors about node not being found, try running the following: `ln -s /usr/bin/nodejs /usr/bin/node`.
    
### Windows
Please use Bash on Ubuntu on Windows 10 and follow the instructions for Debian-based OSes for a supported and tested workflow. If you do not wish to use the Linux subsystem, try first installing Node.js from [their website](http://nodejs.org/).

Like Debian-based OSes, you may need administrative privileges for this.

## Packages
Just run `npm install`.

# Usage
To use Oak.js, either visit the [GitHub Page](https://skyus.github.io/Oak.js) or download this repository and open index.html using your web browser.

To compile and clean, `make` or `make clean` respectively.

-- Please note that the browser version is not yet integrated on this branch.

## On-computer usage
Currently, the Terminal UI only supports assembling and simulating RISC-V files.

`node Executables/Oak.js <RISCVAssemblyFile.s>`

# License
Mozilla Public License 2.0. Check LICENSE.

# Note
Yes, I did patch the Ace text editor to support 0-based numbering. No, I don't remember how.