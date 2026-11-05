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

// "Create a theme" also contains "theme", so the footer trigger needs an exact match.
const themeButton = (page: Page) => page.getByRole('button', { name: 'Theme', exact: true });
const pasteBox = (page: Page) => page.getByLabel('Paste the reply');
const themeCard = (page: Page, name: string) => page.getByRole('button', { name, exact: true });

async function openCreate(page: Page) {
	await themeButton(page).click();
	await page.getByRole('button', { name: 'Create a theme' }).click();
}

async function pasteTheme(page: Page, text: string) {
	await openCreate(page);
	await pasteBox(page).fill(text);
}

const shareWithTeam = (page: Page) =>
	page.getByRole('button', { name: 'Use this look for the team' }).click();

const backgroundMask = (page: Page) =>
	page.evaluate(() => {
		const style = getComputedStyle(document.body, '::before');
		return style.maskImage || style.webkitMaskImage;
	});

const teammateAt = async (page: Page, browser: import('@playwright/test').Browser) => {
	const teammate = await (await browser.newContext()).newPage();
	await teammate.goto(page.url());
	return teammate;
};

const smallSvg = '<svg viewBox="0 0 10 10"><rect width="2" height="2"/></svg>';

test('pasting a theme applies it, saves it, and survives a reload', async ({ page }) => {
	await page.goto('/');
	await pasteTheme(page, themeCss('harbor-night'));

	await expect(page.getByRole('status')).toContainText('Applied “harbor-night”');
	await expect(page.getByRole('status')).toContainText('Saved to your themes.');
	await expect(htmlTheme(page)).toHaveAttribute('data-theme', 'custom-harbor-night');

	await page.reload();
	await expect(htmlTheme(page)).toHaveAttribute('data-theme', 'custom-harbor-night');

	await themeButton(page).click();
	await expect(themeCard(page, 'harbor-night')).toHaveAttribute('aria-pressed', 'true');
});

test('one reply with a theme and an SVG applies both', async ({ page }) => {
	await page.goto('/');
	await pasteTheme(page, `${themeCss('harbor-night')}\n\nAnd a pattern:\n${smallSvg}`);

	await expect(page.getByRole('status')).toContainText('Background applied too.');
	await expect(htmlTheme(page)).toHaveAttribute('data-theme', 'custom-harbor-night');
	expect(await backgroundMask(page)).toContain('rect');

	await page.reload();
	expect(await backgroundMask(page)).toContain('rect');
});

test('a bad SVG in the reply is skipped but the colors still apply', async ({ page }) => {
	await page.goto('/');
	await pasteTheme(
		page,
		`${themeCss('harbor-night')}\n<svg viewBox="0 0 1 1" onload="alert(1)"></svg>`
	);

	await expect(page.getByRole('status')).toContainText('Applied “harbor-night”');
	await expect(page.getByText('Background skipped')).toBeVisible();
	await expect(page.getByText("Scripts and event handlers aren't allowed.")).toBeVisible();
	expect(await backgroundMask(page)).toBe('none');
});

test('an invalid paste lists problems and is not applied', async ({ page }) => {
	await page.goto('/');
	await pasteTheme(page, themeCss('broken').replace(/.*--color-info-content.*\n/, ''));

	await expect(page.getByRole('status')).toContainText('Not applied: 1 problem');
	await expect(page.getByRole('status')).toContainText('Missing --color-info-content');
	await expect(htmlTheme(page)).not.toHaveAttribute('data-theme', /custom-/);
});

test('editing keeps the theme; pasting the same name again reports a replace', async ({ page }) => {
	await page.goto('/');
	await pasteTheme(page, themeCss('harbor-night'));
	await expect(page.getByRole('status')).toContainText('Saved to your themes.');

	await page.reload();
	await themeButton(page).click();
	await page.getByRole('button', { name: 'Edit harbor-night' }).click();
	await expect(pasteBox(page)).toHaveValue(/harbor-night/);
	await pasteBox(page).fill(themeCss('harbor-night', 'oklch(35% 0.05 200)'));
	await expect(page.getByRole('status')).toContainText('Saved to your themes.');

	await pasteBox(page).fill('');
	await pasteBox(page).fill(themeCss('harbor-night'));
	await expect(page.getByRole('status')).toContainText(
		'Replaced your earlier “harbor-night” theme.'
	);
});

