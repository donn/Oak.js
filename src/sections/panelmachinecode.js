import React, { Component } from 'react'
import Select from '../modules/select'
import {padNumber} from './numberttransform'

import { connect } from 'react-redux';

class PanelMachineCode extends Component {
    static display_name = "machine code";

    constructor(props) {
        super(props);
        this.state = {
            register_type: 0,
        }
    }

    handleType = (event) => {
        this.setState({register_type: parseInt(event.target.value, 10)});
    };

    translateRegister = (input) => {
        switch(this.state.register_type) {
            default:
            case 0: // Hex
                return padNumber((input >>> 0).toString(16), 2);
            case 1: // uint
                return padNumber((input >>> 0).toString(10), 3);
            case 2: // octal
                return padNumber((input >>> 0).toString(8), 3);
            case 3: // bin
                return padNumber((input >>> 0).toString(2), 8);
        }
    };

    render() {
        let tabs = this.props.tabs;
        if (tabs.length === 0)
            return <div></div>;
            
        let machinecode = tabs[this.props.selectedtab].machine_code;
        let empty = machinecode.length === 0;
        return (
            <div id="panel_machine_code" className="panel panel_machine_code">
                {empty && <span className="panel_empty">Machine Code Empty</span>}
                {!empty && <Select onChange={this.handleType} icon="/images/icons/input_type.svg" placeholder="Display Type" defaultValue="0">
                    <option value="0">Hex</option>
                    <option value="1">Decimal</option>
                    <option value="2">Octal</option>
                    <option value="3">Binary</option>
                </Select>}
                
                {!empty && machinecode.map((byte, i) => {
                    let val = this.translateRegister(byte);
                    return <span key={i}>{val} </span>;
                })}
            </div>
        )
    }
}

const stateToProps = state => {
	return {
        tabs: state.tabs,
        selectedtab: state.selectedtab
	};
};

export default connect(stateToProps)(PanelMachineCode);