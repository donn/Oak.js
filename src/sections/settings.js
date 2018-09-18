import React, { Component } from 'react'
import HotkeyInput from '../modules/hotkey.js'
import Select from '../modules/select'

export default class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shown: false,
            default_isa: "RISC-V",
            theme: "Light"
        };
        
		this.comp_new = React.createRef();
		this.comp_load = React.createRef();
		this.comp_save = React.createRef();
		this.comp_assemble = React.createRef();
		this.comp_sim = React.createRef();
		this.comp_step = React.createRef();
    }

    handleShow = () => {
        this.setState({shown: true});
    };

    handleClose = () => {
        this.setState({shown: false});
    };

    handleStopClose = (event) => {
        event.stopPropagation();
    };

    handleKey = (event) => {
        let key_ctrl = event.ctrlKey;
        let key_alt = event.altKey;
        let key_shift = event.shiftKey;
        let key_name = event.key.toLowerCase();
        let cancel = false;
        
        if (this.comp_new.current.testKey(key_ctrl, key_alt, key_shift, key_name)) {
            this.props.fn_new();
            cancel = true;
        }
        else if (this.comp_load.current.testKey(key_ctrl, key_alt, key_shift, key_name)) {
            this.props.fn_load();
            cancel = true;
        }
        else if (this.comp_save.current.testKey(key_ctrl, key_alt, key_shift, key_name)) {
            this.props.fn_save();
            cancel = true;
        }
        else if (this.comp_assemble.current.testKey(key_ctrl, key_alt, key_shift, key_name)) {
            this.props.fn_ass();
            cancel = true;
        }
        else if (this.comp_step.current.testKey(key_ctrl, key_alt, key_shift, key_name)) {
            this.props.fn_step();
            cancel = true;
        }
        else if (this.comp_sim.current.testKey(key_ctrl, key_alt, key_shift, key_name)) {
            this.props.fn_sim();
            cancel = true;
        }

        if (cancel) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    setDefaults = () => {
        this.comp_new.current.setKey(false, true, false, "n");
        this.comp_load.current.setKey(false, true, false, "o");
        this.comp_save.current.setKey(false, true, false, "s");
        this.comp_assemble.current.setKey(false, true, false, "f4");
        this.comp_sim.current.setKey(false, true, false, "f5");
        this.comp_step.current.setKey(false, true, false, "f6");

        this.saveSettings();
    }

    /*function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }*/
    
    saveSettings = () => {
        let values = "hotkey_new=" + this.comp_new.current.getKey() + "; ";
        values += "hotkey_load=" + this.comp_load.current.getKey() + "; ";
        values += "hotkey_save=" + this.comp_save.current.getKey() + "; ";
        values += "hotkey_ass=" + this.comp_assemble.current.getKey() + "; ";
        values += "hotkey_sim=" + this.comp_sim.current.getKey() + "; ";
        values += "hotkey_step=" + this.comp_step.current.getKey() + "; ";

        var d = new Date();
        d.setTime(d.getTime() + (360*24*60*60*1000));
        var expires = d.toUTCString();
        document.cookie = values + "expires=" + expires + ";path=/";
    }

    componentDidMount() {
        let missing_fields = [
            "hotkey_new",
            "hotkey_load",
            "hotkey_save",
            "hotkey_ass",
            "hotkey_sim",
            "hotkey_step",
        ];
        
        var ca = document.cookie.split(';');
        let i = 0;
        for (; i < ca.length; i++) {
            var c = ca[i];
            
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            
            let eq = c.indexOf("=");
            let str = c.substr(0, eq);
            let val = c.substr(eq+1);
            let index = missing_fields.indexOf(str);
            if (index !== -1) {
                if (str === "hotkey_new")
                    this.comp_new.current.setKeyStr(val);
                else if (str === "hotkey_load")
                    this.comp_load.current.setKeyStr(val);
                else if (str === "hotkey_save")
                    this.comp_save.current.setKeyStr(val);
                else if (str === "hotkey_ass")
                    this.comp_assemble.current.setKeyStr(val);
                else if (str === "hotkey_sim")
                    this.comp_sim.current.setKeyStr(val);
                else if (str === "hotkey_step")
                    this.comp_step.current.setKeyStr(val);

                missing_fields.splice(index, 1);
            }
        }

        for (i = 0; i < missing_fields.length; i++) {
            let str = missing_fields[i];
            if (str === "hotkey_new")
                this.comp_new.current.setKey(false, true, false, "n");
            if (str === "hotkey_load")
                this.comp_load.current.setKey(false, true, false, "o");
            if (str === "hotkey_save")
                this.comp_save.current.setKey(false, true, false, "s");
            if (str === "hotkey_ass")
                this.comp_assemble.current.setKey(false, true, false, "f4");
            if (str === "hotkey_sim")
                this.comp_sim.current.setKey(false, true, false, "f5");
            if (str === "hotkey_step")
                this.comp_step.current.setKey(false, true, false, "f6");
        }

        if (missing_fields.length > 0) {
            this.saveSettings();
        }
    }

    handleISA = (event) => {
        this.setState({default_isa: event.target.value});
    };

    handleTheme = (event) => {
        this.setState({theme: event.target.value});
    };

    render() {
        return (
            <div id="settings" onClick={this.handleClose} className={`settings_overlay overlay fader${this.state.shown ? " fader_shown" : ""}`}>
                <div className="settings_container" onClick={this.handleStopClose}>
                    <h2>Settings</h2>
                    <table>
                        <thead>
                            <tr>
                                <td colSpan={2}>General Settings</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={2}>
                                    <Select onChange={this.handleISA} icon="/images/icons/input_type.svg" placeholder="Default ISA" value={this.state.default_isa}>
                                        <option>RISC-V</option>
                                        <option>MIPS</option>
                                    </Select>
                                </td>
                            </tr><tr>
                                <td colSpan={2}>
                                    <Select onChange={this.handleTheme} icon="/images/icons/input_type.svg" placeholder="Theme" value={this.state.theme}>
                                        <option>Light</option>
                                        <option>Dark</option>
                                        <option>Black</option>
                                        <option>Mac-OS</option>
                                    </Select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table>
                        <thead>
                            <tr>
                                <td colSpan={2}>Hotkeys</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>New Tab</td>
                                <td>
                                    <HotkeyInput ref={this.comp_new} save={this.saveSettings} />
                                </td>
                            </tr>
                            <tr>
                                <td>Save Tab</td>
                                <td>
                                    <HotkeyInput ref={this.comp_save} save={this.saveSettings} />
                                </td>
                            </tr>
                            <tr>
                                <td>Load</td>
                                <td>
                                    <HotkeyInput ref={this.comp_load} save={this.saveSettings} />
                                </td>
                            </tr>
                            <tr>
                                <td>Assemble</td>
                                <td>
                                    <HotkeyInput ref={this.comp_assemble} save={this.saveSettings} />
                                </td>
                            </tr>
                            <tr>
                                <td>Step-By-Step</td>
                                <td>
                                    <HotkeyInput ref={this.comp_step} save={this.saveSettings} />
                                </td>
                            </tr>
                            <tr>
                                <td>Simulate</td>
                                <td>
                                    <HotkeyInput ref={this.comp_sim} save={this.saveSettings} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <button className="button" onClick={this.setDefaults}>Restore Defaults</button>
                </div>
            </div>
        );
    }
}
