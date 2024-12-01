import type { Theme } from "./types";

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

export const loadTheme = (): Theme | null => {
	const theme = localStorage.getItem('theme') as Theme | null;
	if (theme) {
		document.documentElement.setAttribute('data-theme', theme);
	}

	return theme;
};

export const setTheme = (theme: Theme) => {
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);
};
