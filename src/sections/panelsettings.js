import React, { Component } from 'react'
import Input from '../modules/input'
import Select from '../modules/select'

export default class PanelSettings extends Component {
    static display_name = "settings";

    constructor(props) {
        super(props);
        this.state = {
            file_name: "Test 1",
            instruction_set: "riscv",
            memory_size: 4096
        };
    }

    handleFileName = (event) => {
        this.setState({file_name: event.target.value});
    }

    handleISA = (event) => {
        this.setState({instruction_set: event.target.value});
    }

    handleMemorySize = (event) => {
        this.setState({memory_size: event.target.value});
    }

    setData = (file_name, instruction_set, memory_size) => {
        this.setState({file_name: file_name, instruction_set: instruction_set, memory_size: memory_size});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.onSubmit(this.state.file_name, this.state.instruction_set, this.state.memory_size);
    };

    render() {
        return (
            <div id="panel_settings" className="panel panel_settings">
                <form onSubmit={this.handleSubmit}>
                    <Input onChange={this.handleFileName} value={this.state.file_name} icon="/images/icons/input_name.svg" placeholder="File Name" id="filename" />
                    <Select onChange={this.handleISA} value={this.state.instruction_set} icon="/images/icons/input_code.svg" placeholder="Instruction Set" >
                        {this.props.instruction_sets.map((isa, i) => {
                            return <option key={isa.name} value={isa.name}>{isa.name}</option>
                        })}
                    </Select>
                    <Input onChange={this.handleMemorySize} value={this.state.memory_size} icon="/images/icons/input_memory.svg" placeholder="Memory Size (Bytes)" type="number" />

                    <input className="button" value="Accept Changes" type="submit" />
                </form>
            </div>
        )
    }
}
