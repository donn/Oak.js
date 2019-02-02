import React, { Component } from 'react';
import { Translate, withLocalize } from 'react-localize-redux';

class Navigation extends Component {
	render() {
		return (
			<nav id="navigation" className="navigation">
				<ul>
					<li className="oak_logo">
						<ul className="drop_down">
							<li onClick={this.props.handleAddTab}><Translate id="menus.add_tab">Add Tab</Translate></li>
							<li onClick={this.props.handleLoadAsm}><Translate id="menus.load_assembly">Load Assembly</Translate></li>
							<li onClick={this.props.handleLoadBin}><Translate id="menus.load_binary">Load Binary</Translate></li>
							<li onClick={this.props.handleDownloadAsm}><Translate id="menus.download_assembly">Download Assembly</Translate></li>
							<li onClick={this.props.downloadBin}><Translate id="menus.download_binary">Download Binary</Translate></li>
							<li onClick={this.props.downloadRam}><Translate id="menus.download_memory">Download Memory</Translate></li>
						</ul>
					</li>
					<li onClick={this.props.showSettings}><Translate id="menus.settings">Settings</Translate></li>
					<li onClick={this.props.showHelp}><Translate id="menus.help">Help</Translate></li>
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

export default withLocalize(Navigation);