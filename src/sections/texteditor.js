import React, { Component } from 'react'
//import brace from 'brace';
import AceEditor from 'react-ace';
import CoreContext from '../coreContext';

import 'brace/mode/java';
import 'brace/theme/github';
//import './ace_theme';

export default class TextEditor extends Component {
	addTab = () => {
		this.props.addTab();
	}
	
	handleTabChange = (id) => {
		this.props.handleTabChange(id);
	}

	handleTabClose = (event, id) => {
		event.stopPropagation();
		this.props.handleTabClose(id);
	}

	render() {
		return (
            <CoreContext.Consumer>
				{core =>
				<main id="text_editor" className="text_editor">
					<ul className="page_tabs">
						{core.tabs.map((tab, id) => {
							return (
							<li onClick={() => this.handleTabChange(id)} key={id} className={(core.selected === id) ? "selected" : ""}>
								<span>{tab.name}</span>
								<div onClick={(event) => this.handleTabClose(event, id)}></div>
							</li>);
						})}
						<li className="add_tab" onClick={this.addTab}></li>
					</ul>
					{<AceEditor
						mode="java"
						theme="github"
						onChange={this.props.setEditorValue}
						width="100%"
						height=""
						name="editor_area"
						className="editor_area"
						value={this.props.editor_value}
						readOnly={this.props.is_disabled}
						editorProps={{$blockScrolling: Infinity}}
					/>}
				</main>}
            </CoreContext.Consumer>
		)
	}
}
