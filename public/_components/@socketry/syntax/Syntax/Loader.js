export class Loader {
	#cache = new Map();
	#pending = new Map();
	#load;

	/**
	 * Create a new loader
	 * @param {Function} load - Async function that resolves the key to a resource.
	 */
	constructor(load) {
		this.#load = load;
	}

	/**
	 * Load a resource with automatic deduplication and caching.
	 * @param {string|URL} key - Unique identifier for the resource.
	 * @returns {Promise<any>} The loaded resource.
	 */
	async load(key) {
		const id = key.toString();

		// Return cached result if available:
		if (this.#cache.has(id)) {
			return this.#cache.get(id);
		}

		// Return pending promise if already fetching:
		if (this.#pending.has(id)) {
			return this.#pending.get(id);
		}

		// Start new fetch and track it:
		const promise = (async () => {
			try {
				const result = await this.#load(this, key);
				this.#cache.set(id, result);
				return result;
			} finally {
				this.#pending.delete(id);
			}
		})();

		this.#pending.set(id, promise);
		return promise;
	}

	/**
	 * Check if a resource is cached
	 */
	has(key) {
		return this.#cache.has(key.toString());
	}

	/**
	 * Get a cached resource (synchronous)
	 */
	get(key) {
		return this.#cache.get(key.toString());
	}

	/**
	 * Set a resource in the cache
	 */
	set(key, value) {
		this.#cache.set(key.toString(), value);
		return value;
	}

	/**
	 * Clear the cache
	 */
	clear() {
		this.#cache.clear();
		this.#pending.clear();
	}
}

export default Loader;
