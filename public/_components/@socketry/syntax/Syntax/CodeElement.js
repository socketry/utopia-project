import Syntax from '../Syntax.js';
import {Match} from './Match.js';

const supportsAdopted =
	typeof CSSStyleSheet !== 'undefined' &&
	'adoptedStyleSheets' in Document.prototype;

// These values are defined by the DOM standard. Keep them local so this code
// does not depend on a global `Node`, which may be unavailable in non-browser
// DOM implementations.
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;

/**
 * Extract the source text and existing markup as source-aligned matches.
 *
 * The highlighting pipeline can then insert these matches into the syntax
 * tree, preserving elements such as links while allowing their contents to
 * receive syntax highlighting.
 */
function extractCode(root) {
	let text = '';
	const matches = [];

	function extract(node) {
		if (node.nodeType === TEXT_NODE || node.nodeType === CDATA_SECTION_NODE) {
			text += node.nodeValue.replace(/\r/g, '');
			return;
		}

		if (node.nodeType !== ELEMENT_NODE) {
			return;
		}

		if (node.tagName === 'BR') {
			text += '\n';
			return;
		}

		const offset = text.length;
		let match = null;

		if (node !== root) {
			match = new Match(offset, 0, {element: node, force: true, allow: '*'}, '');
			matches.push(match);
		}

		for (const child of node.childNodes) {
			extract(child);
		}

		if (match) {
			match.length = text.length - offset;
			match.endOffset = text.length;
			match.value = text.slice(offset);
		}
	}

	extract(root);

	return {text, matches: matches.filter(match => match.length > 0)};
}

/**
 * CodeElement - Web Component for syntax highlighting with isolated styles
 *
 * Usage:
 *   <syntax-code language="javascript">const x = 1;</syntax-code>
 *   <pre><syntax-code language="ruby">puts "Hello"</syntax-code></pre>
 */
export class CodeElement extends HTMLElement {
	static get observedAttributes() {
		return ['language', 'theme', 'wrap'];
	}

	#syntax = null;
	#shadow;
	#slot = null;
	#rendered = null;
	#adoptedHrefs = new Set();
	#highlighted = false;

	constructor() {
		super();

		/**
		 * A promise that resolves when the current highlighting attempt completes.
		 * Check `highlighted` before using line measurement APIs.
		 * @type {Promise<void>}
		 */
		this.ready = Promise.resolve();
	}

	get syntax() {
		return this.#syntax || Syntax.default;
	}

	set syntax(value) {
		this.#syntax = value;
		// Re-render with new syntax instance if already connected:
		if (this.isConnected && !this.#highlighted) {
			this.ready = this.#render();
		}
	}

	get language() {
		return (
			this.getAttribute('language') ||
			this.#detectLanguageFromClass()
		);
	}

	set language(value) {
		if (value == null) {
			this.removeAttribute('language');
		} else {
			this.setAttribute('language', value);
		}
	}

	get theme() {
		return this.getAttribute('theme') || this.syntax.defaultOptions.theme;
	}

	set theme(value) {
		if (value == null) {
			this.removeAttribute('theme');
		} else {
			this.setAttribute('theme', value);
		}
	}

	get wrap() {
		return this.hasAttribute('wrap');
	}

	set wrap(value) {
		if (value) {
			this.setAttribute('wrap', '');
		} else {
			this.removeAttribute('wrap');
		}
	}

	/**
	 * Get the bounding client rect of a specific line (1-based).
	 * @param {number} lineNumber - The 1-based line number.
	 * @returns {DOMRect|null} The bounding rect, or null if not found.
	 */
	getLineBoundingClientRect(lineNumber) {
		if (!this.#shadow) return null;

		const code = this.#shadow.querySelector('code');
		if (!code) return null;

		const lines = code.children;
		if (lineNumber < 1 || lineNumber > lines.length) return null;

		return lines[lineNumber - 1].getBoundingClientRect();
	}

	/**
	 * Get the total number of rendered lines.
	 * @returns {number} The line count, or 0 if not yet rendered.
	 */
	get lineCount() {
		if (!this.#shadow) return 0;

		const code = this.#shadow.querySelector('code');
		if (!code) return 0;

		return code.children.length;
	}

	/**
	 * Whether the current highlighting attempt has completed successfully.
	 * @returns {boolean}
	 */
	get highlighted() {
		return this.#highlighted;
	}

	connectedCallback() {
		// Detect if we're inside a <pre> element and set wrap attribute
		if (this.parentElement?.tagName === 'PRE') {
			this.wrap = true;
		}

		// Don't re-highlight if already done
		if (this.#highlighted) {
			return;
		}

		if (!this.#shadow) {
			this.#shadow = this.attachShadow({mode: 'open'});
			this.#slot = document.createElement('slot');
			this.#shadow.appendChild(this.#slot);
		}

		this.ready = this.#render();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) {
			return;
		}

		if (
			(name === 'language' || name === 'theme' || name === 'wrap') &&
			this.isConnected &&
			this.#shadow
		) {
			// Reset highlighted state and track the new render attempt:
			this.#highlighted = false;
			this.#adoptedHrefs.clear();
			this.ready = this.#render();
		}
	}

	/**
	 * Detect language from class names (e.g., language-javascript, brush-ruby)
	 */
	#detectLanguageFromClass() {
		const classes = this.className.split(/\s+/);

		for (const cls of classes) {
			// Match language-* or brush-* patterns
			const match = cls.match(/^(?:language|brush)-(.+)$/);
			if (match) {
				return match[1];
			}
		}

		return null;
	}

