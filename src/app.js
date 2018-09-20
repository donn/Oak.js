import React, { Component } from 'react';
import "./app.css";
import TextEditor from "./sections/texteditor.js";
import Navigation from "./sections/navigation.js";
import PanelContainer from "./sections/panelcontainer.js";
import PanelMemory from "./sections/panelmemory.js";
import PanelConsole from "./sections/panelconsole.js";
import PanelLog from "./sections/panellog.js";
import StatusBar from "./sections/statusbar.js";
import Help from './sections/help';
import Settings from './sections/settings';
import PanelSettings from './sections/panelsettings';
import PanelConversion from './sections/panelconversion';
import PanelRegisters from './sections/panelregisters';
import CoreContext from './coreContext';
import PanelMachineCode from './sections/panelmachinecode';
import {Endianness, CoreFactory, Assembler, AssemblerLine} from './backend.js'

const SIMULATING_OFF  = 0;
const SIMULATING_STEP = 1;
const SIMULATING_PLAY = 2;

const REGISTER_UNASSIGNED = 0;
const REGISTER_ASSIGNED = 1;
const REGISTER_NEWASSIGNED = 2;

const CONSOLE_INPUT_NONE  = 0;
const CONSOLE_INPUT_NUM = 1;
const CONSOLE_INPUT_STR = 2;

let instruction_sets = ["RISC-V", "MIPS"];

export default class App extends Component {
	simulation_start;
	simulation_status;

	constructor(props) {
		super(props);
		this.state = {
			core: {
				selected: -1,
				tabs: []
			},
			panel_x: 256,
			panel_y: 256,
			console_input: "",
			console_input_type: CONSOLE_INPUT_NONE,
			is_disabled: false,
			cursor_pos: 0,
			theme:      0,
			default_isa: "",
			hotkeyNewTab: "a_110",
			hotkeySave: "a_115",
			hotkeyOpen: "a_111",
			hotkeyAssemble: "_119",
			hotkeySimulate: "_120",
			hotkeyStepbystep: "_121"
		};
		this.component_settings = React.createRef();
		this.component_help = React.createRef();
		this.component_editor = React.createRef();
		this.component_input = React.createRef();
		this.component_panel_settings = React.createRef();
	}

	componentDidMount() {
		window.addEventListener("keypress", this.handleKeyPress);

		this.addTabDefault();
	}


	handleKeyPress = (event) => {
		if (this.state.console_input_type === CONSOLE_INPUT_NONE) {
			this.component_settings.current.handleKey(event);
		}
		else {
			event.preventDefault();

			let input = this.state.console_input;
			let cursor = this.state.cursor_pos;

			if (event.key === "Enter") {
				console.log("Entered!", input);
				this.continueAfterConsole(input);
				this.setState({console_input: ""});
			}
			else if (event.which === 8) {
				if (cursor > 0) {
					let val = input.slice(0, cursor - 1) + input.slice(cursor);
					
					this.setState({console_input: val, cursor_pos: cursor - 1});
				}
			}
			else if (event.keyCode === 46) {
				if (cursor < input.length) {
					let val = input.slice(0, cursor) + input.slice(cursor + 1);
					
					this.setState({console_input: val});
				}
			}
			else if (event.keyCode === 37) {
				cursor = (cursor === 0) ? 0 : cursor - 1;
				this.setState({cursor_pos: cursor});
			}
			else if (event.keyCode === 39) {
				this.setState({cursor_pos: cursor + 1});
			}
			else {
				let out = event.key;
				out = input.slice(0, cursor) + out + input.slice(cursor);
				this.setState({console_input: out, cursor_pos: cursor + 1});
			}

			return false;
		}
	}

	instructionCallback = (data) => {
		let tabs = this.state.core.tabs;
		let tab = tabs[this.state.core.selected];
		tab.log.push(data);

		this.setState(prevState => ({
			core: {
				...prevState.core,
				tabs: tabs
			}
		}));
	}

	addConsoleMessage = (data) => {
		let tabs = this.state.core.tabs;
		let tab = tabs[this.state.core.selected];
		tab.console.push(data);

		this.setState(prevState => ({
			core: {
				...prevState.core,
				tabs: tabs
			}
		}));
	}

	registerRead = (core, reg) => {
		return core.registerFile.physicalFile[reg];
	}

	registerWrite = (core, reg, val) => {
		core.registerFile.physicalFile[reg] = val;
	}

