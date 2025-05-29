import { getFullEmailDetails } from './emailUtils.js';
// The getPrivacyMode and getOpenAIApiKey will be imported into App.jsx or sidebar_logic.js
// No longer directly needed here if generateSummary is only about fetching and passing data.

export function waitForEmailContentLoad() {
	return new Promise((resolve) => {
		const checkInterval = setInterval(() => {
			if (document.querySelector('.ii.gt')) {
				// Check if email content selector exists
				clearInterval(checkInterval);
				resolve();
			}
		}, 200); // Check every 200ms
		setTimeout(() => {
			// Optional timeout to prevent indefinite waiting
			clearInterval(checkInterval);
			// console.error('Timeout waiting for email content to load.');
			resolve(); // Resolve anyway to proceed with potentially incomplete content
		}, 10000); // Timeout after 10 seconds (adjust as needed)
	});
}

// updateSummaryBox is no longer needed as React will handle DOM updates.
// export function updateSummaryBox(apiResponse, timeTaken) { ... }

export async function generateSummary(emailItem) {
	// Loading state will be handled by React component now.
	// const summaryParagraph = document.querySelector('.mail-summery p');
	// const actionList = document.querySelector('.action-items ul');
	// const timerElement = document.querySelector('.summary-timer');

	console.log('generateSummary called for email item:', emailItem);

	try {
		const startTime = performance.now();
		await waitForEmailContentLoad();
		const fullEmailDetails = getFullEmailDetails(emailItem);

		// Fetch privacy mode and API key for the request
		const privacyMode = localStorage.getItem('privacyMode') === 'true';
		const apiKey = localStorage.getItem('openai_api_key');

		const requestBody = {
			email: fullEmailDetails,
			privacy_mode: privacyMode,
			// Conditionally add API key if not in privacy mode and key exists
		};
		if (!privacyMode && apiKey) {
			requestBody.openai_api_key = apiKey;
		}

		const response = await fetch('http://localhost:8000/summarize', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		const endTime = performance.now();
		const timeTaken = (endTime - startTime) / 1000;

		console.log(`Summary generated in ${timeTaken.toFixed(1)} seconds`, data);

		// Call the function exposed by React to update the UI
		if (window.showSummaryViewInReact) {
			window.showSummaryViewInReact({
				summary: data.summary,
				actionItems: data.actionItems,
				timeTaken: timeTaken,
			});
		} else {
			console.error(
				'React callback function (showSummaryViewInReact) not found.'
			);
		}
	} catch (error) {
		console.error('Error processing email:', error);
		// Optionally, update React view with error state
		if (window.showSummaryViewInReact) {
			window.showSummaryViewInReact({
				summary: 'Failed to load summary.',
				actionItems: ['Failed to fetch action items.'],
				timeTaken: 0,
				error: true,
			});
		}
	}
}
