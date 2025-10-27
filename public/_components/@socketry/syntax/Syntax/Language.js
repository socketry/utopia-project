import {Match} from './Match.js';
import {Rule} from './Rule.js';
import {LanguageNotFoundError, RuleApplyError} from './Errors.js';

export class Language {
	// Public properties that define the language
	name;

	// A list of processes that may be run after extracting matches.
	processes = {};

	// A sequential list of rules for extracting matches.
	#rules = [];

	// A list of all the parent languages this language derives from.
	#parents = [];

	constructor(name = null) {
		// The primary class of this language. Must be unique.
		this.name = name;
	}

	/**
	 * Add a parent to the language. This language should be loaded as a dependency.
	 */
	derives(name) {
		this.#parents.push(name);
		this.#rules.push({
			apply: async function (syntax, rule, text) {
				const parentLanguage = await syntax.getLanguage(name);
				return parentLanguage.getMatches(syntax, text);
			}
		});
	}

	/**
	 * Return an array of all classes that the language consists of.
	 */
	async allNames(syntax) {
		const names = [this.name];

		for (const parent of this.#parents) {
			if (syntax) {
				const parentLanguage = await syntax.getLanguage(parent);
				if (parentLanguage) names.push(...(await parentLanguage.allNames(syntax)));
			}
		}

		return names;
	}

	/**
	 * Push a rule onto the language.
	 */
	push(...args) {
		if (Array.isArray(args[0])) {
			const patterns = args[0];
			const rule = args[1];

			let all = '(';

			for (let i = 0; i < patterns.length; i += 1) {
				if (i > 0) all += '|';

				const p = patterns[i];

				if (p instanceof RegExp) {
					all += p.source;
				} else {
					all += Rule.convertStringToTokenPattern(p, true);
				}
			}

			all += ')';

			this.push({
				...rule,
				pattern: new RegExp(all, rule.options)
			});
		} else {
			const rule = args[0];

			// Normalize and validate the rule
			const normalized = Rule.normalizeRule(rule, this);

			if (
				typeof normalized.pattern === 'undefined' ||
				normalized.pattern instanceof RegExp
			) {
				this.#rules.push(normalized);
			} else {
				console.error('Syntax Error: Malformed rule: ', rule);
			}
		}
	}

	/**
	 * Get matches for a specific rule.
	 */
	async getMatchesForRule(syntax, text, rule) {
		let matches = [];

		// Short circuit (user defined) function:
		if (typeof rule.apply !== 'undefined') {
			try {
				const result = rule.apply(syntax, rule, text);
				matches = result instanceof Promise ? await result : result;
			} catch (error) {
				if (syntax?.defaultOptions?.strict) {
					// If the underlying error is a strict language resolution error, surface it directly:
					if (error instanceof LanguageNotFoundError) throw error;
					throw new RuleApplyError(rule, {cause: error});
				} else {
					console.warn('Syntax Warning: Rule apply failed:', rule, error);
					matches = [];
				}
			}
		}

		if (rule.debug) {
			console.log('Syntax matches:', rule, text, matches);
		}

		return matches;
	}

	/**
	 * Get the rule for a specific type.
	 */
	getRuleForType(type) {
		for (const rule of this.#rules) {
			if (rule.type === type) {
				return rule;
			}
		}

		return null;
	}

	/**
	 * Get all matches for the given text.
	 */
	async getMatches(syntax, text) {
		const matches = [];

		for (const rule of this.#rules) {
			matches.push(...(await this.getMatchesForRule(syntax, text, rule)));
		}

		return matches;
	}

	/**
	 * A helper function for building a tree from a specific rule.
	 */
	static async buildTree(syntax, rule, text, offset, additionalMatches) {
		let language;
		try {
			language = await syntax.getLanguage(rule.language);
		} catch (error) {
			if (syntax?.defaultOptions?.strict) {
				// Normalize any load error to LanguageNotFoundError for consistency:
				throw new LanguageNotFoundError(rule.language, {cause: error});
			} else {
				console.warn(
					`Syntax Warning: Failed to load language '${rule.language}' for building tree:`,
					error
				);
				return new Match(offset || 0, text.length, rule, text);
			}
		}

		if (!language) {
			if (syntax?.defaultOptions?.strict) {
				throw new LanguageNotFoundError(rule.language);
			} else {
				console.warn(
					`Syntax Warning: Language '${rule.language}' not found for building tree.`
				);
				// Return a simple match without children as fallback
				return new Match(offset || 0, text.length, rule, text);
			}
		}

		const match = await language.buildTree(
			syntax,
			text,
			offset,
			additionalMatches
		);

		Object.assign(match.expression, rule);

		return match;
	}

	/**
	 * Build a syntax tree from a given block of text.
	 */
	async buildTree(syntax, text, offset, additionalMatches) {
		offset = offset || 0;

		// Fixes code that uses \r\n for line endings
		text = text.replace(/\r/g, '');

		const matches = await this.getMatches(syntax, text);

		// Shift matches if offset is provided
		if (offset && offset > 0) {
			for (const match of matches) {
				match.shift(offset);
			}
		}

		const top = new Match(
			offset,
			text.length,
			{type: (await this.allNames(syntax)).join(' '), allow: '*', owner: this},
			text
		);

		// This sort is absolutely key to the tree insertion algorithm
		matches.sort(Match.sort);

		for (const match of matches) {
			top.insertAtEnd(match);
		}

		if (additionalMatches) {
			for (const match of additionalMatches) {
				top.insert(match, true);
			}
		}

		top.complete = true;

		return top;
	}

	/**
	 * Build a syntax tree and process it into HTML.
	 */
	async process(syntax, text, options) {
		const top = await this.buildTree(syntax, text, 0);

		const lines = top.splitLines();

		const html = document.createElement('code');
		html.className = 'syntax highlighted';
		html.setAttribute('part', 'code');

		for (const line of lines) {
			const processedLine = line.reduce(null, (container, match) => {
				if (match.expression) {
					if (match.expression.process) {
						container = match.expression.process(container, match, options);
					}

					if (match.expression.owner) {
						const process = match.expression.owner.processes[match.expression.type];
						if (process) {
							container = process(container, match, options);
						}
					}
				}
				return container;
			});

			html.appendChild(processedLine);
		}

		return html;
	}
}

export default Language;