	ecallCallback = () => {
		let selected = this.state.core.selected;
		let tab = this.state.core.tabs[selected];

		var core = tab.core;
		var reg_type = core.defaultEcallRegType;
		var reg_arg  = core.defaultEcallRegArg;
		var type = this.registerRead(core, reg_type);
		var arg =  this.registerRead(core, reg_arg);
	
		if (this.simulation_status === SIMULATING_STEP) {
			let log = tab.log[tab.log.length-1];
			this.addConsoleMessage(<div className="console_step"><b>Simulator Step: </b> {log}</div>);
		}
			
		//setConsoleMode(0);
		let exit = false;
		let output = "";
	
		switch (type) {
		case 1: { // Integer
			this.addConsoleMessage(<div className="console_output">> {arg}</div>);
			break;
		}
		case 4: { // String
			var pointer = arg;
			var char = core.memory[pointer];
			while (char !== 0) {
				output += String.fromCharCode(char);
				pointer += 1;
				char = core.memory[pointer];
			}
			this.addConsoleMessage(<div className="console_output">> {output}</div>);
			break;
		}
		case 5: {
			this.setState({console_input_type: CONSOLE_INPUT_NUM});
			return;
		}
		case 8: {
			this.setState({console_input_type: CONSOLE_INPUT_STR});
			return;
		}
		case 10: {
			exit = true;
			break;
		}
		case 420: {
			let link;
			switch(arg) {
				default:
					link = "https://youtube.com/watch?v=KZACorHeE-c";
					break;
				case 1:
					link = "https://youtube.com/watch?v=L_jWHffIx5E";
					break;
				case 2:
					link = "https://youtube.com/watch?v=dQw4w9WgXcQ";
					break;
				case 3:
					link = "https://youtube.com/watch?v=VONRQMx78YI";
					break;
				case 4:
					link = "https://youtube.com/watch?v=mtf7hC17IBM";
					break;
				case 5:
					link = "https://youtube.com/watch?v=yKNxeF4KMsY";
					break;
			}
			let win = window.open(link, "_blank");
			win.focus();        
			break;
		}
		case 1776: {
			let win = window.open("https://youtu.be/TOygO4n-CtQ", "_blank");
			win.focus();
			break;
		}
		case 24601: {
			let win = window.open("https://youtu.be/IZdjz6lLngU?t=150", "_blank");
			win.focus();
			break;
		}
		default: {
			output = "<b>WARNING:</b> Environment call " + type + " unsupported.";
			break;
		}
		}
		
		/*if (exit) {
			this.checkUpdatedTabs();
			if (this.simulation_status === SIMULATING_STEP) {
				this.simulation_status = SIMULATING_OFF;
				this.addConsoleMessage(<div className="console_success"><b>Complete:</b> Simulation completed.</div>);
			}
			else {
				this.simulation_status = SIMULATING_OFF;
				var time = performance.now() - this.simulation_start;
				var numInstructions = tab.log.length;
				var ips = numInstructions*1000.0/time;
				this.addConsoleMessage(<div className="console_success"><b>Complete:</b> Simulation completed in {Math.round(time)} ms, {numInstructions} instructions, {Math.round(ips)} instructions/second.</div>);
			}
		} else if (this.simulation_status !== SIMULATING_STEP) {
			output = window.continueSim(core);
			if (output !== "@Oak_Ecall" && output !== null) {
				this.checkUpdatedTabs();
				this.addConsoleMessage("<b>Simulator Error: </b>" + output);
			}
		}*/
	}

	continueAfterConsole = (input) => {
		let selected = this.state.core.selected;
		let tab = this.state.core.tabs[selected];

		let core = tab.core;

		let reg_type = core.defaultEcallRegType;
		let reg_arg  = core.defaultEcallRegArg;
		var arg =  this.registerRead(core, reg_arg);

		if (this.state.console_input_type === CONSOLE_INPUT_NUM) {
			input = parseInt(input, 10);
			this.registerWrite(core, reg_type, input);
			this.addConsoleMessage(<div className="console_input">{"<"} {input}</div>);
		} else if (this.state.console_input_type === CONSOLE_INPUT_STR) {
			console.log(input);
			let bytes = [];
			for (var i = 0; i < input.length; i++) {
				bytes.push(input.charCodeAt(i) & 255);
			}
			bytes.push(0);
			core.memset(arg, bytes);
			this.addConsoleMessage(<div className="console_input">{"<"} {input}</div>);
		}

		this.setState({console_input_type: CONSOLE_INPUT_NONE});
		
		if (this.simulation_status !== SIMULATING_STEP) {
			let output = window.continueSim(core);
			if (output !== "@Oak_Ecall" && output !== null) {
				this.checkUpdatedTabs();
				this.addConsoleMessage(<b>Simulator Error: </b> + output);
			}
		}
	}

