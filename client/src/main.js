import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Import the root React component with .jsx extension
import { generateSummary } from './utils/updateSummaryBox.js';
import { getOpenAIApiKey, getPrivacyMode } from './components/sidebar_logic.js';

let sidebarInjected = false; // Flag to ensure it only injects once

function initMailMindSidebar() {
	if (sidebarInjected) {
		console.log('MailMind AI: Sidebar initialization already attempted.');
		return;
	}
	console.log('MailMind AI: initMailMindSidebar called.');

	// Use the proven target selector from the older version
	const targetContainer = document.querySelector('.aUx');

	if (targetContainer) {
		console.log('MailMind AI: Found target container (.aUx):', targetContainer);

		// Check if our specific sidebar container is already there
		if (document.getElementById('mailmind-sidebar-container')) {
			console.log(
				'MailMind AI: Sidebar container already exists in .aUx. Skipping re-injection.'
			);
			sidebarInjected = true;
			return;
		}

		const sidebarContainerElement = document.createElement('div');
		sidebarContainerElement.id = 'mailmind-sidebar-container';
		sidebarContainerElement.style.height = '100%'; // Add this line to make container fill parent height
		sidebarContainerElement.style.display = 'flex'; // Add this line for proper flex behavior

		// Use insertBefore as in the older version for this specific target
		targetContainer.insertBefore(
			sidebarContainerElement,
			targetContainer.firstChild
		);
		sidebarInjected = true;

		const root = ReactDOM.createRoot(sidebarContainerElement);
		root.render(
			<React.StrictMode>
				{/* onSummarize will be triggered by interactions within App.jsx that call handleEmailSelection */}
				<App onSummarize={handleEmailSelection} />
			</React.StrictMode>
		);
		console.log('MailMind AI: Sidebar injected into .aUx using React.');
		setupGlobalEmailClickListener(); // Setup click listener after successful injection
	} else {
		console.error(
			'MailMind AI: Target container (.aUx) not found. Sidebar cannot be injected here. Will rely on MutationObserver for other potential targets or retry.'
		);
		// If .aUx is critical, we might not want a fallback to body here,
		// but let the observer try to find it later if it appears dynamically.
		// For now, let's not append to body if .aUx is the primary strategy from old code.
	}
}

// This function is called by the App component (via onSummarize prop)
// when an action (like clicking "Select Email to Summarize" or an equivalent) happens.
// It then tries to find the currently active email in Gmail.
async function handleEmailSelection() {
	console.log('MailMind AI: handleEmailSelection triggered.');
	const emailItem = document.querySelector('.zA.yO'); // Try to find the currently opened email

	if (window.showSummaryViewInReact) {
		// Immediately switch to SummaryView with a loading message
		console.log(
			'MailMind AI: Immediately switching to SummaryView with loading state.'
		);
		window.showSummaryViewInReact({
			summary: 'Generating summary, please wait...',
			actionItems: [
				{
					id: 'loading-ai',
					text: 'Generating action items...',
					completed: false,
					isLoading: true,
				},
			], // Updated action items for loading state
			timeTaken: 0,
			// We can add an isLoading flag if App.jsx or SummaryView.jsx needs to behave differently
			// For now, the summary text itself indicates loading.
		});
	} else {
		console.error(
			'MailMind AI: window.showSummaryViewInReact is not available to show loading state.'
		);
		// If this happens, the UI won't switch immediately, which is not ideal.
	}

	if (emailItem) {
		console.log(
			'MailMind AI: Email item found (.zA.yO), proceeding with summary generation.'
		);
		// generateSummary will fetch the actual summary and call showSummaryViewInReact again with real data
		await generateSummary(emailItem);
	} else {
		console.warn(
			'MailMind AI: No active email item (.zA.yO) found to summarize after attempting to switch view.'
		);
		if (window.showSummaryViewInReact) {
			// Update the view from "Generating..." to an error/instruction message
			window.showSummaryViewInReact({
				summary:
					'Could not find an opened email to summarize. Please click an email to open it fully.',
				actionItems: [],
				timeTaken: 0,
				error: true, // You might add an error flag for App.jsx to handle if needed
			});
		}
	}
}