test('low contrast is a warning, not an error', async ({ page }) => {
	await page.goto('/');
	await pasteTheme(page, themeCss('murky', 'oklch(90% 0.05 200)'));

	await expect(page.getByRole('status')).toContainText('Applied “murky”');
	await expect(page.getByText('primary-content on primary is hard to read')).toBeVisible();
});

test('removing the active custom theme falls back to the default', async ({ page }) => {
	await page.goto('/');
	await pasteTheme(page, themeCss('harbor-night'));
	await expect(htmlTheme(page)).toHaveAttribute('data-theme', 'custom-harbor-night');

	await page.getByRole('button', { name: 'Done' }).click();
	await page.getByRole('button', { name: 'Remove harbor-night' }).click();

	await expect(htmlTheme(page)).toHaveAttribute('data-theme', '');
	await expect(themeCard(page, 'harbor-night')).toHaveCount(0);

	await page.reload();
	await expect(htmlTheme(page)).not.toHaveAttribute('data-theme', /custom-/);
});

test('a background works with a built-in theme, separately from it', async ({ page }) => {
	await page.goto('/');
	await themeButton(page).click();
	await page.getByRole('radio', { name: 'Snow' }).click();
	await themeCard(page, 'dark').click();

	await expect(htmlTheme(page)).toHaveAttribute('data-theme', 'dark');
	expect(await backgroundMask(page)).toContain('data:image/svg+xml');

	// Switching themes keeps the background.
	await themeCard(page, 'synthwave').click();
	expect(await backgroundMask(page)).toContain('data:image/svg+xml');

	await page.reload();
	await expect(htmlTheme(page)).toHaveAttribute('data-theme', 'synthwave');
	expect(await backgroundMask(page)).toContain('data:image/svg+xml');

	await themeButton(page).click();
	await page.getByRole('radio', { name: 'None' }).click();
	expect(await backgroundMask(page)).toBe('none');
});

test('a built-in theme and background are shared with the team', async ({ page, browser }) => {
	await page.goto('/');
	await themeButton(page).click();
	await themeCard(page, 'dracula').click();
	await page.getByRole('radio', { name: 'Snow' }).click();
	await shareWithTeam(page);

	await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
	await expect(page.getByText('dracula · Snow')).toBeVisible();
	await expect(page.getByText("This is the team's look.")).toBeVisible();

	const teammate = await teammateAt(page, browser);
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'dracula');
	await expect.poll(() => backgroundMask(teammate)).toContain('data:image/svg+xml');
});

test('a team look applies unless the viewer picked their own', async ({ page, browser }) => {
	await page.goto('/');
	await pasteTheme(page, themeCss('harbor-night'));
	await page.getByRole('button', { name: 'Done' }).click();
	await shareWithTeam(page);
	const teamLink = page.url();

	// A teammate with no picks of their own gets the team theme.
	const teammate = await (await browser.newContext()).newPage();
	await teammate.goto(teamLink);
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'team');

	// Picking a theme wins over the team theme, including after a reload.
	await themeButton(teammate).click();
	await themeCard(teammate, 'dracula').click();
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'dracula');
	await teammate.reload();
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'dracula');

	// Un-picking it goes back to the team theme.
	await themeButton(teammate).click();
	await themeCard(teammate, 'dracula').click();
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'team');

	// So does "Use the team's look", which also drops a personal background.
	await themeCard(teammate, 'dracula').click();
	await teammate.getByRole('radio', { name: 'Waves' }).click();
	await teammate.getByRole('button', { name: "Use the team's look" }).click();
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'team');
	await expect.poll(() => backgroundMask(teammate)).toBe('none');
});

