import {Language} from '../Language.js';
import {Rule} from '../Rule.js';
const vbStyleComment = {
	pattern: /' .*$/m,
	type: 'comment',
	allow: ['href']
};

const language = new Language('basic');

var keywords = [
	'AddHandler',
	'AddressOf',
	'Alias',
	'And',
	'AndAlso',
	'Ansi',
	'As',
	'Assembly',
	'Auto',
	'ByRef',
	'ByVal',
	'Call',
	'Case',
	'Catch',
	'Declare',
	'Default',
	'Delegate',
	'Dim',
	'DirectCast',
	'Do',
	'Each',
	'Else',
	'ElseIf',
	'End',
	'Enum',
	'Erase',
	'Error',
	'Event',
	'Exit',
	'Finally',
	'For',
	'Function',
	'Get',
	'GetType',
	'GoSub',
	'GoTo',
	'Handles',
	'If',
	'Implements',
	'Imports',
	'In',
	'Inherits',
	'Interface',
	'Is',
	'Let',
	'Lib',
	'Like',
	'Loop',
	'Mod',
	'Module',
	'MustOverride',
	'Namespace',
	'New',
	'Next',
	'Not',
	'On',
	'Option',
	'Optional',
	'Or',
	'OrElse',
	'Overloads',
	'Overridable',
	'Overrides',
	'ParamArray',
	'Preserve',
	'Property',
	'RaiseEvent',
	'ReadOnly',
	'ReDim',
	'REM',
	'RemoveHandler',
	'Resume',
	'Return',
	'Select',
	'Set',
	'Static',
	'Step',
	'Stop',
	'Structure',
	'Sub',
	'SyncLock',
	'Then',
	'Throw',
	'To',
	'Try',
	'TypeOf',
	'Unicode',
	'Until',
	'When',
	'While',
	'With',
	'WithEvents',
	'WriteOnly',
	'Xor',
	'ExternalSource',
	'Region',
	'Print',
	'Class'
];

var types = [
	'CBool',
	'CByte',
	'CChar',
	'CDate',
	'CDec',
	'CDbl',
	'Char',
	'CInt',
	'CLng',
	'CObj',
	'Const',
	'CShort',
	'CSng',
	'CStr',
	'CType',
	'Date',
	'Decimal',
	'Variant',
	'String',
	'Short',
	'Long',
	'Single',
	'Double',
	'Object',
	'Integer',
	'Boolean',
	'Byte',
	'Char'
];

var operators = [
	'+',
	'-',
	'*',
	'/',
	'+=',
	'-=',
	'*=',
	'/=',
	'=',
	':=',
	'==',
	'!=',
	'!',
	'%',
	'?',
	'>',
	'<',
	'>=',
	'<=',
	'&&',
	'||',
	'&',
	'|',
	'^',
	'.',
	'~',
	'..',
	'>>',
	'<<',
	'>>>',
	'<<<',
	'>>=',
	'<<=',
	'>>>=',
	'<<<=',
	'%=',
	'^=',
	'&=',
	'\\',
	'\\=',
	'@'
];

var values = [
	'Me',
	'MyClass',
	'MyBase',
	'super',
	'True',
	'False',
	'Nothing',
	/[A-Z][A-Z0-9_]+/
];

var access = [
	'Public',
	'Protected',
	'Private',
	'Shared',
	'Friend',
	'Shadows',
	'MustInherit',
	'NotInheritable',
	'NotOverridable'
];

language.push(types, {type: 'type'});
language.push(keywords, {type: 'keyword', options: 'gi'});
language.push(operators, {type: 'operator'});
language.push(access, {type: 'access'});
language.push(values, {type: 'constant'});

language.push(Rule.decimalNumber);

// ClassNames (CamelCase)
language.push(Rule.camelCaseType);

language.push(vbStyleComment);

language.push(Rule.webLink);

// Strings
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

export default function register(syntax) {
	syntax.register('basic', language);
	syntax.alias('basic', ['vb']);
}
