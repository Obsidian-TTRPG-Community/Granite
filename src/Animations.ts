import GemmyPlugin from './main';
import { AnimationSourceType } from './Setting';

// Original Animations
import EMERGE_MOTION_ORIGINAL from '../animations/original/gemmy_emerge.gif';
import POP_MOTION_ORIGINAL from '../animations/original/gemmy_pop.gif';
import DISAPPEAR_MOTION_ORIGINAL from '../animations/original/gemmy_disappear.gif';
import ANGRY_MOTION_ORIGINAL from '../animations/original/gemmy_angry.gif';
import LOOK_MOTION_ORIGINAL from '../animations/original/gemmy_lookAround.gif';
import IDLE_MOTION_ORIGINAL from '../animations/original/gemmy_idle.gif';
import DISAPPOINT_IMG_ORIGINAL from '../animations/original/gemmy_disappoint.gif';

// Draconic Animations
import EMERGE_MOTION_DRACONIC from '../animations/draconic/gemmy_emerge.gif';
import POP_MOTION_DRACONIC from '../animations/draconic/gemmy_pop.gif';
import DISAPPEAR_MOTION_DRACONIC from '../animations/draconic/gemmy_disappear.gif';
import ANGRY_MOTION_DRACONIC from '../animations/draconic/gemmy_angry.gif';
import LOOK_MOTION_DRACONIC from '../animations/draconic/gemmy_lookAround.gif';
import IDLE_MOTION_DRACONIC from '../animations/draconic/gemmy_idle.gif';
import DISAPPOINT_IMG_DRACONIC from '../animations/draconic/gemmy_disappoint.gif';

export enum AnimationType {
	EMERGE = 'emerge',
	POP_MOTION = 'pop_motion',
	DISAPPEAR_MOTION = 'disappear_motion',
	ANGRY_MOTION = 'angry_motion',
	LOOK_MOTION = 'look_motion',
	IDLE_MOTION = 'idle_motion',
	DISAPPOINT_IMG = 'disappoint_ing',
}

export class Animations {
	public readonly plugin: GemmyPlugin;

	// the mappings from an animation type to an actual image file for the draconic gemmy
	public readonly draconicAnimationMap: Record<AnimationType, string>;
	// the mappings from an animation type to an actual image file for the original gemmy
	public readonly originalAnimationMap: Record<AnimationType, string>;

	// maps an animation source to the corresponding animation map
	public readonly animationSourceMap: Record<AnimationSourceType, Record<AnimationType, string>>;

	constructor(plugin: GemmyPlugin) {
		this.plugin = plugin;

		this.draconicAnimationMap = {
			[AnimationType.EMERGE]: EMERGE_MOTION_DRACONIC,
			[AnimationType.POP_MOTION]: POP_MOTION_DRACONIC,
			[AnimationType.DISAPPEAR_MOTION]: DISAPPEAR_MOTION_DRACONIC,
			[AnimationType.ANGRY_MOTION]: ANGRY_MOTION_DRACONIC,
			[AnimationType.LOOK_MOTION]: LOOK_MOTION_DRACONIC,
			[AnimationType.IDLE_MOTION]: IDLE_MOTION_DRACONIC,
			[AnimationType.DISAPPOINT_IMG]: DISAPPOINT_IMG_DRACONIC,
		};

		this.originalAnimationMap = {
			[AnimationType.EMERGE]: EMERGE_MOTION_ORIGINAL,
			[AnimationType.POP_MOTION]: POP_MOTION_ORIGINAL,
			[AnimationType.DISAPPEAR_MOTION]: DISAPPEAR_MOTION_ORIGINAL,
			[AnimationType.ANGRY_MOTION]: ANGRY_MOTION_ORIGINAL,
			[AnimationType.LOOK_MOTION]: LOOK_MOTION_ORIGINAL,
			[AnimationType.IDLE_MOTION]: IDLE_MOTION_ORIGINAL,
			[AnimationType.DISAPPOINT_IMG]: DISAPPOINT_IMG_ORIGINAL,
		};

		this.animationSourceMap = {
			[AnimationSourceType.DRACTONIC]: this.draconicAnimationMap,
			[AnimationSourceType.ORIGINAL]: this.originalAnimationMap,
		};
	}

	/**
	 * Plays a gemmy animation in the currently selected animation source type inside an element.
	 *
	 * @param el the element to play the animation in
	 * @param animation the animation to play
	 */
	public play(el: HTMLElement, animation: AnimationType): void {
		const animationFile = this.animationSourceMap[this.plugin.settings.animationSource][animation];

		el.setAttribute('src', animationFile);
	}
}
