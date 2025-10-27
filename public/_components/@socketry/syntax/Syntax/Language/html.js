import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('html');

// Custom handler for all <script> tags - determines language based on type attribute
language.push({
	pattern: /<script(\s+[^>]*?)?>((.|\n)*?)<\/script>/im,
	matches: Rule.extractConditionalMatch(1, 2, [
		{pattern: /type\s*=\s*["']importmap["']/i, language: 'json'},
		{pattern: /type\s*=\s*["'](?:text|application)\/javascript["']/i, language: 'javascript'},
		{language: 'javascript'} // Fallback: no type or unknown type defaults to JavaScript (HTML5)
	])
});

// Embedded CSS in <style> tags
language.push({
	pattern: /<style.*?type=.?text\/css.*?>((.|\n)*?)<\/style>/im,
	matches: Rule.extractMatches({language: 'css'})
});

// Embedded PHP
language.push({
	pattern: /((<\?php)([\s\S]*?)(\?>))/m,
	matches: Rule.extractMatches(
		{type: 'php-tag', allow: ['keyword', 'php-script']},
		{type: 'keyword'},
		{language: 'php-script'},
		{type: 'keyword'}
	)
});

// Embedded Ruby
language.push({
	pattern: /((<\?rb?)([\s\S]*?)(\?>))/m,
	matches: Rule.extractMatches(
		{type: 'ruby-tag', allow: ['keyword', 'ruby']},
		{type: 'keyword'},
		{language: 'ruby'},
		{type: 'keyword'}
	)
});

// ERB-style instructions
language.push({
	pattern: /<%=?(.*?)(%>)/,
	type: 'instruction',
	allow: ['string']
});

// DOCTYPE declarations
language.push({
	pattern: /<\!(DOCTYPE(.*?))>/,
	matches: Rule.extractMatches({type: 'doctype'})
});

// Percent escapes
language.push({
	pattern: /(%[0-9a-f]{2})/i,
	type: 'percent-escape',
	only: ['html']
});

// Derive from XML for tag parsing
language.derives('xml');

export default function register(syntax) {
	syntax.register('html', language);
}
