import { Animations, AnimationType } from './Animations';
import GranitePlugin from './main';
import { GRANITE_IDLE_QUOTES, WRITING_MODE_QUOTES } from './quotes/Quotes';

const BUBBLE_DURATION: number = 5000;

export enum GraniteState {
	VISIBLE = 'VISIBLE',
	INVISIBLE = 'INVISIBLE',
	DISAPPEARING = 'DISAPPEARING',
	APPEARING = 'APPEARING',
}

export class Granite {
	public readonly plugin: GranitePlugin;
	private readonly animations: Animations;

	graniteEl: HTMLElement;
	imageEl: HTMLElement;

	state: GraniteState;
	inWritingMode: boolean = false;

	idleTimeout: number;
	writingModeTimeout: number;

	constructor(plugin: GranitePlugin) {
		this.plugin = plugin;

		this.animations = new Animations(this.plugin);

		this.state = GraniteState.INVISIBLE;

		this.createGraniteEl();

		this.startNextIdleTimeout();
	}

	createGraniteEl() {
		this.graniteEl = createDiv('granite-container');
		this.graniteEl.setAttribute('aria-label-position', 'top');
		this.graniteEl.setAttribute('aria-label-delay', '0');
		this.graniteEl.setAttribute('aria-label-classes', 'granite-tooltip');

		this.imageEl = this.graniteEl.createEl('img', {});

		this.graniteEl.addEventListener('mouseenter', () => {
			// ignore mouse events in writing mode
			if (this.inWritingMode) {
				return;
			}

			this.saySomething(GRANITE_IDLE_QUOTES, true);
			this.idleTimeout && clearTimeout(this.idleTimeout);
		});

		this.graniteEl.addEventListener('mouseleave', () => {
			// ignore mouse events in writing mode
			if (this.inWritingMode) {
				return;
			}

			this.animations.play(this.imageEl, AnimationType.IDLE_MOTION);
			this.startNextIdleTimeout();
		});

		this.graniteEl.hidden = true;
		document.body.appendChild(this.graniteEl);
	}

	async appear(): Promise<void> {
		if (this.state === GraniteState.APPEARING || this.state === GraniteState.VISIBLE) {
			return;
		}

		// show him
		this.state = GraniteState.APPEARING;
		this.graniteEl.hidden = false;

		// Quicker if we're in writing mode
		if (this.inWritingMode) {
			this.animations.play(this.imageEl, AnimationType.POP_MOTION);

			await sleep(1800);

			// another animation overrode this animation, so we quit
			if (this.state !== GraniteState.APPEARING) {
				return;
			}

			this.state = GraniteState.VISIBLE;
			this.saySomething(WRITING_MODE_QUOTES, true);
		} else {
			this.animations.play(this.imageEl, AnimationType.EMERGE);

			await sleep(3800);

			// another animation overrode this animation, so we quit
			if (this.state !== GraniteState.APPEARING) {
				return;
			}

			this.state = GraniteState.VISIBLE;
			this.animations.play(this.imageEl, AnimationType.IDLE_MOTION);
		}
	}

	async disappear(): Promise<void> {
		// don't make granite disappear while they are already leaving
		if (this.state === GraniteState.DISAPPEARING || this.state === GraniteState.INVISIBLE) {
			return;
		}

		this.state = GraniteState.DISAPPEARING;

		if (this.idleTimeout) window.clearTimeout(this.idleTimeout);
		if (this.writingModeTimeout) window.clearTimeout(this.writingModeTimeout);

		this.animations.play(this.imageEl, AnimationType.DISAPPEAR_MOTION);
		// remote tooltip
		this.graniteEl.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: 10, clientY: 10 }));

		await sleep(1300);

		// another animation overrode this animation, so we quit
		if (this.state !== GraniteState.DISAPPEARING) {
			return;
		}

		this.state = GraniteState.INVISIBLE;
		this.graniteEl.hidden = true;
	}

	async reset(): Promise<void> {
		if (this.state === GraniteState.DISAPPEARING || this.state === GraniteState.INVISIBLE) {
			await this.appear();
		}

		this.animations.play(this.imageEl, AnimationType.IDLE_MOTION);
	}

	onEditorChange(): void {
		if (!this.inWritingMode) {
			return;
		}

		if (this.state !== GraniteState.DISAPPEARING && this.state !== GraniteState.INVISIBLE) {
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

			this.saySomething(GRANITE_IDLE_QUOTES, false);
			this.startNextIdleTimeout();
		}, randomizedTimeout);
	}

	async saySomething(quotes: string[], persistent: boolean): Promise<void> {
		if (this.state !== GraniteState.VISIBLE) {
			return;
		}

		const randomThing = quotes[Math.floor(Math.random() * quotes.length)];

		this.graniteEl.setAttr('aria-label', randomThing);
		this.graniteEl.setAttr('aria-label-position', 'top');
		this.graniteEl.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: 10, clientY: 10 }));

		if (this.inWritingMode) {
			this.animations.play(this.imageEl, AnimationType.ANGRY_MOTION);

			await sleep(1000);

			this.animations.play(this.imageEl, AnimationType.DISAPPOINT_IMG);
		} else {
			this.animations.play(this.imageEl, AnimationType.LOOK_MOTION);
		}

		if (!persistent) {
			await sleep(BUBBLE_DURATION);

			this.graniteEl.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: 10, clientY: 10 }));
			this.animations.play(this.imageEl, AnimationType.IDLE_MOTION);
		}
	}
}
