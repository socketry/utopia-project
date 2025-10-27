import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('swift');

const keywords = [
	'associatedtype',
	'class',
	'deinit',
	'enum',
	'extension',
	'fileprivate',
	'func',
	'import',
	'init',
	'inout',
	'internal',
	'let',
	'operator',
	'private',
	'protocol',
	'static',
	'struct',
	'subscript',
	'typealias',
	'var',
	'break',
	'case',
	'continue',
	'default',
	'defer',
	'do',
	'else',
	'fallthrough',
	'for',
	'guard',
	'if',
	'in',
	'repeat',
	'return',
	'switch',
	'where',
	'while',
	'as',
	'catch',
	'is',
	'rethrows',
	'throw',
	'throws',
	'try',
	'_',
	'#available',
	'#colorLiteral',
	'#column',
	'#else',
	'#elseif',
	'#endif',
	'#file',
	'#fileLiteral',
	'#function',
	'#if',
	'#imageLiteral',
	'#line',
	'#selector',
	'#sourceLocation',
	'associativity',
	'convenience',
	'dynamic',
	'didSet',
	'final',
	'get',
	'infix',
	'indirect',
	'lazy',
	'left',
	'mutating',
	'none',
	'nonmutating',
	'optional',
	'override',
	'postfix',
	'precedence',
	'prefix',
	'Protocol',
	'required',
	'right',
	'set',
	'Type',
	'unowned',
	'weak',
	'willSet'
];

// Operators - ordered longest to shortest
const operators = [
	'...',
	'..<',
	'->',
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
	'(',
	')',
	'{',
	'}',
	'[',
	']',
	'.',
	',',
	':',
	';',
	'@',
	'#',
	'`',
	'?'
];

const values = ['self', 'super', 'true', 'false', 'nil'];
const access = ['fileprivate', 'open', 'private', 'public'];

// Access modifiers
language.push(access, {type: 'access'});

// Built-in values
language.push(values, {type: 'constant'});

// Backtick identifiers
language.push({
	pattern: /`[^`]+`/g,
	type: 'identifier'
});

// String interpolation \(...) - needs special handling
language.push({
	pattern: /\\\(([^)]*)\)/g,
	klass: 'string'
});

// Types (CamelCase)
language.push(Rule.camelCaseType);

// Keywords
language.push(keywords, {type: 'keyword'});

// Operators
language.push(operators, {type: 'operator'});

// Comments
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

// Functions
language.push(Rule.cStyleFunction);

export default function register(syntax) {
	syntax.register('swift', language);
}