test('stopping sharing removes the look from the link', async ({ page }) => {
	await page.goto('/');
	await themeButton(page).click();
	await themeCard(page, 'dracula').click();
	await shareWithTeam(page);
	const withTeam = page.url();

	await page.getByRole('button', { name: 'Stop sharing' }).click();
	await expect(page.getByRole('heading', { name: 'Team' })).toHaveCount(0);
	expect(page.url()).not.toBe(withTeam);
});

test('a team link saved before backgrounds still applies its theme', async ({ page }) => {
	await page.goto('/');
	await pasteTheme(page, themeCss('harbor-night'));
	const source = await page.evaluate(() => JSON.parse(localStorage.customThemes)[0].source);

	const { compressToEncodedURIComponent } = (await import('lz-string')).default;
	const oldSettings = {
		welcome: 'Welcome!',
		done: 'Done.',
		duration: '1:00',
		showTimer: true,
		names: [],
		theme: { source }
	};
	const fresh = await (await page.context().browser()!.newContext()).newPage();
	await fresh.goto(`/#${compressToEncodedURIComponent(JSON.stringify(oldSettings))}`);
	await expect(htmlTheme(fresh)).toHaveAttribute('data-theme', 'team');
});

async function useCustomSvg(page: Page, svg: string, layout: 'Tile' | 'Full screen') {
	await page.goto('/');
	await themeButton(page).click();
	await page.getByRole('radio', { name: 'Hills' }).click();
	await page.getByText('Adjust background').click();
	await page.getByRole('radio', { name: layout }).click();
	await page.getByText('Use your own SVG').click();
	await page.getByLabel('Pattern SVG').fill(svg);
	expect(await backgroundMask(page)).toContain('rect');
}

test('a small custom SVG is shared with the team', async ({ page, browser }) => {
	await useCustomSvg(page, smallSvg, 'Tile');
	await expect(page.getByText('Small enough to share with your team')).toBeVisible();
	await shareWithTeam(page);

	const teammate = await teammateAt(page, browser);
	await expect.poll(() => backgroundMask(teammate)).toContain('rect');
});

test('a big custom SVG stays personal', async ({ page, browser }) => {
	const big = `<svg viewBox="0 0 100 100">${'<rect x="1" y="2" width="3" height="4"/>'.repeat(80)}</svg>`;
	await useCustomSvg(page, big, 'Full screen');
	await expect(page.getByText('Too big to share with your team')).toBeVisible();
	await themeCard(page, 'dracula').click();
	await expect(page.getByText('Your background is too big to share.')).toBeVisible();
	await shareWithTeam(page);

	const teammate = await teammateAt(page, browser);
	await expect(htmlTheme(teammate)).toHaveAttribute('data-theme', 'dracula');
	await expect.poll(() => backgroundMask(teammate)).toBe('none');
});

test('an unsafe SVG is rejected', async ({ page }) => {
	await page.goto('/');
	await themeButton(page).click();
	await page.getByText('Use your own SVG').click();
	await page.getByLabel('Pattern SVG').fill('<svg viewBox="0 0 1 1" onload="alert(1)"></svg>');

	await expect(page.getByText("Scripts and event handlers aren't allowed.")).toBeVisible();
	expect(await backgroundMask(page)).toBe('none');
});

test('the theme sheet works from the keyboard', async ({ page }) => {
	await page.goto('/');

	await themeButton(page).focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('dialog', { name: 'Theme' })).toBeVisible();

	await page.getByRole('button', { name: 'Create a theme' }).press('Enter');
	await expect(page.getByLabel('Describe the look')).toBeFocused();

	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(themeButton(page)).toBeFocused();
});

test('the closed sheet does not cover the rotation buttons', async ({ page }) => {
	await page.goto('/');
	await themeButton(page).click();
	await page.keyboard.press('Escape');

	// Playwright refuses the click if another element would receive it.
	await page.getByRole('button', { name: 'shuffle' }).click({ timeout: 2000 });
});
