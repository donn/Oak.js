import React, { Component } from 'react'

export default class HotkeyInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            capturing: false,
            combo: "a_110",
            shift: true,
            alt: true,
            ctrl: true,
            key_name: "n"
        }
    }

    handleClick = (event) => {
        this.setState({capturing: true});
		window.addEventListener("keypress", this.handleKey);
    }

    handleKey = (event) => {
        if (this.state.capturing) {
            event.preventDefault();
            event.stopPropagation();

            let key = event.key.toLowerCase();
            this.setState({
                shift: event.shiftKey,
                ctrl: event.ctrlKey,
                alt: event.altKey,
                key_name: key,
                capturing: false
            });

            window.removeEventListener("keypress", this.handleKey);
            this.props.save();
        }
    }

    testKey = (key_ctrl, key_alt, key_shift, key_name) => {
        return (key_shift === this.state.shift &&
            key_alt=== this.state.alt &&
            key_ctrl === this.state.ctrl &&
            key_name === this.state.key_name);
    }

    setKey = (key_ctrl, key_alt, key_shift, key_name) => {
        this.setState({
            ctrl: key_ctrl,
            alt: key_alt,
            shift: key_shift,
            key_name: key_name
        });
    }

    getKey = () => {
        let key = "_" + this.state.key_name;
        if (this.state.shift)
            key = "s" + key;
            
        if (this.state.alt)
            key = "a" + key;
        
        if (this.state.ctrl)
            key = "c" + key;

        return key;
    }

    setKeyStr = (str) => {
		let shift = (str.indexOf("s")!==-1);
		let alt = (str.indexOf("a")!==-1);
		let ctrl = (str.indexOf("c")!==-1);
        let key = str.substr(str.indexOf("_") + 1);
        
        this.setKey(ctrl, alt, shift, key);
    }
    
    render() {
        let c = !this.state.capturing;
        return (<div className={`key_bar${this.state.capturing ? " capturing" : ""}`} onClick={this.handleClick} tabIndex={0}>
                    {!c && <span>Capturing</span>}
                    {c && this.state.ctrl && <span>Ctrl</span>}
                    {c && this.state.alt && <span>Alt</span>}
                    {c && this.state.shift && <span>Shift</span>}
                    {c && <span>{this.state.key_name}</span>}
                </div>);
    }
}