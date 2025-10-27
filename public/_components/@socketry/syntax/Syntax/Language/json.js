import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('json');

// JSON values: true, false, null
language.push(['true', 'false', 'null'], {type: 'constant'});

// JSON numbers (integers, floats, scientific notation)
language.push({
	pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/,
	type: 'constant'
});

// JSON strings (with escapes)
language.push({
	pattern: /"(?:[^"\\]|\\.)*"/,
	type: 'string'
});

// Object keys (strings followed by colon)
language.push({
	pattern: /("(?:[^"\\]|\\.)*")(\s*)(:)/,
	matches: Rule.extractMatches(
		{type: 'key'},
		null,
		{type: 'operator'}
	)
});

// Structural characters
language.push(['{', '}', '[', ']', ','], {type: 'operator'});

export default function register(syntax) {
	syntax.register('json', language);
}