function setupGlobalEmailClickListener() {
	console.log('MailMind AI: Setting up global email click listener.');
	document.body.addEventListener(
		'click',
		function (event) {
			// .zA is a common class for individual email rows in the list view.
			const clickedEmailRow = event.target.closest('.zA');

			if (clickedEmailRow) {
				// Check if the click is on something interactive within the email row that SHOULDN'T trigger summary
				// e.g., checkboxes, star icons, archive buttons. These often have specific roles or child elements.
				// This is a basic check; more specific exclusions might be needed based on Gmail's exact structure.
				if (event.target.closest('input[type="checkbox"], .astar, .ar7')) {
					console.log(
						'MailMind AI: Clicked on an interactive element within email row, not summarizing.'
					);
					return;
				}

				console.log(
					'MailMind AI: Click detected on an email row (.zA). Triggering summary.',
					clickedEmailRow
				);
				// Ensure that the view is actually changing to an email *thread* view, not just a selection.
				// Gmail typically handles opening the email. We then call handleEmailSelection.
				// A small delay helps ensure Gmail has updated the DOM to reflect the opened email.
				setTimeout(() => {
					handleEmailSelection();
				}, 250); // Increased delay slightly to give Gmail more time to switch views
			}
		},
		true
	); // Use capture phase to catch clicks early, though bubbling (false) is often fine.
	console.log('MailMind AI: Global email click listener attached.');
}

// Fallback/Dynamic Injection Logic using MutationObserver
// This observer will attempt to inject if the initial `window.onload` fails or if the DOM changes later.
const observer = new MutationObserver((mutationsList, observerInstance) => {
	if (!sidebarInjected) {
		// Check if the target .aUx has appeared
		if (document.querySelector('.aUx')) {
			console.log(
				'MailMind AI: MutationObserver detected .aUx, attempting injection.'
			);
			initMailMindSidebar(); // Attempt to inject
		} else {
			// console.log('MailMind AI: MutationObserver: .aUx still not found.');
		}
	}
	// If sidebar is successfully injected, we might consider disconnecting to save resources.
	// However, Gmail is very dynamic, so it might be safer to leave it or make it more targeted.
	if (sidebarInjected && observerInstance) {
		// Check observerInstance to ensure it's valid
		// observerInstance.disconnect();
		// console.log("MailMind AI: Sidebar injected, MutationObserver disconnected.");
	}
});

// Initialize on window load - this is often more reliable for initial setup.
window.addEventListener('load', () => {
	console.log(
		'MailMind AI: Window loaded, attempting initial sidebar injection.'
	);
	initMailMindSidebar();

	// If sidebar wasn't injected on load (e.g., .aUx wasn't ready), start the observer.
	if (!sidebarInjected) {
		console.log(
			'MailMind AI: Initial injection failed (target .aUx not ready?), starting MutationObserver.'
		);
		observer.observe(document.body, { childList: true, subtree: true });
	} else {
		console.log('MailMind AI: Sidebar injected on window load.');
		// If injected on load, also set up the click listener if not already done by initMailMindSidebar
		// This is a bit redundant as initMailMindSidebar now calls it, but safe.
		if (!document.body.getAttribute('data-mailmind-listener-attached')) {
			// setupGlobalEmailClickListener(); // Already called in initMailMindSidebar if successful
		}
	}
});

console.log(
	'MailMind AI: main.js executed. Waiting for window load or DOM changes.'
);

// Make utility functions available to the React components if needed via window scope (not ideal, prefer imports)
// window.getOpenAIApiKey = getOpenAIApiKey;
// window.getPrivacyMode = getPrivacyMode;

// Remove old sidebar creation logic from here if it existed.
// const sidebar = createSummarySidebar(); // Old way
// document.body.appendChild(sidebar); // Old way
