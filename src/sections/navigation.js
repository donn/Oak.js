import React, { Component } from 'react';
import { Translate, withLocalize } from 'react-localize-redux';

class Navigation extends Component {
	render() {
		return (
			<nav id="navigation" className="navigation">
				<ul>
					<li className="oak_logo">
						<ul className="drop_down">
							<li onClick={this.props.handleAddTabRiscv}><Translate id="menus.add_tab_riscv" /></li>
							<li onClick={this.props.handleAddTabMips}><Translate id="menus.add_tab_mips" /></li>
							<li onClick={this.props.handleLoadAsm}><Translate id="menus.load_assembly" /></li>
							<li onClick={this.props.handleLoadBin}><Translate id="menus.load_binary" /></li>
							<li onClick={this.props.handleDownloadAsm}><Translate id="menus.download_assembly" /></li>
							<li onClick={this.props.downloadBin}><Translate id="menus.download_binary" /></li>
							<li onClick={this.props.downloadRam}><Translate id="menus.download_memory" /></li>
						</ul>
					</li>
					<li onClick={this.props.showSettings}><Translate id="menus.settings" /></li>
					<li onClick={this.props.showHelp}><Translate id="menus.help" /></li>
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