import { describe, it, expect } from 'vitest';
import { contrastRatio } from './contrast';

describe('contrastRatio', () => {
	it('is 21 for black on white', () => {
		expect(contrastRatio('#000', '#ffffff')).toBeCloseTo(21, 1);
	});

	it('is 1 for identical colors', () => {
		expect(contrastRatio('oklch(50% 0.1 200)', 'oklch(50% 0.1 200)')).toBeCloseTo(1, 5);
	});

	it('matches hex and oklch for the same color', () => {
		// oklch(62.8% 0.2577 29.23) is sRGB red
		expect(contrastRatio('oklch(62.8% 0.2577 29.23)', '#fff')).toBeCloseTo(
			contrastRatio('#ff0000', '#fff')!,
			1
		);
	});

	it('accepts unitless lightness, deg hues and alpha', () => {
		expect(contrastRatio('oklch(0.628 0.2577 29.23deg / 50%)', '#fff')).toBeCloseTo(
			contrastRatio('#ff0000', '#fff')!,
			1
		);
	});

	it('returns null for formats it does not check', () => {
		expect(contrastRatio('rgb(0 0 0)', '#fff')).toBeNull();
		expect(contrastRatio('hsl(0 0% 0%)', '#fff')).toBeNull();
	});
});
