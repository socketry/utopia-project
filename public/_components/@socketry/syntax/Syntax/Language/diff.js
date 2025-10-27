import {Language} from '../Language.js';

const language = new Language('diff');

// File headers
language.push({pattern: /^\+\+\+.*$/m, type: 'add'});
language.push({pattern: /^\-\-\-.*$/m, type: 'del'});

// Chunk header (offset markers)
language.push({pattern: /^@@.*@@/m, type: 'offset'});

// Added lines
language.push({pattern: /^\+[^\+]{1}.*$/m, type: 'insert'});

// Removed lines
language.push({pattern: /^\-[^\-]{1}.*$/m, type: 'remove'});

// Note: The postprocess function that added classes to parent lines has been removed.
// CSS can be used to style entire lines based on the span types instead.

export default function register(syntax) {
	syntax.register('diff', language);
	syntax.alias('diff', ['patch']);
}
