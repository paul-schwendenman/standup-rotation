import { describe, it, expect } from 'vitest';
import {
	backgroundDecls,
	checkSvg,
	defaultBackground,
	parseBackground,
	svgUrl
} from './background';

const tile = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="1"/></svg>';

describe('checkSvg', () => {
	it('accepts a simple svg and adds the namespace', () => {
		const { svg, errors } = checkSvg(tile, 'tile');

		expect(errors).toEqual([]);
		expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
	});

	it('rejects scripts, event handlers and external links', () => {
		expect(checkSvg('<svg viewBox="0 0 1 1"><script>x()</script></svg>', 'tile').svg).toBeNull();
		expect(checkSvg('<svg viewBox="0 0 1 1" onload="x()"></svg>', 'tile').svg).toBeNull();
		expect(
			checkSvg('<svg viewBox="0 0 1 1"><image href="https://x/y.png"/></svg>', 'tile').svg
		).toBeNull();
	});

	it('allows in-document references', () => {
		const svg = '<svg viewBox="0 0 1 1"><defs><path id="a"/></defs><use href="#a"/></svg>';
		expect(checkSvg(svg, 'tile').svg).not.toBeNull();
	});

	it('requires a viewBox', () => {
		expect(checkSvg('<svg><rect/></svg>', 'tile').errors).toContain(
			'Needs a viewBox so it can scale.'
		);
	});

	it('allows bigger SVGs full screen than tiled', () => {
		const big = `<svg viewBox="0 0 1 1">${'<rect/>'.repeat(2000)}</svg>`;

		expect(checkSvg(big, 'tile').svg).toBeNull();
		expect(checkSvg(big, 'full').svg).not.toBeNull();
	});
});

describe('parseBackground', () => {
	it('accepts presets and clamps numbers', () => {
		expect(
			parseBackground(
				{ ...defaultBackground('snow'), size: 9999, strength: -5 },
				{ allowCustom: false }
			)
		).toMatchObject({
			pattern: 'snow',
			size: 160,
			strength: 2
		});
	});

	it('only accepts custom SVGs when allowed, and re-checks them', () => {
		const custom = { ...defaultBackground('dots'), pattern: 'custom', svg: tile };

		expect(parseBackground(custom, { allowCustom: false })).toBeNull();
		expect(parseBackground(custom, { allowCustom: true })?.svg).toContain('<circle');
		expect(
			parseBackground(
				{ ...custom, svg: '<svg viewBox="0 0 1 1" onload="x()"></svg>' },
				{ allowCustom: true }
			)
		).toBeNull();
	});

	it('rejects junk', () => {
		expect(parseBackground('dots', { allowCustom: true })).toBeNull();
		expect(parseBackground({ pattern: 'nope' }, { allowCustom: true })).toBeNull();
	});
});

describe('backgroundDecls', () => {
	it('keeps the SVG inside the url() even with quotes and parentheses', () => {
		const url = svgUrl('<svg viewBox="0 0 1 1"><text>") } body { display: none</text></svg>');

		expect(url.startsWith('url("data:image/svg+xml,')).toBe(true);
		expect(url.slice(5, -2)).not.toMatch(/["\\\n]/);
	});

	it('tiles patterns and covers full-screen illustrations', () => {
		expect(backgroundDecls(defaultBackground('snow'))).toContain('/ 56px 56px repeat');
		expect(backgroundDecls(defaultBackground('hills'))).toContain(
			'center bottom / cover no-repeat'
		);
	});

	it('tints with the theme color by default and fades original colors', () => {
		expect(backgroundDecls(defaultBackground('dots'))).toContain('var(--color-base-content) 8%');
		expect(backgroundDecls({ ...defaultBackground('dots'), mode: 'original' })).toContain(
			'opacity: 0.2'
		);
	});
});
