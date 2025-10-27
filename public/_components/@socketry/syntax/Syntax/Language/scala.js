import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('scala');

// Keywords
language.push(
	[
		'abstract',
		'do',
		'finally',
		'import',
		'object',
		'return',
		'trait',
		'var',
		'case',
		'catch',
		'class',
		'else',
		'extends',
		'for',
		'forSome',
		'if',
		'lazy',
		'match',
		'new',
		'override',
		'package',
		'private',
		'sealed',
		'super',
		'try',
		'type',
		'while',
		'with',
		'yield',
		'def',
		'final',
		'implicit',
		'protected',
		'throw',
		'val'
	],
	{type: 'keyword'}
);

// Operators
language.push(['_', ':', '=', '=>', '<-', '<:', '<%', '>:', '#', '@'], {
	type: 'operator'
});

// Constants
language.push(['this', 'null', 'true', 'false'], {type: 'constant'});

// Triple-quoted strings
language.push({pattern: /"""[\s\S]*?"""/, type: 'string'});

// Double-quoted strings
language.push(Rule.doubleQuotedString);

// Functions: `def name` or `.name`
language.push({
	pattern: /(?:def\s+|\.)([a-z_][a-z0-9_]+)/i,
	matches: Rule.extractMatches({type: 'function'})
});

// Types and function calls
language.push(Rule.camelCaseType);
language.push(Rule.cStyleFunction);

// Comments
language.push(Rule.cStyleComment);
language.push(Rule.cppStyleComment);

// Scala supports XML literals; derive XML rules
language.derives('xml');

export default function register(syntax) {
	syntax.register('scala', language);
}
