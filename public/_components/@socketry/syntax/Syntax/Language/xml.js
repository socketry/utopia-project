/**
 * XML language syntax highlighting
 * Supports XML tags, attributes, entities, CDATA sections, and comments
 */
import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

// XML entity pattern: &entity;
const xmlEntity = {pattern: /&\w+;/, type: 'entity'};

// XML percent escape pattern for URL encoding
const xmlPercentEscape = {
	pattern: /(%[0-9a-f]{2})/i,
	type: 'percent-escape',
	only: ['string']
};

// Create xml-tag language for highlighting XML tag internals
const xmlTagLanguage = new Language('xml-tag');

// Match opening/closing tags with optional namespace
// Pattern: <tag>, <ns:tag>, </tag>, </ns:tag>, <tag/>, etc.
xmlTagLanguage.push({
	pattern: /<\/?((?:[^:\s>]+:)?)([^\s>]+)(\s[^>]*)?\/?>/,
	matches: Rule.extractMatches({type: 'namespace'}, {type: 'tag-name'})
});

// Match attributes with values
// Pattern: attribute="value", attribute='value', attribute=value
xmlTagLanguage.push({
	pattern: /([^=\s]+)=(".*?"|'.*?'|[^\s>]+)/,
	matches: Rule.extractMatches(
		{type: 'attribute', only: ['tag']},
		{type: 'string', only: ['tag']}
	)
});

xmlTagLanguage.push(xmlEntity);
xmlTagLanguage.push(xmlPercentEscape);
xmlTagLanguage.push(Rule.singleQuotedString);
xmlTagLanguage.push(Rule.doubleQuotedString);

// Create main XML language

const language = new Language('xml');

// Match CDATA sections
// Pattern: <![CDATA[content]]>
language.push({
	pattern: /(<!(\[CDATA\[)([\s\S]*?)(\]\])>)/m,
	matches: Rule.extractMatches(
		{type: 'cdata', allow: ['cdata-content', 'cdata-tag']},
		{type: 'cdata-tag'},
		{type: 'cdata-content'},
		{type: 'cdata-tag'}
	)
});

// XML comments
language.push(Rule.xmlComment);

// Match all XML tags and delegate to xml-tag language
language.push({
	pattern: /<[^>\-\s]([^>'"!\/;\?@\[\]^`\{\}\|]|"[^"]*"|'[^']')*[\/?]?>/,
	language: 'xml-tag'
});

language.push(xmlEntity);
language.push(xmlPercentEscape);
language.push(Rule.webLink);

// Register both languages
export default function register(syntax) {
	syntax.register('xml-tag', xmlTagLanguage);
	syntax.register('xml', language);
}
