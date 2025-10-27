import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('php');

language.push({
	pattern: /(<\?(php)?)([\s\S]*?)(\?>)/m,
	matches: Rule.extractMatches(
		{type: 'keyword'},
		null,
		{language: 'php-script'},
		{type: 'keyword'}
	)
});

export default function register(syntax) {
	syntax.register('php', language);
}
