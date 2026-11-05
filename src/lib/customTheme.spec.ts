import { describe, it, expect } from 'vitest';
import { defaultBackground } from './background';
import {
	colorVars,
	createPrompt,
	parseLook,
	parseTeamSetting,
	parseTheme,
	themeCss,
	toSource,
	toTeamSetting
} from './customTheme';

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

const bigSvg = `<svg viewBox="0 0 1 1">${'<rect/>'.repeat(400)}</svg>`;
const custom = (svg: string) => ({ ...defaultBackground('dots'), pattern: 'custom' as const, svg });

describe('team settings', () => {
	it('shares a built-in theme by name and a custom theme by its CSS', () => {
		const { theme } = parseTheme(validTheme);

		expect(toTeamSetting('dracula', null)).toEqual({ name: 'dracula' });
		expect(toTeamSetting(theme!, null)).toEqual({ source: toSource(theme!) });
		expect(toTeamSetting(null, null)).toBeUndefined();
	});

	it('shares a background with or without a theme, but drops big custom SVGs', () => {
		expect(toTeamSetting(null, defaultBackground('snow'))?.background?.pattern).toBe('snow');
		expect(toTeamSetting('dark', custom('<svg viewBox="0 0 1 1"/>'))?.background?.pattern).toBe(
			'custom'
		);
		expect(toTeamSetting('dark', custom(bigSvg))).toEqual({ name: 'dark' });
	});

	it('reads built-in, custom and background-only looks from a link', () => {
		const { theme } = parseTheme(validTheme);

		expect(parseTeamSetting({ name: 'dracula' })).toEqual({
			builtIn: 'dracula',
			custom: null,
			background: null
		});
		expect(parseTeamSetting({ source: toSource(theme!) })?.custom?.name).toBe('standup-night');
		expect(parseTeamSetting({ background: defaultBackground('snow') })?.background?.pattern).toBe(
			'snow'
		);
	});

	it('still reads links made before built-in names and backgrounds', () => {
		const { theme } = parseTheme(validTheme);
		const look = parseTeamSetting({ source: toSource(theme!) });

		expect(look?.custom?.name).toBe('standup-night');
		expect(look?.builtIn).toBeNull();
	});

	it('drops an oversized custom SVG or an unknown theme name from a link', () => {
		const { theme } = parseTheme(validTheme);

		const parsed = parseTeamSetting({ source: toSource(theme!), background: custom(bigSvg) });
		expect(parsed?.custom?.name).toBe('standup-night');
		expect(parsed?.background).toBeNull();

		// @ts-expect-error: links can hold anything
		expect(parseTeamSetting({ name: 'not-a-theme' })).toBeNull();
	});
});

describe('background layer', () => {
	it('applies to every theme rather than one theme id', () => {
		const { theme } = parseTheme(validTheme);

		expect(themeCss([theme!])).not.toContain('body::before');
		const css = themeCss([theme!], null, defaultBackground('snow'));
		expect(css).toContain('\nbody::before {');
		expect(css).not.toContain('custom-standup-night"] body::before');
	});
});

describe('parseLook', () => {
	it('splits one reply into a theme and a background', () => {
		const reply = `${validTheme}\n\nAnd the pattern:\n<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="3"/></svg>`;
		const { result, background } = parseLook(reply);

		expect(result.theme?.name).toBe('standup-night');
		expect(result.warnings.filter((w) => w.includes('ignored'))).toEqual([]);
		expect(background?.svg).toContain('<circle');
	});

	it('reads a reply that is only an SVG as a background, not a broken theme', () => {
		const { result, background } = parseLook('Here:\n<svg viewBox="0 0 48 48"><rect/></svg>');

		expect(result).toEqual({ theme: null, errors: [], warnings: [] });
		expect(background?.svg).toContain('<rect');
	});

	it('checks the SVG against the chosen layout', () => {
		const big = `<svg viewBox="0 0 1 1">${'<rect x="1" y="2" width="3" height="4"/>'.repeat(300)}</svg>`;

		expect(parseLook(big, 'tile').background?.svg).toBeNull();
		expect(parseLook(big, 'full').background?.svg).toContain('<rect');
	});

	it('has no background when the reply is only a theme', () => {
		expect(parseLook(validTheme).background).toBeNull();
	});

	it('keeps the theme when the SVG is rejected', () => {
		const { result, background } = parseLook(
			`${validTheme}\n<svg viewBox="0 0 1 1" onload="alert(1)"></svg>`
		);

		expect(result.theme).not.toBeNull();
		expect(background?.svg).toBeNull();
		expect(background?.errors).toContain("Scripts and event handlers aren't allowed.");
	});
});

describe('createPrompt', () => {
	it('asks for what is being made, with the description filled in', () => {
		const both = createPrompt('both', 'tile', 'snowy cabin');
		expect(both).toContain('The look I want: snowy cabin.');
		expect(both).toContain('@plugin "daisyui/theme"');
		expect(both).toContain('seamless tiling SVG');

		const theme = createPrompt('theme', 'tile', '');
		expect(theme).toContain('@plugin "daisyui/theme"');
		expect(theme).not.toContain('<svg>');
		expect(theme).toContain('[describe it');

		const illustration = createPrompt('background', 'full', 'hills');
		expect(illustration).not.toContain('@plugin');
		expect(illustration).toContain('viewBox="0 0 1600 900"');
	});
});
