import React, { Component } from 'react'
//import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/theme/github';
//import './ace_theme';

import { selectTab, deleteTab, updateTab } from "../actions"
import { connect } from 'react-redux';

class TextEditor extends Component {
	addTab = () => {
		this.props.addTab();
	}
	
	handleTabChange = (id) => {
		this.props.selectTab(id);
	}

	handleTabClose = (event, id) => {
		event.stopPropagation();

		let selected = this.props.selectedtab;
		if (selected >= id)
			selected -= 1;

		this.props.selectTab(selected);
		
		this.props.deleteTab(id);
	}

	setEditorValue = (val) => {
		let current_tab = this.props.selectedtab;
		let tab = this.props.tabs[current_tab];
		tab.content = val;
		this.props.updateTab(current_tab, tab);
	}

	render() {
		let tabs = this.props.tabs;
		
		return (
			<main id="text_editor" className="text_editor">
				<ul className="page_tabs">
					{tabs.map((tab, id) => {
						return (
						<li onClick={() => this.handleTabChange(id)} key={id} className={(this.props.selectedtab === id) ? "selected" : ""}>
							<span>{tab.name}</span>
							<div onClick={(event) => this.handleTabClose(event, id)}></div>
						</li>);
					})}
					<li className="add_tab" onClick={this.addTab}></li>
				</ul>
				{<AceEditor
					mode="java"
					theme="github"
					onChange={this.setEditorValue}
					width="100%"
					height=""
					name="editor_area"
					className="editor_area"
					value={this.props.tabs[this.props.selectedtab].content}
					readOnly={this.props.is_disabled}
					editorProps={{$blockScrolling: Infinity}}
				/>}
			</main>
		)
	}
}

const stateToProps = state => {
	return {
		tabs: state.tabs,
		selectedtab: state.selectedtab
	};
};

const dispatchToProps = (dispatch, ownProps) => ({
	selectTab: (id) => dispatch(selectTab(id)),
	updateTab: (index, tab) => dispatch(updateTab(index, tab)),
	deleteTab: (id) => dispatch(deleteTab(id))
})

export default connect(
	stateToProps,
	dispatchToProps
	)(TextEditor);