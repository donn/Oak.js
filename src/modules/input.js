import React, { Component } from 'react'

export default class Input extends Component {
    render() {
        return (
            <div className="input_group">
                <input onChange={this.props.onChange} value={this.props.value} style={{backgroundImage: `url(${this.props.icon})`}} type={this.props.type} placeholder={this.props.placeholder} />
                <label className="group_label">{this.props.placeholder}</label>
            </div>
        );
    }
}
