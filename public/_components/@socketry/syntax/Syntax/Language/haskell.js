import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('haskell');

// Multi-word keywords need to be matched first (before single words)
language.push(
	[
		'data family',
		'data instance',
		'deriving instance',
		'type family',
		'type instance'
	],
	{type: 'keyword'}
);

const keywords = [
	'as',
	'case',
	'of',
	'class',
	'data',
	'default',
	'deriving',
	'do',
	'forall',
	'foreign',
	'hiding',
	'if',
	'then',
	'else',
	'import',
	'infix',
	'infixl',
	'infixr',
	'instance',
	'let',
	'in',
	'mdo',
	'module',
	'newtype',
	'proc',
	'qualified',
	'rec',
	'type',
	'where'
];

// Operators - ordered from longest to shortest to avoid partial matches
const operators = [
	'::',
	'->',
	'<-',
	'-<<',
	'-<',
	'??',
	'`',
	'|',
	'\\',
	'-',
	'*',
	'?',
	'#',
	'@',
	'!',
	'_',
	'~',
	'>',
	';',
	'{',
	'}'
];

const values = ['True', 'False'];

language.push(values, {type: 'constant'});
language.push(keywords, {type: 'keyword'});
language.push(operators, {type: 'operator'});

// CamelCase types
language.push(Rule.camelCaseType);

// Comments
language.push({
	pattern: /\-\-.*$/m,
	type: 'comment',
	allow: ['href']
});

language.push({
	pattern: /\{\-[\s\S]*?\-\}/m,
	type: 'comment',
	allow: ['href']
});

language.push(Rule.webLink);

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

export default function register(syntax) {
	syntax.register('haskell', language);
}
