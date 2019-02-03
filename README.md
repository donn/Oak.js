![Oak.js](public/images/logo.png)

An assembler and simulator generator written in TypeScript.

It supports both RISCV (RV32I) and MIPS (Core Instruction Set).

The assembler and simulator were designed by [@donn](https://github.com/donn) and the user interface for the web version was designed by [@KarimIO](https://github.com/KarimIO).

Special thanks to [@alikhaled96](https://github.com/alikhaled96) for helping implement MIPS.

# Requirements
TypeScript 2 or above, UglifyJS 2 or above, and a compatible version of Node.js. It was tested with Node v7.

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

# Building and Usage
To use the latest stab;le web version of Oak.js, visit the [GitHub Page](https://donn.github.io/Oak.js).

First of all, you need to install dependencies. You can just write `npm install`.

## Web version
Simply invoke `node make web`.

## On-computer usage
Invoke `make`. This does require a POSIX-y environment and GNU make.

For more, invoke `./bin/oak --help`.

(There is `node make exec` but it's maintained by the GUI side of the project and I have no guarantees that it will work.)

# License
Mozilla Public License 2.0. Check LICENSE.