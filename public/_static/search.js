const trigger = document.querySelector('pagefind-modal-trigger');
const modal = document.querySelector('pagefind-modal');

const localDevelopment = window.location.protocol === 'https:' &&
	['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

if (!localDevelopment) {
	const stylesheet = document.createElement('link');
	stylesheet.rel = 'stylesheet';
	stylesheet.href = '/pagefind/pagefind-component-ui.css';
	document.head.append(stylesheet);

	try {
		await import('/pagefind/pagefind-component-ui.js');
		if (trigger) trigger.hidden = false;
		if (modal) modal.hidden = false;
	} catch (error) {
		stylesheet.remove();
		console.warn('Documentation search is unavailable.', error);
	}
}
