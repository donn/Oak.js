import React, { Component } from "react";
import Select from "../modules/select";
import { padNumber } from "./numberttransform";
import { connect } from "react-redux";

class PanelMemory extends Component {
    static display_name = "memory";

    constructor(props) {
        super(props);
        this.state = {
            register_type: 0,
        };
    }

    handleType = (event) => {
        this.setState({ register_type: parseInt(event.target.value, 10) });
    };

    translateRegister = (input) => {
        switch (this.state.register_type) {
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
        if (tabs.length === 0) return <div></div>;

        let memory = tabs[this.props.selectedtab].core.memory;
        let empty = memory.length === 0;
        return (
            <div id="panel_memory" className="panel panel_memory">
                {empty && <span className="panel_empty">Memory Empty</span>}
                {!empty && (
                    <Select
                        onChange={this.handleType}
                        icon="images/icons/input_type.svg"
                        placeholder="Display Type"
                        defaultValue="0"
                    >
                        <option value="0">Hex</option>
                        <option value="1">Decimal</option>
                        <option value="2">Octal</option>
                        <option value="3">Binary</option>
                    </Select>
                )}

                {!empty &&
                    memory.map((byte, i) => {
                        let val = this.translateRegister(byte);
                        return <span key={i}>{val} </span>;
                    })}
            </div>
        );
    }
}

const stateToProps = (state) => {
    return {
        tabs: state.tabs,
        selectedtab: state.selectedtab,
    };
};

export default connect(stateToProps)(PanelMemory);
