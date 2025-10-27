import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('yaml');

language.push({
	pattern: /^\s*#.*$/m,
	type: 'comment',
	allow: ['href']
});

language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);

language.push({
	pattern: /(&|\*)[a-z0-9]+/i,
	type: 'constant'
});

language.push({
	pattern: /(.*?):/i,
	matches: Rule.extractMatches({type: 'keyword'})
});

language.push(Rule.webLink);

export default function register(syntax) {
	syntax.register('yaml', language);
}
