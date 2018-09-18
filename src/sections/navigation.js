import React, { Component } from 'react';

export default class Navigation extends Component {
	render() {
		return (
			<nav id="navigation" className="navigation">
				<ul>
					<li className="oak_logo">
						<ul className="drop_down">
							<li onClick={this.props.handleAddTab}>Add Tab</li>
							<li onClick={this.props.handleLoadAsm}>Load Assembly</li>
							<li onClick={this.props.handleLoadBin}>Load Binary</li>
							<li onClick={this.props.handleDownloadAsm}>Download Assembly</li>
							<li onClick={this.props.downloadBin}>Download Binary</li>
							<li onClick={this.props.downloadRam}>Download Memory</li>
						</ul>
					</li>
					<li onClick={this.props.showSettings}>Settings</li>
					<li onClick={this.props.showHelp}>Help</li>
				</ul>

				<div className="buttons_right">
					<button className="assemble" onClick={this.props.assemble}></button>
					<button className="simulate" onClick={this.props.simulate}></button>
					<button className="simulate_step" onClick={this.props.stepbystep}></button>
				</div>
			</nav>
		);
	}
};