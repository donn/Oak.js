import React, { Component } from 'react'

export default class Select extends Component {
    render() {
        return (
            <div className="select_group">
                <select onChange={this.props.onChange} value={this.props.value} style={{backgroundImage: `url(/images/icons/input_select_arrow.svg), url(${this.props.icon})`}}>
                    {this.props.children}
                </select>
                <label className="group_label">{this.props.placeholder}</label>
            </div>
        );
    }
}
