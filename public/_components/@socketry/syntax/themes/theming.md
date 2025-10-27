# Theming Guide

The `@socketry/syntax` library uses CSS custom properties (variables) with HSL colors to provide a flexible and maintainable theming system.

## Key Benefits

1. **Ultra Simple**: Change just 3 variables to create a complete theme
2. **Automatic Dark Mode**: Light and dark mode handled automatically
3. **Automatic Color Harmony**: All colors derived from one base color using hue rotation
4. **Easy Customization**: Override the base or individual colors as needed

## Theme Architecture

### The Base Color System

Everything derives from three base variables:

```css
:host {
	--syntax-base-hue: 270;           /* 0-360 degrees on the color wheel */
	--syntax-base-saturation: 60%;    /* How vibrant the colors are */
	--syntax-base-lightness: 50%;     /* How light/dark the colors are */
}
```

**Dark mode** just adjusts saturation and lightness:

```css
@media (prefers-color-scheme: dark) {
	:host {
		--syntax-base-saturation: 50%;  /* Slightly less saturated */
		--syntax-base-lightness: 70%;   /* Much lighter for dark backgrounds */
	}
}
```

### Automatic Color Derivation

All token colors are automatically calculated using hue rotation:

```css
--syntax-keyword: hsl(calc(var(--syntax-base-hue) + 30), ...);   /* 30° rotation */
--syntax-string: hsl(calc(var(--syntax-base-hue) - 90), ...);    /* 90° opposite */
--syntax-function: hsl(calc(var(--syntax-base-hue) - 60), ...);  /* 60° rotation */
/* etc. */
```

This ensures all colors are harmonious and work together!

## Creating Custom Themes

### Method 1: Change the Base Hue (Recommended)

The simplest approach - just pick a different base color:

```css
.ocean-theme {
	--syntax-base-hue: 200;  /* Blue - everything becomes ocean-themed! */
}

.sunset-theme {
	--syntax-base-hue: 30;   /* Orange - warm sunset colors */
}

.forest-theme {
	--syntax-base-hue: 140;  /* Green - natural forest palette */
}
```

Then apply it:

```html
<syntax-code language="javascript" class="ocean-theme">
	// Your code here
</syntax-code>
```

### Method 2: Adjust Saturation and Lightness

For more subtle themes:

```css
.pastel-theme {
	--syntax-base-saturation: 40%;  /* Less vibrant */
	--syntax-base-lightness: 65%;   /* Lighter */
}

.vivid-theme {
	--syntax-base-saturation: 90%;  /* Very saturated */
	--syntax-base-lightness: 45%;   /* Slightly darker */
}
```

### Method 3: Override Specific Colors

For fine-grained control:

```css
.custom-theme {
	--syntax-base-hue: 280;  /* Purple base */
	
	/* But make strings green instead of the derived color */
	--syntax-string: hsl(120, 60%, 40%);
}
```

### Method 4: Custom Dark Mode

Override dark mode values for specific themes:

```css
.my-theme {
	--syntax-base-hue: 200;
}

@media (prefers-color-scheme: dark) {
	.my-theme {
		/* Different hue in dark mode */
		--syntax-base-hue: 180;
		--syntax-base-saturation: 45%;
		--syntax-base-lightness: 75%;
	}
}
```

## Token Types

All token types automatically get colors derived from the base. You can override individual ones if needed:

### Programming Language Tokens

- `keyword` - Language keywords (if, function, class)
- `string` - String literals
- `comment` - Code comments
- `number` - Numeric literals
- `operator` - Operators (+, -, *, etc.)
- `function` - Function names
- `constant` - Constants and literals
- `type` - Type names
- `preprocessor` - Preprocessor directives
- `access` - Access modifiers (public, private)
- `escape` - Escape sequences

### HTML/XML Tokens

- `tag` - HTML/XML tags
- `tag-name` - Tag names
- `attribute` - Attributes
- `entity` - HTML entities
- `doctype` - DOCTYPE declarations
- `cdata` - CDATA sections

### Semantic Markdown Tokens

- `heading` - Headers (# Heading)
- `strong` - Bold text (**bold**)
- `emphasis` - Italic text (*italic*)
- `code` - Code blocks and inline code
- `link` - Links and images
- `quote` - Blockquotes
- `list-marker` - List markers

## Dark Mode

Dark mode colors are automatically applied using `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
	:host {
		--syntax-keyword: hsl(var(--syntax-hue-primary), 50%, 70%);
		/* Automatically lighter and less saturated for dark backgrounds */
	}
}
```

You can override dark mode colors in your custom theme:

```css
.my-theme {
	--syntax-keyword: hsl(300, 80%, 40%);
}

@media (prefers-color-scheme: dark) {
	.my-theme {
		--syntax-keyword: hsl(300, 60%, 75%);
	}
}
```

## Example Themes

### Monochrome

```css
.monochrome {
	--syntax-keyword: hsl(0, 0%, 20%);
	--syntax-string: hsl(0, 0%, 30%);
	--syntax-comment: hsl(0, 0%, 60%);
	--syntax-function: hsl(0, 0%, 25%);
}
```

### High Contrast

```css
.high-contrast {
	--syntax-hue-primary: 270;
	/* Increase saturation and contrast */
	--syntax-keyword: hsl(var(--syntax-hue-primary), 100%, 30%);
	--syntax-string: hsl(0, 100%, 35%);
	--syntax-comment: hsl(0, 0%, 40%);
}
```

### Pastel

```css
.pastel {
	/* Use same hues but with high lightness and low saturation */
	--syntax-keyword: hsl(var(--syntax-hue-primary), 40%, 60%);
	--syntax-string: hsl(var(--syntax-hue-tertiary), 40%, 60%);
	--syntax-comment: hsl(var(--syntax-hue-neutral), 20%, 70%);
}
```

## Tips

1. **Hue Relationships**: Use complementary (180° apart) or analogous (30° apart) hues for harmony
2. **Saturation**: Lower saturation (20-40%) for subtle themes, higher (70-90%) for vibrant themes
3. **Lightness**: Keep 30-50% for light mode, 60-80% for dark mode
4. **Contrast**: Ensure sufficient contrast between text and background (WCAG AA: 4.5:1 minimum)
5. **Testing**: Test themes in both light and dark mode
6. **Consistency**: Use the hue variables to maintain color relationships across tokens
