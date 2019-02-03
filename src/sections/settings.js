import React, { Component } from 'react'
import HotkeyInput from '../modules/hotkey.js'
import Select from '../modules/select'

import { connect } from 'react-redux';
import { Translate, withLocalize } from "react-localize-redux";
import { setSettingsVisible } from "../actions"

const themes = [
    "theme_light",
    "theme_dark",
    "theme_dos",
    "theme_macos"
];

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            default_isa: "RISC-V",
            theme: "theme_light"
        };
        
		window.addEventListener("keydown", this.handleKey);

		this.comp_new = React.createRef();
		this.comp_load = React.createRef();
		this.comp_save = React.createRef();
		this.comp_assemble = React.createRef();
		this.comp_sim = React.createRef();
		this.comp_step = React.createRef();
    }

    handleClose = (e) => {
        e.preventDefault();
        this.props.setSettingsVisible(false);
    };

    handleStopClose = (event) => {
        event.stopPropagation();
    };

    handleKey = (event) => {
        if (this.props.canhandleinput) {
            let key_name = event.key.toLowerCase();
            if (key_name === "control" || key_name === "shift" || key_name === "alt")
                return false;

            let key_ctrl = event.ctrlKey;
            let key_alt = event.altKey;
            let key_shift = event.shiftKey;
            let cancel = false;

            let hotkey = [
                this.comp_new.current,
                this.comp_load.current,
                this.comp_save.current,
                this.comp_assemble.current,
                this.comp_step.current,
                this.comp_sim.current
            ];

            let hotkeyfns = [
                this.props.fn_new,
                this.props.fn_load,
                this.props.fn_save,
                this.props.fn_ass,
                this.props.fn_step,
                this.props.fn_sim
            ];

            for (let i = 0; i < hotkey.length; ++i) {
                if (hotkey[i].testKey(key_ctrl, key_alt, key_shift, key_name)) {
                    hotkeyfns[i]();
                    cancel = true;
                }
            }

            if (cancel) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    setDefaults = () => {
        this.comp_new.current.setKey(false, true, false, "n");
        this.comp_load.current.setKey(true, false, false, "o");
        this.comp_save.current.setKey(true, false, false, "s");
        this.comp_assemble.current.setKey(false, true, false, "f5");
        this.comp_sim.current.setKey(false, true, false, "f7");
        this.comp_step.current.setKey(false, true, false, "f6");
        this.setTheme("theme_light");

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
        var d = new Date();
        d.setTime(d.getTime() + (30*24*60*60*1000));
        var expires = d.toUTCString();
        let exp = "; expires=" + expires + "; path=/";
        
        document.cookie = "ojs_hotkey_new=" + this.comp_new.current.getKey() + exp;
        document.cookie = "ojs_hotkey_load=" + this.comp_load.current.getKey() + exp;
        document.cookie = "ojs_hotkey_save=" + this.comp_save.current.getKey() + exp;
        document.cookie = "ojs_hotkey_ass=" + this.comp_assemble.current.getKey() + exp;
        document.cookie = "ojs_hotkey_sim=" + this.comp_sim.current.getKey() + exp;
        document.cookie = "ojs_hotkey_step=" + this.comp_step.current.getKey() + exp;
        document.cookie = "ojs_theme=" + this.state.theme + exp;
    }

    setTheme = (val) => {
        themes.forEach(function(element) {
            document.getElementById(element).disabled = (element !== val);
        });

        this.setState({theme: val}, this.saveSettings);
    }

    componentDidMount() {
        let missing_fields = [
            "ojs_hotkey_new",
            "ojs_hotkey_load",
            "ojs_hotkey_save",
            "ojs_hotkey_ass",
            "ojs_hotkey_sim",
            "ojs_hotkey_step",
            "ojs_theme"
        ];
        
        var ca = document.cookie.split("; ");
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
                if (str === "ojs_hotkey_new")
                    this.comp_new.current.setKeyStr(val);
                else if (str === "ojs_hotkey_load")
                    this.comp_load.current.setKeyStr(val);
                else if (str === "ojs_hotkey_save")
                    this.comp_save.current.setKeyStr(val);
                else if (str === "ojs_hotkey_ass")
                    this.comp_assemble.current.setKeyStr(val);
                else if (str === "ojs_hotkey_sim")
                    this.comp_sim.current.setKeyStr(val);
                else if (str === "ojs_hotkey_step")
                    this.comp_step.current.setKeyStr(val);
                else if (str === "ojs_theme")
                    this.setTheme(val);

                missing_fields.splice(index, 1);
            }
        }

        for (i = 0; i < missing_fields.length; i++) {
            let str = missing_fields[i];
            if (str === "ojs_hotkey_new")
                this.comp_new.current.setKey(false, true, false, "n");
            if (str === "ojs_hotkey_load")
                this.comp_load.current.setKey(true, false, false, "o");
            if (str === "ojs_hotkey_save")
                this.comp_save.current.setKey(true, false, false, "s");
            if (str === "ojs_hotkey_ass")
                this.comp_assemble.current.setKey(false, true, false, "f5");
            if (str === "ojs_hotkey_sim")
                this.comp_sim.current.setKey(false, true, false, "f7");
            if (str === "ojs_hotkey_step")
                this.comp_step.current.setKey(false, true, false, "f6");
            if (str === "ojs_theme")
                this.setTheme("theme_light");
        }

        if (missing_fields.length > 0) {
            this.saveSettings();
        }
    }

    handleISA = (event) => {
        this.setState({default_isa: event.target.value});
    };

    handleTheme = (event) => {
        this.setTheme(event.target.value);
    };

    render() {
        return (
            <div id="settings" onClick={this.handleClose} className={`settings_overlay overlay fader${this.props.visible ? " fader_shown" : ""}`}>
                <div className="settings_container" onClick={this.handleStopClose}>
                    <h2>Settings</h2>
                    <div style={{position: "relative"}}>
                        <button className="button reset_defaults" onClick={this.setDefaults}>Restore Defaults</button>
                        <table>
                            <thead>
                                <tr>
                                    <td colSpan={2}>General Settings</td>
                                </tr>
                            </thead>
                            <tbody>
                                {/*<tr>
                                    <td colSpan={2}>
                                        <Select onChange={this.handleISA} icon="/images/icons/input_type.svg" placeholder="Default ISA" value={this.state.default_isa}>
                                            <option>RISC-V</option>
                                            <option>MIPS</option>
                                        </Select>
                                    </td>
                                </tr>*/}
                                <tr>
                                    <td colSpan={2}>
                                        <Select onChange={this.handleTheme} icon="/images/icons/input_type.svg" placeholder="Theme" value={this.state.theme}>
                                            <option value="theme_light">Light</option>
                                            <option value="theme_dark">Dark</option>
                                            <option value="theme_dos">Black</option>
                                            <option value="theme_macos">Mac-OS</option>
                                        </Select>
                                    </td>
                                </tr>
                            </tbody>
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
                    </div>
                </div>
            </div>
        );
    }
}

const stateToProps = state => {
    return {
        visible: state.panel_visibility.settings
    };
};

const dispatchToProps = (dispatch, ownProps) => ({
    setSettingsVisible: (visible) => dispatch(setSettingsVisible(visible))
});

export default withLocalize(
    connect(stateToProps,
            dispatchToProps
    )(Settings));