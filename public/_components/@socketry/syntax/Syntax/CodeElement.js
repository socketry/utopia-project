import Syntax from '../Syntax.js';

const supportsAdopted =
	typeof CSSStyleSheet !== 'undefined' &&
	'adoptedStyleSheets' in Document.prototype;

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
	#adoptedHrefs = new Set();
	#highlighted = false;

	constructor() {
		super();
	}

	get syntax() {
		return this.#syntax || Syntax.default;
	}

	set syntax(value) {
		this.#syntax = value;
		// Re-render with new syntax instance if already connected:
		if (this.isConnected && !this.#highlighted) {
			this.#render();
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
		}

		this.#render();
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
			// Reset highlighted flag to allow re-rendering
			this.#highlighted = false;
			this.#adoptedHrefs.clear();
			this.#render();
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
	 * Get the code content to highlight
	 */
	#getCodeContent() {
		// Check if there's a <code> child element
		const codeElement = this.querySelector('code');
		if (codeElement) {
			return codeElement.textContent;
		}

		return this.textContent;
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

			const code = this.#getCodeContent();

			// Clear shadow DOM before rendering (must happen before appendChild to remove old content, but after loadStylesheets since fallback path may have appended <style> elements):
			this.#shadow.innerHTML = '';

			// Highlight and append - language.process() returns a <code> element:
			const highlighted = await language.process(this.syntax, code);
			this.#shadow.appendChild(highlighted);

			// Clear light DOM only after successful render to avoid losing content on errors:
			this.textContent = '';

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

		// Copy the code content into the wrapper
		wrapper.textContent = element.textContent;

		// Replace <code> with <syntax-code>, leaving <pre> parent in place
		const parent = element.parentElement;
		parent.replaceChild(wrapper, element);
	}
}

export {Syntax};
export default CodeElement;
