export type Layout = 'tile' | 'full';
export type Position = 'top' | 'center' | 'bottom';
export type Mode = 'tint' | 'original';

export const presetIds = ['dots', 'grid', 'waves', 'snow', 'hills'] as const;
export type PresetId = (typeof presetIds)[number];

export interface ThemeBackground {
	pattern: PresetId | 'custom';
	// Only for pattern 'custom'. Custom SVGs stay in this browser and are never shared in team links.
	svg?: string;
	layout: Layout;
	size: number;
	position: Position;
	strength: number;
	mode: Mode;
}

const XMLNS = 'xmlns="http://www.w3.org/2000/svg"';

export const presets: Record<PresetId, { label: string; layout: Layout; svg: string }> = {
	dots: {
		label: 'Dots',
		layout: 'tile',
		svg: `<svg ${XMLNS} viewBox="0 0 20 20"><circle cx="10" cy="10" r="2.2"/></svg>`
	},
	grid: {
		label: 'Grid',
		layout: 'tile',
		svg: `<svg ${XMLNS} viewBox="0 0 24 24"><path d="M0 0h24v1.2H0zM0 0h1.2v24H0z"/></svg>`
	},
	waves: {
		label: 'Waves',
		layout: 'tile',
		svg: `<svg ${XMLNS} viewBox="0 0 40 20"><path d="M0 10 Q10 2 20 10 T40 10" fill="none" stroke="#000" stroke-width="2"/></svg>`
	},
	snow: {
		label: 'Snow',
		layout: 'tile',
		svg: `<svg ${XMLNS} viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14M7 7l10 10M17 7 7 17"/><path d="M36 29v10M31 34h10M32.5 30.5l7 7M39.5 30.5l-7 7"/></g></svg>`
	},
	hills: {
		label: 'Hills',
		layout: 'full',
		svg: `<svg ${XMLNS} viewBox="0 0 1600 900"><path fill-opacity=".45" d="M0 610 C260 520 520 540 760 600 S1250 520 1600 560 V900 H0Z"/><path d="M0 720 C300 640 600 700 900 690 S1350 620 1600 680 V900 H0Z"/><circle cx="1260" cy="170" r="60" fill-opacity=".6"/><g fill-opacity=".5"><circle cx="180" cy="120" r="4"/><circle cx="420" cy="260" r="3"/><circle cx="640" cy="90" r="5"/><circle cx="880" cy="220" r="3"/><circle cx="1040" cy="80" r="4"/><circle cx="1450" cy="320" r="3"/><circle cx="300" cy="380" r="3"/><circle cx="760" cy="400" r="4"/><circle cx="1120" cy="380" r="3"/></g></svg>`
	}
};

export const SIZE = { min: 16, max: 160, default: 56 };
export const STRENGTH = { min: 2, max: 40, default: 8 };
const MAX_KB: Record<Layout, number> = { tile: 8, full: 32 };

export const defaultBackground = (pattern: PresetId): ThemeBackground => ({
	pattern,
	layout: presets[pattern].layout,
	size: SIZE.default,
	position: 'bottom',
	strength: STRENGTH.default,
	mode: 'tint'
});

export function checkSvg(text: string, layout: Layout): { svg: string | null; errors: string[] } {
	const svg = text.trim();
	const errors: string[] = [];

	if (!/^<svg[\s>]/i.test(svg) || !/<\/svg>$/i.test(svg)) {
		errors.push('Paste a single <svg>…</svg> element.');
	}
	if (!/\sviewBox\s*=/.test(svg)) errors.push('Needs a viewBox so it can scale.');
	if (/<script|<foreignObject|\son[a-z]+\s*=/i.test(svg)) {
		errors.push("Scripts and event handlers aren't allowed.");
	}
	if (/(href|src)\s*=\s*["'](?!#)/i.test(svg)) {
		errors.push("Links to other files aren't allowed; draw the shapes inline.");
	}
	if (svg.length > MAX_KB[layout] * 1024) {
		errors.push(`Too big: ${Math.ceil(svg.length / 1024)} KB (max ${MAX_KB[layout]} KB).`);
	}

	if (errors.length > 0) return { svg: null, errors };
	return { svg: /\sxmlns=/.test(svg) ? svg : svg.replace(/^<svg/i, `<svg ${XMLNS}`), errors };
}

const clamp = (value: unknown, { min, max, default: fallback }: typeof SIZE) =>
	typeof value === 'number' && Number.isFinite(value)
		? Math.min(max, Math.max(min, Math.round(value)))
		: fallback;

const oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T =>
	options.includes(value as T) ? (value as T) : fallback;

// Validates a background read from localStorage or a link; anything unexpected becomes null.
export function parseBackground(
	value: unknown,
	{ allowCustom }: { allowCustom: boolean }
): ThemeBackground | null {
	if (!value || typeof value !== 'object') return null;
	const raw = value as Record<string, unknown>;

	const isPreset = presetIds.includes(raw.pattern as PresetId);
	if (!isPreset && !(allowCustom && raw.pattern === 'custom')) return null;

	const layout = oneOf(raw.layout, ['tile', 'full'] as const, 'tile');
	const background: ThemeBackground = {
		pattern: raw.pattern as ThemeBackground['pattern'],
		layout,
		size: clamp(raw.size, SIZE),
		position: oneOf(raw.position, ['top', 'center', 'bottom'] as const, 'bottom'),
		strength: clamp(raw.strength, STRENGTH),
		mode: oneOf(raw.mode, ['tint', 'original'] as const, 'tint')
	};

	if (background.pattern === 'custom') {
		const { svg } = checkSvg(typeof raw.svg === 'string' ? raw.svg : '', layout);
		if (!svg) return null;
		background.svg = svg;
	}

	return background;
}

export const backgroundSvg = (background: ThemeBackground) =>
	background.pattern === 'custom' ? (background.svg ?? '') : presets[background.pattern].svg;

// encodeURIComponent escapes quotes, backslashes and newlines, so the value can't break out of url("…").
export const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

export function backgroundDecls(background: ThemeBackground): string {
	const url = svgUrl(backgroundSvg(background));
	const full = background.layout === 'full';
	const size = full ? 'cover' : `${background.size}px ${background.size}px`;
	const repeat = full ? 'no-repeat' : 'repeat';
	const position = full ? `center ${background.position}` : '0 0';
	const layer = `content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;`;

	if (background.mode === 'original') {
		return `${layer} background: ${url} ${position} / ${size} ${repeat}; opacity: ${background.strength / STRENGTH.max};`;
	}

	return [
		layer,
		`background: color-mix(in oklab, var(--color-base-content) ${background.strength}%, transparent);`,
		`-webkit-mask: ${url} ${position} / ${size} ${repeat};`,
		`mask: ${url} ${position} / ${size} ${repeat};`
	].join(' ');
}

export const tilePrompt = `Make a seamless tiling SVG pattern of [snowflakes].
Rules: one <svg> element with a viewBox (e.g. 0 0 48 48); one color (#000);
shapes that wrap cleanly at the edges; no text, scripts, images or links; under 2 KB.
Reply with ONLY the SVG.`;

export const fullPrompt = `Make a full-screen background illustration as an SVG of [snowy hills under a night sky].
Rules: one <svg> element with viewBox="0 0 1600 900"; keep the main shapes near the
[bottom] edge and leave the middle calm so text stays readable; one color (#000),
using fill-opacity for lighter areas; no text, scripts, images or links; under 16 KB.
Reply with ONLY the SVG.`;
