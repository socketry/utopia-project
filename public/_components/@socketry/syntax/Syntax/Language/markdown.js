import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('markdown');

// Headers
language.push({
	pattern: /^#{1,6}\s+.+$/m,
	type: 'heading'
});

// Bold (strong emphasis)
language.push({
	pattern: /\*\*(.+?)\*\*/,
	type: 'strong'
});

language.push({
	pattern: /__(.+?)__/,
	type: 'strong'
});

// Italic (emphasis)
language.push({
	pattern: /\*(.+?)\*/,
	type: 'emphasis'
});

language.push({
	pattern: /_(.+?)_/,
	type: 'emphasis'
});

// Code blocks with language
language.push({
	pattern: /^```[\w-]*\n[\s\S]*?\n```$/m,
	type: 'code'
});

// Inline code
language.push({
	// Do not allow newlines inside inline code to avoid spanning across blocks/fences:
	pattern: /`([^`\n\r]+)`/,
	type: 'code'
});

// Links - make them clickable
language.push({
	pattern: /\[([^\]]+)\]\(([^)]+)\)/,
	type: 'link',
	matches: Rule.extractMatches(
		{type: 'string'}, // Link text
		{
			type: 'link',
			process: function (container, match) {
				const anchor = document.createElement('a');
				anchor.className = container.className;
				anchor.textContent = container.textContent;
				anchor.href = match.value;
				return anchor;
			}
		} // URL
	)
});

// Images
language.push({
	pattern: /!\[([^\]]*)\]\(([^)]+)\)/,
	type: 'link'
});

// Blockquotes
language.push({
	pattern: /^>\s+.+$/m,
	type: 'quote'
});

// Unordered lists
language.push({
	pattern: /^[\s]*[-*+]\s+/m,
	type: 'list-marker'
});

// Ordered lists
language.push({
	pattern: /^[\s]*\d+\.\s+/m,
	type: 'list-marker'
});

// Horizontal rules
language.push({
	pattern: /^(?:[-*_]){3,}$/m,
	type: 'operator'
});

// URLs - make them clickable
language.push({
	...Rule.webLink,
	type: 'link',
	process: function (container, match) {
		const anchor = document.createElement('a');
		anchor.className = container.className;
		anchor.textContent = match.value;
		anchor.href = match.value;
		return anchor;
	}
});

export default function register(syntax) {
	syntax.register('markdown', language);
	syntax.alias('markdown', ['md']);
}
