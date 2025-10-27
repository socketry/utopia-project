import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('clang');

var keywords = [
	'@interface',
	'@implementation',
	'@protocol',
	'@end',
	'@try',
	'@throw',
	'@catch',
	'@finally',
	'@class',
	'@selector',
	'@encode',
	'@synchronized',
	'@property',
	'@synthesize',
	'@dynamic',
	'struct',
	'break',
	'continue',
	'else',
	'for',
	'switch',
	'case',
	'default',
	'enum',
	'goto',
	'register',
	'sizeof',
	'typedef',
	'volatile',
	'do',
	'extern',
	'if',
	'return',
	'static',
	'union',
	'while',
	'asm',
	'dynamic_cast',
	'namespace',
	'reinterpret_cast',
	'try',
	'explicit',
	'static_cast',
	'typeid',
	'catch',
	'operator',
	'template',
	'class',
	'const_cast',
	'inline',
	'throw',
	'virtual',
	'IBOutlet'
];

var access = [
	'@private',
	'@protected',
	'@public',
	'@required',
	'@optional',
	'private',
	'protected',
	'public',
	'friend',
	'using'
];

var typeModifiers = [
	'mutable',
	'auto',
	'const',
	'register',
	'typename',
	'abstract'
];

var types = [
	'double',
	'float',
	'int',
	'short',
	'char',
	'long',
	'signed',
	'unsigned',
	'bool',
	'void',
	'id'
];

var operators = [
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
	'new',
	'delete',
	'in'
];

var values = ['this', 'true', 'false', 'NULL', 'YES', 'NO', 'nil'];

language.push(values, {type: 'constant'});
language.push(typeModifiers, {type: 'keyword'});
language.push(types, {type: 'type'});
language.push(keywords, {type: 'keyword'});
language.push(operators, {type: 'operator'});
language.push(access, {type: 'access'});

// Objective-C properties
language.push({
	pattern: /@property\((.*)\)[^;]+;/im,
	type: 'objective-c-property',
	allow: '*'
});

var propertyAttributes = [
	'getter',
	'setter',
	'readwrite',
	'readonly',
	'assign',
	'retain',
	'copy',
	'nonatomic'
];

language.push(propertyAttributes, {
	type: 'keyword',
	only: ['objective-c-property']
});

// Objective-C strings
language.push({
	pattern: /@(?=")/,
	type: 'string'
});

// Objective-C classes, C++ classes, C types, etc.
language.push(Rule.camelCaseType);
language.push(Rule.cStyleType);
language.push({
	pattern: /(?:class|struct|enum|namespace)\s+([^{;\s]+)/im,
	matches: Rule.extractMatches({type: 'type'})
});

language.push({
	pattern: /#.*$/im,
	type: 'preprocessor',
	allow: ['string']
});

language.push(Rule.cStyleComment);
language.push(Rule.cppStyleComment);
language.push(Rule.webLink);

// Objective-C style functions
language.push({pattern: /\w+:(?=.*(\]|;|\{))(?!:)/, type: 'function'});

language.push({
	pattern: /[^:\[]\s+(\w+)(?=\])/,
	matches: Rule.extractMatches({type: 'function'})
});

language.push({
	pattern: /-\s*(\([^\)]+?\))?\s*(\w+)\s*\{/,
	matches: Rule.extractMatches({index: 2, type: 'function'})
});

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

// Numbers
language.push(Rule.decimalNumber);
language.push(Rule.hexNumber);

language.push(Rule.cStyleFunction);

export default function register(syntax) {
	syntax.register('clang', language);
	syntax.alias('clang', ['cpp', 'c++', 'c', 'objective-c']);
}