	/**
	 * Get the source text and existing markup to highlight.
	 */
	#getCodeContent() {
		// Check if there's a <code> child element
		const codeElement = this.querySelector('code');
		if (codeElement) {
			return extractCode(codeElement);
		}

		return extractCode(this);
	}

	/**
	 * Load theme CSS into shadow root
	 */
	async #loadStylesheets(languageName) {
		// Guard: ensure shadow root exists
		if (!this.#shadow) {
			return;
		}

		const themeRoot = new URL(
			this.syntax.themeRoot,
			typeof document !== 'undefined' ? document.baseURI : import.meta.url
		);

		const urls = [
			new URL('syntax.css', themeRoot),
			new URL(`${languageName}.css`, themeRoot)
		];

		if (supportsAdopted && this.#shadow.adoptedStyleSheets !== undefined) {
			const sheets = Array.from(this.#shadow.adoptedStyleSheets);
			for (const url of urls) {
				const href = url.toString();
				if (this.#adoptedHrefs.has(href)) continue;
				try {
					const result = await this.syntax.getStyleSheet(url);
					if (result.sheet) {
						sheets.push(result.sheet);
						this.#adoptedHrefs.add(href);
					}
				} catch (error) {
					console.warn(`Failed to load ${href}:`, error);
				}
			}
			this.#shadow.adoptedStyleSheets = sheets;
		} else {
			// Fallback: inline <style> tags in shadow root
			for (const url of urls) {
				const href = url.toString();
				if (this.#adoptedHrefs.has(href)) continue;
				try {
					const result = await this.syntax.getStyleSheet(url);
					const style = document.createElement('style');
					style.textContent = result.cssText;
					this.#shadow.appendChild(style);
					this.#adoptedHrefs.add(href);
				} catch (error) {
					console.warn(`Failed to load ${href}:`, error);
				}
			}
		}
	}

	/**
	 * Perform syntax highlighting and render into shadow DOM
	 */
	async #render() {
		try {
			const languageName = this.language;
			const {text: code, matches} = this.#getCodeContent();

			if (!languageName) {
				console.warn('<syntax-code>: No language specified');
				return;
			}

			// Get or auto-load the language
			const language = await this.syntax.getLanguage(languageName);

			if (!language) {
				console.warn(
					`<syntax-code>: Language '${languageName}' not found and could not be loaded`
				);
				return;
			}

			// Load theme CSS into shadow root using the language's canonical name
			await this.#loadStylesheets(language.name);

			// Highlight off-DOM so the original source remains visible while all
			// asynchronous work is in progress:
			const highlighted = await language.process(
				this.syntax,
				code,
				undefined,
				matches
			);

			// Swap the completed rendering in synchronously. On the first render,
			// the slot keeps the light-DOM source visible. On subsequent renders,
			// keep the previous highlighted content visible until its replacement
			// is ready.
			if (this.#rendered) {
				this.#rendered.replaceWith(highlighted);
			} else if (this.#slot) {
				this.#slot.replaceWith(highlighted);
				this.#slot = null;
			} else {
				this.#shadow.appendChild(highlighted);
			}

			this.#rendered = highlighted;

			this.#highlighted = true;
		} catch (error) {
			console.warn('<syntax-code> render failed:', error);
		}
	}
}

/**
 * Auto-register the custom element
 */
if (
	typeof customElements !== 'undefined' &&
	!customElements.get('syntax-code')
) {
	customElements.define('syntax-code', CodeElement);
}

/**
 * Compatibility layer - upgrade existing code blocks to web components
 */
export function upgradeAll(selector, syntax = null) {
	const elements = document.querySelectorAll(selector);

	for (const element of elements) {
		// Create a syntax-code wrapper
		const wrapper = document.createElement('syntax-code');
		if (syntax) {
			wrapper.syntax = syntax;
		}

		// Try to detect language from various sources
		let language = element.getAttribute('lang') || element.getAttribute('language');

		if (!language) {
			// Check class names
			const classes = element.className.split(/\s+/);
			for (const cls of classes) {
				const match = cls.match(/^(?:language|brush)-(.+)$/);
				if (match) {
					language = match[1];
					break;
				}
			}
		}

		if (language) {
			wrapper.setAttribute('language', language);
		}

		// Move the source content into the wrapper so existing markup remains
		// available for extraction and re-rendering.
		while (element.firstChild) {
			wrapper.appendChild(element.firstChild);
		}

		// Replace <code> with <syntax-code>, leaving <pre> parent in place
		const parent = element.parentElement;
		parent.replaceChild(wrapper, element);
	}
}

export {Syntax};
export default CodeElement;
