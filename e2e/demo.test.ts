import { expect, test } from '@playwright/test';

test('home page shows the welcome message', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Welcome!')).toBeVisible();
	await expect(page.getByRole('button', { name: 'start' })).toBeVisible();
});
