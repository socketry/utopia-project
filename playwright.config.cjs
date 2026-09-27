const {defineConfig} = require('@playwright/test');

module.exports = defineConfig({
	testDir: './test/browser',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: 2,
	use: {
		baseURL: 'http://127.0.0.1:9294/project/',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {},
	},
	projects: ['light', 'dark'].flatMap(colorScheme => [390, 1440].map(width => ({
		name: `${colorScheme}-${width}`,
		use: {browserName: 'chromium', colorScheme, viewport: {width, height: 900}},
	}))),
	webServer: {
		command: 'node test/browser/server.cjs',
		url: 'http://127.0.0.1:9294/project/index.html',
		reuseExistingServer: false,
	},
});
