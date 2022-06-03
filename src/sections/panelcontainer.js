import React, { Component } from "react";

export default class PanelContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: 0,
        };
    }

    handleClickTab(e, key) {
        e.preventDefault();
        this.setState({ selected: key });
    }

    renderTabs = () => {
        return (
            <ul className="panel_tabs">
                {React.Children.map(this.props.children, (child, i) => (
                    <li
                        className={this.state.selected === i ? "selected" : ""}
                        key={child.type.display_name}
                        onClick={(e) => this.handleClickTab(e, i)}
                    >
                        {child.type.display_name}
                    </li>
                ))}
            </ul>
        );
    };

    render() {
        const { children } = this.props;
        const childrenProps = React.Children.map(children, (child, id) => {
            return this.state.selected === id && React.cloneElement(child);
        });
        return (
            <div
                id="panel_container"
                className={`panel_container ${this.props.className}`}
            >
                <div
                    onMouseDown={this.props.handleStartDrag}
                    className="panel_drag"
                ></div>
                {this.renderTabs()}
                {childrenProps}
            </div>
        );
    }
}