	checkUpdatedTabs = () => {
		let tab = this.state.core.tabs[this.state.core.selected];

		var mod_reg = tab.core.registerFile.getModifiedRegisters();
		for(let i = 0; i < tab.register_changed.length; ++i) {
			if (mod_reg[i])
				tab.register_changed[i] = REGISTER_NEWASSIGNED;
			else if (tab.register_changed[i] ===  REGISTER_NEWASSIGNED)
				tab.register_changed[i] = REGISTER_ASSIGNED;
		}
	}

	addTab = (name, code, machine_code) => {
		let selected = this.state.core.tabs.length;
		
		let memorySize = 4096;

		let core = CoreFactory.getCore(instruction_sets[0], memorySize, this.ecallCallback, []);

		let new_tab = {
			name: name,
			content: code,
			log: [],
			console: [],
			machine_code: machine_code,
			core: core,
			register_changed: [],
			instruction_set: instruction_sets[0].name
		};

		new_tab.register_changed = Array.from({ length: core.registerFile.physicalFile.length }, () => REGISTER_UNASSIGNED);
		
		console.log(this.component_panel_settings);
		//this.component_panel_settings.current.setData(new_tab.name, new_tab.instruction_set, new_tab.core.memory.length);
		
		let tabs = this.state.core.tabs;
		tabs.push(new_tab);

		this.setState(prevState => ({
			core: {
				...prevState.core,
				tabs: tabs,
				selected: selected
			}
		}));
	}

	addTabDefault = () => {
		let selected = this.state.core.tabs.length;
		
		let memorySize = 4096;

		let core = CoreFactory.getCore(instruction_sets[0], memorySize, this.ecallCallback, []);
		let tabs = this.state.core.tabs;
		let new_tab = {
			name: "New Tab",
			content: core.instructionSet.exampleCode,
			log: [],
			console: [],
			machine_code: [],
			core: core,
			register_changed: [],
			instruction_set: instruction_sets[0].name
		};
		
		new_tab.register_changed = Array.from({ length: core.registerFile.physicalFile.length }, () => REGISTER_UNASSIGNED);
		
		console.log(this.component_panel_settings);
		//this.component_panel_settings.current.setData(new_tab.name, new_tab.instruction_set, new_tab.core.memory.length);
		
		tabs.push(new_tab);
		this.setState(prevState => ({
			core: {
				...prevState.core,
				tabs: tabs,
				selected: selected
			}
		}));
	}

	handleUpload = (event) => {
		let files = this.component_input.current.files;
		if (files.length <= 0) return;

		let file = files[0];
		if (this.is_upload_bin) {
			let name = file.name;
			let blob = file.slice(0, file.size);
			let fr = new FileReader();
			let me = this;
			fr.addEventListener("load", function ()
			{
				var bytes = new Uint8Array(this.result);
				me.addTab(name, "", Array.from(bytes));
			});
			fr.readAsArrayBuffer(blob);
		}
		else {
			let name = file.name;
			let blob = file.slice(0, file.size);
			let fr = new FileReader();
			let me = this;
			fr.addEventListener("load", function ()
			{
				let res = this.result;
				
				me.addTab(name, res, []);
			});
			fr.readAsText(blob);
		}
	}

	handleLoadAsm = () => {
		this.is_upload_bin = false;
		this.component_input.current.click();
	}

	handleLoadBin = () => {
		this.is_upload_bin = true;
		this.component_input.current.click();
	}

	handleDownloadAsm = () => {
		let tab = this.state.core.tabs[this.state.core.selected];

		var data = tab.content;
		if (data.length === 0)
			return;
			
		var el = document.createElement("a");
		var blob = new Blob([data],
		{
			type: "text/plain"
		});
		var blobLink = URL.createObjectURL(blob);
		var name = tab.name + ".s";
		el.setAttribute("href", blobLink);
		el.setAttribute("download", name);
		el.style.display = "none";
		document.body.appendChild(el);
		el.click();
		document.body.removeChild(el)
	}
	
