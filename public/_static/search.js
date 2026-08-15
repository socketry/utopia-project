const trigger = document.querySelector('pagefind-modal-trigger');
const modal = document.querySelector('pagefind-modal');
const site = new URL('../', import.meta.url);
const pagefind = new URL('pagefind/', site);

const config = document.createElement('pagefind-config');
config.setAttribute('bundle-path', pagefind);
config.setAttribute('base-url', site.pathname);
document.head.append(config);

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
