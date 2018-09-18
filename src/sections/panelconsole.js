import React, { Component } from 'react'

export default class PanelConsole extends Component {
    static display_name = "console";

    render() {
        let empty = this.props.log.length === 0;
        return (<div id="panel_console" className="panel panel_console">
            {empty && <span className="panel_empty">Console Empty</span>}
            {!empty && this.props.log.map((line, i) => {
                return (<div key={i}>{line}</div>);
            })}
            {this.props.show_input && <span>{"<"} {this.props.input}</span>}
        </div>)
    }
}
