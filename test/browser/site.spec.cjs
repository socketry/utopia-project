const {test, expect} = require('@playwright/test');
const guide = 'guides/getting-started/index.html';

test('renders diagrams, highlighted code and local links under a project subpath', async ({page, request}) => {
	const errors = [];
	page.on('pageerror', error => errors.push(error.message));
	await page.goto(guide);
	await expect(page.locator('.mermaid svg')).toBeVisible();
	await expect(page.locator('syntax-code')).not.toHaveCount(0);
	await expect(page.locator('#configuration-2')).toHaveCount(1);
	const links = await page.locator('a[href]').evaluateAll(links => links.map(link => link.href).filter(href => href.startsWith(location.origin)));
	for (const href of new Set(links)) {
		expect(new URL(href).pathname).toMatch(/^\/project\//);
		expect((await request.get(href)).ok(), href).toBeTruthy();
	}
	expect(errors).toEqual([]);
});

test('preserves deep links and tracks sidebar navigation', async ({page}, testInfo) => {
	await page.goto(guide + '#configuration-2');
	await expect(page.locator('a.self')).not.toHaveCount(0);
	await expect(page).toHaveURL(/#configuration-2$/);
	if (testInfo.project.use.viewport.width < 1024) {
		await expect(page.locator('.sidebar')).toBeHidden();
		return;
	}
	const link = page.locator('.sidebar a[href$="#configuration"]');
	await link.click();
	await expect(link).toBeFocused();
	await expect(link).toHaveClass(/active/);
	await expect(page).toHaveURL(/#configuration$/);
	await page.locator('#deployment').evaluate(element => element.scrollIntoView());
	await expect(page.locator('.sidebar a[href$="#deployment"]')).toHaveClass(/active/);
	await expect(page).toHaveURL(/#deployment$/);
});

test('contains wide tables and scales spacing with table text', async ({page}) => {
	await page.goto(guide);
	const table = page.locator('table');
	const padding = [];
	for (const size of ['80%', '125%']) {
		padding.push(await table.evaluate((table, size) => {
			table.style.fontSize = size;
			const style = getComputedStyle(table.querySelector('td'));
			return {font: parseFloat(style.fontSize), top: parseFloat(style.paddingTop), left: parseFloat(style.paddingLeft)};
		}, size));
	}
	expect(padding[1].top / padding[0].top).toBeCloseTo(padding[1].font / padding[0].font);
	expect(padding[1].left / padding[0].left).toBeCloseTo(padding[1].font / padding[0].font);
	const backgrounds = await table.locator('tbody tr').first().locator('td').evaluateAll(cells => cells.map(cell => getComputedStyle(cell).backgroundColor));
	expect(backgrounds[1]).not.toEqual(backgrounds[0]);
	expect(backgrounds[2]).toEqual(backgrounds[0]);
	await table.locator('td').first().evaluate(cell => cell.textContent = 'LONG_CONFIGURATION_NAME_'.repeat(30));
	const scrolling = await table.evaluate(table => {
		table.scrollLeft = 100;
		return {offset: table.scrollLeft, pageWidth: document.documentElement.scrollWidth, viewport: innerWidth};
	});
	expect(scrolling.offset).toBe(100);
	expect(scrolling.pageWidth).toBe(scrolling.viewport);
});

test('opens example disclosures with the keyboard without shifting their summaries', async ({page}) => {
	await page.goto('reference/Example/Client/index.html');
	const details = page.locator('details').first();
	await details.evaluate(element => element.style.fontSize = '125%');
	const summary = details.locator('summary');
	await summary.focus();
	const before = await summary.boundingBox();
	await summary.press('Enter');
	await expect(details).toHaveAttribute('open', '');
	await expect(details.locator('pre')).toBeVisible();
	const after = await summary.boundingBox();
	expect(after.x).toBeCloseTo(before.x);
	expect(after.width).toBeCloseTo(before.width);
	await summary.press('Space');
	await expect(details).not.toHaveAttribute('open');
});

test('hides unavailable search without breaking navigation', async ({page}) => {
	await page.route('**/pagefind-component-ui.js', route => route.abort());
	const unavailable = page.waitForEvent('console', message => message.text().includes('Documentation search is unavailable.'));
	await page.goto(guide);
	await unavailable;
	await expect(page.locator('a.self')).not.toHaveCount(0);
	await expect(page.locator('pagefind-modal-trigger')).toBeHidden();
	await page.locator('.section-links a').filter({hasText: 'Reference'}).click();
	await expect(page).toHaveURL(/reference\/index.html$/);
});

test('searches the generated index and follows results under the project subpath', async ({page}) => {
	const errors = [];
	page.on('pageerror', error => errors.push(error.message));
	await page.goto('index.html');
	const trigger = page.locator('pagefind-modal-trigger button');
	await trigger.click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	const input = dialog.locator('input');
	await expect(input).toBeFocused();
	await input.fill('preview');
	const result = dialog.locator('pagefind-results a[href*="/guides/getting-started/"]').first();
	await expect(result).toBeVisible();
	await expect(result).toHaveAttribute('href', /^\/project\/guides\/getting-started\//);
	await result.click();
	await expect(page).toHaveURL(/\/project\/guides\/getting-started\/(?:index\.html)?(?:#.*)?$/);
	await expect(page.locator('h1')).toHaveText('Getting Started');
	await page.locator('pagefind-modal-trigger button').click();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).toBeHidden();
	await expect(page.locator('pagefind-modal-trigger button')).toBeFocused();
	expect(errors).toEqual([]);
});
