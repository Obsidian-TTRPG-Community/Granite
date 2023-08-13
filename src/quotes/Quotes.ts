export interface Quotes {
	// general quotes can appear both in normal and in writing mode
	general: string[];
	// idle quotes can only appear in normal mode
	idle: string[];
	// writing mode quotes can only appear in writing mode
	writingMode: string[];
}

// these quotes can appear in every animation mode
export const GRANITE_BASE_QUOTES: Quotes = {
	general: [],
	idle: [
		"You can't arrest us! We already ate the evidence!",
		"Don't ever split the party!",
		'If you kill a hive mind, is that murder or genocide?',
		'Roll initiative!',
		'You can try!',
		"I'm not short, I'm concentrated awesome.",
		"I'm not greedy, I'm just allergic to poverty.",
		"I don't always cast spells, but when I do, it's fireball.",
		"I don't need luck, I have a high charisma stat.",
		"I don't always drink ale, but when I do, it's with my fellow adventurers after slaying a dragon.",
		"I don't always roll a critical hit, but when I do, the DM forgets to make me reroll the damage.",
		'I may be chaotic neutral on paper, but in reality, I just like to watch the world burn.',
		'It’s not stealing if it belongs to a dead guy.',
		'Who needs an army when you have a bag of holding full of rocks?',
		'Let me show you how to wear a snake.',
		'WHY WOULD YOU DO THAT!',
		'That dice needs to be retired!',
		"I don't kill without reason. Fortunately, I'm bored. Reason enough!",
		'Ah, my favoured enemy. Something alive.',
		"I slap the barrel with my member!... the 'barrel' open's its mouth!",
		"I'm not deprived, I'm depraved.",
		'You need a free hand to attempt a grapple',
		`Careful how much you carry; the GM might actually ask you to calculate your inventory weight!`,
		`Don't do that! Then we'll have to go look up the grapple rules!`,
		`50 page backstory... NOPE`,
		`It's astounding anyone can understand you, with all those Nat 1 Charisma rolls.`,
		`The cheddar monks are here to save the day!`,
		`You've been Gygaxed.`,
		`STEP AWAY FROM THE PURCHASE MORE DICE BUTTON`,
		`After thousands of years, I have attained my current state, while you struggle to complete this simple note.`,
		`You are a background character in your own life.`,
	],
	writingMode: [
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
		`What would Matt Mercer do?`,
		`To continue, please insert more credits`,
		`Have you considered just... Not?`,
	],
};

export const GEMMY_EXCLUSIVE_QUOTES: Quotes = {
	general: [],
	idle: [],
	writingMode: [],
};

export const DRAKE_EXCLUSIVE_QUOTES: Quotes = {
	general: [],
	idle: [],
	writingMode: [],
};
