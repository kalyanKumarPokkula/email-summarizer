import './styles.css';
import { createSummarySidebar } from './components/sidebar.js';
import { monitorEmailClicks } from './components/emailMonitor.js';

function init() {
	const sidebar = createSummarySidebar();
	// Insert into Gmail's DOM
	const targetContainer = document.querySelector('.aUx');
	if (targetContainer) {
		targetContainer.insertBefore(sidebar, targetContainer.firstChild);
	} else {
		console.error('Target container (.aUx) not found.');
	}

	monitorEmailClicks();
}

// Initialize when the page loads
window.addEventListener('load', init);
