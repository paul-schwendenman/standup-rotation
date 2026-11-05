import { expect, test } from '@playwright/test';

test('settings open in a sheet that previews changes on the page', async ({ page }) => {
	await page.goto('/');
	const settingsButton = page.getByRole('button', { name: 'Settings' });
	await settingsButton.click();

	const sheet = page.getByRole('dialog', { name: 'Settings' });
	await expect(sheet).toBeVisible();
	await expect(sheet).toContainText('Update the meeting invite so the team gets them.');

	// The page beside the sheet updates as you type.
	await page.getByPlaceholder('Message shown at beginning').fill('Morning, team');
	await expect(page.getByRole('main')).toContainText('Morning, team');

	await page.keyboard.press('Escape');
	await expect(sheet).toHaveCount(0);
	await expect(settingsButton).toBeFocused();

	// The link carries the change.
	await page.reload();
	await expect(page.getByRole('main')).toContainText('Morning, team');
});

test('copy link copies the current page link', async ({ page, context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/');
	await page.getByRole('button', { name: 'Settings' }).click();
	await page.getByPlaceholder('Message shown at beginning').fill('Morning, team');

	await page.getByRole('button', { name: 'Copy link' }).click();
	await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
});

test('only one sheet is open at a time', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Settings' }).click();
	await page.getByRole('button', { name: 'Theme', exact: true }).click();

	await expect(page.getByRole('dialog', { name: 'Theme' })).toBeVisible();
	await expect(page.getByRole('dialog', { name: 'Settings' })).toHaveCount(0);

	await page.getByRole('button', { name: 'Settings' }).click();
	await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
	await expect(page.getByRole('dialog', { name: 'Theme' })).toHaveCount(0);
});

test('settings close and lock while a rotation runs', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Settings' }).click();
	await page.getByPlaceholder('name').fill('Ada');
	await page.getByRole('button', { name: 'Add' }).click();
	await page.getByRole('button', { name: 'start' }).click();

	await expect(page.getByRole('dialog', { name: 'Settings' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Settings' })).toBeDisabled();
});

test('clicking the page closes a sheet and the click still goes through', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Settings' }).click();
	await page.getByPlaceholder('name').fill('Ada');
	await page.getByRole('button', { name: 'Add' }).click();

	await page.getByRole('button', { name: 'start' }).click();
	await expect(page.getByRole('dialog', { name: 'Settings' })).toHaveCount(0);
	await expect(page.getByRole('main')).toContainText('Ada');
	await expect(page.getByRole('button', { name: 'next' })).toBeVisible();
});

test('the footer buttons toggle their sheet rather than close-and-reopen it', async ({ page }) => {
	await page.goto('/');
	const theme = page.getByRole('button', { name: 'Theme', exact: true });

	await theme.click();
	await expect(page.getByRole('dialog', { name: 'Theme' })).toBeVisible();
	await theme.click();
	await expect(page.getByRole('dialog', { name: 'Theme' })).toHaveCount(0);
});
