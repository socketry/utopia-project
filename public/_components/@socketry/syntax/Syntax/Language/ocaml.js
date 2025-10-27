// This brush is based loosely on the following documentation:
// http://msdn.microsoft.com/en-us/library/dd233230.aspx

import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('ocaml');

const keywords = [
	'abstract',
	'and',
	'as',
	'assert',
	'begin',
	'class',
	'default',
	'delegate',
	'do',
	'done',
	'downcast',
	'downto',
	'elif',
	'else',
	'end',
	'exception',
	'extern',
	'finally',
	'for',
	'fun',
	'function',
	'if',
	'in',
	'inherit',
	'inline',
	'interface',
	'internal',
	'lazy',
	'let',
	'match',
	'member',
	'module',
	'mutable',
	'namespace',
	'new',
	'null',
	'of',
	'open',
	'or',
	'override',
	'rec',
	'return',
	'static',
	'struct',
	'then',
	'to',
	'try',
	'type',
	'upcast',
	'use',
	'val',
	'when',
	'while',
	'with',
	'yield',
	'asr',
	'land',
	'lor',
	'lsl',
	'lsr',
	'lxor',
	'mod',
	'sig',
	'atomic',
	'break',
	'checked',
	'component',
	'const',
	'constraint',
	'constructor',
	'continue',
	'eager',
	'event',
	'external',
	'fixed',
	'functor',
	'global',
	'include',
	'method',
	'mixin',
	'object',
	'parallel',
	'process',
	'protected',
	'pure',
	'sealed',
	'trait',
	'virtual',
	'volatile'
];

const types = [
	'bool',
	'byte',
	'sbyte',
	/\bu?int\d*\b/,
	'nativeint',
	'unativeint',
	'char',
	'string',
	'decimal',
	'unit',
	'void',
	'float32',
	'single',
	'float64',
	'double',
	'list',
	'array',
	'exn',
	'format',
	'fun',
	'option',
	'ref'
];

const operators = [
	':?>',
	'<>',
	'->',
	'::',
	':=',
	':>',
	':?',
	'[<',
	'>]',
	'<|',
	'|>',
	'[|',
	'|]',
	'(|',
	'|)',
	'(*',
	'*)',
	'!',
	'%',
	'&',
	'*',
	'+',
	'-',
	'/',
	'<',
	'=',
	'>',
	'?',
	'@',
	'^',
	'_',
	'`',
	'|',
	'~',
	"'",
	'in'
];

const values = ['true', 'false'];

const access = ['private', 'public'];

language.push(access, {type: 'access'});
language.push(values, {type: 'constant'});
language.push(types, {type: 'type'});
language.push(keywords, {type: 'keyword'});
language.push(operators, {type: 'operator'});

// http://caml.inria.fr/pub/docs/manual-ocaml/manual011.html#module-path
// open [module-path], new [type]
language.push({
	pattern: /(?:open|new)\s+((?:\.?[a-z][a-z0-9]*)+)/i,
	matches: Rule.extractMatches({type: 'type'})
});

// Functions
language.push({
	pattern: /(?:\.)([a-z_][a-z0-9_]+)/i,
	matches: Rule.extractMatches({type: 'function'})
});

// Avoid highlighting keyword arguments as camel-case types.
language.push({
	pattern: /(?:\(|,)\s*(\w+\s*=)/,
	matches: Rule.extractMatches({
		type: 'keyword-argument'
	})
});

// We need to modify cStyleFunction because "(*" is a comment token.
language.push({
	pattern: /([a-z_][a-z0-9_]*)\s*\((?!\*)/i,
	matches: Rule.extractMatches({type: 'function'})
});

// Types
language.push(Rule.camelCaseType);

// Web Links
language.push(Rule.webLink);

// Comments
language.push({
	pattern: /\(\*[\s\S]*?\*\)/,
	type: 'comment'
});

// Strings
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

export default function register(syntax) {
	syntax.register('ocaml', language);
	syntax.alias('ocaml', ['ml', 'sml', 'fsharp']);
}
