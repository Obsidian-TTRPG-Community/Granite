import { debounce, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, GemmySettings, GemmySettingTab } from './Setting';
import { Gemmy } from './Gemmy';

export default class GemmyPlugin extends Plugin {
	settings: GemmySettings;
	gemmy: Gemmy;

	async onload() {
		await this.loadSettings();

		this.gemmy = new Gemmy(this);

		this.addCommand({
			id: 'show',
			name: 'Show Gemmy',
			callback: () => {
				this.gemmy.appear();
			},
		});

		this.addCommand({
			id: 'hide',
			name: 'Hide Gemmy',
			callback: () => {
				this.gemmy.disappear();
			},
		});

		this.addCommand({
			id: 'enter-writing-mode',
			name: 'Enter writing mode',
			callback: () => {
				this.gemmy.enterWritingMode();
			},
		});

		this.addCommand({
			id: 'leave-writing-mode',
			name: 'Leave writing mode',
			callback: () => {
				this.gemmy.leaveWritingMode();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GemmySettingTab(this.app, this));

		// debounce editor-change event on workspace
		this.registerEvent(
			this.app.workspace.on(
				'editor-change',
				debounce(() => {
					this.gemmy.onEditorChange();
				}, 500),
			),
		);

		this.app.workspace.onLayoutReady(() => this.gemmy.appear());
	}

	onunload() {
		this.gemmy.disappear();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
