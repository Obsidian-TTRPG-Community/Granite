import { App, PluginSettingTab, Setting } from 'obsidian';
import GemmyPlugin from './main';

export enum AnimationSourceType {
	ORIGINAL = 'original',
	DRACTONIC = 'draconic',
}

export interface GemmySettings {
	// Add the animationSource property to the settings interface
	animationSource: AnimationSourceType;
	// how often does Gemmy talk in idle mode, in minutes
	idleTalkFrequency: number;
	// the number of minutes you must write before Gemmy appears to mock you
	writingModeGracePeriod: number;
}

export const DEFAULT_SETTINGS: GemmySettings = {
	animationSource: AnimationSourceType.ORIGINAL,
	idleTalkFrequency: 1,
	writingModeGracePeriod: 1,
};

export class GemmySettingTab extends PluginSettingTab {
	plugin: GemmyPlugin;

	constructor(app: App, plugin: GemmyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Animation Source')
			.setDesc('Choose the source of Gemmy animations.')
			.addDropdown(dropdown =>
				dropdown
					.addOption(AnimationSourceType.ORIGINAL, 'Original')
					.addOption(AnimationSourceType.DRACTONIC, 'Draconic')
					.setValue(this.plugin.settings.animationSource)
					.onChange(async value => {
						// Explicitly cast the value to the correct type
						const animationSource = value as AnimationSourceType;
						this.plugin.settings.animationSource = animationSource;

						// Show Gemmy with the new animations after changing the source
						this.plugin.gemmy.reset();

						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Idle talk frequency')
			.setDesc('How often does Gemmy speak when idle, in minutes.')
			.addSlider(slider =>
				slider
					.setLimits(5, 60, 5)
					.setValue(this.plugin.settings.idleTalkFrequency)
					.setDynamicTooltip()
					.onChange(async value => {
						this.plugin.settings.idleTalkFrequency = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Writing mode grace period')
			.setDesc('How soon Gemmy starts to get disappointed after you stop tying in writing mode, in seconds.')
			.addSlider(slider =>
				slider
					.setLimits(5, 180, 5)
					.setDynamicTooltip()
					.setValue(this.plugin.settings.writingModeGracePeriod)
					.onChange(async value => {
						this.plugin.settings.writingModeGracePeriod = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
