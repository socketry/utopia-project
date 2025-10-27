import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('javascript');

// Constants/values
language.push(['this', 'true', 'false', 'null'], {type: 'constant'});

// Keywords
language.push(
	[
		'async',
		'await',
		'break',
		'case',
		'catch',
		'class',
		'const',
		'continue',
		'debugger',
		'default',
		'delete',
		'do',
		'else',
		'export',
		'extends',
		'finally',
		'for',
		'function',
		'if',
		'import',
		'in',
		'instanceof',
		'let',
		'new',
		'return',
		'super',
		'switch',
		'this',
		'throw',
		'try',
		'typeof',
		'var',
		'void',
		'while',
		'with',
		'yield'
	],
	{type: 'keyword'}
);

// Operators
language.push(['+', '*', '/', '-', '&', '|', '~', '!', '%', '<', '=', '>', '...'], {
	type: 'operator'
});

// Access modifiers
language.push(
	['implements', 'package', 'protected', 'interface', 'private', 'public'],
	{type: 'access'}
);

// Regular expressions
language.push(Rule.perlStyleRegularExpression);

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

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

// Functions
language.push(Rule.cStyleFunction);

export default function register(syntax) {
	syntax.register('javascript', language);
	syntax.alias('javascript', ['js', 'actionscript']);
}
