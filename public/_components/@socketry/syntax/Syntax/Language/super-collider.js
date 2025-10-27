import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('super-collider');

// Keywords
language.push(['const', 'arg', 'classvar', 'var'], {type: 'keyword'});

// Operators
language.push(
	['`', '+', '@', ':', '*', '/', '-', '&', '|', '~', '!', '%', '<', '=', '>'],
	{
		type: 'operator'
	}
);

// Constants/values
language.push(
	[
		'thisFunctionDef',
		'thisFunction',
		'thisMethod',
		'thisProcess',
		'thisThread',
		'this',
		'super',
		'true',
		'false',
		'nil',
		'inf'
	],
	{type: 'constant'}
);

// CamelCase class/type names
language.push(Rule.camelCaseType);

// Single Characters like $a or $\n
language.push({pattern: /\$(\\)?.\b/, type: 'constant'});

// Symbols: \symbol and 'quotedSymbol'
language.push({pattern: /\\[a-z_][a-z0-9_]*/i, type: 'symbol'});
language.push({pattern: /'[^']+'/, type: 'symbol'});

// Comments and links
language.push(Rule.cStyleComment);
language.push(Rule.cppStyleComment);
language.push(Rule.webLink);

// Strings: SuperCollider uses double quotes for Strings
// Single quotes denote Symbols and are handled above.
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

// Method calls .method and c-style function pattern (identifier()
language.push({
	pattern: /(?:\.)([a-z_][a-z0-9_]*)/i,
	matches: Rule.extractMatches({type: 'function'})
});
language.push(Rule.cStyleFunction);

export default function register(syntax) {
	syntax.register('super-collider', language);
	// Alias: sc
	syntax.alias('super-collider', ['sc']);
}
