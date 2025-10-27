import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('io');

language.push(Rule.cStyleFunction);

const keywords = ['return'];

// Operators ordered longest-first
const operators = [
	'::=',
	':=',
	'or',
	'and',
	'new',
	'delete',
	'@',
	'+',
	'*',
	'/',
	'-',
	'&',
	'|',
	'~',
	'!',
	'%',
	'<',
	'=',
	'>',
	'[',
	']'
];

language.push(keywords, {type: 'keyword'});
language.push(operators, {type: 'operator'});

// Extract space delimited method invocations
language.push({
	pattern: /\b([ \t]+([a-z]+))/i,
	matches: Rule.extractMatches({index: 2, type: 'function'})
});

language.push({
	pattern: /\)([ \t]+([a-z]+))/i,
	matches: Rule.extractMatches({index: 2, type: 'function'})
});

// CamelCase types
language.push(Rule.camelCaseType);

language.push(Rule.perlStyleComment);
language.push(Rule.cStyleComment);
language.push(Rule.cppStyleComment);
language.push(Rule.webLink);

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

export default function register(syntax) {
	syntax.register('io', language);
}
