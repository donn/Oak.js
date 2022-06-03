import React, { Component } from "react";

import { connect } from "react-redux";
import { Translate, withLocalize } from "react-localize-redux";
import { setHelpVisible } from "../actions";

class Help extends Component {
    handleClose = (e) => {
        e.preventDefault();
        this.props.setHelpVisible(false);
    };

    handleStopClose = (event) => {
        event.stopPropagation();
    };

    render() {
        return (
            <div
                id="help"
                onClick={this.handleClose}
                className={`settings_overlay overlay fader${
                    this.props.visible ? " fader_shown" : ""
                }`}
            >
                <div
                    className="settings_container"
                    onClick={this.handleStopClose}
                >
                    <button
                        className="floating_close"
                        onClick={this.handleClose}
                    ></button>
                    <h2>
                        <Translate id="help.title" />
                    </h2>
                    <div className="overlay_contents">
                        <Translate
                            id="help.data"
                            options={{ renderInnerHtml: true }}
                        />
                        <button className="button" onClick={this.handleClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

const stateToProps = (state) => {
    return {
        visible: state.panel_visibility.help,
    };
};

const dispatchToProps = (dispatch, ownProps) => ({
    setHelpVisible: (visible) => dispatch(setHelpVisible(visible)),
});

export default withLocalize(connect(stateToProps, dispatchToProps)(Help));
