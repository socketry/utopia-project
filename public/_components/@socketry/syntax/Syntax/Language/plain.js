import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('plain');

language.push(Rule.webLink);

// Process href types as clickable links
language.processes['href'] = function (container, match, options) {
	const anchor = document.createElement('a');
	anchor.className = container.className;
	anchor.textContent = match.value;
	anchor.href = match.value;
	return anchor;
};

export default function register(syntax) {
	syntax.register('plain', language);
	syntax.alias('plain', ['text']);
}