	downloadBin = () => {
		let tab = this.state.core.tabs[this.state.core.selected];

		var data = tab.machine_code;
		var byteArray = new Uint8Array(data);
		var blob = new Blob([byteArray],
		{
			type: "application/octet-stream"
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
	}
	
	downloadRam = () =>{
		let tab = this.state.core.tabs[this.state.core.selected];

		var data = tab.core.memory;
		var byteArray = new Uint8Array(data);
		var blob = new Blob([byteArray],
		{
			type: "application/octet-stream"
		});
		var blobLink = URL.createObjectURL(blob);
		var element = document.createElement("a");
		var name = tab.name + ".ram";
		element.setAttribute("href", blobLink);
		element.setAttribute("download", name);
		element.style.display = "none";
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element)
	}

	resetUI = () => {
		let current_tab = this.state.core.selected;
		let tabs = this.state.core.tabs;
		let tab = tabs[current_tab];
		tab.log = [];
		tab.console = [];
		tab.register_changed = Array.from({ length: tab.register_changed.length }, () => REGISTER_UNASSIGNED);

		this.setState(prevState => ({
			core: {
				...prevState.core,
				tabs: tabs
			}
		}));
	}

	reset = () => {
		let current_tab = this.state.core.selected;
		let tabs = this.state.core.tabs;
		let tab = tabs[current_tab];

		this.resetUI();
		tab.core.reset();
	}

	uiSimulate = () => {
		let current_tab = this.state.core.selected;
		let tab = this.state.core.tabs[current_tab];
		let core =  tab.core;

		/*if (this.simulation_status === SIMULATING_STEP) {
			this.simulation_status = SIMULATING_PLAY;
			this.simulation_start = performance.now();
			var output = window.continueSim(tab.core);
			if (output !== "@Oak_Ecall" && output !== null) {
				this.checkUpdatedTabs();
				this.addConsoleMessage(<div className="console_error"><b>Simulator Error: </b> {output}</div>);
			}
		}
		else {
			if (tab.content) {
				this.uiAssemble();
			}
			else {
				this.reset();
			}
			
			this.simulation_status = SIMULATING_PLAY;
			this.simulation_start = performance.now();

			let core = tab.core;
			let bytes = tab.machine_code;
			let output = window.simulate(core, bytes);
			if (output !== "@Oak_Ecall" && output != null) {
				this.checkUpdatedTabs();
				this.addConsoleMessage(<div className="console_error"><b>Simulator Error: </b> {output}</div>);
			}
		}*/

		while (true) {
			let fetch = core.fetch();
			if (fetch !== null) {
				console.log(fetch);
				break;
			}
		
			let decode = core.decode(); // Decode has the decoded instruction on success
			tab.log.push(decode);
			
			console.log(decode);
			if (decode === null) {
				console.log("decode.failure");
				break;
			}
		
			let execute = core.execute();
			if (execute !== null) {
				if (execute !== 'HALT') { // If HALT, then an environment call has been executed.
					console.log(execute);
				}
				break;
			}
		}
	}

	uiStepByStep = () => {
		let current_tab = this.state.core.selected;
		let tab = this.state.core.tabs[current_tab];
		let core = tab.core;

		/*if (this.simulation_status !== SIMULATING_STEP) {
			this.uiAssemble();
			let bytes = tab.machine_code;
			var load = window.loadIntoMemory(core, bytes);
			if (load !== null)
			{
				this.addConsoleMessage(<div className="console_error"><b>Failed to load machine code into memory: </b> {load}</div>);
				return;
			}
			this.simulation_status = SIMULATING_STEP;
		}

		var output = window.simulateStep(core);
		this.checkUpdatedTabs();
		
		if (output !== "@Oak_Ecall") {
			let log = tab.log[tab.log.length - 1];
			this.addConsoleMessage(<div className="console_step"><b>Simulator Step: </b> {log}</div>);
		}
		else if (output !== null && output !== "@Oak_Ecall") {
			this.addConsoleMessage(<div className="console_error"><b>Simulator Error: </b> {output}</div>);
		}*/

		let fetch = core.fetch();
		if (fetch !== null) {
			console.log(fetch);
			tab.console.push(fetch);
		}
	
		let decode = core.decode(); // Decode has the decoded instruction on success
		tab.log.push(decode);
		
		console.log(decode);
		if (decode === null) {
			console.log("decode.failure");
			tab.console.push("decode.failure");
		}
	
		let execute = core.execute();
		if (execute !== null) {
			if (execute !== 'HALT') { // If HALT, then an environment call has been executed.
				console.log(execute);
				tab.console.push(execute);
			}
		}
	}
	
	uiAssemble = () => {
		let current_tab = this.state.core.selected;
		let tab = this.state.core.tabs[current_tab];
		var val = tab.content;
		if (val === "") {
			return;
		}

		var core = tab.core;
		this.reset();
		let assembler = new Assembler(core.instructionSet, Endianness.little);
		
		let lines = AssemblerLine.arrayFromFile(val);
		console.log(lines);
		let passZero = assembler.assemble(lines, 0); // Assembler Pass 0. Returns Line array with errored lines, which are in line.invalidReason
		if (passZero.length !== 0) {
			for (let i in passZero) {
				let line = passZero[i];
				console.log(line.number, line.invalidReason);
				return;
				//process.exit(65);
			}
		}
		let pass = null;
		let passCounter = 1;
		do { // Subsequent assembler passes. Typically one pass is needed, but when there's a lot of variance in ISA word sizes, another pass might be needed.
			pass = assembler.assemble(lines, passCounter);
			if (pass.length !== 0) {
				for (let i in passZero) {
					let line = passZero[i];
					console.log(line.number, line.invalidReason);
					return;
					//process.exit(65);
				}
			}
			passCounter += 1;
		} while (pass === null);

		let machineCode = lines.map(line=> line.machineCode).reduce((a, b)=> a.concat(b), []); // Get machine code from lines
		core.memset(0, machineCode); // memset
		console.log(machineCode);

		this.checkUpdatedTabs();

		let error = false; //output.errorMessage===null;
		if (!error) {
			this.setMachineCodeValue(machineCode);
			this.addConsoleMessage(<div className="console_success"><b>Complete:</b> Assembly succeeded.</div>);
		}
		else {
			this.addConsoleMessage(<div className="console_error"><b>Error:</b> Assembler failed.</div>);
		}

		this.simulation_status = SIMULATING_OFF;
	}

	handleTabChange = (id) => {
		let tab = this.state.core.tabs[id];
		this.component_panel_settings.current.setData(tab.name, tab.instruction_set, tab.core.memory.length);
		this.setState(prevState => ({
			core: {
				...prevState.core,
				selected: id
			}
		}));
	};

	handleTabClose = (id) => {
		let selected = this.state.core.selected;

		let tabs = this.state.core.tabs;
		tabs.splice(id, 1);

		if (selected >= id)
			selected -= 1;

		this.setState(prevState => ({
			core: {
				...prevState.core,
				tabs: tabs,
				selected: selected
			}
		}));
	};

	handleSettingsChange = (file_name, isa_type, memory_size) => {
		let tabs = this.state.core.tabs;
		let tab = this.state.core.tabs[this.state.core.selected];
		tab.name = file_name;

		if (this.state.isa_type !== tab.instruction_set || this.state.memory_size !== tab.memory_size) {
			delete tab.core;
			this.resetUI();

			for (let i = 0; i < instruction_sets.length; ++i) {
				if (instruction_sets[i].name === isa_type) {
					tab.core = instruction_sets[i].callback(memory_size, this.ecallCallback, this.instructionCallback);
					break;
				}
			}

			tab.instruction_set = isa_type;
		}

		this.setState(prevState => ({
			core: {
				...prevState.core,
				tabs: tabs
			}
		}));

		this.addConsoleMessage(<div className="console_success"><b>Complete: </b>Successfully changed ISA to {isa_type}.</div>);
	}

	handleStartDragX = (event) => {
		window.addEventListener("mousemove", this.handleDragX);
		window.addEventListener("mouseup", this.handleStopDragX);
	}

	handleX = (event) => {
		let x = event.pageX;
		let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		x = w - x;

		if (x < 200) {
			x = 200;
		}
		else if (x > w - 200) {
			x = w - 200;
		}

		this.setState({panel_x: x});
	}

	handleX = (event) => {
		let x = event.pageX;
		let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		x = w - x;

		if (x < 150) {
			x = 150;
		}
		else if (x > w - 200) {
			x = w - 200;
		}

		this.setState({panel_x: x});
	}

	handleY = (event) => {
		let y = event.pageY + 20;
		let h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		y =  h - y;
		
		if (y < 50) {
			y = 50;
		}
		else if (y > h - 50) {
			y = h - 50;
		}

		this.setState({panel_y: y});
	}

	handleDragX = (event) => {
		this.handleX(event);
	}

	handleStopDragX = (event) => {
		this.handleX(event);
		window.removeEventListener("mousemove", this.handleDragX);
		window.removeEventListener("mouseup", this.handleStopDragX);
	}

	handleStartDragY = (event) => {
		window.addEventListener("mousemove", this.handleDragY);
		window.addEventListener("mouseup", this.handleStopDragY);
	}

	handleDragY = (event) => {
		this.handleY(event);
	}

	handleStopDragY = (event) => {
		this.handleY(event);
		window.removeEventListener("mousemove", this.handleDragY);
		window.removeEventListener("mouseup", this.handleStopDragY);
	}

	showSettings = () => {
		this.component_settings.current.handleShow();
	}

	showHelp = () => {
		this.component_help.current.handleShow();
	}

	setEditorValue = (val) => {
		let tabs = this.state.core.tabs;
		tabs[this.state.core.selected].content = val;

		this.setState(prevState => ({
			core: {
				...prevState.core,
				tabs: tabs
			}
		}));
	}

	setMachineCodeValue = (val) => {
		let tabs = this.state.core.tabs;
		tabs[this.state.core.selected].machine_code = val;

		this.setState(prevState => ({
			core: {
				...prevState.core,
				tabs: tabs
			}
		}));
	}

	render() {
		let current_content = "";
		let register_changed = [];
		let register_names = [];
		let registers = [];
		let log = "";
		let console_vals = [];
		let machine_code = [];
		let memory = [];

		if (this.state.core.selected !== -1) {
			let tab = this.state.core.tabs[this.state.core.selected];
			current_content = tab.content;
			machine_code	= tab.machine_code;
			memory			= tab.core.memory;
			log				= tab.log;
			console_vals	= tab.console;
			register_changed= tab.register_changed;
			register_names	= tab.core.registerFile.abiNames;
			registers		= tab.core.registerFile.physicalFile;
		}

		let has_tabs = (this.state.core.tabs.length > 0);

		//let disabled = this.state.is_disabled ? "disabled": "";
		return (
			<CoreContext.Provider value={this.state.core}>
				<Help ref={this.component_help} />
				<Settings ref={this.component_settings}
					fn_new={this.addTabDefault}
					fn_load={this.handleLoadAsm}
					fn_save={this.handleDownloadAsm}
					fn_ass={this.uiAssemble}
					fn_sim={this.uiSimulate}
					fn_step={this.uiStepbystep} />
				<Navigation showSettings={this.showSettings} showHelp={this.showHelp} assemble={this.uiAssemble} simulate={this.uiSimulate} stepbystep={this.uiStepByStep} downloadRam={this.downloadRam} downloadBin={this.downloadBin} handleAddTab={this.addTabDefault} handleLoadAsm={this.handleLoadAsm} handleLoadBin={this.handleLoadBin} handleDownloadAsm={this.handleDownloadAsm} />
				{!has_tabs && <div className="no_tabs">
					<div>
						<h2>Welcome to Oak.js</h2>
						<p>Oak.js is an online javascript IDE, Assembler, Disassembler, and Simulator for assembly languages such as RISC-V and MIPS.</p>
						<button className="button" onClick={this.addTabDefault}>Add Tab</button>
						<button className="button" onClick={this.handleLoadAsm}>Load Assembly</button>
						<button className="button" onClick={this.handleLoadBin}>Load Binary</button>
					</div>
				</div>}
				{has_tabs && <div className="grid" style={{gridTemplateColumns: `auto ${this.state.panel_x}px`, gridTemplateRows: `auto calc(${this.state.panel_y}px)`}}>
					<TextEditor is_disabled={this.state.is_disabled} editor_value={current_content} setEditorValue={this.setEditorValue} handleTabChange={this.handleTabChange} handleTabClose={this.handleTabClose} addTab={this.addTabDefault} />
					<PanelContainer handleStartDrag={this.handleStartDragY} className="panel_bottom">
						<PanelConsole show_input={this.state.console_input_type !== CONSOLE_INPUT_NONE} input={this.state.console_input} log={console_vals} />
						<PanelMachineCode machinecode={machine_code} />
						<PanelMemory memory={memory} />
						<PanelLog log={log}/>
					</PanelContainer>
					<PanelContainer handleStartDrag={this.handleStartDragX} className="panel_side">
						<PanelSettings ref={this.component_panel_settings} onSubmit={this.handleSettingsChange} instruction_sets={instruction_sets} />
						<PanelRegisters register_changed={register_changed} register_names={register_names} registers={registers} />
						<PanelConversion />
					</PanelContainer>
				</div>}
				<StatusBar />
				<input type="file" onChange={this.handleUpload} ref={this.component_input} />
			</CoreContext.Provider>
		);
	}
}
