# @socketry/syntax

A modern, framework-agnostic syntax highlighter using Web Components. This is a reimplementation of [jQuery.Syntax](https://github.com/ioquatix/jquery-syntax) without jQuery dependencies.

## Features

- 🎨 **Modern Web Components** - Uses autonomous custom elements
- 📦 **Dynamic Loading** - Loads language definitions on-demand
- 🔒 **No Dependencies** - Pure JavaScript, no jQuery required
- 🎯 **Framework Agnostic** - Works with React, Vue, vanilla JS, etc.
- 🌲 **Clean Architecture** - Well-structured classes with clear responsibilities
- 🔐 **Private Fields** - Modern JavaScript with proper encapsulation

## Installation

```bash
npm install @socketry/syntax
```

## Usage

### Automatic Upgrade

The easiest way to use Syntax is to let it automatically upgrade existing `<code>` elements:

```html
<script type="module">
	import Syntax from '@socketry/syntax';
	
	// Automatically upgrade all code blocks with language classes
	document.addEventListener('DOMContentLoaded', async function() {
		await Syntax.highlight();
	});
</script>

<!-- Standard code blocks - will be automatically upgraded -->
<pre><code class="language-javascript">
const hello = "world";
console.log(hello);
</code></pre>

<p>Inline code: <code class="language-javascript">const x = 1;</code></p>
```

By default, `Syntax.highlight()` will:
- Find all `<code>` elements with class names matching `language-*` e.g., `language-javascript`, `language-python`.
- Replace them with `<syntax-code>` web components.
- Automatically detect if they're inside `<pre>` tags for proper wrapping behavior.

You can customize the selector:

```javascript
// Only upgrade specific elements:
await Syntax.highlight({
	selector: 'code.highlight'
});
```

### Manual Web Components

You can also use the `<syntax-code>` web component directly:

```html
<script type="module">
	import {Syntax} from '@socketry/syntax';
	
	// Disable automatic upgrade, just register the component:
	await Syntax.highlight({upgradeAll: false});
</script>

<!-- Use the web component directly -->
<syntax-code language="javascript">
	const hello = "world"; console.log(hello);
</syntax-code>

<!-- Inside a <pre> tag for block display with line wrapping -->
<pre><syntax-code language="python" wrap>
def greet(name):
    print(f"Hello, {name}!")
</syntax-code></pre>
```

### Programmatic Usage

```javascript
import Syntax from '@socketry/syntax';
import registerJavaScript from '@socketry/syntax/Language/javascript.js';

// Create a Syntax instance
const syntax = new Syntax();
registerJavaScript(syntax);

// Get the JavaScript language and process code:
const language = await syntax.getLanguage('javascript');
const code = 'const x = 10;';
const html = await language.process(code);
document.body.appendChild(html);
```

### The `wrap` Attribute

The `<syntax-code>` element automatically detects whether it's inside a `<pre>` tag:

- **Inside `<pre>`**: Sets `wrap` attribute, enables line wrapping with proper indentation.
- **Standalone**: No `wrap` attribute, uses horizontal scrolling for long lines.

You can manually control this:

```html
<!-- Force wrapping even outside <pre> -->
<syntax-code language="javascript" wrap>
const reallyLongLine = "This will wrap instead of scroll";
</syntax-code>

<!-- Disable wrapping even inside <pre> -->
<pre><syntax-code language="javascript">
const code = "This will scroll horizontally";
</syntax-code></pre>
```

## Command Line Tool

A simple CLI tool is included to inspect the AST (Abstract Syntax Tree) of parsed code:

```bash
node bin/syntax-ast.js <language> <code>
```

Examples:

```bash
# Parse JavaScript
node bin/syntax-ast.js javascript "const x = 1;"

# Parse Markdown
node bin/syntax-ast.js markdown '`inline code`'

# Parse Python
node bin/syntax-ast.js python "def foo(): pass"
```

Output shows all matched tokens with their type, position, length, and text:

```
Language: javascript
Code: "const x = 1;"

Matches: 3
────────────────────────────────────────────────────────────────────────────────
[keyword] @0..5 (5 chars)
  Text: "const"
[operator] @8..9 (1 chars)
  Text: "="
[constant] @10..11 (1 chars)
  Text: "1"
```

This is useful for:
- Debugging language definitions
- Understanding how code is tokenized
- Testing pattern matching
- Developing new language support
