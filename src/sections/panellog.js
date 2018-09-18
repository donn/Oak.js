import React, { Component } from 'react'

export default class PanelLog extends Component {
    static display_name = "log";

    render() {
        let empty = this.props.log.length === 0;
        return (<div id="panel_log" className="panel panel_log">
            {empty && <span className="panel_empty">Instruction Log Empty</span>}
            {!empty && this.props.log.map((instruction, i) => {
                return (<div key={i}>{instruction}</div>);
            })}
        </div>)
    }
}
