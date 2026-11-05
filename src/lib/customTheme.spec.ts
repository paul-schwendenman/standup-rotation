import { describe, it, expect } from 'vitest';
import { colorVars, parseTheme, themeCss, toSource } from './customTheme';

const validTheme = `Sure! Here is your theme:

@plugin "daisyui/theme" {
  name: "Standup Night";
  color-scheme: dark;
${colorVars
	.map(
		(key) =>
			`  ${key}: ${key.endsWith('-content') ? 'oklch(98% 0.01 200)' : 'oklch(30% 0.05 200)'};`
	)
	.join('\n')}
  --radius-box: 1rem;
  --border: 1px;
  --depth: 1;
}`;

describe('parseTheme', () => {
	it('parses a complete theme and ignores surrounding text', () => {
		const { theme, errors } = parseTheme(validTheme);

		expect(errors).toEqual([]);
		expect(theme?.name).toBe('standup-night');
		expect(theme?.colorScheme).toBe('dark');
		expect(theme?.vars['--color-primary']).toBe('oklch(30% 0.05 200)');
		expect(theme?.vars['--radius-box']).toBe('1rem');
	});

	it('returns nothing for empty input', () => {
		expect(parseTheme('   ')).toEqual({ theme: null, errors: [], warnings: [] });
	});

	it('reports missing colors', () => {
		const { theme, errors } = parseTheme(validTheme.replace(/.*--color-info-content.*\n/, ''));

		expect(theme).toBeNull();
		expect(errors).toEqual(['Missing --color-info-content']);
	});

	it('rejects values that are not colors or lengths', () => {
		const { theme, errors } = parseTheme(
			validTheme
				.replace('--color-accent: oklch(30% 0.05 200)', '--color-accent: red} body{display:none')
				.replace('--border: 1px', '--border: thick')
		);

		expect(theme).toBeNull();
		expect(errors).toHaveLength(2);
	});

	it('warns about unknown variables', () => {
		const { theme, warnings } = parseTheme(
			validTheme.replace('--depth: 1;', '--depth: 1;\n--color-highlight: #fff;')
		);

		expect(theme).not.toBeNull();
		expect(warnings).toContain("--color-highlight isn't a daisyUI theme variable and was ignored.");
	});

	it('has no contrast warnings for a readable theme', () => {
		expect(parseTheme(validTheme).warnings).toEqual([]);
	});

	it('warns about hard-to-read color pairs but still applies the theme', () => {
		const { theme, warnings } = parseTheme(
			validTheme.replace(
				'--color-primary-content: oklch(98% 0.01 200)',
				'--color-primary-content: oklch(40% 0.05 200)'
			)
		);

		expect(theme).not.toBeNull();
		expect(warnings).toHaveLength(1);
		expect(warnings[0]).toMatch(
			/^primary-content on primary is hard to read: 1\.\d:1 \(needs 4\.5:1\)\.$/
		);
	});

	it('defaults to light when color-scheme is missing', () => {
		const { theme, warnings } = parseTheme(validTheme.replace('color-scheme: dark;', ''));

		expect(theme?.colorScheme).toBe('light');
		expect(warnings).toContain('No color-scheme set; assuming light.');
	});
});

describe('themeCss', () => {
	it('scopes variables to the custom theme id', () => {
		const { theme } = parseTheme(validTheme);
		const css = themeCss([theme!]);

		expect(css).toContain(':root[data-theme="custom-standup-night"]');
		expect(css).toContain('color-scheme: dark;');
		expect(css).toContain('--color-primary: oklch(30% 0.05 200);');
	});

	it('adds the team theme under its own id', () => {
		const { theme } = parseTheme(validTheme);
		const css = themeCss([], theme);

		expect(css).toContain(':root[data-theme="team"]');
		expect(css).not.toContain('custom-');
	});
});

describe('toSource', () => {
	it('round-trips through parseTheme without the surrounding chatter', () => {
		const { theme } = parseTheme(validTheme);
		const source = toSource(theme!);

		expect(source).not.toContain('Sure!');
		expect(parseTheme(source).theme).toEqual({ ...theme, source });
	});
});
