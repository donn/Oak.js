# Oak.js
A port of [Oak](https://github.com/Skyus/Oak) to TypeScript for a Computer Organization course.

Unlike the Swift version, the TypeScript version only aims to use a specified subset of the RISC-V instruction set architecture. As a result, some features were removed, including variable length ISA support.

The user interface was made mostly by [@KarimIO](https://github.com/KarimIO).

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
