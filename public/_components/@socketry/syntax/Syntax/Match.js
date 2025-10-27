export class Match {
	// Public properties
	offset;
	endOffset;
	length;
	expression;
	type;
	value;
	children = [];
	parent = null;
	// A pointer to the next match if a match is bisected.
	next = null;
	complete;

	constructor(offset, length, expression, value) {
		this.offset = offset;
		this.endOffset = offset + length;
		this.length = length;

		// Handle expression being either a string (type) or an object
		if (typeof expression === 'string') {
			this.type = expression;
			this.expression = {type: expression};
		} else {
			this.expression = expression;
			this.type = expression?.type;
		}

		this.value = value;
	}

	/**
	 * Shifts an entire tree forward or backwards.
	 */
	shift(offset, text) {
		this.adjust(offset, null, text);

		for (const child of this.children) {
			child.shift(offset, text);
		}
	}

	/**
	 * Adjust the current match to have different offset and length.
	 */
	adjust(offset, length, text) {
		this.offset += offset;
		this.endOffset += offset;

		if (length) {
			this.length = length;
			this.endOffset = this.offset + length;
		}

		if (text) {
			this.value = text.substr(this.offset, this.length);
		}
	}

	/**
	 * Sort helper for sorting matches in forward order
	 */
	static sort(a, b) {
		return a.offset - b.offset || b.length - a.length;
	}

	/**
	 * Is the given match contained in the range of the parent match?
	 */
	contains(match) {
		return match.offset >= this.offset && match.endOffset <= this.endOffset;
	}

	/**
	 * Default reduce callback - converts nodes to DOM
	 */
	static defaultReduceCallback(node, container) {
		// We avoid using complex DOM manipulation for performance
		if (typeof node === 'string') {
			node = document.createTextNode(node);
		}

		container.appendChild(node);
	}

	/**
	 * Convert a tree of matches into DOM nodes
	 */
	reduce(append, process) {
		let start = this.offset;
		let container = null;

		if (this.expression && this.expression.element) {
			container = this.expression.element.cloneNode(false);
		} else {
			container = document.createElement('span');
		}

		append = append || Match.defaultReduceCallback;

		if (this.expression && this.expression.type) {
			if (container.className.length > 0) {
				container.className += ' ';
			}

			container.className += this.expression.type;
		}

		for (const child of this.children) {
			const end = child.offset;

			if (child.offset < this.offset) {
				console.warn(
					'Syntax Warning: Offset of child',
					child,
					'is before offset of parent',
					this
				);
			}

			const text = this.value.substr(start - this.offset, end - start);

			append(text, container);
			append(child.reduce(append, process), container);

			start = child.endOffset;
		}

		if (start === this.offset) {
			append(this.value, container);
		} else if (start < this.endOffset) {
			append(
				this.value.substr(start - this.offset, this.endOffset - start),
				container
			);
		} else if (start > this.endOffset) {
			console.warn(
				'Syntax Warning: Start position ' +
					start +
					' exceeds end of value ' +
					this.endOffset
			);
		}

		if (process) {
			container = process(container, this);
		}

		return container;
	}

	/**
	 * Main nesting check - can a match contain the given match?
	 */
	canContain(match) {
		// This is a special conditional for explicitly added ranges by the user.
		if (match.expression.force) {
			return true;
		}

		// Can't add anything into complete trees.
		if (this.complete) {
			return false;
		}

		// match.expression.only will be checked on insertion using this.canHaveChild(match)
		if (match.expression.only) {
			return true;
		}

		// If allow is undefined, default behaviour is no children.
		if (typeof this.expression.allow === 'undefined') {
			return false;
		}

		// false if {disallow: [..., type, ...]}
		if (
			Array.isArray(this.expression.disallow) &&
			this.expression.disallow.includes(match.expression.type)
		) {
			return false;
		}

		// true if {allow: '*'}
		if (this.expression.allow === '*') {
			return true;
		}

		// true if {allow: [..., type, ...]}
		if (
			Array.isArray(this.expression.allow) &&
			this.expression.allow.includes(match.expression.type)
		) {
			return true;
		}

		return false;
	}

	/**
	 * Return true if the given match can be spliced in as a child.
	 */
	canHaveChild(match) {
		const only = match.expression.only;

		if (only) {
			let cur = this;

			while (cur !== null) {
				if (only.includes(cur.expression.type)) {
					return true;
				}

				cur = cur.parent;

				// We don't traverse into other trees.
				if (cur && cur.complete) {
					break;
				}
			}

			return false;
		}

		return true;
	}

	/**
	 * Add a child into the list of children for a given match.
	 */
	#splice(i, match) {
		if (this.canHaveChild(match)) {
			this.children.splice(i, 0, match);
			match.parent = this;

			// For matches added using tags.
			if (!match.expression.owner) {
				match.expression.owner = this.expression.owner;
			}

			return this;
		} else {
			return null;
		}
	}

	/**
	 * Insert a match, potentially splitting the tree to fit.
	 */
	insert(match, whole) {
		if (!this.contains(match)) {
			return null;
		}

		if (whole) {
			let top = this,
				i = 0;
			while (i < top.children.length) {
				if (top.children[i].contains(match)) {
					top = top.children[i];
					i = 0;
				} else {
					i += 1;
				}
			}

			return top.#insertWhole(match);
		} else {
			return this.#insert(match);
		}
	}

	/**
	 * Insert a whole match, splitting children as needed.
	 */
	#insertWhole(match) {
		const parts = this.bisectAtOffsets([match.offset, match.endOffset]);
		this.children = [];

		if (parts[0]) {
			this.children = this.children.concat(parts[0].children);
		}

		if (parts[1]) {
			match.children = [];

			// Update the match's expression based on the current position in the tree:
			if (this.expression && this.expression.owner) {
				match.expression =
					this.expression.owner.getRuleForType(match.expression.type) ||
					match.expression;
			}

			for (const child of parts[1].children) {
				if (match.canContain(child)) {
					match.children.push(child);
				}
			}

			this.children.push(match);
		}

		if (parts[2]) {
			this.children = this.children.concat(parts[2].children);
		}

		return this;
	}

	/**
	 * Insert at end - optimized for sorted insertion.
	 */
	insertAtEnd(match) {
		if (!this.contains(match)) {
			console.error('Syntax Error: Child is not contained in parent node!');
			return null;
		}

		if (!this.canContain(match)) {
			return null;
		}

		if (this.children.length > 0) {
			const i = this.children.length - 1;
			const child = this.children[i];

			if (match.offset < child.offset) {
				// Displacement: Before or LHS Overlap
				if (match.force) {
					return this.#insert(match);
				} else {
					return null;
				}
			} else if (match.offset < child.endOffset) {
				if (match.endOffset <= child.endOffset) {
					// Displacement: Contains
					return child.insertAtEnd(match);
				} else {
					// Displacement: RHS Overlap
					if (match.force) {
						return this.#insert(match);
					} else {
						return null;
					}
				}
			} else {
				// Displacement: After
				return this.#splice(i + 1, match);
			}
		} else {
			// Displacement: Contains [but currently no children]
			return this.#splice(0, match);
		}
	}

	/**
	 * General insertion function that splits match over children.
	 */
	#insert(match) {
		if (this.children.length === 0) {
			return this.#splice(0, match);
		}

		for (let i = 0; i < this.children.length; i += 1) {
			const child = this.children[i];

			// If the match ends before this child, it must be before it.
			if (match.endOffset <= child.offset) {
				return this.#splice(i, match);
			}

			// If the match starts after this child, we continue.
			if (match.offset >= child.endOffset) {
				continue;
			}

			// First, the easiest case:
			if (child.contains(match)) {
				return child.#insert(match);
			}

			const parts = match.bisectAtOffsets([child.offset, child.endOffset]);

			if (parts[0]) {
				this.#splice(i, parts[0]);
			}

			if (parts[1]) {
				child.insert(parts[1]);
			}

			// Continue insertion at this level with remainder.
			if (parts[2]) {
				match = parts[2];
			} else {
				return this;
			}
		}

		// If we got this far, insert at the end.
		this.#splice(this.children.length, match);
	}

	/**
	 * Recursively bisect the tree at given offsets.
	 */
	bisectAtOffsets(splits) {
		const parts = [];
		let start = this.offset;
		let prev = null;
		const children = [...this.children];

		// Copy the array so we can modify it.
		splits = splits.slice(0);

		// We need to split including the last part.
		splits.push(this.endOffset);

		splits.sort((a, b) => a - b);

		for (let i = 0; i < splits.length; i += 1) {
			const offset = splits[i];

			if (offset > this.endOffset) {
				break;
			}

			if (offset < this.offset || offset - start === 0) {
				parts.push(null);
				start = offset;
				continue;
			}

			if (start < this.offset) {
				start = this.offset;
			}

			const match = new Match(start, offset - start, this.expression);
			match.value = this.value.substr(start - this.offset, match.length);

			if (prev) {
				prev.next = match;
			}

			prev = match;
			start = match.endOffset;
			parts.push(match);
		}

		splits.length = parts.length;

		for (let i = 0; i < parts.length; i += 1) {
			if (parts[i] === null) {
				continue;
			}

			while (children.length > 0) {
				if (children[0].endOffset <= parts[i].endOffset) {
					parts[i].children.push(children.shift());
				} else {
					break;
				}
			}

			if (children.length) {
				if (children[0].offset < parts[i].endOffset) {
					const children_parts = children.shift().bisectAtOffsets(splits);
					let j = 0;

					for (; j < children_parts.length; j += 1) {
						if (children_parts[j] === null) continue;

						parts[i + j].children.push(children_parts[j]);
					}

					i += children_parts.length - 2;
					splits.splice(0, children_parts.length - 2);
				}
			}

			splits.shift();
		}

		if (children.length) {
			console.error(
				'Syntax Error: Children nodes not consumed',
				children.length,
				' remaining!'
			);
		}

		return parts;
	}

	/**
	 * Split a match at points that match a specific pattern.
	 */
	split(pattern) {
		const splits = [];

		// Clone the regex and ensure it is global
		if (!pattern.global) {
			pattern = new RegExp(pattern.source, pattern.flags + 'g');
		}

		let match;
		while ((match = pattern.exec(this.value)) !== null) {
			splits.push(pattern.lastIndex);
		}

		const matches = this.bisectAtOffsets(splits);

		// Remove any null placeholders.
		return matches.filter(n => n);
	}

	/**
	 * Split into lines with indent/text structure.
	 */
	splitLines() {
		const lines = this.split(/\n/g);

		for (let i = 0; i < lines.length; i += 1) {
			const line = lines[i];
			const indentOffset = line.value.search(/\S/);

			const top = new Match(line.offset, line.length, line.expression, line.value);

			if (indentOffset > 0) {
				const parts = line.bisectAtOffsets([line.offset + indentOffset]);
				top.children = parts;
				parts[0].expression = {type: 'indent'};
				parts[1].expression = {type: 'text'};
			} else {
				line.expression = {type: 'text'};
				top.children = [line];
			}

			lines[i] = top;
		}

		return lines;
	}
}

export default Match;
