![Oak.js](public/images/logo.png)

An assembler and simulator generator written in ~~TypeScript~~ JavaScript.

It supports both RISCV (RV32I) and MIPS (Core Instruction Set).

The assembler and simulator were designed by [@donn](https://github.com/donn) and the user interface for the web version was designed by [@KarimIO](https://github.com/KarimIO).

Special thanks to [@alikhaled96](https://github.com/alikhaled96) for helping implement MIPS.

# Requirements and Building
Node v12 or higher.

If you just want to use Oak.js, it should work fine on any modern browser, bar modern versions of Internet Explorer.

## Getting Node
### Unix
Use `tj/n` to install node.
    
    curl -L https://git.io/n-install | bash
    sudo n lts
    
### Windows
Please use WSL2 for Windows 10 and follow the instructions for Debian-based OSes for a supported and tested workflow.

If you do not wish to use the Linux subsystem, try first installing Node.js from [their website](http://nodejs.org/). This codebase uses symlinks, however, so no promises this will function.

Like Debian-based OSes, you may need administrative privileges for this.

## Getting yarn
Type `npm i -g yarn`. Simple.

## Installing Dependencies
You also need to install package dependencies. You can just write `yarn install`.

# Usage
For the web, `yarn start` for the CLI, invoke `node ./main.js --help`.

# License
Mozilla Public License 2.0. Check LICENSE.