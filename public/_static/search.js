const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = '/pagefind/pagefind-component-ui.css';
document.head.append(stylesheet);

await import('/pagefind/pagefind-component-ui.js');
