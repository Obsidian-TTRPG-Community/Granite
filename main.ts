import { App, debounce, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Original Animations
import EMERGE_MOTION_ORIGINAL from './animations/original/gemmy_emerge.gif';
import POP_MOTION_ORIGINAL from './animations/original/gemmy_pop.gif';
import DISAPPEAR_MOTION_ORIGINAL from './animations/original/gemmy_disappear.gif';
import ANGRY_MOTION_ORIGINAL from './animations/original/gemmy_angry.gif';
import LOOK_MOTION_ORIGINAL from './animations/original/gemmy_lookAround.gif'
import IDLE_MOTION_ORIGINAL from './animations/original/gemmy_idle.gif'
import DISAPPOINT_IMG_ORIGINAL from './animations/original/gemmy_disappoint.gif'

// Draconic Animations
import EMERGE_MOTION_DRACONIC from './animations/draconic/gemmy_emerge.gif';
import POP_MOTION_DRACONIC from './animations/draconic/gemmy_pop.gif';
import DISAPPEAR_MOTION_DRACONIC from './animations/draconic/gemmy_disappear.gif';
import ANGRY_MOTION_DRACONIC from './animations/draconic/gemmy_angry.gif';
import LOOK_MOTION_DRACONIC from './animations/draconic/gemmy_lookAround.gif'
import IDLE_MOTION_DRACONIC from './animations/draconic/gemmy_idle.gif'
import DISAPPOINT_IMG_DRACONIC from './animations/draconic/gemmy_disappoint.gif'

interface GemmySettings {
	// Add the animationSource property to the settings interface
	animationSource: 'original' | 'draconic';
	// how often does Gemmy talk in idle mode, in minutes
	idleTalkFrequency: number;
	// the number of minutes you must write before Gemmy appears to mock you
	writingModeGracePeriod: number;
	// Create Save States
	appeared: boolean;
	inWritingMode: boolean;
}

const DEFAULT_SETTINGS: GemmySettings = {
	animationSource: 'original',
	idleTalkFrequency: 1,
	writingModeGracePeriod: 1,
	// Create Save States
	appeared: false,
	inWritingMode: false,
};


const GEMMY_IDLE_QUOTES = [
	"You can't arrest us! We already ate the evidence!",
	"Don't ever split the party!",
	"If you kill a hive mind, is that murder or genocide?",
	"Roll initiative!",
	"You can try!",
	"I'm not short, I'm concentrated awesome.",
	"I'm not greedy, I'm just allergic to poverty.",
	"I don't always cast spells, but when I do, it's fireball.",
	"I don't need luck, I have a high charisma stat.",
	"I don't always drink ale, but when I do, it's with my fellow adventurers after slaying a dragon.",
	"I don't always roll a critical hit, but when I do, the DM forgets to make me reroll the damage.",
	"I may be chaotic neutral on paper, but in reality, I just like to watch the world burn.",
	"It’s not stealing if it belongs to a dead guy.",
	"Who needs an army when you have a bag of holding full of rocks?",
	"Let me show you how to wear a snake.",
	"WHY WOULD YOU DO THAT!",
	"That dice needs to be retired!",
	"I don't kill without reason. Fortunately, I'm bored. Reason enough!",
	"Ah, my favoured enemy. Something alive.",
	"I slap the barrel with my member!... the 'barrel' open's its mouth!",
	"I'm not deprived, I'm depraved.",
	"You need a free hand to attempt a grapple",
	`Careful how much you carry; the GM might actually ask you to calculate your inventory weight!`,
	`Don't do that! Then we'll have to go look up the grapple rules!`,
	`50 page backstory... NOPE`,
	`It's astounding anyone can understand you, with all those Nat 1 Charisma rolls.`,
	`The cheddar monks are here to save the day!`,
	`What would Matt Mercer do?`,
	`You've been Gygaxed.`,
	`STEP AWAY FROM THE PURCHASE MORE DICE BUTTON`,
	`After thousands of years, I have attained my current state, while you struggle to complete this simple note.`
	]
	;

const WRITING_MODE_QUOTES = [
	`Player's dont take notes... maybe you should try that?`,
	`Is that the best you can do? Keep writing!`,
	`Write first, editor later.`,
	`AI could probably write a better note...`,
	`I love hearing your keyboard. Don't stop.`,
	`How about we review some old notes today?`,
	`Why not just use a template?`,
	`Doesn't matter how much you plan... they will derail anyway!`,
	`Maybe it's time to go get some water or coffee.`,
	`That's not how rivers are in real-life...`,
	`Anything is better than a blank page, even me. Write something!`,
	`Have you given out Inspiration recently?`,
	`Call me Jeeves. I. Dare. You.`,
	`I cast 'Summon Bigger Fish`,
	`Do you touch it?`,
	`What would Matt Mercer do?`
	
	
];

const BUBBLE_DURATION = 5000;

export default class Gemmy extends Plugin {
	settings: GemmySettings;
	gemmyEl: HTMLElement;
	imageEl: HTMLElement;
	inWritingMode: boolean = false;
	idleTimeout: number;
	writingModeTimeout: number;
	appeared: boolean = false;


	// Define variables to hold the selected animations
	EMERGE_MOTION: string;
	POP_MOTION: string;
	DISAPPEAR_MOTION: string;
	ANGRY_MOTION: string;
	LOOK_MOTION: string;
	IDLE_MOTION: string;
	DISAPPOINT_IMG: string;

	async onload() {
		await this.loadSettings();

		// Load the declared animation source
		await this.loadAnimations(this.settings.animationSource);

		let gemmyEl = this.gemmyEl = createDiv('gemmy-container');
		gemmyEl.setAttribute('aria-label-position', 'top');
		gemmyEl.setAttribute('aria-label-delay', '0');
		gemmyEl.setAttribute('aria-label-classes', 'gemmy-tooltip');

		this.imageEl = gemmyEl.createEl('img', {});

		this.addCommand({
			id: 'show',
			name: 'Show Gemmy',
			callback: () => {
				this.appear();
			}
		});

		this.addCommand({
			id: 'hide',
			name: 'Hide Gemmy',
			callback: () => {
				this.disappear();
			}
		});

		this.addCommand({
			id: 'enter-writing-mode',
			name: 'Enter writing mode',
			callback: () => {
				this.enterWritingMode();
			}
		});

		this.addCommand({
			id: 'leave-writing-mode',
			name: 'Leave writing mode',
			callback: () => {
				this.leaveWritingMode();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GemmySettingTab(this.app, this));

		this.gemmyEl.addEventListener('mouseenter', () => {
			if (this.inWritingMode) {
				return;
			}

			this.saySomething(GEMMY_IDLE_QUOTES, true);
			this.idleTimeout && clearTimeout(this.idleTimeout);

		});
		this.gemmyEl.addEventListener('mouseleave', () => {
			if (this.inWritingMode) {
				return;
			}

			this.imageEl.setAttribute('src', this.IDLE_MOTION);
			this.startNextIdleTimeout();
		});

		this.startNextIdleTimeout();

		// debounce editor-change event on workspace
		this.registerEvent(this.app.workspace.on('editor-change', debounce(() => {
			if (!this.inWritingMode) {
				return;
			}

			this.disappear();
			this.setWritingModeTimeout();
		}, 500)));

		app.workspace.onLayoutReady(this.appear.bind(this));
	}

	async loadAnimations(animationSource: 'draconic' | 'original') {
		if (animationSource === 'draconic') {
			// Set the animations to the draconic versions
			this.EMERGE_MOTION = EMERGE_MOTION_DRACONIC;
			this.POP_MOTION = POP_MOTION_DRACONIC;
			this.DISAPPEAR_MOTION = DISAPPEAR_MOTION_DRACONIC;
			this.ANGRY_MOTION = ANGRY_MOTION_DRACONIC;
			this.LOOK_MOTION = LOOK_MOTION_DRACONIC;
			this.IDLE_MOTION = IDLE_MOTION_DRACONIC;
			this.DISAPPOINT_IMG = DISAPPOINT_IMG_DRACONIC;
		} else {
			// Set the animations to the original versions
			this.EMERGE_MOTION = EMERGE_MOTION_ORIGINAL;
			this.POP_MOTION = POP_MOTION_ORIGINAL;
			this.DISAPPEAR_MOTION = DISAPPEAR_MOTION_ORIGINAL;
			this.ANGRY_MOTION = ANGRY_MOTION_ORIGINAL;
			this.LOOK_MOTION = LOOK_MOTION_ORIGINAL;
			this.IDLE_MOTION = IDLE_MOTION_ORIGINAL;
			this.DISAPPOINT_IMG = DISAPPOINT_IMG_ORIGINAL;
		}
	}

	appear() {
		let { gemmyEl, imageEl } = this;

		imageEl.setAttribute('src', this.EMERGE_MOTION);

		// Quicker if we're in writing mode
		if (this.inWritingMode) {
			imageEl.setAttribute('src', this.POP_MOTION);

			setTimeout(() => {
				this.appeared = true;

				this.saySomething(WRITING_MODE_QUOTES, true);
			}, 1800);
		}
		else {
			imageEl.setAttribute('src', this.EMERGE_MOTION);

			setTimeout(() => {
				imageEl.setAttribute('src', this.IDLE_MOTION);
				this.appeared = true;
			}, 3800);
		}

		document.body.appendChild(gemmyEl);
		gemmyEl.show();
		this.appeared = true;
	}

	disappear() {
		this.idleTimeout && window.clearTimeout(this.idleTimeout);
		this.writingModeTimeout && window.clearTimeout(this.writingModeTimeout);

		this.imageEl.setAttribute('src', this.DISAPPEAR_MOTION);
		// remote tooltip
		this.gemmyEl.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: 10, clientY: 10 }));
		setTimeout(() => {
			this.gemmyEl.hide();
			this.appeared = false;
		}, 1300);

		this.appeared = false;
	}

	enterWritingMode() {
		this.inWritingMode = true;

		this.disappear();

		this.setWritingModeTimeout();
	}

	leaveWritingMode() {
		this.inWritingMode = false;
		this.disappear();

		window.clearTimeout(this.writingModeTimeout);
	}

	setWritingModeTimeout() {
		if (this.writingModeTimeout) {
			window.clearTimeout(this.writingModeTimeout);
		}

		this.writingModeTimeout = window.setTimeout(() => {
			if (!this.inWritingMode) {
				return;
			}

			this.appear();
		}, this.settings.writingModeGracePeriod * 1000);
	}

	startNextIdleTimeout() {
		// if the set time is 5 minutes, this will set timeout to be a random time between 4-6 minutes
		// the range will be 80% - 120%
		let randomFactor = 0.8 + 0.4 * Math.random();
		let randomizedTimeout = randomFactor * this.settings.idleTalkFrequency * 60000;

		if (this.idleTimeout) {
			window.clearTimeout(this.idleTimeout);
		}

		this.idleTimeout = window.setTimeout(() => {
			if (this.inWritingMode) {
				return;
			}

			this.saySomething(GEMMY_IDLE_QUOTES, false);
			this.startNextIdleTimeout();
		}, randomizedTimeout);
	}

	saySomething(quotes: string[], persistent: boolean) {
		if (!this.appeared) {
			return;
		}

		let randomThing = quotes[Math.floor(Math.random() * quotes.length)];

		this.gemmyEl.setAttr('aria-label', randomThing);
		this.gemmyEl.setAttr('aria-label-position', 'top');
		this.gemmyEl.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: 10, clientY: 10 }))

		if (this.inWritingMode) {
			this.imageEl.setAttribute('src', this.ANGRY_MOTION);
			setTimeout(() => {
				this.imageEl.setAttribute('src', this.DISAPPOINT_IMG);
			}, 1000);
		}
		else {
			this.imageEl.setAttribute('src', this.LOOK_MOTION);
		}

		if (!persistent) {
			setTimeout(() => {
				this.gemmyEl.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: 10, clientY: 10 }));
				this.imageEl.setAttribute('src', this.IDLE_MOTION);
			}, BUBBLE_DURATION);
		}
	}

	onunload() {
		this.disappear();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.appeared = this.settings.appeared;
		this.inWritingMode = this.settings.inWritingMode;
	}

	async saveSettings() {
		this.settings.appeared = this.appeared;
		this.settings.inWritingMode = this.inWritingMode;
		await this.saveData(this.settings);
	}
}

