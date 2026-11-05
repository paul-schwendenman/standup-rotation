import { expect, test, type Page } from '@playwright/test';

const colors = [
	'base-100',
	'base-200',
	'base-300',
	'primary',
	'secondary',
	'accent',
	'neutral',
	'info',
	'success',
	'warning',
	'error'
];

const themeCss = (name: string, primary = 'oklch(30% 0.05 200)') => `Here you go:

@plugin "daisyui/theme" {
  name: "${name}";
  color-scheme: dark;
  --color-base-content: oklch(98% 0.01 200);
${colors
	.map((color) => {
		const bg = color === 'primary' ? primary : 'oklch(30% 0.05 200)';
		const content = color.startsWith('base')
			? ''
			: `  --color-${color}-content: oklch(98% 0.01 200);\n`;
		return `  --color-${color}: ${bg};\n${content}`;
	})
	.join('')}
}`;

const htmlTheme = (page: Page) => page.locator('html');

async function openCreate(page: Page) {
	await page.getByRole('button', { name: 'Theme' }).click();
	await page.getByRole('tab', { name: 'Create' }).click();
}

test('pasting a theme applies it, saves it, and survives a reload', async ({ page }) => {
	await page.goto('/');
	await openCreate(page);

	await page.getByLabel('Theme CSS').fill(themeCss('harbor-night'));

	await expect(page.getByRole('status')).toContainText('Applied “harbor-night”');
	await expect(page.getByRole('status')).toContainText('Saved to your themes.');
	await expect(htmlTheme(page)).toHaveAttribute('data-theme', 'custom-harbor-night');

	await page.reload();
	await expect(htmlTheme(page)).toHaveAttribute('data-theme', 'custom-harbor-night');

	await page.getByRole('button', { name: 'Theme' }).click();
	await expect(page.getByRole('button', { name: 'harbor-night', pressed: true })).toBeVisible();
});

test('an invalid paste lists problems and is not applied', async ({ page }) => {
	await page.goto('/');
	await openCreate(page);

	await page
		.getByLabel('Theme CSS')
		.fill(themeCss('broken').replace(/.*--color-info-content.*\n/, ''));

	await expect(page.getByRole('status')).toContainText('Not applied: 1 problem');
	await expect(page.getByRole('status')).toContainText('Missing --color-info-content');
	await expect(htmlTheme(page)).not.toHaveAttribute('data-theme', /custom-/);
});

test('editing keeps the theme; pasting the same name again reports a replace', async ({ page }) => {
	await page.goto('/');
	await openCreate(page);
	await page.getByLabel('Theme CSS').fill(themeCss('harbor-night'));
	await expect(page.getByRole('status')).toContainText('Saved to your themes.');

	await page.reload();
	await page.getByRole('button', { name: 'Theme' }).click();
	await page.getByRole('button', { name: 'Edit harbor-night' }).click();
	await expect(page.getByLabel('Theme CSS')).toHaveValue(/harbor-night/);
	await page.getByLabel('Theme CSS').fill(themeCss('harbor-night', 'oklch(35% 0.05 200)'));
	await expect(page.getByRole('status')).toContainText('Saved to your themes.');

	await page.getByLabel('Theme CSS').fill('');
	await page.getByLabel('Theme CSS').fill(themeCss('harbor-night'));
	await expect(page.getByRole('status')).toContainText(
		'Replaced your earlier “harbor-night” theme.'
	);
});

test('low contrast is a warning, not an error', async ({ page }) => {
	await page.goto('/');
	await openCreate(page);

	await page.getByLabel('Theme CSS').fill(themeCss('murky', 'oklch(90% 0.05 200)'));

	await expect(page.getByRole('status')).toContainText('Applied “murky”');
	await expect(page.getByText('primary-content on primary is hard to read')).toBeVisible();
});

test('removing the active custom theme falls back to the default', async ({ page }) => {
	await page.goto('/');
	await openCreate(page);
	await page.getByLabel('Theme CSS').fill(themeCss('harbor-night'));
	await expect(htmlTheme(page)).toHaveAttribute('data-theme', 'custom-harbor-night');

	await page.getByRole('tab', { name: 'Themes' }).click();
	await page.getByRole('button', { name: 'Remove harbor-night' }).click();

	await expect(htmlTheme(page)).toHaveAttribute('data-theme', '');
	await expect(page.getByRole('heading', { name: 'Custom' })).toHaveCount(0);

	await page.reload();
	await expect(htmlTheme(page)).not.toHaveAttribute('data-theme', /custom-/);
});

