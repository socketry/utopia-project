import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('smalltalk');

const operators = ['[', ']', '|', ':=', '.'];

const values = ['self', 'super', 'true', 'false', 'nil'];

language.push(values, {type: 'constant'});
language.push(operators, {type: 'operator'});

// Objective-C style functions (method selectors ending with colon)
language.push({pattern: /\w+:/, type: 'function'});

// Camelcase Types
language.push(Rule.camelCaseType);

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

export default function register(syntax) {
	syntax.register('smalltalk', language);
}
