import { Animations, AnimationType } from './Animations';
import GemmyPlugin from './main';
import { GEMMY_IDLE_QUOTES, WRITING_MODE_QUOTES } from './Quotes';

const BUBBLE_DURATION: number = 5000;

export enum GemmyState {
	VISIBLE = 'VISIBLE',
	INVISIBLE = 'INVISIBLE',
	DISAPPEARING = 'DISAPPEARING',
	APPEARING = 'APPEARING',
}

export class Gemmy {
	public readonly plugin: GemmyPlugin;
	private readonly animations: Animations;

	gemmyEl: HTMLElement;
	imageEl: HTMLElement;

	state: GemmyState;
	inWritingMode: boolean = false;

	idleTimeout: number;
	writingModeTimeout: number;

	constructor(plugin: GemmyPlugin) {
		this.plugin = plugin;

		this.animations = new Animations(this.plugin);

		this.state = GemmyState.INVISIBLE;

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
			// ignore mouse events in writing mode
			if (this.inWritingMode) {
				return;
			}

			this.saySomething(GEMMY_IDLE_QUOTES, true);
			this.idleTimeout && clearTimeout(this.idleTimeout);
		});

		this.gemmyEl.addEventListener('mouseleave', () => {
			// ignore mouse events in writing mode
			if (this.inWritingMode) {
				return;
			}

			this.animations.play(this.imageEl, AnimationType.IDLE_MOTION);
			this.startNextIdleTimeout();
		});

		this.gemmyEl.hidden = true;
		document.body.appendChild(this.gemmyEl);
	}

	async appear(): Promise<void> {
		if (this.state === GemmyState.APPEARING || this.state === GemmyState.VISIBLE) {
			return;
		}

		// show him
		this.state = GemmyState.APPEARING;
		this.gemmyEl.hidden = false;

		// Quicker if we're in writing mode
		if (this.inWritingMode) {
			this.animations.play(this.imageEl, AnimationType.POP_MOTION);

			await sleep(1800);

			// another animation overrode this animation, so we quit
			if (this.state !== GemmyState.APPEARING) {
				return;
			}

			this.state = GemmyState.VISIBLE;
			this.saySomething(WRITING_MODE_QUOTES, true);
		} else {
			this.animations.play(this.imageEl, AnimationType.EMERGE);

			await sleep(3800);

			// another animation overrode this animation, so we quit
			if (this.state !== GemmyState.APPEARING) {
				return;
			}

			this.state = GemmyState.VISIBLE;
			this.animations.play(this.imageEl, AnimationType.IDLE_MOTION);
		}
	}

	async disappear(): Promise<void> {
		// don't make gemmy disappear while he is already leaving
		if (this.state === GemmyState.DISAPPEARING || this.state === GemmyState.INVISIBLE) {
			return;
		}

		this.state = GemmyState.DISAPPEARING;

		if (this.idleTimeout) window.clearTimeout(this.idleTimeout);
		if (this.writingModeTimeout) window.clearTimeout(this.writingModeTimeout);

		this.animations.play(this.imageEl, AnimationType.DISAPPEAR_MOTION);
		// remote tooltip
		this.gemmyEl.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: 10, clientY: 10 }));

		await sleep(1300);

		// another animation overrode this animation, so we quit
		if (this.state !== GemmyState.DISAPPEARING) {
			return;
		}

		this.state = GemmyState.INVISIBLE;
		this.gemmyEl.hidden = true;
	}

	async reset(): Promise<void> {
		if (this.state === GemmyState.DISAPPEARING || this.state === GemmyState.INVISIBLE) {
			await this.appear();
		}

		this.animations.play(this.imageEl, AnimationType.IDLE_MOTION);
	}

	onEditorChange(): void {
		if (!this.inWritingMode) {
			return;
		}

		if (this.state !== GemmyState.DISAPPEARING && this.state !== GemmyState.INVISIBLE) {
			this.disappear();
		}
		this.setWritingModeTimeout();
	}

	enterWritingMode(): void {
		this.inWritingMode = true;
		this.disappear();

		this.setWritingModeTimeout();
	}

	leaveWritingMode() {
		this.inWritingMode = false;
		this.reset();

		window.clearTimeout(this.writingModeTimeout);
	}

	setWritingModeTimeout(): void {
		if (this.writingModeTimeout) {
			window.clearTimeout(this.writingModeTimeout);
		}

		this.writingModeTimeout = window.setTimeout(() => {
			if (this.inWritingMode) {
				this.appear();
			}
		}, this.plugin.settings.writingModeGracePeriod * 1000);
	}

	startNextIdleTimeout(): void {
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

	async saySomething(quotes: string[], persistent: boolean): Promise<void> {
		if (this.state !== GemmyState.VISIBLE) {
			return;
		}

		const randomThing = quotes[Math.floor(Math.random() * quotes.length)];

		this.gemmyEl.setAttr('aria-label', randomThing);
		this.gemmyEl.setAttr('aria-label-position', 'top');
		this.gemmyEl.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: 10, clientY: 10 }));

		if (this.inWritingMode) {
			this.animations.play(this.imageEl, AnimationType.ANGRY_MOTION);

			await sleep(1000);

			this.animations.play(this.imageEl, AnimationType.DISAPPOINT_IMG);
		} else {
			this.animations.play(this.imageEl, AnimationType.LOOK_MOTION);
		}

		if (!persistent) {
			await sleep(BUBBLE_DURATION);

			this.gemmyEl.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: 10, clientY: 10 }));
			this.animations.play(this.imageEl, AnimationType.IDLE_MOTION);
		}
	}
}
