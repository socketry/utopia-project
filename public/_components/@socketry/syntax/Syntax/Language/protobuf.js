import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('protobuf');

const keywords = [
	'enum',
	'extend',
	'extensions',
	'group',
	'import',
	'max',
	'message',
	'option',
	'package',
	'returns',
	'rpc',
	'service',
	'syntax',
	'to',
	'default'
];
language.push(keywords, {type: 'keyword'});

const values = ['true', 'false'];
language.push(values, {type: 'constant'});

const types = [
	'bool',
	'bytes',
	'double',
	'fixed32',
	'fixed64',
	'float',
	'int32',
	'int64',
	'sfixed32',
	'sfixed64',
	'sint32',
	'sint64',
	'string',
	'uint32',
	'uint64'
];
language.push(types, {type: 'type'});

const access = ['optional', 'required', 'repeated'];
language.push(access, {type: 'access'});

language.push(Rule.camelCaseType);

// Highlight names of fields
language.push({
	pattern: /\s+(\w+)\s*=\s*\d+/,
	matches: Rule.extractMatches({
		type: 'variable'
	})
});

// Comments
language.push(Rule.cppStyleComment);
language.push(Rule.cStyleComment);
language.push(Rule.webLink);

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

export default function register(syntax) {
	syntax.register('protobuf', language);
	syntax.alias('protobuf', ['proto']);
}
