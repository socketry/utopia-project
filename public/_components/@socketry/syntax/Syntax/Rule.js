import {Match} from './Match.js';
import {Language} from './Language.js';

export class Rule {
	/**
	 * Convert string to token pattern with word boundaries.
	 */
	static convertStringToTokenPattern(pattern, escape) {
		let prefix = '\\b',
			postfix = '\\b';

		if (!pattern.match(/^\w/)) {
			if (!pattern.match(/\w$/)) {
				prefix = postfix = '';
			} else {
				prefix = '\\B';
			}
		} else {
			if (!pattern.match(/\w$/)) {
				postfix = '\\B';
			}
		}

		if (escape) {
			pattern = pattern.replace(/[\-\[\]{}()*+?.\\\^$|,#\s]/g, '\\$&');
		}

		return prefix + pattern + postfix;
	}

	/**
	 * Normalize a rule by converting string patterns to RegExp and setting defaults.
	 */
	static normalizeRule(rule, owner) {
		const normalized = {...rule, owner};

		if (typeof normalized.pattern === 'string') {
			normalized.string = normalized.pattern;
			normalized.pattern = new RegExp(
				Rule.convertStringToTokenPattern(normalized.string, true),
				normalized.options
			);
		}

		// Default pattern extraction algorithm
		normalized.apply = normalized.apply || Rule.matchPattern;

		return normalized;
	}

	/**
	 * Match a pattern against text and return matches.
	 */
	static async matchPattern(syntax, rule, text) {
		if (!rule.pattern) {
			return [];
		}

		const matches = [];

		// Duplicate the pattern and ensure 'g' flag is set:
		let pattern = rule.pattern;
		if (!pattern.global) {
			pattern = new RegExp(pattern.source, pattern.flags + 'g');
		}

		let match;
		while ((match = pattern.exec(text)) !== null) {
			if (rule.matches) {
				// Try new signature first (syntax, match, rule), fall back to old signature (match, rule)
				// This supports both extractMatches (new) and custom matches functions (old)
				const result =
					rule.matches.length >= 3
						? rule.matches(syntax, match, rule)
						: rule.matches(match, rule);
				// Handle both sync and async matches functions
				matches.push(...(result instanceof Promise ? await result : result));
			} else if (rule.language) {
				// Use the owning language's syntax to build sub-tree for embedded language
				matches.push(
					await Language.buildTree(syntax, rule, match[0], match.index, undefined)
				);
			} else {
				matches.push(new Match(match.index, match[0].length, rule, match[0]));
			}
			if (rule.incremental) {
				// Don't start scanning from the end of the match
				pattern.lastIndex = match.index + 1;
			}
		}
		return matches;
	}

	/**
	 * Create a matches extractor based on capture groups.
	 * Each provided rule corresponds to a capture group (default i+1) in the RegExp match.
	 * If a rule has {language: 'name'}, a subtree will be built using that language.
	 * If a rule has other expression fields (e.g. type), a Match will be created.
	 */
	static extractMatches(...rules) {
		return async function (syntax, match, expression) {
			const results = [];
			for (let i = 0; i < rules.length; i += 1) {
				const rule = rules[i];
				// Skip null/undefined rules:
				if (rule == null) continue;

				// Determine the capture group index to use:
				let index = typeof rule.index !== 'undefined' ? rule.index : i + 1;
				const value = match[index];

				// Skip empty captures:
				if (!value || value.length === 0) continue;

				// Compute absolute offset of this capture group within the full match:
				const offset = match.index + match[0].indexOf(value);

				// Create either a subtree or a Match based on the rule:
				if (rule.language) {
					results.push(
						await Language.buildTree(syntax, rule, value, offset, undefined)
					);
				} else {
					const nestedExpression = {owner: expression?.owner, ...rule};
					results.push(new Match(offset, value.length, nestedExpression, value));
				}
			}

			return results;
		};
	}

	/**
	 * Create a conditional matcher that selects a rule based on another capture group.
	 * Tests a condition capture group against patterns to determine which rule to apply
	 * to a content capture group.
	 * 
	 * @param {number} conditionIndex - Capture group index to test against patterns
	 * @param {number} contentIndex - Capture group index containing content to match
	 * @param {Array<{pattern?: RegExp, ...rule}>} conditions - Array of condition objects. Each can have:
	 *   - pattern: RegExp to test against the condition group (optional - if omitted, acts as fallback)
	 *   - Any rule properties (language, type, etc.) to apply when pattern matches
	 * @returns {Function} A matches function for use in language rules
	 * 
	 * @example
	 * // Script tags with type-based language selection
	 * language.push({
	 *   pattern: /<script(\s+[^>]*?)?>((.|\n)*?)<\/script>/im,
	 *   matches: Rule.extractConditionalMatch(1, 2, [
	 *     {pattern: /type\s*=\s*["']importmap["']/i, language: 'json'},
	 *     {pattern: /type\s*=\s*["'](?:text|application)\/javascript["']/i, language: 'javascript'},
	 *     {language: 'javascript'} // Fallback for no type or unknown types
	 *   ])
	 * });
	 * 
	 * @example
	 * // Code fence with language specifier
	 * language.push({
	 *   pattern: /```(\w+)?\n([\s\S]*?)```/,
	 *   matches: Rule.extractConditionalMatch(1, 2, [
	 *     {pattern: /^javascript$/i, language: 'javascript'},
	 *     {pattern: /^python$/i, language: 'python'},
	 *     {language: 'plaintext'} // Fallback
	 *   ])
	 * });
	 * 
	 * @example
	 * // Conditional type based on prefix
	 * language.push({
	 *   pattern: /(TODO|FIXME|NOTE):\s*(.+)/,
	 *   matches: Rule.extractConditionalMatch(1, 2, [
	 *     {pattern: /^TODO$/i, type: 'todo'},
	 *     {pattern: /^FIXME$/i, type: 'error'},
	 *     {pattern: /^NOTE$/i, type: 'comment'}
	 *   ])
	 * });
	 */
	static extractConditionalMatch(conditionIndex, contentIndex, conditions) {
		return async function (syntax, match, expression) {
			const condition = match[conditionIndex] || '';
			const content = match[contentIndex];

			// Skip if no content
			if (!content) return [];

			// Find matching rule
			let rule = null;
			for (const candidate of conditions) {
				// If no pattern specified, it's a fallback
				if (!candidate.pattern || candidate.pattern.test(condition)) {
					rule = candidate;
					break;
				}
			}

			// If no rule determined, return empty
			if (!rule) return [];

			// Extract rule properties (exclude pattern)
			const {pattern, ...ruleProps} = rule;

			// Build syntax tree or create match based on rule properties
			const offset = match.index + match[0].indexOf(content);
			
			if (ruleProps.language) {
				return [
					await Language.buildTree(
						syntax,
						{...ruleProps, owner: expression?.owner},
						content,
						offset,
						undefined
					)
				];
			} else {
				const nestedExpression = {owner: expression?.owner, ...ruleProps};
				return [new Match(offset, content.length, nestedExpression, content)];
			}
		};
	}

	static cStyleComment = {
		pattern: /\/\*[\s\S]*?\*\//m,
		type: 'comment',
		allow: ['href']
	};
	static cppStyleComment = {
		pattern: /\/\/.*$/m,
		type: 'comment',
		allow: ['href']
	};
	static perlStyleComment = {
		pattern: /#.*$/m,
		type: 'comment',
		allow: ['href']
	};

	static perlStyleRegularExpression = {
		pattern: /\B\/([^\\\/]|\\.)*\/[a-z]*(?=\s*($|[^\w\s'"\(]))/m,
		type: 'constant',
		incremental: true
	};
	static rubyStyleRegularExpression = {
		pattern: /\B\/([^\\\/]|\\.)*\/[a-z]*(?=\s*($|[^\w\s'"\(]|do))/m,
		type: 'constant',
		incremental: true
	};

	static cStyleFunction = {
		pattern: /([a-z_][a-z0-9_]*)\s*\(/i,
		matches: this.extractMatches({type: 'function'})
	};
	static camelCaseType = {pattern: /\b_*[A-Z][\w]*\b/, type: 'type'};
	static cStyleType = {pattern: /\b[_a-z][_\w]*_t\b/i, type: 'type'};

	static xmlComment = {
		pattern: /(&lt;|<)!--[\s\S]*?--(&gt;|>)/m,
		type: 'comment'
	};
	static webLink = {pattern: /\w+:\/\/[\w\-.\/?%&=@:;#]*/, type: 'href'};

	static hexNumber = {pattern: /\b0x[0-9a-fA-F]+/, type: 'constant'};
	static decimalNumber = {
		pattern: /\b[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/,
		type: 'constant'
	};

	static doubleQuotedString = {pattern: /"([^\\"\n]|\\.)*"/, type: 'string'};
	static singleQuotedString = {pattern: /'([^\\'\n]|\\.)*'/, type: 'string'};
	static multiLineDoubleQuotedString = {
		pattern: /"([^\\"]|\\.)*"/,
		type: 'string'
	};
	static multiLineSingleQuotedString = {
		pattern: /'([^\\']|\\.)*'/,
		type: 'string'
	};
	static stringEscape = {pattern: /\\./, type: 'escape', only: ['string']};

	/**
	 * Create a process function that wraps matched tokens in documentation links.
	 *
	 * @param {string} baseUrl - The base URL for documentation lookups
	 * @returns {Function} A process function for language.processes
	 *
	 * @example
	 * language.processes['function'] = Rule.webLinkProcess('http://docs.python.org/search.html?q=');
	 */
	static webLinkProcess(baseUrl) {
		return function (container, match, options) {
			// Replace the span with an anchor element
			const anchor = document.createElement('a');

			// Copy className and content from container
			anchor.className = container.className;
			anchor.innerHTML = container.innerHTML;

			// Append the matched text to the base URL
			anchor.href = `${baseUrl}${encodeURIComponent(match.value)}`;

			return anchor;
		};
	}
}

export default Rule;
