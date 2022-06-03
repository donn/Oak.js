import React, { Component } from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";

import {
    selectTab,
    deleteTab,
    updateTab,
    setProjectSettings,
} from "../actions";
import { connect } from "react-redux";

class TextEditor extends Component {
    addTab = () => {
        this.props.addTab();
    };

    handleTabChange = (id) => {
        this.props.selectTab(id);
        let tab = this.props.tabs[id];

        if (tab) {
            this.props.setProjectSettings(
                tab.name,
                tab.core.memorySize,
                tab.instruction_set
            );
        }
    };

    handleTabClose = (event, id) => {
        event.stopPropagation();

        let selected = this.props.selectedtab;
        if (selected >= id) selected -= 1;

        selected = Math.min(Math.max(selected, 0), this.props.tabs.length - 1);

        this.props.selectTab(selected);

        let tab = this.props.tabs[selected];

        if (tab) {
            this.props.setProjectSettings(
                tab.name,
                tab.core.memorySize,
                tab.instruction_set
            );
        }

        this.props.deleteTab(id);
    };

    setEditorValue = (val) => {
        let current_tab = this.props.selectedtab;
        let tab = this.props.tabs[current_tab];
        tab.content = val;
        this.props.updateTab(current_tab, tab);
    };

    render() {
        let tabs = this.props.tabs;

        return (
            <main id="text_editor" className="text_editor">
                <ul className="page_tabs">
                    {tabs.map((tab, id) => {
                        return (
                            <li
                                onClick={() => this.handleTabChange(id)}
                                key={id}
                                className={
                                    this.props.selectedtab === id
                                        ? "selected"
                                        : ""
                                }
                            >
                                <span>{tab.name}</span>
                                <div
                                    onClick={(event) =>
                                        this.handleTabClose(event, id)
                                    }
                                ></div>
                            </li>
                        );
                    })}
                    <li className="add_tab" onClick={this.addTab}></li>
                </ul>
                {
                    <AceEditor
                        mode="java"
                        theme="github"
                        onChange={this.setEditorValue}
                        width="100%"
                        height=""
                        name="editor_area"
                        className="editor_area"
                        value={tabs[this.props.selectedtab].content}
                        readOnly={this.props.is_disabled}
                        editorProps={{ $blockScrolling: Infinity }}
                    />
                }
            </main>
        );
    }
}

const stateToProps = (state) => {
    return {
        tabs: state.tabs,
        selectedtab: state.selectedtab,
    };
};

const dispatchToProps = (dispatch, ownProps) => ({
    selectTab: (id) => dispatch(selectTab(id)),
    updateTab: (index, tab) => dispatch(updateTab(index, tab)),
    deleteTab: (id) => dispatch(deleteTab(id)),
    setProjectSettings: (n, s, i) => dispatch(setProjectSettings(n, s, i)),
});

export default connect(stateToProps, dispatchToProps)(TextEditor);
