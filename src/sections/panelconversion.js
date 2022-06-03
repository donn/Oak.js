import React, { Component } from "react";
import Input from "../modules/input";
import Select from "../modules/select";
import { padNumber, parseToFloat, encodeFloat } from "./numberttransform";

export default class PanelConversion extends Component {
    static display_name = "conversion";

    constructor(props) {
        super(props);
        this.state = {
            input: 0,
            input_type: 0,
            output_type: 0,
            output: "",
            has_value: false,
        };
    }

    calculateOutput = (val, in_type, out_type) => {
        let input = val;
        switch (in_type) {
            case 0: // Hex
                input = parseInt(input, 16);
                break;
            default:
            case 1: // uint
            case 2: // int
                input = parseInt(input, 10);
                break;
            case 3: // bin
                input = parseInt(input, 2);
                break;
            case 4: // float
                input = encodeFloat(input);
                break;
        }

        if (input.toString() === "NaN") return "";

        let output;
        switch (out_type) {
            case 0: // Hex
                output = "0x" + padNumber((input >>> 0).toString(16), 8);
                break;
            case 1: // uint
                output = (input >>> 0).toString(10);
                break;
            default:
            case 2: // int
                output = input.toString(10);
                if (output > 2147483648) {
                    output = output - 4294967296;
                }
                break;
            case 3: // bin
                output = "0b" + padNumber((input >>> 0).toString(2), 32);
                break;
            case 4: // float
                output = parseToFloat(input);
                break;
        }

        return output;
    };

    onChangeInput = (event) => {
        let val = event.target.value;
        let in_type = this.state.input_type;
        let out_type = this.state.output_type;
        let out = this.calculateOutput(val, in_type, out_type);
        this.setState({ input: val, has_value: val !== "", output: out });
    };

    onChangeInputType = (event) => {
        let val = this.state.input;
        let in_type = parseInt(event.target.value, 10);
        let out_type = this.state.output_type;
        let out = this.calculateOutput(val, in_type, out_type);
        this.setState({
            input: val,
            input_type: in_type,
            has_value: val !== "",
            output: out,
        });
    };

    onChangeOutputType = (event) => {
        let val = this.state.input;
        let in_type = this.state.input_type;
        let out_type = parseInt(event.target.value, 10);
        let out = this.calculateOutput(val, in_type, out_type);
        this.setState({
            input: val,
            output_type: out_type,
            has_value: val !== "",
            output: out,
        });
    };

    render() {
        return (
            <div id="panel_conversion" className="panel panel_conversion">
                <Input
                    onChange={this.onChangeInput}
                    icon="images/icons/input_in.svg"
                    placeholder="Input"
                    type="text"
                />
                <Select
                    onChange={this.onChangeInputType}
                    icon="images/icons/input_type.svg"
                    placeholder="Input Type"
                >
                    <option value="0">Hex</option>
                    <option value="1">Integer</option>
                    <option value="3">Binary</option>
                    {/*<option value="4">Float</option>*/}
                </Select>
                <hr />
                <Select
                    onChange={this.onChangeOutputType}
                    icon="images/icons/input_type.svg"
                    placeholder="Output Type"
                >
                    <option value="0">Hex</option>
                    <option value="1">Unsigned Integer</option>
                    <option value="2">Signed Integer</option>
                    <option value="3">Binary</option>
                    {/*<option value="4">Float</option>*/}
                </Select>
                <span className="conversion_output">
                    {this.state.output !== "" ? this.state.output : "<Output>"}
                </span>
            </div>
        );
    }
}
