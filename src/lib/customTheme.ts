import {
	backgroundDecls,
	checkSvg,
	defaultBackground,
	isShareable,
	parseBackground,
	type ThemeBackground
} from './background';
import { contrastRatio } from './contrast';
import { themes, type Theme } from './types';

export interface CustomTheme {
	name: string;
	colorScheme: 'light' | 'dark';
	vars: Record<string, string>;
	source: string;
}

// What a team link carries: a built-in theme's name or a custom theme's CSS, and/or a background.
// Links from before backgrounds and built-in names carry only `source`, and still parse.
export interface TeamThemeSetting {
	name?: Theme;
	source?: string;
	background?: ThemeBackground;
}

// A team link, validated. A look can be a theme, a background, or both.
export interface TeamLook {
	builtIn: Theme | null;
	custom: CustomTheme | null;
	background: ThemeBackground | null;
}

export interface ParseResult {
	theme: CustomTheme | null;
	errors: string[];
	warnings: string[];
}

export type CustomThemeId = `custom-${string}`;

// The team theme shared in the page link. Never collides with built-in or custom-* ids.
export const TEAM_THEME_ID = 'team';
export type TeamThemeId = typeof TEAM_THEME_ID;

const STORAGE_KEY = 'customThemes';
const BACKGROUND_KEY = 'background';
const CSS_CACHE_KEY = 'customThemesCss';
const STYLE_ID = 'custom-themes';

export const colorVars = [
	'base-100',
	'base-200',
	'base-300',
	'base-content',
	'primary',
	'primary-content',
	'secondary',
	'secondary-content',
	'accent',
	'accent-content',
	'neutral',
	'neutral-content',
	'info',
	'info-content',
	'success',
	'success-content',
	'warning',
	'warning-content',
	'error',
	'error-content'
].map((name) => `--color-${name}`);

export const shapeVars = [
	'--radius-selector',
	'--radius-field',
	'--radius-box',
	'--size-selector',
	'--size-field',
	'--border',
	'--depth',
	'--noise'
];

// Values end up inside a <style> tag, so only allow plain colors and lengths.
const COLOR_RE = /^(#[0-9a-f]{3,8}|(oklch|oklab|rgb|rgba|hsl|hsla)\([0-9a-z.%,\s/+-]*\))$/i;
const LENGTH_RE = /^-?[0-9]*\.?[0-9]+(rem|px|em)?$/;

export const themeId = (name: string): CustomThemeId => `custom-${name}`;

export const isCustomThemeId = (theme: string | null): theme is CustomThemeId =>
	!!theme && theme.startsWith('custom-');

export const isBuiltInTheme = (theme: unknown): theme is Theme => themes.includes(theme as Theme);

const slugify = (name: string) =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

const MIN_CONTRAST = 4.5;

const contrastPairs: [string, string][] = [
	['base-content', 'base-100'],
	['base-content', 'base-200'],
	['base-content', 'base-300'],
	...['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'].map(
		(name): [string, string] => [`${name}-content`, name]
	)
];

function contrastWarnings(vars: Record<string, string>): string[] {
	return contrastPairs.flatMap(([fg, bg]) => {
		const ratio = contrastRatio(vars[`--color-${fg}`], vars[`--color-${bg}`]);
		if (ratio === null || ratio >= MIN_CONTRAST) return [];
		return [`${fg} on ${bg} is hard to read: ${ratio.toFixed(1)}:1 (needs ${MIN_CONTRAST}:1).`];
	});
}

export function parseTheme(source: string): ParseResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (source.trim() === '') {
		return { theme: null, errors, warnings };
	}

	const found: Record<string, string> = {};
	for (const match of source.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}\n]+);/gi)) {
		found[match[1].toLowerCase()] = match[2].trim();
	}

	const vars: Record<string, string> = {};
	const missing: string[] = [];

	for (const key of colorVars) {
		const value = found[key];
		if (value === undefined) {
			missing.push(key);
		} else if (!COLOR_RE.test(value)) {
			errors.push(`${key}: "${value}" isn't a color.`);
		} else {
			vars[key] = value;
		}
	}

	for (const key of shapeVars) {
		const value = found[key];
		if (value === undefined) continue;
		if (!LENGTH_RE.test(value)) {
			errors.push(`${key}: "${value}" isn't a valid size.`);
		} else {
			vars[key] = value;
		}
	}

	if (missing.length > 0) {
		errors.push(`Missing ${missing.join(', ')}`);
	}

	const known = new Set([...colorVars, ...shapeVars]);
	for (const key of Object.keys(found)) {
		if (!known.has(key)) warnings.push(`${key} isn't a daisyUI theme variable and was ignored.`);
	}

	const scheme = source.match(/color-scheme\s*:\s*(light|dark)/)?.[1] as
		'light' | 'dark' | undefined;
	if (!scheme) warnings.push('No color-scheme set; assuming light.');

	const name = slugify(source.match(/\bname\s*:\s*"([^"]*)"/)?.[1] ?? '') || 'custom';

	if (errors.length > 0) {
		return { theme: null, errors, warnings };
	}

	warnings.push(...contrastWarnings(vars));

	return { theme: { name, colorScheme: scheme ?? 'light', vars, source }, errors, warnings };
}

// A paste can hold a theme block and an <svg> background together (the one-step AI prompt asks for both).
export function parseLook(text: string): {
	result: ParseResult;
	background: { svg: string | null; errors: string[] } | null;
} {
	const svgMatch = text.match(/<svg[\s>][\s\S]*?<\/svg>/i);
	const result = parseTheme(svgMatch ? text.replace(svgMatch[0], '') : text);
	return { result, background: svgMatch ? checkSvg(svgMatch[0], 'tile') : null };
}

