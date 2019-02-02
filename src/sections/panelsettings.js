import React, { Component } from 'react'
import Input from '../modules/input'
import Select from '../modules/select'
import OakJS from '../backend.js';

import { connect } from 'react-redux';
import { Translate, withLocalize } from "react-localize-redux";
import { setProjectSettings } from "../actions"

class PanelSettings extends Component {
    static display_name = "settings";

    handleFileName = (event) => {
        this.props.setProjectSettings(event.target.value, this.props.project_settings.memory_size, this.props.project_settings.isa);
    }

    handleISA = (event) => {
        this.props.setProjectSettings(this.props.project_settings.file_name, this.props.project_settings.memory_size, event.target.value);
    }

    handleMemorySize = (event) => {
        const re = /^[0-9\b]+$/;
    
        if (event.target.value === '' || re.test(event.target.value)) {
            this.props.setProjectSettings(this.props.project_settings.file_name, event.target.value, this.props.project_settings.isa);
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.submitChanges();
    };

    render() {
        let isas = OakJS.CoreFactory.getCoreList();
        
        return (
            <div id="panel_settings" className="panel panel_settings">
                <form onSubmit={this.handleSubmit}>
                    <Input onChange={this.handleFileName} value={this.props.project_settings.file_name} icon="/images/icons/input_name.svg" placeholder="File Name" id="filename" />
                    <Select onChange={this.handleISA} value={this.props.project_settings.isa} icon="/images/icons/input_code.svg" placeholder="Instruction Set" >
                        {isas.map((isa, i) => {
                            return <option key={isa} value={isa}>{isa}</option>
                        })}
                    </Select>
                    <Input onChange={this.handleMemorySize} value={this.props.project_settings.memory_size} icon="/images/icons/input_memory.svg" placeholder="Memory Size (Bytes)" type="number" />

                    <input className="button" value="Accept Changes" type="submit" />
                </form>
            </div>
        )
    }
}

const appStateToProps = state => {
	return {
        tabs: state.tabs,
        selectedtab: state.selectedtab,
		project_settings: state.project_settings
	};
};

const appDispatchToProps = (dispatch, ownProps) => ({
	setProjectSettings: (n, s, i) => dispatch(setProjectSettings(n, s, i))
})

export default withLocalize(
	connect(appStateToProps,
			appDispatchToProps
	)(PanelSettings));