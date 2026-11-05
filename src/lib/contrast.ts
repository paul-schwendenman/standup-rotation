type Rgb = [number, number, number];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const toLinear = (channel: number) =>
	channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

function parseHex(value: string): Rgb | null {
	const hex = value.match(/^#([0-9a-f]{3,8})$/i)?.[1];
	if (!hex || hex.length === 5 || hex.length === 7) return null;

	const digits =
		hex.length <= 4 ? [...hex.slice(0, 3)].map((d) => d + d) : hex.slice(0, 6).match(/../g)!;
	return digits.map((d) => toLinear(parseInt(d, 16) / 255)) as Rgb;
}

function parseNumber(token: string, percentScale: number): number {
	if (token === 'none') return 0;
	return token.endsWith('%') ? (parseFloat(token) / 100) * percentScale : parseFloat(token);
}

// https://bottosson.github.io/posts/oklab/ — returns linear sRGB, clipped to gamut.
function parseOklch(value: string): Rgb | null {
	const parts = value
		.match(/^oklch\(\s*([^/)]*)/i)?.[1]
		.trim()
		.split(/\s+/);
	if (!parts || parts.length !== 3) return null;

	const lightness = parseNumber(parts[0], 1);
	const chroma = parseNumber(parts[1], 0.4);
	const hue = (parseNumber(parts[2].replace(/deg$/, ''), 1) * Math.PI) / 180;
	if ([lightness, chroma, hue].some(Number.isNaN)) return null;

	const a = chroma * Math.cos(hue);
	const b = chroma * Math.sin(hue);
	const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

	return [
		clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
		clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
		clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
	];
}

function luminance(value: string): number | null {
	const rgb = parseHex(value) ?? parseOklch(value);
	if (!rgb) return null;
	return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

// WCAG 2 contrast ratio, or null for color formats we don't check (rgb(), hsl(), ...).
export function contrastRatio(foreground: string, background: string): number | null {
	const fg = luminance(foreground);
	const bg = luminance(background);
	if (fg === null || bg === null) return null;
	return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
}
