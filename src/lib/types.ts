export interface Person {
	name: string;
	active: boolean;
}

export interface Setting {
	welcome: string;
	done: string;
	duration: string;
	showTimer: boolean;
	names: Person[];
	// The team's custom theme as daisyUI theme CSS; applies for anyone who hasn't picked their own.
	theme?: string;
}

export const themes = [
	'light',
	'dark',
	'cupcake',
	'bumblebee',
	'emerald',
	'corporate',
	'synthwave',
	'retro',
	'cyberpunk',
	'valentine',
	'halloween',
	'garden',
	'forest',
	'aqua',
	'lofi',
	'pastel',
	'fantasy',
	'wireframe',
	'black',
	'luxury',
	'dracula',
	'cmyk',
	'autumn',
	'business',
	'acid',
	'lemonade',
	'night',
	'coffee',
	'winter',
	'dim',
	'nord',
	'sunset',
	'caramellatte',
	'abyss',
	'silk'
] as const;

export type Theme = (typeof themes)[number];
