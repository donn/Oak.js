import React, { Component } from "react";
import { connect } from "react-redux";

const SimulatingStatus = {
    Stopped: 0,
    Step: 1,
    Play: 2,
};

class PanelConsole extends Component {
    static display_name = "console";

    render() {
        let tab = this.props.tabs[this.props.selectedtab];
        if (!tab) return <div></div>;

        let log = tab.console;
        let empty = log.length === 0;

        const running = tab.runningStatus !== SimulatingStatus.Stopped;

        return (
            <div id="panel_console" className="panel panel_console">
                {empty && <span className="panel_empty">Console Empty</span>}
                {!empty &&
                    log.map((line, i) => {
                        return <div key={i}>{line}</div>;
                    })}
                {this.props.show_input && (
                    <span>
                        <span className="blinker">{"<<"}</span>{" "}
                        {this.props.input}
                    </span>
                )}
                {running && (
                    <div className="running_console">
                        Simulation still not completed...
                    </div>
                )}
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

export default connect(stateToProps)(PanelConsole);
