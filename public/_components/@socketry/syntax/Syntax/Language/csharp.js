import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('csharp');

var keywords = [
	'abstract',
	'add',
	'alias',
	'ascending',
	'base',
	'break',
	'case',
	'catch',
	'class',
	'const',
	'continue',
	'default',
	'delegate',
	'descending',
	'do',
	'dynamic',
	'else',
	'enum',
	'event',
	'explicit',
	'extern',
	'finally',
	'for',
	'foreach',
	'from',
	'get',
	'global',
	'goto',
	'group',
	'if',
	'implicit',
	'in',
	'interface',
	'into',
	'join',
	'let',
	'lock',
	'namespace',
	'new',
	'operator',
	'orderby',
	'out',
	'override',
	'params',
	'partial',
	'readonly',
	'ref',
	'remove',
	'return',
	'sealed',
	'select',
	'set',
	'stackalloc',
	'static',
	'struct',
	'switch',
	'throw',
	'try',
	'unsafe',
	'using',
	'value',
	'var',
	'virtual',
	'volatile',
	'where',
	'while',
	'yield'
];

var access = ['public', 'private', 'internal', 'protected'];

var types = [
	'object',
	'bool',
	'byte',
	'fixed',
	'float',
	'uint',
	'char',
	'ulong',
	'ushort',
	'decimal',
	'int',
	'sbyte',
	'short',
	'void',
	'long',
	'string',
	'double'
];

var operators = [
	'+',
	'-',
	'*',
	'/',
	'%',
	'&',
	'|',
	'^',
	'!',
	'~',
	'&&',
	'||',
	'++',
	'--',
	'<<',
	'>>',
	'==',
	'!=',
	'<',
	'>',
	'<=',
	'>=',
	'=',
	'?',
	'new',
	'as',
	'is',
	'sizeof',
	'typeof',
	'checked',
	'unchecked'
];

var values = ['this', 'true', 'false', 'null'];

language.push(values, {type: 'constant'});
language.push(types, {type: 'type'});
language.push(keywords, {type: 'keyword'});
language.push(operators, {type: 'operator'});
language.push(access, {type: 'access'});

// Functions
language.push(Rule.cStyleFunction);
language.push({
	pattern: /(?:\.)([a-z_][a-z0-9_]+)/i,
	matches: Rule.extractMatches({type: 'function'})
});

// Camel Case Types
language.push(Rule.camelCaseType);

// Comments
language.push(Rule.cStyleComment);
language.push(Rule.cppStyleComment);
language.push(Rule.webLink);

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

export default function register(syntax) {
	syntax.register('csharp', language);
	syntax.alias('csharp', ['c-sharp', 'c#']);
}