test('a team theme in the link applies unless the viewer picked their own', async ({
	page,
	browser
}) => {
	await page.goto('/');
	await openCreate(page);
	await page.getByLabel('Theme CSS').fill(themeCss('harbor-night'));
	await page.getByRole('tab', { name: 'Themes' }).click();
	await page.getByRole('button', { name: 'Use harbor-night for this team' }).click();
	await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
	const teamLink = page.url();

	// A teammate with no theme of their own gets the team theme.
	const teammate = await (await browser.newContext()).newPage();
	await teammate.goto(teamLink);
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'team');

	// Picking a theme wins over the team theme, including after a reload.
	await teammate.getByRole('button', { name: 'Theme' }).click();
	await teammate.getByRole('button', { name: 'dracula' }).click();
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'dracula');
	await teammate.reload();
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'dracula');

	// Un-picking it goes back to the team theme.
	await teammate.getByRole('button', { name: 'Theme' }).click();
	await teammate.getByRole('button', { name: 'dracula' }).click();
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'team');
});

test('stopping the team theme removes it from the link', async ({ page }) => {
	await page.goto('/');
	await openCreate(page);
	await page.getByLabel('Theme CSS').fill(themeCss('harbor-night'));
	await page.getByRole('tab', { name: 'Themes' }).click();
	await page.getByRole('button', { name: 'Use harbor-night for this team' }).click();
	const withTeam = page.url();

	await page.getByRole('button', { name: 'Stop using harbor-night for this team' }).click();
	await expect(page.getByRole('heading', { name: 'Team' })).toHaveCount(0);
	expect(page.url()).not.toBe(withTeam);
});

const backgroundMask = (page: Page) =>
	page.evaluate(() => {
		const style = getComputedStyle(document.body, '::before');
		return style.maskImage || style.webkitMaskImage;
	});

test('a preset background applies, survives a reload, and is shared with the team', async ({
	page,
	browser
}) => {
	await page.goto('/');
	await openCreate(page);
	await page.getByLabel('Theme CSS').fill(themeCss('harbor-night'));
	await page.getByRole('radio', { name: 'Snow' }).click();
	expect(await backgroundMask(page)).toContain('data:image/svg+xml');

	await page.reload();
	expect(await backgroundMask(page)).toContain('data:image/svg+xml');

	await page.getByRole('button', { name: 'Theme' }).click();
	await page.getByRole('button', { name: 'Use harbor-night for this team' }).click();

	const teammate = await (await browser.newContext()).newPage();
	await teammate.goto(page.url());
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'team');
	expect(await backgroundMask(teammate)).toContain('data:image/svg+xml');
});

test('a custom SVG background stays personal', async ({ page, browser }) => {
	await page.goto('/');
	await openCreate(page);
	await page.getByLabel('Theme CSS').fill(themeCss('harbor-night'));
	await page.getByText('Use your own SVG').click();
	await page
		.getByLabel('Pattern SVG')
		.fill('<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="2"/></svg>');
	expect(await backgroundMask(page)).toContain('circle');

	await page.getByRole('tab', { name: 'Themes' }).click();
	await page.getByRole('button', { name: 'Use harbor-night for this team' }).click();
	await expect(page.getByText("Custom backgrounds aren't shared.")).toBeVisible();

	const teammate = await (await browser.newContext()).newPage();
	await teammate.goto(page.url());
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'team');
	expect(await backgroundMask(teammate)).toBe('none');
});

test('an unsafe SVG is rejected', async ({ page }) => {
	await page.goto('/');
	await openCreate(page);
	await page.getByLabel('Theme CSS').fill(themeCss('harbor-night'));
	await page.getByText('Use your own SVG').click();
	await page.getByLabel('Pattern SVG').fill('<svg viewBox="0 0 1 1" onload="alert(1)"></svg>');

	await expect(page.getByText("Scripts and event handlers aren't allowed.")).toBeVisible();
	expect(await backgroundMask(page)).toBe('none');
});
