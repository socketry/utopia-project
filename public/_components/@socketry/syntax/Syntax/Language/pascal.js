//
// Constructed using information from http://pascal.comsci.us/etymology/
//

import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('pascal');

const keywords = [
	'absolute',
	'abstract',
	'all',
	'and_then',
	'as',
	'asm',
	'asmname',
	'attribute',
	'begin',
	'bindable',
	'c',
	'c_language',
	'case',
	'class',
	'const',
	'constructor',
	'destructor',
	'dispose',
	'do',
	'downto',
	'else',
	'end',
	'except',
	'exit',
	'export',
	'exports',
	'external',
	'far',
	'file',
	'finalization',
	'finally',
	'for',
	'forward',
	'function',
	'goto',
	'if',
	'implementation',
	'import',
	'inherited',
	'initialization',
	'inline',
	'interface',
	'interrupt',
	'is',
	'keywords',
	'label',
	'library',
	'module',
	'name',
	'near',
	'new',
	'object',
	'of',
	'on',
	'only',
	'operator',
	'or_else',
	'otherwise',
	'packed',
	'pascal',
	'pow',
	'private',
	'procedure',
	'program',
	'property',
	'protected',
	'public',
	'published',
	'qualified',
	'raise',
	'record',
	'repeat',
	'resident',
	'restricted',
	'segment',
	'set',
	'then',
	'threadvar',
	'to',
	'try',
	'type',
	'unit',
	'until',
	'uses',
	'value',
	'var',
	'view',
	'virtual',
	'while',
	'with'
];

const operators = [
	':=',
	'>=',
	'<=',
	'<>',
	'+',
	'-',
	'*',
	'/',
	'div',
	'mod',
	'and',
	'or',
	'xor',
	'shl',
	'shr',
	'not',
	'=',
	'>',
	'<',
	'in'
];

const values = ['true', 'false', 'nil'];

// Keywords are case insensitive
language.push(values, {type: 'constant', options: 'gi'});
language.push(keywords, {type: 'keyword', options: 'gi'});
language.push(operators, {type: 'operator', options: 'gi'});

language.push(Rule.camelCaseType);

// Pascal style comments
language.push({
	pattern: /\{[\s\S]*?\}/m,
	type: 'comment',
	allow: ['href']
});

language.push({
	pattern: /\(\*[\s\S]*?\*\)/m,
	type: 'comment',
	allow: ['href']
});

language.push(Rule.webLink);

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

// Numbers
language.push(Rule.decimalNumber);
// Pascal hex numbers use $ prefix
language.push({pattern: /\$[0-9a-fA-F]+/, type: 'constant'});

// Functions
language.push(Rule.cStyleFunction);

export default function register(syntax) {
	syntax.register('pascal', language);
	syntax.alias('pascal', ['delphi']);
}
