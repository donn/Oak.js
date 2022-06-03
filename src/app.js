import React, { Component } from "react";
import TextEditor from "./sections/texteditor.js";
import Navigation from "./sections/navigation.js";
import PanelContainer from "./sections/panelcontainer.js";
import PanelMemory from "./sections/panelmemory.js";
import PanelConsole from "./sections/panelconsole.js";
import PanelLog from "./sections/panellog.js";
import Help from "./sections/help";
import About from "./sections/about";
import Settings from "./sections/settings";
import PanelSettings from "./sections/panelsettings";
import PanelConversion from "./sections/panelconversion";
import PanelRegisters from "./sections/panelregisters";
//import CoreContext from './coreContext';
import PanelMachineCode from "./sections/panelmachinecode";

import "./isas/RISCV";
import "./isas/MIPS";

import OakJS from "./oak/index.js";

import { connect } from "react-redux";
import { Translate, withLocalize } from "react-localize-redux";
import { renderToStaticMarkup } from "react-dom/server";

import enTranslations from "./translations/en.json";

import {
    selectTab,
    addTab,
    updateTab,
    setProjectSettings,
    setSettingsVisible,
    setHelpVisible,
    setAboutVisible,
} from "./actions";

const SimulatingStatus = {
    Stopped: 0,
    Step: 1,
    Play: 2,
};

const REGISTER_UNASSIGNED = 0;
const REGISTER_ASSIGNED = 1;
const REGISTER_NEWASSIGNED = 2;

const CONSOLE_INPUT_NONE = 0;
const CONSOLE_INPUT_NUM = 1;
const CONSOLE_INPUT_STR = 2;

const decode_error_msg = (
    <span>
        <b>Error: </b>Failed to decode instruction. In practice, the most likely
        cause is forgetting to terminate the program using the appropriate
        system call (see help section).
    </span>
);

const MessageType = {
    Log: 0,
    Input: 1,
    Output: 2,
    Success: 3,
    Warning: 4,
    Error: 5,
};

class App extends Component {
    virtual_os;

    constructor(props) {
        super(props);

        this.props.initialize({
            languages: [{ name: "English", code: "en" }],
            options: { renderToStaticMarkup },
        });

        // $.ajax({
        //     type: "POST",
        //     url: 'https://pastebin.com/api/api_post.php',
        //     data: {
        //         api_dev_key:    'fe832913bc53f77f05505bc93e3b04b1',
        //         api_option:     'paste',
        //         api_paste_code: "Dude this is\nHella cool"
        //     },
        //     async:true,
        //     dataType : 'text/plain',   //you may use jsonp for cross origin request
        //     crossDomain:true,
        //     headers: {
        //         "Access-Control-Allow-Origin": "*",
        //         "Access-Control-Allow-Headers": "origin, content-type, accept"
        //     },
        //     success: function(data, status, xhr) {
        //         console.log("Pastebin success: " + data);
        //     }
        // });

        // $.ajax({
        //     type: "GET",
        //     url: 'https://pastebin.com/Tricwqr6',
        //     data: {
        //         api_dev_key:    'fe832913bc53f77f05505bc93e3b04b1',
        //         api_option:     'paste',
        //         api_paste_code: "Dude this is\nHella cool"
        //     },
        //     async:true,
        //     dataType : 'text/plain',   //you may use jsonp for cross origin request
        //     crossDomain:true,
        //     headers: {
        //         "Access-Control-Allow-Origin": "*",
        //         "Access-Control-Allow-Headers": "origin, content-type, accept"
        //     },
        //     success: function(data, status, xhr) {
        //         console.log("Pastebin get success: " + data);
        //     }
        // });

        this.state = {
            panel_x: 256,
            panel_y: 256,
        };

        this.component_input = React.createRef();

        window.addEventListener("keyup", this.handleKeyPress);

        this.props.addTranslationForLanguage(enTranslations, "en");

        this.virtual_os = new OakJS.VirtualOS(); // The virtual OS handles ecalls. It takes a bunch of callbacks: output Int, output String, etcetera...
        this.virtual_os.inputInt = () => {
            let tab = this.props.tabs[this.props.selectedtab];
            if (tab) {
                tab.console_input_type = CONSOLE_INPUT_NUM;
            }
        };

        this.virtual_os.inputString = () => {
            let tab = this.props.tabs[this.props.selectedtab];
            if (tab) {
                tab.console_input_type = CONSOLE_INPUT_STR;
            }
        };

        this.virtual_os.outputInt = (number) => {
            this.addConsoleMessage(MessageType.Output, ">> " + number);
        };

        this.virtual_os.outputString = (string) => {
            this.addConsoleMessage(MessageType.Output, ">> " + string);
        };

        this.virtual_os.handleHalt = () => {
            let current_tab = this.props.selectedtab;
            let tab = this.props.tabs[current_tab];

            if (!tab) return;

            tab.runningStatus = SimulatingStatus.Stopped;

            this.addConsoleMessage(
                MessageType.Success,
                " == SIMULATION COMPLETED == "
            );

            this.props.updateTab(current_tab, tab);
        };

        this.addTabDefault();
    }

