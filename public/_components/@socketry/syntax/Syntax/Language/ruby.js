import {Language} from '../Language.js';
import {Rule} from '../Rule.js';
import {Match} from '../Match.js';

const language = new Language('ruby');

// Ruby-style function definitions and method calls (def foo, .bar)
// Method names can end with ? or !
const rubyStyleFunction = {
	pattern: /(?:def\s+|\.)([a-z_][a-z0-9_]*[?!]?)/i,
	matches: Rule.extractMatches({type: 'function'})
};

// Emulate negative lookbehind to avoid matching ::symbol (only match :symbol not ::symbol)
// Symbols can also end with ? or !
const rubyStyleSymbol = {
	pattern: /([:]?):\w+[?!]?/,
	type: 'constant',
	matches: function (/* syntax */ _syntax, match, expr) {
		// If there is a preceding ':' captured, skip (handles '::symbol').
		if (match[1] !== '') return [];

		return [new Match(match.index, match[0].length, expr, match[0])];
	}
};

// Keywords, operators, values and access modifiers
const keywords = [
	'alias',
	'and',
	'begin',
	'break',
	'case',
	'class',
	'def',
	'define_method',
	'defined?',
	'do',
	'else',
	'elsif',
	'end',
	'ensure',
	'false',
	'for',
	'if',
	'in',
	'module',
	'next',
	'not',
	'or',
	'raise',
	'redo',
	'rescue',
	'retry',
	'return',
	'then',
	'throw',
	'undef',
	'unless',
	'until',
	'when',
	'while',
	'yield',
	'block_given?'
];

const operators = ['+', '*', '/', '-', '&', '|', '~', '!', '%', '<', '=', '>', '...', '..'];
const values = ['self', 'super', 'true', 'false', 'nil'];
const access = ['private', 'protected', 'public'];

language.push(access, {type: 'access'});
language.push(values, {type: 'constant'});

// Percent-literals like %q{...}, %w{...}
language.push({
	pattern: /(\%[\S])(\{[\s\S]*?\})/,
	matches: Rule.extractMatches({type: 'function'}, {type: 'constant'})
});

// Backtick command strings
language.push({pattern: /`[^`]+`/, type: 'string'});

// Interpolation inside strings: #{ ... }
language.push({
	pattern: /\#\{([^\}]*)\}/,
	matches: Rule.extractMatches({language: 'ruby', only: ['string']})
});

// Regular expressions
language.push(Rule.rubyStyleRegularExpression);

// Instance/class/global variables
language.push({pattern: /(@+|\$)[\w]+/, type: 'variable'});

// Types (CamelCase constants)
language.push(Rule.camelCaseType);

// Core tokens
language.push(keywords, {type: 'keyword'});
language.push(operators, {type: 'operator'});

// Symbols
language.push(rubyStyleSymbol);

// Comments and links
language.push(Rule.perlStyleComment);
language.push(Rule.webLink);

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

// Functions (definitions and c-style function detection)
language.push(rubyStyleFunction);
language.push(Rule.cStyleFunction);

export default function register(syntax) {
	syntax.register('ruby', language);
}
