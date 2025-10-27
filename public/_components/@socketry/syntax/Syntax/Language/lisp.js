import {Language} from '../Language.js';
import {Rule} from '../Rule.js';
const lispStyleComment = {
	pattern: /(;+) .*$/m,
	type: 'comment',
	allow: ['href']
};

// This syntax is intentionally very sparse. This is because it is a general syntax for Lisp like languages.
// It might be a good idea to make specific dialects (e.g. common lisp, scheme, clojure, etc)

const language = new Language('lisp');

language.push(['(', ')'], {type: 'operator'});

language.push(lispStyleComment);

language.push(Rule.hexNumber);
language.push(Rule.decimalNumber);
language.push(Rule.webLink);

language.push({
	pattern: /\(\s*([^\s\(\)]+)/im,
	matches: Rule.extractMatches({type: 'function'})
});

language.push({
	pattern: /#[a-z]+/i,
	type: 'constant'
});

// Strings
language.push(Rule.multiLineDoubleQuotedString);
language.push(Rule.stringEscape);

export default function register(syntax) {
	syntax.register('lisp', language);
}
