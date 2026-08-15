const trigger = document.querySelector('pagefind-modal-trigger');
const modal = document.querySelector('pagefind-modal');
const pagefind = new URL('../pagefind/', import.meta.url);

const localDevelopment = window.location.protocol === 'https:' &&
	['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

if (!localDevelopment) {
	const stylesheet = document.createElement('link');
	stylesheet.rel = 'stylesheet';
	stylesheet.href = new URL('pagefind-component-ui.css', pagefind);
	document.head.append(stylesheet);

	try {
		await import(new URL('pagefind-component-ui.js', pagefind));
		if (trigger) trigger.hidden = false;
		if (modal) modal.hidden = false;
	} catch (error) {
		stylesheet.remove();
		console.warn('Documentation search is unavailable.', error);
	}
}
