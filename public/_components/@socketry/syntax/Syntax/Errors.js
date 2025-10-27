export class GenericSyntaxError extends Error {
	constructor(message, options = {}) {
		super(message, options);
		Object.defineProperty(this, 'name', {value: this.constructor.name});
	}
}

export class LanguageNotFoundError extends GenericSyntaxError {
	constructor(language, options = {}) {
		super(`Language not found: ${language}`, options);
		this.language = language;
	}
}

export class LanguageLoadError extends GenericSyntaxError {
	constructor(language, url, options = {}) {
		super(`Failed to load language '${language}' from ${url}`, options);
		this.language = language;
		this.url = url;
	}
}

export class StyleSheetLoadError extends GenericSyntaxError {
	constructor(url, status, options = {}) {
		super(`Failed to load stylesheet ${url} (status: ${status})`, options);
		this.url = url;
		this.status = status;
	}
}

export class RuleApplyError extends GenericSyntaxError {
	constructor(rule, options = {}) {
		const pattern =
			rule?.pattern instanceof RegExp
				? `/${rule.pattern.source}/${rule.pattern.flags}`
				: String(rule?.pattern);
		const type = rule?.type || rule?.klass || 'unknown';
		super(`Rule apply failed (type=${type}, pattern=${pattern})`, options);
		this.rule = rule;
	}
}

export class HighlightRenderError extends GenericSyntaxError {}

export default {
	GenericSyntaxError,
	LanguageNotFoundError,
	LanguageLoadError,
	StyleSheetLoadError,
	RuleApplyError,
	HighlightRenderError
};
