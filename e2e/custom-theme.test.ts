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
