import React, { Component } from 'react';
import { Translate, withLocalize } from 'react-localize-redux';
import { connect } from 'react-redux';
import { setSettingsVisible, setHelpVisible, setAboutVisible } from "../actions"

const SimulatingStatus = {
	Stopped:	0,
	Step:		1,
	Play:		2
};

const CONSOLE_INPUT_NONE  = 0;

class Navigation extends Component {
	render() {
		let assemble_css = "";
		const tab  = this.props.tabs[this.props.selectedtab];

		if (tab) {
			if (tab.runningStatus === SimulatingStatus.Stopped) {
				assemble_css = " assemble_ready";
			}

			if (tab.console_input_type !== CONSOLE_INPUT_NONE) {
				assemble_css += " simulate_prevent_input";
			}
		}

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
							<li onClick={this.props.downloadBinH}><Translate id="menus.download_binary_h" /></li>
							<li onClick={this.props.downloadRam}><Translate id="menus.download_memory" /></li>
						</ul>
					</li>
					<li onClick={this.props.showSettings}><Translate id="menus.settings" /></li>
					<li onClick={this.props.showHelp}><Translate id="menus.help" /></li>
					<li onClick={this.props.showAbout}><Translate id="menus.about" /></li>
				</ul>

				<div className="buttons_right">
					<button className={`assemble`} onClick={this.props.assemble}></button>
					<button className={`simulate${assemble_css}`} onClick={this.props.simulate}></button>
					<button className={`simulate_step${assemble_css}`} onClick={this.props.stepbystep}></button>
				</div>
			</nav>
		);
	}
};

const stateToProps = state => {
	return {
		tabs: state.tabs,
		selectedtab: state.selectedtab
	};
};

const appDispatchToProps = (dispatch, ownProps) => ({
	showHelp: (visible) => dispatch(setHelpVisible(visible)),
	showAbout: (visible) => dispatch(setAboutVisible(visible)),
	showSettings: (visible) => dispatch(setSettingsVisible(visible))
});

export default withLocalize(
	connect(
		stateToProps,
		appDispatchToProps
	)(
		Navigation
	)
);