class GemmySettingTab extends PluginSettingTab {
	plugin: Gemmy;

	constructor(app: App, plugin: Gemmy) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Animation Source')
			.setDesc('Choose the source of Gemmy animations.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('original', 'Original')
					.addOption('draconic', 'Draconic')
					.setValue(this.plugin.settings.animationSource)
					.onChange(async (value) => {
						// Explicitly cast the value to the correct type
						const animationSource = value as 'original' | 'draconic';
						this.plugin.settings.animationSource = animationSource;
						await this.plugin.saveSettings();
						// Reload animations when the source changes
						await this.plugin.loadAnimations(animationSource);

						// Show Gemmy with the new animations after changing the source
						this.plugin.appear();
					})
			);

		new Setting(containerEl)
			.setName('Idle talk frequency')
			.setDesc('How often does Gemmy speak when idle, in minutes.')
			.addSlider(slider => slider
				.setLimits(5, 60, 5)
				.setValue(this.plugin.settings.idleTalkFrequency)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.idleTalkFrequency = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Writing mode grace period')
			.setDesc('How soon Gemmy starts to get disappointed after you stop tying in writing mode, in seconds.')
			.addSlider(slider => slider
				.setLimits(5, 180, 5)
				.setDynamicTooltip()
				.setValue(this.plugin.settings.writingModeGracePeriod)
				.onChange(async (value) => {
					this.plugin.settings.writingModeGracePeriod = value;
					await this.plugin.saveSettings();
				}));
	}
}
