import GranitePlugin from './main';
import { AnimationSourceType } from './Setting';
import { GraniteMode, GraniteState } from './Granite';
import { DRAKE_EXCLUSIVE_QUOTES, GEMMY_EXCLUSIVE_QUOTES, GRANITE_BASE_QUOTES, Quotes } from './quotes/Quotes';

export class QuoteManager {
	public readonly plugin: GranitePlugin;

	public readonly quoteMap: Record<AnimationSourceType, Record<GraniteMode, string[]>>;

	constructor(plugin: GranitePlugin) {
		this.plugin = plugin;

		this.quoteMap = {
			[AnimationSourceType.GEMMY]: {
				[GraniteMode.IDLE]: this.getIdleQuotes(GEMMY_EXCLUSIVE_QUOTES),
				[GraniteMode.WRITING]: this.getWritingQuotes(GEMMY_EXCLUSIVE_QUOTES),
			},
			[AnimationSourceType.DRAKE]: {
				[GraniteMode.IDLE]: this.getIdleQuotes(DRAKE_EXCLUSIVE_QUOTES),
				[GraniteMode.WRITING]: this.getWritingQuotes(DRAKE_EXCLUSIVE_QUOTES),
			},
		};

		console.log('granite | build quote map', this.quoteMap);
	}

	private getIdleQuotes(exclusiveQuotes: Quotes): string[] {
		return [...GRANITE_BASE_QUOTES.general, ...GRANITE_BASE_QUOTES.idle, ...exclusiveQuotes.general, ...exclusiveQuotes.idle];
	}

	private getWritingQuotes(exclusiveQuotes: Quotes): string[] {
		return [...GRANITE_BASE_QUOTES.general, ...GRANITE_BASE_QUOTES.writingMode, ...exclusiveQuotes.general, ...exclusiveQuotes.writingMode];
	}

	public getQuote(): string {
		const quotes: string[] = this.quoteMap[this.plugin.settings.animationSource][this.plugin.granite.mode];

		return quotes[Math.floor(Math.random() * quotes.length)];
	}
}
