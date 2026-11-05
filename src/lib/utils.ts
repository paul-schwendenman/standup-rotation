import type { Theme } from './types';
import type { CustomThemeId, TeamThemeId } from './customTheme';

export function shuffle<T>(array: T[]): T[] {
	let currentIndex = array.length,
		randomIndex;

	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

export const loadTheme = (): Theme | CustomThemeId | null => {
	const theme = localStorage.getItem('theme') as Theme | CustomThemeId | null;
	if (theme) {
		document.documentElement.setAttribute('data-theme', theme);
	}

	return theme;
};

export const applyTheme = (theme: Theme | CustomThemeId | TeamThemeId | '') => {
	document.documentElement.setAttribute('data-theme', theme);
};

export const setTheme = (theme: Theme | CustomThemeId | '') => {
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);
};
