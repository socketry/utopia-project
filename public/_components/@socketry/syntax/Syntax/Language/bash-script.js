import {Language} from '../Language.js';
import {Rule} from '../Rule.js';
const bashScript = new Language('bash-script');

var operators = ['&&', '|', ';', '{', '}'];
bashScript.push(operators, {type: 'operator'});

bashScript.push({
	pattern:
		/(?:^|\||;|&&)\s*((?:"([^"]|\\")+"|'([^']|\\')+'|\\\n|.|[ \t])+?)(?=$|\||;|&&)/im,
	matches: Rule.extractMatches({language: 'bash-statement'})
});

const bashStatement = new Language('bash-statement');

var keywords = [
	'break',
	'case',
	'continue',
	'do',
	'done',
	'elif',
	'else',
	'eq',
	'fi',
	'for',
	'function',
	'ge',
	'gt',
	'if',
	'in',
	'le',
	'lt',
	'ne',
	'return',
	'then',
	'until',
	'while'
];
bashStatement.push(keywords, {type: 'keyword'});

var statementOperators = [
	'>',
	'<',
	'=',
	'`',
	'--',
	'{',
	'}',
	'(',
	')',
	'[',
	']'
];
bashStatement.push(statementOperators, {type: 'operator'});

bashStatement.push({
	pattern: /\(\((.*?)\)\)/im,
	type: 'expression',
	allow: ['variable', 'string', 'operator', 'constant']
});

bashStatement.push({
	pattern: /`([\s\S]+?)`/im,
	matches: Rule.extractMatches({language: 'bash-script', debug: true})
});

bashStatement.push(Rule.perlStyleComment);

// Probably need to write a real parser here rather than using regular expressions, it is too fragile
// and misses lots of edge cases (e.g. nested brackets, delimiters).
bashStatement.push({
	pattern:
		/^\s*((?:\S+?=\$?(?:\[[^\]]+\]|\(\(.*?\)\)|"(?:[^"]|\\")+"|'(?:[^']|\\')+'|\S+)\s*)*)((?:(\\ |\S)+)?)/im,
	matches: Rule.extractMatches(
		{
			type: 'env',
			allow: ['variable', 'string', 'operator', 'constant', 'expression']
		},
		{type: 'function', allow: ['variable', 'string']}
	)
});

bashStatement.push({
	pattern: /(\S+?)=/im,
	matches: Rule.extractMatches({type: 'variable'}),
	only: ['env']
});

bashStatement.push({
	pattern: /\$\w+/,
	type: 'variable'
});

bashStatement.push({pattern: /\s\-+[\w-]+/, type: 'option'});

bashStatement.push(Rule.singleQuotedString);
bashStatement.push(Rule.doubleQuotedString);

bashStatement.push(Rule.decimalNumber);
bashStatement.push(Rule.hexNumber);

bashStatement.push(Rule.webLink);

export default function register(syntax) {
	syntax.register('bash-script', bashScript);
	syntax.register('bash-statement', bashStatement);
}
