import { Animations, AnimationType } from './Animations';
import GemmyPlugin from './main';
import { GEMMY_IDLE_QUOTES, WRITING_MODE_QUOTES } from './Quotes';

const BUBBLE_DURATION: number = 5000;

export class Gemmy {
	public readonly plugin: GemmyPlugin;
	private readonly animations: Animations;

	gemmyEl: HTMLElement;
	imageEl: HTMLElement;

	appeared: boolean = false;
	isDisappearing: boolean = false;
	inWritingMode: boolean = false;

	idleTimeout: number;
	writingModeTimeout: number;
	disappearTimeout: number;

	constructor(plugin: GemmyPlugin) {
		this.plugin = plugin;

		this.animations = new Animations(this.plugin);

		this.createGemmyEl();

		this.startNextIdleTimeout();
	}

	createGemmyEl() {
		this.gemmyEl = createDiv('gemmy-container');
		this.gemmyEl.setAttribute('aria-label-position', 'top');
		this.gemmyEl.setAttribute('aria-label-delay', '0');
		this.gemmyEl.setAttribute('aria-label-classes', 'gemmy-tooltip');

		this.imageEl = this.gemmyEl.createEl('img', {});

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

			this.animations.play(this.imageEl, AnimationType.IDLE_MOTION);
			this.startNextIdleTimeout();
		});
	}

	appear() {
		console.log('gemmy appear');

		// stop him from leaving
		window.clearTimeout(this.disappearTimeout);
		this.isDisappearing = false;

		// show him
		this.animations.play(this.imageEl, AnimationType.EMERGE);

		// Quicker if we're in writing mode
		if (this.inWritingMode) {
			this.animations.play(this.imageEl, AnimationType.POP_MOTION);

			window.setTimeout(() => {
				this.appeared = true;

				this.saySomething(WRITING_MODE_QUOTES, true);
			}, 1800);
		} else {
			this.animations.play(this.imageEl, AnimationType.EMERGE);

			window.setTimeout(() => {
				this.animations.play(this.imageEl, AnimationType.IDLE_MOTION);
				this.appeared = true;
			}, 3800);
		}

		document.body.appendChild(this.gemmyEl);
		this.gemmyEl.hidden = false;
		this.appeared = true;
	}

	disappear() {
		// don't make gemmy disappear while he is already leaving
		if (this.isDisappearing) {
			return;
		}

		this.isDisappearing = true;

		this.idleTimeout && window.clearTimeout(this.idleTimeout);
		this.writingModeTimeout && window.clearTimeout(this.writingModeTimeout);

		this.animations.play(this.imageEl, AnimationType.DISAPPEAR_MOTION);
		// remote tooltip
		this.gemmyEl.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: 10, clientY: 10 }));

		this.disappearTimeout = window.setTimeout(() => {
			// gemmy finished leaving
			this.gemmyEl.hidden = true;
			this.appeared = false;
			this.isDisappearing = false;
		}, 1300);

		// this.appeared = false;
	}

	onEditorChange(): void {
		if (!this.inWritingMode) {
			return;
		}

		this.disappear();
		this.setWritingModeTimeout();
	}

	enterWritingMode() {
		this.inWritingMode = true;
		this.disappear();

		this.setWritingModeTimeout();
	}

	leaveWritingMode() {
		this.inWritingMode = false;
		this.appear();

		window.clearTimeout(this.writingModeTimeout);
	}

	setWritingModeTimeout() {
		if (this.writingModeTimeout) {
			window.clearTimeout(this.writingModeTimeout);
		}

		this.writingModeTimeout = window.setTimeout(() => {
			if (this.inWritingMode) {
				this.appear();
			}
		}, this.plugin.settings.writingModeGracePeriod * 1000);
	}

	startNextIdleTimeout() {
		// if the set time is 5 minutes, this will set timeout to be a random time between 4-6 minutes
		// the range will be 80% - 120%
		const randomFactor = 0.8 + 0.4 * Math.random();
		const randomizedTimeout = randomFactor * this.plugin.settings.idleTalkFrequency * 60000;

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

		console.log(this.inWritingMode);

		const randomThing = quotes[Math.floor(Math.random() * quotes.length)];

		this.gemmyEl.setAttr('aria-label', randomThing);
		this.gemmyEl.setAttr('aria-label-position', 'top');
		this.gemmyEl.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: 10, clientY: 10 }));

		if (this.inWritingMode) {
			this.animations.play(this.imageEl, AnimationType.ANGRY_MOTION);

			window.setTimeout(() => {
				this.animations.play(this.imageEl, AnimationType.DISAPPOINT_IMG);
			}, 1000);
		} else {
			this.animations.play(this.imageEl, AnimationType.LOOK_MOTION);
		}

		if (!persistent) {
			window.setTimeout(() => {
				this.gemmyEl.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: 10, clientY: 10 }));
				this.animations.play(this.imageEl, AnimationType.IDLE_MOTION);
			}, BUBBLE_DURATION);
		}
	}
}
