import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('java');

const keywords = [
	'abstract',
	'continue',
	'for',
	'switch',
	'assert',
	'default',
	'goto',
	'synchronized',
	'do',
	'if',
	'break',
	'implements',
	'throw',
	'else',
	'import',
	'throws',
	'case',
	'enum',
	'return',
	'transient',
	'catch',
	'extends',
	'try',
	'final',
	'interface',
	'static',
	'class',
	'finally',
	'strictfp',
	'volatile',
	'const',
	'native',
	'super',
	'while'
];

const access = ['private', 'protected', 'public', 'package'];

const types = [
	'void',
	'byte',
	'short',
	'int',
	'long',
	'float',
	'double',
	'boolean',
	'char'
];

// Operators ordered longest-first to match correctly
const operators = [
	'>>>=',
	'<<=',
	'>>=',
	'>>>',
	'instanceof',
	'==',
	'!=',
	'<=',
	'>=',
	'<<',
	'>>',
	'&&',
	'||',
	'++',
	'--',
	'+=',
	'-=',
	'*=',
	'/=',
	'%=',
	'&=',
	'^=',
	'|=',
	'new',
	'delete',
	'<',
	'>',
	'+',
	'-',
	'~',
	'!',
	'*',
	'/',
	'%',
	'&',
	'^',
	'|',
	'?',
	'='
];

const constants = ['this', 'true', 'false', 'null'];

language.push(constants, {type: 'constant'});
language.push(types, {type: 'type'});
language.push(keywords, {type: 'keyword'});
language.push(operators, {type: 'operator'});
language.push(access, {type: 'access'});

// Camel Case Types
language.push(Rule.camelCaseType);

// Comments
language.push(Rule.cStyleComment);
language.push(Rule.cppStyleComment);
language.push(Rule.webLink);

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

language.push(Rule.cStyleFunction);

language.processes['function'] = Rule.webLinkProcess(
	'java "Developer Documentation"',
	true
);

export default function register(syntax) {
	syntax.register('java', language);
}