    handleKeyPress = (event) => {
        let current_tab = this.props.selectedtab;
        let tab = this.props.tabs[current_tab];

        if (tab && tab.console_input_type !== CONSOLE_INPUT_NONE) {
            event.preventDefault();

            let input = tab.console_input;
            let cursor = tab.cursor_pos;

            if (event.key === "Enter") {
                this.continueAfterConsole(input);
                tab.console_input = "";
            } else if (event.which === 8) {
                if (cursor > 0) {
                    let val = input.slice(0, cursor - 1) + input.slice(cursor);

                    tab.cursor_pos = cursor - 1;
                    tab.console_input = val;
                }
            } else if (event.keyCode === 46) {
                if (cursor < input.length) {
                    let val = input.slice(0, cursor) + input.slice(cursor + 1);

                    tab.cursor_pos = cursor - 1;
                    tab.console_input = val;
                }
            } else if (event.keyCode === 37) {
                cursor = cursor <= 0 ? 0 : cursor - 1;
                tab.cursor_pos = cursor;
            } else if (event.keyCode === 39) {
                let l = tab.console_input.length;
                cursor = cursor >= l ? l : cursor + 1;
                tab.cursor_pos = l;
            } else {
                let out = event.key;

                const keycode = event.keyCode;
                const isNum = tab.console_input_type === CONSOLE_INPUT_NUM;

                var valid =
                    (keycode > 47 && keycode < 58) || // number keys
                    (!isNum &&
                        (keycode === 32 ||
                            keycode === 13 || // spacebar & return key(s) (if you want to allow carriage returns)
                            (keycode > 64 && keycode < 91) || // letter keys
                            (keycode > 95 && keycode < 112) || // numpad keys
                            (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
                            (keycode > 218 && keycode < 223)));

                if (valid) {
                    out = input.slice(0, cursor) + out + input.slice(cursor);
                    tab.console_input = out;
                    tab.cursor_pos = cursor + 1;
                }
            }

            this.props.updateTab(current_tab, tab);

            return false;
        }
    };

    addConsoleMessage = (msg_type, data) => {
        let current_tab = this.props.selectedtab;
        let tabs = this.props.tabs;
        let tab = tabs[current_tab];

        let className;
        if (msg_type === MessageType.Error) className = "console_error";
        else if (msg_type === MessageType.Warning)
            className = "console_warning";
        else if (msg_type === MessageType.Success)
            className = "console_success";
        else if (msg_type === MessageType.Output) className = "console_output";
        else if (msg_type === MessageType.Input) className = "console_input";
        else className = "console_log";

        tab.console.push(<div className={className}>{data}</div>);
        this.props.updateTab(current_tab, tab);
    };

    continueAfterConsole = (input) => {
        let selected = this.props.selectedtab;
        let tab = this.props.tabs[selected];

        let core = tab.core;

        if (tab.console_input_type === CONSOLE_INPUT_NUM) {
            input = parseInt(input, 10);
            this.virtual_os.continueInputInt(core, input);
            this.addConsoleMessage(MessageType.Log, "<< " + input);
        } else if (tab.console_input_type === CONSOLE_INPUT_STR) {
            this.virtual_os.continueInputString(core, input);
            this.addConsoleMessage(MessageType.Log, "<< " + input);
        }

        tab.console_input_type = CONSOLE_INPUT_NONE;

        this.checkUpdatedTabs();
        this.props.updateTab(selected, tab);
    };

    checkUpdatedTabs = () => {
        let tab = this.props.tabs[this.props.selectedtab];

        var mod_reg = tab.core.registerFile.getModifiedRegisters();

        for (let i = 0; i < tab.register_changed.length; ++i) {
            if (mod_reg[i]) tab.register_changed[i] = REGISTER_NEWASSIGNED;
            else if (tab.register_changed[i] === REGISTER_NEWASSIGNED)
                tab.register_changed[i] = REGISTER_ASSIGNED;
        }
    };

    addTabFull = (
        name,
        code,
        machine_code,
        mem_size,
        isa,
        get_example_code
    ) => {
        let selected = this.props.tabs.length;

        let core = OakJS.Core.factory.getCore(isa, mem_size, this.virtual_os);

        let new_tab = {
            name: name,
            content: get_example_code ? core.instructionSet.exampleCode : code,
            log: [],
            console: [],
            machine_code: machine_code,
            core: core,
            register_changed: [],
            runningStatus: SimulatingStatus.Stopped,
            instruction_set: isa,
            console_input: "",
            console_input_type: CONSOLE_INPUT_NONE,
            cursor_pos: 0,
        };

        new_tab.register_changed = Array.from(
            { length: core.registerFile.physicalFile.length },
            () => REGISTER_UNASSIGNED
        );

        // TODO: Send to Project Settings
        this.props.setProjectSettings(name, mem_size, isa);

        this.props.addTab(new_tab);
        this.props.selectTab(selected);
    };

    addTab = (name, code, machine_code) => {
        this.addTabFull(
            name,
            code,
            machine_code,
            4096,
            this.getDefaultISA(),
            false
        );
    };

    addTabDefault = () => {
        this.addTabFull("New Tab", "", [], 4096, this.getDefaultISA(), true);
    };

    addTabDefaultRISCV = () => {
        this.addTabFull("New Tab", "", [], 4096, "RISCV", true);
    };

    addTabDefaultMIPS = () => {
        this.addTabFull("New Tab", "", [], 4096, "MIPS", true);
    };

    getDefaultISA = () => {
        return OakJS.Core.factory.getCoreList()[0];
    };

    handleUpload = (event) => {
        let files = this.component_input.current.files;
        if (files.length <= 0) return;

        let file = files[0];
        if (this.is_upload_bin) {
            let name = file.name;
            let blob = file.slice(0, file.size);
            let fr = new FileReader();
            let me = this;
            fr.addEventListener("load", function () {
                var bytes = new Uint8Array(this.result);
                me.addTab(name, "", Array.from(bytes));
            });
            fr.readAsArrayBuffer(blob);
        } else {
            let name = file.name;
            let blob = file.slice(0, file.size);
            let fr = new FileReader();
            let me = this;
            fr.addEventListener("load", function () {
                let res = this.result;

                me.addTab(name, res, []);
            });
            fr.readAsText(blob);
        }
    };

    handleLoadAsm = () => {
        this.is_upload_bin = false;
        this.component_input.current.click();
    };

    handleLoadBin = () => {
        this.is_upload_bin = true;
        this.component_input.current.click();
    };

    handleDownloadAsm = () => {
        const current_tab = this.props.selectedtab;
        let tab = this.props.tabs[current_tab];

        var data = tab.content;
        if (data.length === 0) return;

        var el = document.createElement("a");
        var blob = new Blob([data], {
            type: "text/plain",
        });
        var blobLink = URL.createObjectURL(blob);
        var name = tab.name + ".s";
        el.setAttribute("href", blobLink);
        el.setAttribute("download", name);
        el.style.display = "none";
        document.body.appendChild(el);
        el.click();
        document.body.removeChild(el);
    };

    downloadBin = () => {
        const current_tab = this.props.selectedtab;
        let tab = this.props.tabs[current_tab];

        var data = tab.machine_code;
        var byteArray = new Uint8Array(data);
        var blob = new Blob([byteArray], {
            type: "application/octet-stream",
        });
        var blobLink = URL.createObjectURL(blob);
        var element = document.createElement("a");
        var name = tab.name + ".bin";
        element.setAttribute("href", blobLink);
        element.setAttribute("download", name);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    downloadBinH = () => {
        const current_tab = this.props.selectedtab;
        let tab = this.props.tabs[current_tab];

        let finalFile = tab.machine_code
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("\n");

        var blob = new Blob([finalFile], {
            type: "text/plain",
        });
        var blobLink = URL.createObjectURL(blob);
        var element = document.createElement("a");
        var name = tab.name + ".hex";
        element.setAttribute("href", blobLink);
        element.setAttribute("download", name);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    downloadRam = () => {
        const current_tab = this.props.selectedtab;
        let tab = this.props.tabs[current_tab];

        var data = tab.core.memory;
        var byteArray = new Uint8Array(data);
        var blob = new Blob([byteArray], {
            type: "application/octet-stream",
        });
        var blobLink = URL.createObjectURL(blob);
        var element = document.createElement("a");
        var name = tab.name + ".bin";
        element.setAttribute("href", blobLink);
        element.setAttribute("download", name);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    resetUI = () => {
        let current_tab = this.props.selectedtab;
        let tabs = this.props.tabs;
        let tab = tabs[current_tab];
        tab.log = [];
        tab.console = [];
        tab.register_changed = Array.from(
            { length: tab.register_changed.length },
            () => REGISTER_UNASSIGNED
        );
        tab.runningStatus = SimulatingStatus.Stopped;

        tab.console_input = "";
        tab.console_input_type = CONSOLE_INPUT_NONE;
        tab.cursor_pos = 0;

        this.props.updateTab(current_tab, tab);
    };

    reset = () => {
        let current_tab = this.props.selectedtab;
        let tabs = this.props.tabs;
        let tab = tabs[current_tab];

        tab.core.reset();
        this.resetUI();
    };

    uiSimulate = () => {
        let current_tab = this.props.selectedtab;
        let tab = this.props.tabs[current_tab];

        if (tab.console_input_type !== CONSOLE_INPUT_NONE) return;

        if (tab.runningStatus === SimulatingStatus.Stopped) this.uiAssemble();

        let core = tab.core;

        tab.runningStatus = SimulatingStatus.Play;

        while (true) {
            let fetch = core.fetch();
            if (fetch !== null) {
                this.addConsoleMessage(MessageType.Error, fetch);
                tab.runningStatus = SimulatingStatus.Stopped;
                break;
            }

            let decode = core.decode(); // Decode has the decoded instruction on success

            if (decode === null) {
                this.addConsoleMessage(MessageType.Error, decode_error_msg);
                tab.runningStatus = SimulatingStatus.Stopped;
                break;
            } else {
                tab.log.push(decode);
            }

            let execute = core.execute();
            if (execute !== null) {
                if (execute !== "HALT" && execute !== "WAIT") {
                    // If HALT, then an environment call has been executed.
                    this.addConsoleMessage(MessageType.Error, execute);
                    tab.runningStatus = SimulatingStatus.Stopped;
                }
                break;
            }
        }

        this.checkUpdatedTabs();
        this.props.updateTab(current_tab, tab);
    };

    uiStepByStep = () => {
        let current_tab = this.props.selectedtab;
        let tab = this.props.tabs[current_tab];

        if (tab.console_input_type !== CONSOLE_INPUT_NONE) return;

        if (tab.runningStatus === SimulatingStatus.Stopped) this.uiAssemble();

        let core = tab.core;

        tab.runningStatus = SimulatingStatus.Step;

        let fetch = core.fetch();
        if (fetch !== null) {
            this.addConsoleMessage(MessageType.Error, fetch);
            tab.runningStatus = SimulatingStatus.Stopped;
            this.props.updateTab(current_tab, tab);
            return;
        }

        let decode = core.decode(); // Decode has the decoded instruction on success

        if (decode === null) {
            this.addConsoleMessage(MessageType.Error, decode_error_msg);
            tab.runningStatus = SimulatingStatus.Stopped;
            this.props.updateTab(current_tab, tab);
            return;
        } else {
            tab.log.push(decode);
        }

        let execute = core.execute();
        if (execute !== null) {
            if (execute !== "HALT" && execute !== "WAIT") {
                // If HALT, then an environment call has been executed.
                this.addConsoleMessage(MessageType.Error, execute);
                tab.runningStatus = SimulatingStatus.Stopped;
            }
        }

        this.checkUpdatedTabs();
        this.props.updateTab(current_tab, tab);
    };

    uiAssemble = () => {
        let current_tab = this.props.selectedtab;
        let tab = this.props.tabs[current_tab];
        var val = tab.content;
        if (val === "") {
            return;
        }

        var core = tab.core;
        this.reset();
        let assembler = new OakJS.Assembler(
            core.instructionSet,
            OakJS.Endianness.little
        );

        let lines = OakJS.Line.arrayFromFile(val);

        let passZero = assembler.assemble(lines, 0); // Assembler Pass 0. Returns Line array with errored lines, which are in line.invalidReason
        if (passZero.length !== 0) {
            for (let i in passZero) {
                let line = passZero[i];
                this.addConsoleMessage(
                    MessageType.Error,
                    <span>
                        <b>Assembly error on line {line.number}:</b>{" "}
                        {line.invalidReason}.
                    </span>
                );
                return;
            }
        }
        let pass = null;
        let passCounter = 1;
        do {
            // Subsequent assembler passes. Typically one pass is needed, but when there's a lot of variance in ISA word sizes, another pass might be needed.
            pass = assembler.assemble(lines, passCounter);
            if (pass.length !== 0) {
                for (let i in pass) {
                    let line = pass[i];
                    this.addConsoleMessage(
                        MessageType.Error,
                        <span>
                            <b>Assembly error on line {line.number}:</b>{" "}
                            {line.invalidReason}.
                        </span>
                    );
                    return;
                }
            }
            passCounter += 1;
        } while (pass === null);

        let machineCode = lines
            .map((line) => line.machineCode)
            .reduce((a, b) => a.concat(b), []); // Get machine code from lines
        core.memset(0, machineCode); // memset

        this.checkUpdatedTabs();

        let error = false; //output.errorMessage===null;
        if (!error) {
            tab.machine_code = machineCode;
            this.addConsoleMessage(
                MessageType.Success,
                <span>
                    <b>Complete:</b> Assembly succeeded.
                </span>
            );
        } else {
            this.addConsoleMessage(
                MessageType.Error,
                <span>
                    <b>Error:</b> Assembler failed.
                </span>
            );
        }

        this.props.updateTab(current_tab, tab);
    };

    handleSettingsChange = () => {
        let current_tab = this.props.selectedtab;
        let tab = this.props.tabs[current_tab];

        if (!tab) return;

        let file_name = this.props.project_settings.file_name;
        let isa_type = this.props.project_settings.isa;
        let memory_size = this.props.project_settings.memory_size;

        tab.name = file_name;

        let diff_isa = isa_type !== tab.instruction_set;
        let diff_mem = memory_size !== tab.core.memorySize;

        let new_isa_found = false;

        if (diff_isa || diff_mem) {
            let instruction_sets = OakJS.Core.factory.ISAs;
            if (instruction_sets[isa_type]) {
                new_isa_found = true;
                tab.core = OakJS.Core.factory.getCore(
                    isa_type,
                    memory_size,
                    this.virtual_os,
                    []
                );
                tab.instruction_set = isa_type;
                this.resetUI();
            }

            if (!new_isa_found) {
                this.addConsoleMessage(
                    MessageType.Error,
                    <span>
                        <b>Error: </b>Could not find ISA {isa_type}.
                    </span>
                );
            }
        }

        this.props.updateTab(current_tab, tab);

        if (new_isa_found) {
            if (diff_isa)
                this.addConsoleMessage(
                    MessageType.Success,
                    <span>
                        <b>Complete: </b>Successfully changed ISA to {isa_type}.
                    </span>
                );

            if (diff_mem)
                this.addConsoleMessage(
                    MessageType.Success,
                    <span>
                        <b>Complete: </b>Successfully changed memory size to{" "}
                        {memory_size}.
                    </span>
                );
        }
    };

    handleStartDragX = (event) => {
        window.addEventListener("mousemove", this.handleDragX);
        window.addEventListener("mouseup", this.handleStopDragX);
    };

    handleX = (event) => {
        let x = event.pageX;
        let w =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        x = w - x;

        if (x < 200) {
            x = 200;
        } else if (x > w - 200) {
            x = w - 200;
        }

        this.setState({ panel_x: x });
    };

    handleX = (event) => {
        let x = event.pageX;
        let w =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        x = w - x;

        if (x < 150) {
            x = 150;
        } else if (x > w - 200) {
            x = w - 200;
        }

        this.setState({ panel_x: x });
    };

    handleY = (event) => {
        let y = event.pageY + 20;
        let h =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;
        y = h - y;

        if (y < 50) {
            y = 50;
        } else if (y > h - 50) {
            y = h - 50;
        }

        this.setState({ panel_y: y });
    };

    handleDragX = (event) => {
        this.handleX(event);
    };

    handleStopDragX = (event) => {
        this.handleX(event);
        window.removeEventListener("mousemove", this.handleDragX);
        window.removeEventListener("mouseup", this.handleStopDragX);
    };

    handleStartDragY = (event) => {
        window.addEventListener("mousemove", this.handleDragY);
        window.addEventListener("mouseup", this.handleStopDragY);
    };

    handleDragY = (event) => {
        this.handleY(event);
    };

    handleStopDragY = (event) => {
        this.handleY(event);
        window.removeEventListener("mousemove", this.handleDragY);
        window.removeEventListener("mouseup", this.handleStopDragY);
    };

    showSettings = () => {
        this.props.setSettingsVisible(true);
    };

    showHelp = () => {
        this.props.setHelpVisible(true);
    };

    showAbout = () => {
        alert(1);
        this.props.setAboutVisible(true);
    };

    render() {
        let current_tab = this.props.selectedtab;
        let tab = this.props.tabs[current_tab];

        let has_tabs = this.props.tabs.length > 0;
        let show_input = false;

        if (tab) show_input = tab.console_input_type !== CONSOLE_INPUT_NONE;

        return (
            <React.Fragment>
                <About />
                <Help />
                <Settings
                    canhandleinput={!show_input}
                    fn_new={this.addTabDefault}
                    fn_load={this.handleLoadAsm}
                    fn_save={this.handleDownloadAsm}
                    fn_ass={this.uiAssemble}
                    fn_sim={this.uiSimulate}
                    fn_step={this.uiStepByStep}
                />
                <Navigation
                    assemble={this.uiAssemble}
                    simulate={this.uiSimulate}
                    stepbystep={this.uiStepByStep}
                    downloadRam={this.downloadRam}
                    downloadBin={this.downloadBin}
                    downloadBinH={this.downloadBinH}
                    handleAddTabRiscv={this.addTabDefaultRISCV}
                    handleAddTabMips={this.addTabDefaultMIPS}
                    handleLoadAsm={this.handleLoadAsm}
                    handleLoadBin={this.handleLoadBin}
                    handleDownloadAsm={this.handleDownloadAsm}
                />
                {!has_tabs && (
                    <div className="no_tabs">
                        <div>
                            <h2>
                                <Translate id="welcome.title">
                                    Welcome to Oak.js
                                </Translate>
                            </h2>
                            <p>
                                <Translate id="welcome.subtitle">
                                    Oak.js is an online javascript IDE,
                                    Assembler, Disassembler, and Simulator for
                                    assembly languages such as RISC-V and MIPS.
                                </Translate>
                            </p>
                            <button
                                className="button"
                                onClick={this.addTabDefault}
                            >
                                <Translate id="menus.add_tab">
                                    Add a Tab
                                </Translate>
                            </button>
                            <button
                                className="button"
                                onClick={this.handleLoadAsm}
                            >
                                <Translate id="menus.load_assembly">
                                    Load Assembly
                                </Translate>
                            </button>
                            <button
                                className="button"
                                onClick={this.handleLoadBin}
                            >
                                <Translate id="menus.load_binary">
                                    Load Binary
                                </Translate>
                            </button>
                        </div>
                    </div>
                )}
                {has_tabs && (
                    <div
                        className="grid"
                        style={{
                            gridTemplateColumns: `auto ${this.state.panel_x}px`,
                            gridTemplateRows: `auto calc(${this.state.panel_y}px)`,
                        }}
                    >
                        <TextEditor
                            is_disabled={show_input}
                            addTab={this.addTabDefault}
                        />
                        <PanelContainer
                            handleStartDrag={this.handleStartDragY}
                            className="panel_bottom"
                        >
                            <PanelConsole
                                show_input={show_input}
                                input={tab.console_input}
                            />
                            <PanelMachineCode />
                            <PanelMemory />
                            <PanelLog />
                        </PanelContainer>
                        <PanelContainer
                            handleStartDrag={this.handleStartDragX}
                            className="panel_side"
                        >
                            <PanelSettings
                                submitChanges={this.handleSettingsChange}
                            />
                            <PanelRegisters />
                            <PanelConversion />
                        </PanelContainer>
                    </div>
                )}
                <input
                    type="file"
                    onChange={this.handleUpload}
                    ref={this.component_input}
                />
            </React.Fragment>
        );
    }
}

const appStateToProps = (state) => {
    return {
        tabs: state.tabs,
        selectedtab: state.selectedtab,
        project_settings: state.project_settings,
    };
};

const appDispatchToProps = (dispatch, ownProps) => ({
    addTab: (tab) => dispatch(addTab(tab)),
    updateTab: (index, tab) => dispatch(updateTab(index, tab)),
    selectTab: (id) => dispatch(selectTab(id)),
    setProjectSettings: (n, s, i) => dispatch(setProjectSettings(n, s, i)),
    setHelpVisible: (visible) => dispatch(setHelpVisible(visible)),
    setAboutVisible: (visible) => dispatch(setAboutVisible(visible)),
    setSettingsVisible: (visible) => dispatch(setSettingsVisible(visible)),
});

export default withLocalize(connect(appStateToProps, appDispatchToProps)(App));
