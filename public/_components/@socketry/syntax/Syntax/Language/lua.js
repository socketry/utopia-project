import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('lua');

const keywords = [
	'and',
	'break',
	'do',
	'else',
	'elseif',
	'end',
	'false',
	'for',
	'function',
	'if',
	'in',
	'local',
	'nil',
	'not',
	'or',
	'repeat',
	'return',
	'then',
	'true',
	'until',
	'while'
];

// Operators ordered longest-first
const operators = [
	'==',
	'~=',
	'<=',
	'>=',
	'..',
	'+',
	'-',
	'*',
	'/',
	'%',
	'^',
	'#',
	'=',
	'<',
	'>',
	'?',
	':'
];

const values = ['self', 'true', 'false', 'nil'];

language.push(values, {type: 'constant'});
language.push(keywords, {type: 'keyword'});
language.push(operators, {type: 'operator'});

// CamelCase types
language.push(Rule.camelCaseType);
language.push(Rule.cStyleFunction);

// Single-line comments
language.push({
	pattern: /\-\-.*$/m,
	type: 'comment',
	allow: ['href']
});

// Multi-line comments
language.push({
	pattern: /\-\-\[\[(\n|.)*?\]\]\-\-/m,
	type: 'comment',
	allow: ['href']
});

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

language.push(Rule.hexNumber);
language.push(Rule.decimalNumber);

language.push(Rule.webLink);

export default function register(syntax) {
	syntax.register('lua', language);
}
