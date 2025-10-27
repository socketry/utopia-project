import {Language} from '../Language.js';
import {Rule} from '../Rule.js';

const language = new Language('css');

var colorNames = [
	'AliceBlue',
	'AntiqueWhite',
	'Aqua',
	'Aquamarine',
	'Azure',
	'Beige',
	'Bisque',
	'Black',
	'BlanchedAlmond',
	'Blue',
	'BlueViolet',
	'Brown',
	'BurlyWood',
	'CadetBlue',
	'Chartreuse',
	'Chocolate',
	'Coral',
	'CornflowerBlue',
	'Cornsilk',
	'Crimson',
	'Cyan',
	'DarkBlue',
	'DarkCyan',
	'DarkGoldenRod',
	'DarkGray',
	'DarkGreen',
	'DarkKhaki',
	'DarkMagenta',
	'DarkOliveGreen',
	'Darkorange',
	'DarkOrchid',
	'DarkRed',
	'DarkSalmon',
	'DarkSeaGreen',
	'DarkSlateBlue',
	'DarkSlateGray',
	'DarkTurquoise',
	'DarkViolet',
	'DeepPink',
	'DeepSkyBlue',
	'DimGray',
	'DodgerBlue',
	'FireBrick',
	'FloralWhite',
	'ForestGreen',
	'Fuchsia',
	'Gainsboro',
	'GhostWhite',
	'Gold',
	'GoldenRod',
	'Gray',
	'Green',
	'GreenYellow',
	'HoneyDew',
	'HotPink',
	'IndianRed',
	'Indigo',
	'Ivory',
	'Khaki',
	'Lavender',
	'LavenderBlush',
	'LawnGreen',
	'LemonChiffon',
	'LightBlue',
	'LightCoral',
	'LightCyan',
	'LightGoldenRodYellow',
	'LightGrey',
	'LightGreen',
	'LightPink',
	'LightSalmon',
	'LightSeaGreen',
	'LightSkyBlue',
	'LightSlateGray',
	'LightSteelBlue',
	'LightYellow',
	'Lime',
	'LimeGreen',
	'Linen',
	'Magenta',
	'Maroon',
	'MediumAquaMarine',
	'MediumBlue',
	'MediumOrchid',
	'MediumPurple',
	'MediumSeaGreen',
	'MediumSlateBlue',
	'MediumSpringGreen',
	'MediumTurquoise',
	'MediumVioletRed',
	'MidnightBlue',
	'MintCream',
	'MistyRose',
	'Moccasin',
	'NavajoWhite',
	'Navy',
	'OldLace',
	'Olive',
	'OliveDrab',
	'Orange',
	'OrangeRed',
	'Orchid',
	'PaleGoldenRod',
	'PaleGreen',
	'PaleTurquoise',
	'PaleVioletRed',
	'PapayaWhip',
	'PeachPuff',
	'Peru',
	'Pink',
	'Plum',
	'PowderBlue',
	'Purple',
	'Red',
	'RosyBrown',
	'RoyalBlue',
	'SaddleBrown',
	'Salmon',
	'SandyBrown',
	'SeaGreen',
	'SeaShell',
	'Sienna',
	'Silver',
	'SkyBlue',
	'SlateBlue',
	'SlateGray',
	'Snow',
	'SpringGreen',
	'SteelBlue',
	'Tan',
	'Teal',
	'Thistle',
	'Tomato',
	'Turquoise',
	'Violet',
	'Wheat',
	'White',
	'WhiteSmoke',
	'Yellow',
	'YellowGreen'
];

var colorPatterns = ['#[0-9a-f]{3,6}', 'rgba?\\(.+?\\)', 'hsla?\\(.+?\\)'];

// Helper function to escape regex special characters
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper function to convert string to token pattern
function convertStringToTokenPattern(pattern, caseSensitive) {
	if (caseSensitive) {
		return escapeRegex(pattern);
	}
	return pattern;
}

var colorMatcher = [].concat(
	colorNames.map(function (pattern) {
		return '(' + convertStringToTokenPattern(pattern, true) + ')';
	}),
	colorPatterns.map(function (pattern) {
		return '(' + convertStringToTokenPattern(pattern, false) + ')';
	})
);

language.push({
	pattern: /\(.*?\)/,
	allow: '*',
	disallow: ['property']
});

language.push({
	pattern: /\s*([\:\.\[\]\"\'\=\s\w#\.\-,]+)\s+\{/m,
	matches: Rule.extractMatches({type: 'selector', allow: ['string']})
});

language.push({
	pattern: new RegExp(colorMatcher.join('|'), 'gi'),
	type: 'color',
	process: function (element, match) {
		if (!element.textContent) return element;

		var text = element.textContent;

		// Create color box container
		var colourBox = document.createElement('span');
		colourBox.className = 'colour-box';

		// Create sample color element
		var sampleColour = document.createElement('span');
		sampleColour.className = 'sample';
		sampleColour.style.backgroundColor = text;
		sampleColour.appendChild(document.createTextNode('  '));
		colourBox.appendChild(sampleColour);

		// Append to element
		element.appendChild(colourBox);
		return element;
	}
});

language.push(Rule.cStyleComment);
language.push(Rule.webLink);

language.push({
	pattern: /\{(.|\n)*?\}/,
	type: 'properties',
	allow: '*'
});

language.push({
	pattern: /\:(.*?(?=\})|(.|\n)*?(?=(\}|\;)))/,
	matches: Rule.extractMatches({
		type: 'value',
		allow: ['color'],
		only: ['properties']
	})
});

language.push({
	pattern: /([\-\w]+):/,
	matches: Rule.extractMatches({
		type: 'property',
		process: Rule.webLinkProcess('http://cssdocs.org/')
	})
});

// Strings
language.push(Rule.singleQuotedString);
language.push(Rule.doubleQuotedString);
language.push(Rule.stringEscape);

language.push(Rule.cStyleFunction);

export default function register(syntax) {
	syntax.register('css', language);
}
