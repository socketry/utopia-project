import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('nginx');

// Directives with web links to nginx documentation
language.push({
	pattern: /((\w+).*?);/,
	matches: Rule.extractMatches(
		{type: 'directive', allow: '*'},
		{
			type: 'function',
			process: Rule.webLinkProcess('http://nginx.org/r/')
		}
	)
});

// Keywords (blocks with { )
language.push({
	pattern: /(\w+).*?{/,
	matches: Rule.extractMatches({type: 'keyword'})
});

// Variables ($var)
language.push({pattern: /(\$)[\w]+/, type: 'variable'});

// Comments and strings
language.push(Rule.perlStyleComment);
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);

// Web links
language.push(Rule.webLink);

export default function register(syntax) {
	syntax.register('nginx', language);
}