export const pastedBackground = (svg: string): ThemeBackground => ({
	...defaultBackground('dots'),
	pattern: 'custom',
	svg
});

function themeRule(id: string, theme: CustomTheme): string {
	const decls = Object.entries(theme.vars)
		.map(([key, value]) => `${key}: ${value};`)
		.join(' ');
	return `:root[data-theme="${id}"], [data-theme="${id}"] { color-scheme: ${theme.colorScheme}; ${decls} }`;
}

// The background is its own layer: it applies whatever theme is showing.
export function themeCss(
	themes: CustomTheme[],
	teamTheme: CustomTheme | null = null,
	background: ThemeBackground | null = null
): string {
	const rules = themes.map((theme) => themeRule(themeId(theme.name), theme));
	if (teamTheme) rules.push(themeRule(TEAM_THEME_ID, teamTheme));
	if (background) rules.push(`body::before { ${backgroundDecls(background)} }`);
	return rules.join('\n');
}

// A compact, canonical daisyUI theme block: drops whatever chatter surrounded the original paste.
export function toSource(theme: CustomTheme): string {
	const decls = Object.entries(theme.vars)
		.map(([key, value]) => `  ${key}: ${value};`)
		.join('\n');
	return `@plugin "daisyui/theme" {\n  name: "${theme.name}";\n  color-scheme: ${theme.colorScheme};\n${decls}\n}`;
}

// Re-parse stored themes so hand-edited localStorage can't inject arbitrary CSS.
export function loadCustomThemes(): CustomTheme[] {
	try {
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
		if (!Array.isArray(stored)) return [];
		return stored
			.map((item) => (typeof item?.source === 'string' ? parseTheme(item.source).theme : null))
			.filter((theme): theme is CustomTheme => theme !== null);
	} catch {
		return [];
	}
}

// undefined: no personal pick, so the team's background applies. null: picked "None".
export function loadBackground(): ThemeBackground | null | undefined {
	try {
		const stored = localStorage.getItem(BACKGROUND_KEY);
		if (stored === null) return undefined;
		return parseBackground(JSON.parse(stored), { shareableOnly: false });
	} catch {
		return undefined;
	}
}

export function saveBackground(background: ThemeBackground | null | undefined) {
	if (background === undefined) localStorage.removeItem(BACKGROUND_KEY);
	else localStorage.setItem(BACKGROUND_KEY, JSON.stringify(background));
}

// Custom SVGs too big for a link stay personal; the team gets the theme without them.
export function toTeamSetting(
	theme: Theme | CustomTheme | null,
	background: ThemeBackground | null
): TeamThemeSetting | undefined {
	const setting: TeamThemeSetting = {};
	if (typeof theme === 'string') setting.name = theme;
	else if (theme) setting.source = toSource(theme);
	if (background && isShareable(background)) setting.background = background;
	return Object.keys(setting).length > 0 ? setting : undefined;
}

// Team links carry presets and small custom SVGs; anything bigger in a link is dropped.
export function parseTeamSetting(setting: TeamThemeSetting | undefined): TeamLook | null {
	if (!setting || typeof setting !== 'object') return null;
	const builtIn = isBuiltInTheme(setting.name) ? setting.name : null;
	const custom =
		!builtIn && typeof setting.source === 'string' ? parseTheme(setting.source).theme : null;
	const background = parseBackground(setting.background, { shareableOnly: true });
	if (!builtIn && !custom && !background) return null;
	return { builtIn, custom, background };
}

export function saveCustomThemes(themes: CustomTheme[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
}

export function injectCustomThemes(
	themes: CustomTheme[],
	teamTheme: CustomTheme | null = null,
	background: ThemeBackground | null = null
) {
	let style = document.getElementById(STYLE_ID);
	if (!style) {
		style = document.createElement('style');
		style.id = STYLE_ID;
		document.head.appendChild(style);
	}
	style.textContent = themeCss(themes, teamTheme, background);

	// app.html injects this cached copy before the app loads, to avoid a flash of the default theme.
	localStorage.setItem(CSS_CACHE_KEY, style.textContent);
}

export const DESCRIBE_PLACEHOLDER = 'calm dark navy with a warm amber accent and soft snowflakes';

// One prompt, one reply: the theme block plus a matching tiled background.
export const lookPrompt = (
	description: string
) => `Create a daisyUI v5 custom theme and a matching background pattern
for a stand-up meeting timer app.
The look I want: ${description.trim() || `[describe it, e.g. "${DESCRIBE_PLACEHOLDER}"]`}.

Reply with exactly two code blocks and nothing else.

1. The theme, in this format:
@plugin "daisyui/theme" {
  name: "...";
  color-scheme: light; /* or dark */
  --color-base-100: ...; --color-base-200: ...; --color-base-300: ...;
  --color-base-content: ...;
  --color-primary: ...; --color-primary-content: ...;
  /* the same pair for secondary, accent, neutral, info, success, warning, error */
  --radius-selector: ...; --radius-field: ...; --radius-box: ...;
  --size-selector: ...; --size-field: ...;
  --border: ...; --depth: 0 or 1; --noise: 0 or 1;
}
Give it a short, lowercase name that describes it (e.g. "harbor-night"),
not "my-theme". Use oklch() colors, include every variable, and make each
*-content color readable on its pair (WCAG AA).

2. A seamless tiling SVG pattern that fits the look.
Rules: one <svg> element with a viewBox (e.g. 0 0 48 48); one color (#000);
sparse, small shapes that wrap cleanly at the edges; no text, scripts, images
or links; under 2 KB.`;
