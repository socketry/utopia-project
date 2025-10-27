/**
 * Application Initialization
 * Main entry point for client-side functionality
 */

// Import dependencies:
import {Syntax} from '@socketry/syntax';
import mermaid from 'mermaid';
import {initializeSectionHeadingLinks} from './links.js';
import {SidebarNavigation} from './sidebar.js';

// Initialize Mermaid with theme detection:
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = isDarkMode ? 'dark' : 'default';
mermaid.initialize({startOnLoad: true, theme: theme});

// Initialize section self-links:
initializeSectionHeadingLinks();

// Initialize sidebar navigation:
SidebarNavigation.initialize();

// Initialize syntax highlighting:
await Syntax.highlight();
