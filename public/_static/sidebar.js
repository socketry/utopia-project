/**
 * Sidebar Navigation Highlighting
 * Progressive enhancement for sidebar navigation with scroll tracking
 */

class SidebarNavigation {
	static extractFragment(href) {
		const index = href.indexOf('#');
		return index !== -1 ? href.substring(index + 1) : null;
	}
	
	constructor(sidebarNav, sidebarLinksByFragment, allSections, sections, navLinks, sectionToSidebarLinkMap) {
		this.sidebarNav = sidebarNav;
		this.navLinks = navLinks;
		this.currentActive = null;
		this.sidebarLinksByFragment = sidebarLinksByFragment;
		this.allSections = allSections;
		this.sections = sections;
		this.sectionToSidebarLinkMap = sectionToSidebarLinkMap;
		
		// Store references for cleanup
		this.scrollTimer = null;
		this.scrollHandler = null;
		this.resizeHandler = null;
		this.clickHandlers = new Map();
		
		// Initialize
		this.setupEventListeners();
		
		// Initial update without changing page state (preserves URL fragments)
		this.updateActiveLink(false);
	}
	
	setupEventListeners() {
		// Throttled scroll handler
		this.scrollHandler = () => {
			if (this.scrollTimer) return;
			
			this.scrollTimer = setTimeout(() => {
				this.updateActiveLink();
				this.scrollTimer = null;
			}, 100);
		};
		
		this.resizeHandler = () => this.updateActiveLink();
		
		// Set up event listeners
		window.addEventListener('scroll', this.scrollHandler, { passive: true });
		window.addEventListener('resize', this.resizeHandler, { passive: true });
		
		// Smooth scroll enhancement for sidebar navigation links
		this.navLinks.forEach(link => {
			const clickHandler = (event) => {
				const href = link.getAttribute('href');
				const fragment = SidebarNavigation.extractFragment(href);
				
				if (!fragment) return;
				
				const target = document.getElementById(fragment);
				
				if (target) {
					event.preventDefault();
					
					// Update URL to trigger :target and let browser handle scrolling
					window.location.hash = fragment;
					
					link.focus();
				}
			};
			
			this.clickHandlers.set(link, clickHandler);
			link.addEventListener('click', clickHandler);
		});
	}
	
	destroy() {
		// Clear any pending timer
		if (this.scrollTimer) {
			clearTimeout(this.scrollTimer);
			this.scrollTimer = null;
		}
		
		// Remove window event listeners
		if (this.scrollHandler) {
			window.removeEventListener('scroll', this.scrollHandler);
			this.scrollHandler = null;
		}
		
		if (this.resizeHandler) {
			window.removeEventListener('resize', this.resizeHandler);
			this.resizeHandler = null;
		}
		
		// Remove click handlers from all links
		this.clickHandlers.forEach((handler, link) => {
			link.removeEventListener('click', handler);
		});
		this.clickHandlers.clear();
		
		// Clear the section-to-sidebar-link mapping
		this.sectionToSidebarLinkMap.clear();
		
		// Remove active class from current link
		if (this.currentActive) {
			this.currentActive.link.classList.remove('active');
			this.currentActive = null;
		}
	}
	
	findCurrentSection() {
		let smallestValidBottom = Infinity;
		let currentSectionElement = null;
		
		// Find which section the user is currently viewing
		this.allSections.forEach(({element}) => {
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
		
		// Look up which sidebar link should be active using the map
		if (currentSectionElement) {
			const sidebarLinkId = this.sectionToSidebarLinkMap.get(currentSectionElement);
			if (sidebarLinkId) {
				return this.sections.find(s => s.id === sidebarLinkId);
			}
		}
		
		// If no section found, fall back to the last section
		return this.sections.length > 0 ? this.sections[this.sections.length - 1] : null;
	}
	
	setActiveSection(activeSectionData) {
		// Remove previous active
		if (this.currentActive) {
			this.currentActive.link.classList.remove('active');
		}
		
		// Set new active
		if (activeSectionData) {
			activeSectionData.link.classList.add('active');
			this.currentActive = activeSectionData;
		} else {
			this.currentActive = null;
		}
	}
	
	updateUrlFragment(sectionId) {
		if (sectionId) {
			const newFragment = '#' + sectionId;
			if (window.location.hash !== newFragment) {
				history.replaceState(null, null, newFragment);
			}
		} else {
			// Clear fragment if no active section
			if (window.location.hash) {
				history.replaceState(null, null, window.location.pathname);
			}
		}
	}
	
	updateActiveLink(updatePageState = true) {
		const activeSectionData = this.findCurrentSection();
		
		// Only update if section changed
		if (activeSectionData !== this.currentActive) {
			this.setActiveSection(activeSectionData);
			
			if (updatePageState) {
				if (activeSectionData) {
					this.updateUrlFragment(activeSectionData.id);
					this.scrollToActiveItem(activeSectionData.link);
				} else {
					this.updateUrlFragment(null);
				}
			}
		}
	}
	
	scrollToActiveItem(activeLink) {
		// Use the sidebar nav container we already have
		const sidebar = this.sidebarNav.closest('.sidebar');
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
	
	// Static method to initialize with default selector
	static initialize(selector = '.sidebar nav') {
		const sidebarNav = document.querySelector(selector);
		if (!sidebarNav) return null;
		
		const navLinks = sidebarNav.querySelectorAll('a[href*="#"]');
		
		// Build a map of sidebar links by their fragment IDs
		const sidebarLinksByFragment = new Map();
		navLinks.forEach(link => {
			const href = link.getAttribute('href');
			const fragment = SidebarNavigation.extractFragment(href);
			
			if (fragment) {
				sidebarLinksByFragment.set(fragment, link);
			}
		});
		
		// Early exit if no sidebar links with fragments
		if (sidebarLinksByFragment.size === 0) return null;
		
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
		// Store mapping in a Map instead of mutating DOM with data attributes
		const sectionToSidebarLinkMap = new Map();
		let lastSeenSidebarId = null;
		allSections.forEach(({element, id}) => {
			if (sidebarLinksByFragment.has(id)) {
				// This section has a sidebar link - use it
				lastSeenSidebarId = id;
			}
			// Map the section element to the sidebar link to activate
			if (lastSeenSidebarId) {
				sectionToSidebarLinkMap.set(element, lastSeenSidebarId);
			}
		});
		
		// Build sections array with link references for active state tracking
		const sections = Array.from(sidebarLinksByFragment.entries()).map(([id, link]) => {
			let sectionElement = document.getElementById(id);
			
			if (sectionElement && sectionElement.tagName.match(/^H[1-6]$/)) {
				sectionElement = sectionElement.closest('section') || sectionElement.parentElement;
			}
			
			return sectionElement ? { link, sectionElement, id } : null;
		}).filter(Boolean);
		
		// Early exit if no valid sections found
		if (sections.length === 0) return null;
		
		// All checks passed - create the instance
		return new SidebarNavigation(sidebarNav, sidebarLinksByFragment, allSections, sections, navLinks, sectionToSidebarLinkMap);
	}
}

export { SidebarNavigation };
