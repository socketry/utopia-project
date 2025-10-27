import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('php-script');

const keywords = [
	'abstract',
	'and',
	'as',
	'break',
	'case',
	'cfunction',
	'class',
	'const',
	'continue',
	'declare',
	'default',
	'die',
	'do',
	'echo',
	'else',
	'elseif',
	'enddeclare',
	'endfor',
	'endforeach',
	'endif',
	'endswitch',
	'endwhile',
	'extends',
	'extends',
	'for',
	'foreach',
	'function',
	'global',
	'if',
	'implements',
	'include',
	'include_once',
	'interface',
	'old_function',
	'or',
	'require',
	'require_once',
	'return',
	'static',
	'switch',
	'throw',
	'use',
	'var',
	'while',
	'xor'
];

const access = ['private', 'protected', 'public'];

const operators = [
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
	'[',
	']',
	'new'
];

const values = ['this', 'true', 'false'];

language.push(values, {type: 'constant'});
language.push(keywords, {type: 'keyword'});
language.push(operators, {type: 'operator'});
language.push(access, {type: 'access'});

// Variables
language.push({
	pattern: /\$[a-z_][a-z0-9]*/gi,
	type: 'variable'
});

// ClassNames (CamelCase)
language.push(Rule.camelCaseType);
language.push(Rule.cStyleFunction);

// Comments
language.push(Rule.cStyleComment);
language.push(Rule.cppStyleComment);
language.push(Rule.perlStyleComment);
language.push(Rule.webLink);

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

language.processes['function'] = Rule.webLinkProcess(
	'http://www.php.net/manual-lookup.php?pattern='
);

export default function register(syntax) {
	syntax.register('php-script', language);
}
