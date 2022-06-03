import React, { Component } from "react";

import { connect } from "react-redux";
import { Translate, withLocalize } from "react-localize-redux";
import { setAboutVisible } from "../actions";
import devs from "../developer_list.js";

class About extends Component {
    handleClose = (e) => {
        e.preventDefault();
        this.props.setAboutVisible(false);
    };

    handleStopClose = (event) => {
        event.stopPropagation();
    };

    printdev = (arr) => {
        return arr.map((element, i) => {
            return (
                <a key={i} href={element.link}>
                    <img
                        src={`images/about/${element.pic}`}
                        alt={element.name}
                    />
                    <h4>{element.name}</h4>
                    <span>{element.job}</span>
                    <span>{element.affiliation}</span>
                    <p>{element.desc}</p>
                </a>
            );
        });
    };

    render() {
        return (
            <div
                id="about"
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
                        <Translate id="about.title" />
                    </h2>
                    <div className="overlay_contents">
                        <div className="devlist">
                            <h3>
                                <Translate id="about.core_devs" />
                            </h3>
                            {this.printdev(devs.core)}
                        </div>
                        <div className="devlist">
                            <h3>
                                <Translate id="about.additional_devs" />
                            </h3>
                            {this.printdev(devs.additional)}
                        </div>
                        {devs.translators.length > 0 && (
                            <div className="translatorlist">
                                <h3>
                                    <Translate id="about.translators" />
                                </h3>
                                {devs.translators.map((element, i) => {
                                    return (
                                        <a key={i} href={element.link}>
                                            <h4>{element.name}</h4>
                                            <span>{element.lang}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <button className="button" onClick={this.handleClose}>
                        Close
                    </button>
                </div>
            </div>
        );
    }
}

const stateToProps = (state) => {
    return {
        visible: state.panel_visibility.about,
    };
};

const dispatchToProps = (dispatch, ownProps) => ({
    setAboutVisible: (visible) => dispatch(setAboutVisible(visible)),
});

export default withLocalize(connect(stateToProps, dispatchToProps)(About));
