/**
 * Sidebar Navigation Highlighting
 * Progressive enhancement for sidebar navigation with scroll tracking
 */

(function() {
	'use strict';
	
	// Only run if we have a sidebar navigation
	const sidebarNav = document.querySelector('.sidebar nav');
	if (!sidebarNav) return;
	
	const navLinks = sidebarNav.querySelectorAll('a[href*="#"]');
	
	// Build a map of sidebar links by their fragment IDs
	const sidebarLinksByFragment = new Map();
	navLinks.forEach(link => {
		const href = link.getAttribute('href');
		const fragmentIndex = href.indexOf('#');
		if (fragmentIndex !== -1) {
			const fragment = href.substring(fragmentIndex + 1);
			sidebarLinksByFragment.set(fragment, link);
		}
	});
	
	if (sidebarLinksByFragment.size === 0) return;
	
	// Get all sections/headings on the page and annotate them with their sidebar link
	const allSections = Array.from(document.querySelectorAll('section, h1, h2, h3, h4, h5, h6'))
		.filter(el => el.id) // Only keep elements with IDs
		.map(el => {
			// Get the section element (section or heading's parent)
			const sectionElement = el.tagName === 'SECTION' ? el : (el.closest('section') || el.parentElement);
			return { element: sectionElement, id: el.id };
		});
	
	// Annotate each section with which sidebar link should be active
	// Walk through in DOM order and track the "last seen" sidebar link
	let lastSeenSidebarId = null;
	allSections.forEach(({element, id}) => {
		if (sidebarLinksByFragment.has(id)) {
			// This section has a sidebar link - use it
			lastSeenSidebarId = id;
		}
		// Annotate the section element with the sidebar link to activate
		if (lastSeenSidebarId) {
			element.dataset.sidebarLink = lastSeenSidebarId;
		}
	});
	
	// Build sections array with link references for active state tracking
	const sections = Array.from(sidebarLinksByFragment.entries()).map(([id, link]) => {
		let sectionElement = document.getElementById(id);
		
		if (!sectionElement && id !== CSS.escape(id)) {
			sectionElement = document.querySelector(`#${CSS.escape(id)}`);
		}
		
		if (sectionElement && sectionElement.tagName.match(/^H[1-6]$/)) {
			sectionElement = sectionElement.closest('section') || sectionElement.parentElement;
		}
		
		return sectionElement ? { link, sectionElement, id } : null;
	}).filter(Boolean);
	
	if (sections.length === 0) return;
	
	let currentActive = null;
	
	function updateActiveLink(updatePageState = true) {
		let activeSectionData = null;
		let smallestValidBottom = Infinity;
		let currentSectionElement = null;
		
		// Find which section the user is currently viewing
		allSections.forEach(({element}) => {
			const rect = element.getBoundingClientRect();
			const sectionBottom = rect.bottom;
			
			// Get the actual bottom padding for this section
			const bottomPadding = parseFloat(getComputedStyle(element).paddingBottom);
			
			// We want the section whose bottom is closest to the top but still visible
			if (sectionBottom > bottomPadding && sectionBottom < smallestValidBottom) {
				smallestValidBottom = sectionBottom;
				currentSectionElement = element;
			}
		});
		
		// Look up which sidebar link should be active using the data attribute
		if (currentSectionElement && currentSectionElement.dataset.sidebarLink) {
			const sidebarLinkId = currentSectionElement.dataset.sidebarLink;
			activeSectionData = sections.find(s => s.id === sidebarLinkId);
		}
		
		// If still no section found, fall back to the last section
		if (!activeSectionData && sections.length > 0) {
			activeSectionData = sections[sections.length - 1];
		}
		
		// Update active link
		if (activeSectionData !== currentActive) {
			// Remove previous active
			if (currentActive) {
				currentActive.link.classList.remove('active');
			}
			
			// Set new active
			if (activeSectionData) {
				activeSectionData.link.classList.add('active');
				currentActive = activeSectionData;
				
				if (updatePageState) {
					// Update URL fragment to reflect current section
					const newFragment = '#' + activeSectionData.id;
					if (window.location.hash !== newFragment) {
						history.replaceState(null, null, newFragment);
					}
					
					// Auto-scroll sidebar to keep active item visible
					scrollToActiveItem(activeSectionData.link);
				}
			} else {
				currentActive = null;
				
				if (updatePageState) {
					// Clear fragment if no active section
					if (window.location.hash) {
						history.replaceState(null, null, window.location.pathname);
					}
				}
			}
		}
	}
	
	function scrollToActiveItem(activeLink) {
		const sidebar = activeLink.closest('.sidebar');
		if (!sidebar) return;
		
		const sidebarRect = sidebar.getBoundingClientRect();
		const linkRect = activeLink.getBoundingClientRect();
		
		// Check if the active link is outside the visible area
		const isAbove = linkRect.top < sidebarRect.top;
		const isBelow = linkRect.bottom > sidebarRect.bottom;
		
		if (isAbove || isBelow) {
			// Calculate the ideal scroll position to center the active item
			const sidebarScrollTop = sidebar.scrollTop;
			const linkOffsetTop = linkRect.top - sidebarRect.top + sidebarScrollTop;
			const sidebarHeight = sidebarRect.height;
			const targetScrollTop = linkOffsetTop - (sidebarHeight / 2) + (linkRect.height / 2);
			
			// Smooth scroll the sidebar
			sidebar.scrollTo({
				top: Math.max(0, targetScrollTop),
				behavior: 'smooth'
			});
		}
	}
	
	// Throttled scroll handler
	let scrollTimer = null;
	
	function onScroll() {
		if (scrollTimer) return;
		
		scrollTimer = setTimeout(() => {
			updateActiveLink();
			scrollTimer = null;
		}, 100);
	}
	
	// Initialize and set up event listeners
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', updateActiveLink, { passive: true });
	
	// Initial update without changing page state (preserves URL fragments):
	updateActiveLink(false);
	
	// Smooth scroll enhancement for sidebar navigation links
	navLinks.forEach(link => {
		link.addEventListener('click', (event) => {
			const href = link.getAttribute('href');
			// Extract fragment from both "#section" and "page.html#section" formats
			const fragmentIndex = href.indexOf('#');
			if (fragmentIndex === -1) return;
			const fragment = href.substring(fragmentIndex + 1);
			
			// Try to find the target using the fragment
			let target = document.getElementById(fragment);
			
			// If not found, try with CSS.escape for special characters
			if (!target && fragment !== CSS.escape(fragment)) {
				target = document.querySelector(`#${CSS.escape(fragment)}`);
			}
			
			if (target) {
				event.preventDefault();
				
				// Update URL to trigger :target and let browser handle scrolling
				window.location.hash = fragment;
			}

			link.focus();
		});
	});
})();
