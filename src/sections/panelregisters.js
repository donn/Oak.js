import React, { Component } from 'react'
import Select from '../modules/select'
import {padNumber, parseToFloat} from './numberttransform'
import { connect } from 'react-redux';

const REGISTER_UNASSIGNED = 0;
const REGISTER_ASSIGNED = 1;
const REGISTER_NEWASSIGNED = 2;

class PanelRegisters extends Component {
    static display_name = "registers";

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
            case 0: // Hex
                return "0x"+padNumber((input >>> 0).toString(16), 8);
            case 1: // uint
                return (input >>> 0).toString(10);
            default:
            case 2: // int
                let output = input.toString(10);
                if (output > 2147483648) { output = output - 4294967296 }
                return output;
            case 3: // bin
                return "0b"+padNumber((input >>> 0).toString(2), 32);
            case 4: // float
                return output = parseToFloat(input);
        }
    };

    getChangedRegisterClass = (val) => {
        switch(val) {
            default:
            case REGISTER_UNASSIGNED:
                return "reg_normal";
            case REGISTER_ASSIGNED:
                return "reg_assigned";
            case REGISTER_NEWASSIGNED:
                return "reg_new";
        }
    }

    render() {
        let tab = this.props.tabs[this.props.selectedtab];
        if (!(tab && tab.core))
            return <div></div>;

        let core = tab.core;
        let registers = core.registerFile.physicalFile;
        let register_changed = tab.register_changed;
        let register_names = core.registerFile.abiNames;

        return (
            <div id="panel_registers" className="panel panel_registers">
                <Select onChange={this.handleType} icon="/images/icons/input_type.svg" placeholder="Display Type" defaultValue="0">
                    <option value="0">Hex</option>
                    <option value="1">Unsigned Integer</option>
                    <option value="2">Signed Integer</option>
                    <option value="3">Binary</option>
                    <option value="4">Float</option>
                </Select>
                <table cellSpacing="0" cellPadding="0">
                    <thead>
                        <tr><th>Reg</th><th>Value</th></tr>
                    </thead>
                    <tbody>
                        {
                            registers.map((register, i) => {
                                let register_dpy = this.translateRegister(register);
                                return (<tr key={i} className={this.getChangedRegisterClass(register_changed[i])}>
                                    <td>
                                        {register_names[i]}
                                    </td>
                                    <td data-info={register}>
                                        {register_dpy}
                                    </td>
                                </tr>);
                            })
                        }
                    </tbody>
                </table>
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

export default connect(stateToProps)(PanelRegisters);