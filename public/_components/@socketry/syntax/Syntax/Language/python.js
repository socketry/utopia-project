import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('python');

var keywords = [
	'and',
	'as',
	'assert',
	'break',
	'class',
	'continue',
	'def',
	'del',
	'elif',
	'else',
	'except',
	'exec',
	'finally',
	'for',
	'from',
	'global',
	'if',
	'import',
	'in',
	'is',
	'lambda',
	'not',
	'or',
	'pass',
	'print',
	'raise',
	'return',
	'try',
	'while',
	'with',
	'yield'
];

var operators = [
	'!=',
	'%',
	'%=',
	'&',
	'&=',
	'(',
	')',
	'*',
	'**',
	'**=',
	'*=',
	'+',
	'+=',
	',',
	'-',
	'-=',
	'.',
	'/',
	'//',
	'//=',
	'/=',
	':',
	';',
	'<',
	'<<',
	'<<=',
	'<=',
	'<>',
	'=',
	'==',
	'>',
	'>=',
	'>>',
	'>>=',
	'@',
	'[',
	']',
	'^',
	'^=',
	'`',
	'`',
	'{',
	'|',
	'|=',
	'}',
	'~'
];

// Extracted from http://docs.python.org/library/functions.html
var builtinFunctions = [
	'abs',
	'all',
	'any',
	'basestring',
	'bin',
	'bool',
	'callable',
	'chr',
	'classmethod',
	'cmp',
	'compile',
	'complex',
	'delattr',
	'dict',
	'dir',
	'divmod',
	'enumerate',
	'eval',
	'execfile',
	'file',
	'filter',
	'float',
	'format',
	'frozenset',
	'getattr',
	'globals',
	'hasattr',
	'hash',
	'help',
	'hex',
	'id',
	'input',
	'int',
	'isinstance',
	'issubclass',
	'iter',
	'len',
	'list',
	'locals',
	'long',
	'map',
	'max',
	'min',
	'next',
	'object',
	'oct',
	'open',
	'ord',
	'pow',
	'print',
	'property',
	'range',
	'raw_input',
	'reduce',
	'reload',
	'repr',
	'reversed',
	'round',
	'set',
	'setattr',
	'slice',
	'sorted',
	'staticmethod',
	'str',
	'sum',
	'super',
	'tuple',
	'type',
	'type',
	'unichr',
	'unicode',
	'vars',
	'xrange',
	'zip',
	'__import__',
	'apply',
	'buffer',
	'coerce',
	'intern'
];

const values = ['self', 'True', 'False', 'None'];
language.push({pattern: /^\s*@\w+/m, type: 'decorator'});
language.push(values, {type: 'constant'});
language.push(keywords, {type: 'keyword'});
language.push(operators, {type: 'operator'});
language.push(builtinFunctions, {type: 'builtin'});

// ClassNames (CamelCase)
language.push(Rule.camelCaseType);
language.push(Rule.cStyleFunction);

language.push(Rule.perlStyleComment);
language.push({pattern: /(['\"]{3})([^\1])*?\1/m, type: 'comment'});
language.push(Rule.webLink);

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

language.processes['function'] = Rule.webLinkProcess(
	'http://docs.python.org/search.html?q='
);
language.processes['type'] = Rule.webLinkProcess(
	'http://docs.python.org/search.html?q='
);
language.processes['builtin'] = Rule.webLinkProcess(
	'http://docs.python.org/search.html?q='
);

export default function register(syntax) {
	syntax.register('python', language);
}
