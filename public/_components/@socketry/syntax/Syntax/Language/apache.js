import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('apache');

language.push({
	pattern: /(<(\w+).*?>)/i,
	matches: Rule.extractMatches(
		{
			type: 'tag',
			allow: ['attribute', 'tag-name', 'string']
		},
		{
			type: 'tag-name',
			process: Rule.webLinkProcess(
				'http://httpd.apache.org/docs/trunk/mod/directive-dict.html#'
			)
		}
	)
});

language.push({
	pattern: /(<\/(\w+).*?>)/i,
	matches: Rule.extractMatches(
		{type: 'tag', allow: ['tag-name']},
		{type: 'tag-name'}
	)
});

language.push({
	pattern: /^\s+([A-Z][\w]+)/m,
	matches: Rule.extractMatches({
		type: 'function',
		allow: ['attribute'],
		process: Rule.webLinkProcess(
			'http://httpd.apache.org/docs/trunk/mod/directive-dict.html#'
		)
	})
});

language.push(Rule.perlStyleComment);
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);

language.push(Rule.webLink);

export default function register(syntax) {
	syntax.register('apache', language);
}
