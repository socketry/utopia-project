import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('assembly');

language.push(Rule.cStyleComment);
language.push(Rule.cppStyleComment);

language.push({pattern: /\.[a-zA-Z_][a-zA-Z0-9_]*/m, type: 'directive'});

language.push({pattern: /^[a-zA-Z_][a-zA-Z0-9_]*:/m, type: 'label'});

language.push({
	pattern: /^\s*([a-zA-Z]+)/m,
	matches: Rule.extractMatches({type: 'function'})
});

language.push({pattern: /(-[0-9]+)|(\b[0-9]+)|(\$[0-9]+)/, type: 'constant'});
language.push({
	pattern: /(\-|\b|\$)(0x[0-9a-f]+|[0-9]+|[a-z0-9_]+)/i,
	type: 'constant'
});

language.push({pattern: /%\w+/, type: 'register'});

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

// Comments
language.push(Rule.perlStyleComment);
language.push(Rule.webLink);

export default function register(syntax) {
	syntax.register('assembly', language);
	syntax.alias('assembly', ['asm']);
}
