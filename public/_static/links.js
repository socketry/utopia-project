/**
 * Section Heading Links
 * Adds pilcrow (¶) self-links to section headings for easy linking
 */

export function initializeSectionHeadingLinks() {
	const sections = document.querySelectorAll('section[id]');
	
	sections.forEach(element => {
		const anchor = document.createElement('a');
		
		anchor.appendChild(document.createTextNode("¶"));
		anchor.href = "#" + element.id;
		anchor.className = "self";
		
		const heading = element.firstChild;
		if (heading) {
			anchor.title = heading.innerText;
			heading.appendChild(document.createTextNode(' '));
			heading.appendChild(anchor);
		}
	});
}
