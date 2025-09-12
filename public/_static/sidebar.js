/**
 * Sidebar Navigation Highlighting
 * Progressive enhancement for sidebar navigation with scroll tracking
 */

(function() {
	'use strict';
	
	// Only run if we have a sidebar navigation
	const sidebarNav = document.querySelector('.sidebar nav');
	if (!sidebarNav) return;
	
	const navLinks = sidebarNav.querySelectorAll('a[href^="#"]');
	const sections = Array.from(navLinks).map(link => {
		const href = link.getAttribute('href').substring(1);
		// Try to find the section element using the href as-is first
		let sectionElement = document.getElementById(href);
		
		// If not found, try with CSS.escape for special characters
		if (!sectionElement && href !== CSS.escape(href)) {
			sectionElement = document.querySelector(`#${CSS.escape(href)}`);
		}
		
		// The element we found should be the section container, not just the heading
		// If it's a heading, find its parent section
		if (sectionElement && sectionElement.tagName.match(/^H[1-6]$/)) {
			sectionElement = sectionElement.closest('section') || sectionElement.parentElement;
		}
		
		return { link, sectionElement, id: href };
	}).filter(item => item.sectionElement);
	
	if (sections.length === 0) return;
	
	let currentActive = null;
	
	function updateActiveLink(updatePageState = true) {
		let activeSectionData = null;
		let smallestValidBottom = Infinity;
		
		// Find the section with the smallest bottom position that is still >= 0
		// This gives us the section that we're currently reading through
		sections.forEach((sectionData) => {
			const { sectionElement } = sectionData;
			const rect = sectionElement.getBoundingClientRect();
			const sectionBottom = rect.bottom;
			
			// Get the actual bottom padding for this section
			const bottomPadding = parseFloat(getComputedStyle(sectionElement).paddingBottom);
			
			// We want the section whose bottom is closest to the top but still visible
			if (sectionBottom > bottomPadding && sectionBottom < smallestValidBottom) {
				smallestValidBottom = sectionBottom;
				activeSectionData = sectionData;
			}
		});
		
		// If no section has bottom >= 0, fall back to the last section
		// (meaning we've scrolled past all content)
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
			const href = link.getAttribute('href').substring(1);
			// Try to find the target using the href as-is first
			let target = document.getElementById(href);
			
			// If not found, try with CSS.escape for special characters
			if (!target && href !== CSS.escape(href)) {
				target = document.querySelector(`#${CSS.escape(href)}`);
			}
			
			if (target) {
				event.preventDefault();
				
				// Update URL to trigger :target and let browser handle scrolling
				window.location.hash = href;
			}

			link.focus();
		});
	});
})();
