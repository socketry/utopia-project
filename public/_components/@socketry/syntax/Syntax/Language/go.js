import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('go');

const keywords = [
	'break',
	'default',
	'func',
	'interface',
	'select',
	'case',
	'defer',
	'go',
	'map',
	'struct',
	'chan',
	'else',
	'goto',
	'package',
	'switch',
	'const',
	'fallthrough',
	'if',
	'range',
	'type',
	'continue',
	'for',
	'import',
	'return',
	'var'
];

const types = [
	// Specific types first (before regexes that might partially match them)
	'uintptr',
	'string',
	'byte',
	'bool',
	'rune',
	// Then regex patterns
	/u?int\d*/,
	/float\d+/,
	/complex\d+/
];

// Operators - ordered from longest to shortest to avoid partial matches
const operators = [
	'<<=',
	'>>=',
	'&^=',
	'...',
	'<-',
	'+=',
	'-=',
	'*=',
	'/=',
	'%=',
	'&=',
	'|=',
	'^=',
	'<<',
	'>>',
	'==',
	'!=',
	'<=',
	'>=',
	'&&',
	'||',
	'++',
	'--',
	':=',
	'&^',
	'+',
	'-',
	'*',
	'/',
	'%',
	'&',
	'|',
	'^',
	'<',
	'>',
	'=',
	'!',
	',',
	';',
	'.',
	':'
];

const values = ['true', 'false', 'iota', 'nil'];

const functions = [
	'append',
	'cap',
	'close',
	'complex',
	'copy',
	'imag',
	'len',
	'make',
	'new',
	'panic',
	'print',
	'println',
	'real',
	'recover'
];

language.push(values, {type: 'constant'});
language.push(types, {type: 'type'});
language.push(keywords, {type: 'keyword'});
language.push(operators, {type: 'operator'});
language.push(functions, {type: 'function'});

language.push(Rule.cStyleFunction);
language.push(Rule.camelCaseType);

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
	syntax.register('go', language);
}
