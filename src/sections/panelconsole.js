import React, { Component } from 'react'
import { connect } from 'react-redux';

class PanelConsole extends Component {
    static display_name = "console";

    render() {
        let tabs = this.props.tabs;
        if (tabs.length === 0)
            return <div></div>;
            
        let log = tabs[this.props.selectedtab].console;
        let empty = log.length === 0;
        
        return (<div id="panel_console" className="panel panel_console">
            {empty && <span className="panel_empty">Console Empty</span>}
            {!empty && log.map((line, i) => {
                return (<div key={i}>{line}</div>);
            })}
            {this.props.show_input && <span>{"<"} {this.props.input}</span>}
        </div>)
    }
}

const stateToProps = state => {
	return {
        tabs: state.tabs,
        selectedtab: state.selectedtab
	};
};

export default connect(stateToProps)(PanelConsole);