![Oak.js](public/images/logo.png)

An assembler and simulator generator written in TypeScript.

It supports both RISCV (RV32I) and MIPS (Core Instruction Set).

The assembler and simulator were designed by [@donn](https://github.com/donn) and the user interface for the web version was designed by [@KarimIO](https://github.com/KarimIO).

Special thanks to [@alikhaled96](https://github.com/alikhaled96) for helping implement MIPS.

# Requirements and Building
TypeScript 2 or above, UglifyJS 2 or above, and a compatible version of Node.js. It was tested with Node v7.

If you just want to use Oak.js, it should work fine on any modern browser, bar modern versions of Internet Explorer.

## Getting Node
### macOS
It is recommended to use the [Homebrew package manager](https://brew.sh) first. Type in your terminal:

    brew install node

### Debian-based OSes (incl. Ubuntu)
Use `tj/n` to install node.
    
    curl -L https://git.io/n-install | bash
    
### Windows
Please use Bash on Ubuntu on Windows 10 and follow the instructions for Debian-based OSes for a supported and tested workflow. If you do not wish to use the Linux subsystem, try first installing Node.js from [their website](http://nodejs.org/).

Like Debian-based OSes, you may need administrative privileges for this.

## Getting yarn
Type `npm i -g yarn`. Simple.

## Installing Dependencies
You also need to install package dependencies. You can just write `yarn install`.

## Building
Invoke `node make web` for the web version or `node run make` for the local executable.

# Usage
For the web, `yarn start,` for the CLI, invoke `node ./bin/oak --help`.

# License
Mozilla Public License 2.0. Check LICENSE.