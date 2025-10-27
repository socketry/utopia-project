/**
 * Syntax - Core highlighting engine
 * A modern, framework-agnostic syntax highlighter
 *
 * @package @socketry/syntax
 * @author Samuel G. D. Williams
 * @license MIT
 */

import {Loader} from './Syntax/Loader.js';
import {
	LanguageNotFoundError,
	LanguageLoadError,
	StyleSheetLoadError
} from './Syntax/Errors.js';

export class Syntax {
	static #default = null;

	#root = null;
	#aliases = {};
	#languages = new Loader((loader, name) => this.#loadLanguage(loader, name));
	#styleSheets = new Loader((loader, url) => this.#loadStyleSheet(loader, url));
	#styles = {};
	#themes = {};
	#themeRoot = null; // Base URL for theme assets (CSS)

	#defaultOptions = {
		theme: 'base',
		linkify: true,
		strict: false
	};

	/**
	 * Get or create the default Syntax instance
	 */
	static get default() {
		if (!this.#default) {
			this.#default = new Syntax();
		}
		return this.#default;
	}

	/**
	 * Set a custom default Syntax instance
	 */
	static set default(instance) {
		this.#default = instance;
	}

	/**
	 * Detect the default root path for loading language modules
	 * Uses import.meta.url to reliably locate the Syntax module directory
	 */
	static detectRoot() {
		try {
			const url = new URL('./', import.meta.url);
			return url.href;
		} catch (error) {
			// Fallback: try document.currentScript (may not work reliably)
			if (
				typeof document !== 'undefined' &&
				document.currentScript &&
				document.currentScript.src
			) {
				const url = new URL(document.currentScript.src);
				return url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1);
			}
			// Last resort fallback
			return '/';
		}
	}

	/**
	 * Initialize syntax highlighting on the page
	 * Registers the web component and sets up the default syntax instance
	 * Languages will be auto-loaded on demand when referenced by elements
	 *
	 * @param {Object} options - Configuration options
	 * @param {Syntax} options.syntax - Syntax instance to use (defaults to Syntax.default)
	 * @param {boolean} options.upgradeAll - Whether to automatically upgrade existing elements (default: true)
	 * @param {string} options.selector - CSS selector for upgrading (default: 'code[class*="language-"]')
	 * @param {string} options.root - Base URL for loading language modules (default: auto-detected)
	 * @returns {Promise<void>}
	 */
	static async highlight(options = {}) {
		const {
			syntax = Syntax.default,
			upgradeAll: shouldUpgradeAll = true,
			selector = 'code[class*="language-"]',
			root = null
		} = options;

		// Set the default syntax instance:
		Syntax.default = syntax;

		// Configure root for auto-loading if provided:
		if (root && !syntax.root) {
			syntax.root = root;
		}

		// Import and register the web component:
		const {CodeElement, upgradeAll} = await import('./Syntax/CodeElement.js');

		if (!customElements.get('syntax-code')) {
			customElements.define('syntax-code', CodeElement);
		}

		// Upgrade existing code blocks if requested:
		if (shouldUpgradeAll) {
			if (upgradeAll) {
				// Use the upgradeAll function with the selector:
				upgradeAll(selector, syntax);
			} else {
				// Fallback to customElements.upgrade if the function isn't available:
				customElements.upgrade(document.body);
			}
		}
	}

	constructor(options = {}) {
		// Allow customization via constructor options
		if (options.root !== undefined) this.#root = options.root;
		if (options.theme !== undefined) this.#defaultOptions.theme = options.theme;
		if (options.themeRoot !== undefined) this.#themeRoot = options.themeRoot;

		// Set default root if not provided
		if (this.#root === null) {
			this.#root = Syntax.detectRoot();
		}
	}

	// Public getters for commonly accessed properties
	get defaultOptions() {
		return this.#defaultOptions;
	}

	get languages() {
		return this.#languages;
	}

	get aliases() {
		return this.#aliases;
	}

	get styles() {
		return this.#styles;
	}

	get themes() {
		return this.#themes;
	}

	// Theme root for CSS assets
	get themeRoot() {
		return this.#resolveThemeRoot().toString();
	}

	set themeRoot(value) {
		this.#themeRoot = value;
		// Clear the stylesheet cache when theme changes
		this.#styleSheets.clear();
	}

	get root() {
		return this.#root;
	}

	set root(value) {
		this.#root = value;
	}

	/**
	 * Resolve the base URL for the current theme's assets.
	 * Priority:
	 * 1) Explicit options.themeRoot or setter
	 * 2) Relative to this module location: ./themes/<theme>/
	 */
	#resolveThemeRoot() {
		try {
			if (this.#themeRoot) {
				return new URL(
					this.#themeRoot,
					typeof document !== 'undefined' ? document.baseURI : import.meta.url
				);
			}
			// Default to a folder next to Syntax.js
			return new URL(`./themes/${this.#defaultOptions.theme}/`, import.meta.url);
		} catch (error) {
			// As a last resort, fall back to root if provided or current location:
			const base =
				this.#root || (typeof location !== 'undefined' ? location.href : '');
			return new URL(`themes/${this.#defaultOptions.theme}/`, base);
		}
	}

	/**
	 * Fetch CSS for use in Shadow DOM
	 * Returns an object with {sheet, cssText} where sheet is a CSSStyleSheet (if supported)
	 * The result is cached and deduplicated across calls
	 */
	async getStyleSheet(url) {
		return this.#styleSheets.load(url);
	}

	/**
	 * Load a stylesheet from a URL
	 * Used internally by the stylesheet loader
	 */
	async #loadStyleSheet(loader, url) {
		const response = await fetch(url);
		if (!response.ok) {
			throw new StyleSheetLoadError(url.toString(), response.status);
		}
		const cssText = await response.text();

		// If CSSStyleSheet constructor is available, create and return a stylesheet:
		if (typeof CSSStyleSheet !== 'undefined') {
			const sheet = new CSSStyleSheet();
			await sheet.replace(cssText);
			return {sheet, cssText};
		}

		// Otherwise just return the text:
		return {cssText};
	}

	/**
	 * Load a language module from disk/network
	 * Used internally by the language loader
	 */
	async #loadLanguage(loader, name) {
		const path = `${this.#root}Syntax/Language/${name}.js`;
		let module;
		try {
			module = await import(path);
		} catch (error) {
			throw new LanguageLoadError(name, path, {cause: error});
		}
		
		// If the module exports a register function, call it with this instance
		if (typeof module.default === 'function') {
			module.default(this);
		}
		
		// After calling register, aliases have been registered. Re-resolve the name:
		let resolvedName = this.#aliases[name] || name;
		return loader.get(resolvedName);
	}

	/**
	 * Load a language module dynamically
	 */
	async getResource(name) {
		// First check if the language is already loaded (including via alias)
		const resolvedName = this.#aliases[name] || name;
		if (this.#languages.has(resolvedName)) {
			return this.#languages.get(resolvedName);
		}

		// Use the loader to deduplicate concurrent loads
		return this.#languages.load(resolvedName);
	}

	/**
	 * Register language aliases
	 */
	alias(name, aliases) {
		this.#aliases[name] = name;

		for (const alias of aliases) {
			this.#aliases[alias] = name;
		}
	}

	/**
	 * Register a language with this Syntax instance
	 */
	register(name, language) {
		// Store directly in the loader's cache using the new set() method
		this.#languages.set(name, language);

		// Also store in aliases if not already there
		if (!this.#aliases[name]) {
			this.#aliases[name] = name;
		}

		return language;
	}

	/**
	 * Get a language by name or alias
	 * Auto-loads the language if not already registered
	 */
	async getLanguage(name) {
		// Resolve alias
		const resolvedName = (this.#aliases[name] || name).toLowerCase();

		// If already loaded, return it
		if (this.#languages.has(resolvedName)) {
			return this.#languages.get(resolvedName);
		}

		// Otherwise, try to load it
		try {
			return await this.getResource(name);
		} catch (error) {
			if (this.#defaultOptions.strict && !(error instanceof LanguageLoadError)) {
				// If strict and not a load error, ensure a consistent error type:
				throw new LanguageNotFoundError(resolvedName, {cause: error});
			}
			throw error;
		}
	}

	/**
	 * Check if a language is already registered (synchronous)
	 */
	hasLanguage(name) {
		// Resolve alias
		const resolvedName = this.#aliases[name] || name;
		return this.#languages.has(resolvedName);
	}

	/**
	 * Get all aliases for a language
	 */
	languageAliases(language) {
		const aliases = [];

		for (const [name, target] of Object.entries(this.#aliases)) {
			if (target === language) {
				aliases.push(name);
			}
		}

		return aliases;
	}

	/**
	 * Get all language names (primary names, not aliases)
	 */
	languageNames() {
		const names = [];

		for (const [name, target] of Object.entries(this.#aliases)) {
			if (name === target) {
				names.push(name);
			}
		}

		return names;
	}
}

export default Syntax;
