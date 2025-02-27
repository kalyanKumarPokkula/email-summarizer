import { getFullEmailDetails } from './emailUtils.js';

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

export function updateSummaryBox(apiResponse) {
	const summaryParagraph = document.querySelector('.mail-summery p');
	const actionList = document.querySelector('.action-items ul');

	summaryParagraph.textContent = apiResponse.summary || 'Summary not found.'; // Display summary or default

	actionList.innerHTML = ''; // Clear existing action items

	if (apiResponse['actionItems'] && apiResponse['actionItems'].length > 0) {
		apiResponse['actionItems'].forEach((item) => {
			const li = document.createElement('li');
			li.textContent = item;
			actionList.appendChild(li);
		});
	} else {
		const li = document.createElement('li');
		li.textContent = 'No Action Items';
		actionList.appendChild(li);
	}
}

export async function generateSummary(emailItem) {
	const summaryParagraph = document.querySelector('.mail-summery p');
	const actionList = document.querySelector('.action-items ul');

	// Show loading state
	summaryParagraph.textContent = 'Loading summary...';
	actionList.innerHTML = '';
	const loadingLi = document.createElement('li');
	loadingLi.textContent = 'Fetching action items...';
	actionList.appendChild(loadingLi);

	try {
		await waitForEmailContentLoad();
		const fullEmailDetails = getFullEmailDetails(emailItem);

		const response = await fetch('http://localhost:8000/summarize', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email: fullEmailDetails }),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		console.log(data);
		updateSummaryBox(data);
	} catch (error) {
		console.error('Error processing email:', error);
		summaryParagraph.textContent = 'Failed to load summary.';
		actionList.innerHTML = '';
		const errorLi = document.createElement('li');
		errorLi.textContent = 'Failed to fetch action items.';
		actionList.appendChild(errorLi);
	}
}
