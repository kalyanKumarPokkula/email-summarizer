function createSummarySidebar() {
	// Create sidebar container
	const sidebar = document.createElement('div');
	sidebar.className = 'summary-sidebar';

	// Create main container structure
	const container = document.createElement('div');
	container.className = 'container';

	// Create header
	const header = document.createElement('header');
	const headerText = document.createElement('h1');
	headerText.innerHTML = 'MailMind AI ✨';
	header.appendChild(headerText);

	// Create summary box (hidden initially)
	const summaryBox = document.createElement('div');
	summaryBox.className = 'summery-box';
	summaryBox.style.display = 'none';

	// Mail summary section (now will hold combined subject and content)
	const mailSummary = document.createElement('div');
	mailSummary.className = 'mail-summery';
	const summaryParagraph = document.createElement('p'); // Element to hold summary from API
	mailSummary.appendChild(summaryParagraph);

	// Action items section
	const actionItems = document.createElement('div');
	actionItems.className = 'action-items';
	const actionHeader = document.createElement('h3');
	actionHeader.textContent = 'Action Items:';
	const actionList = document.createElement('ul');
	actionItems.appendChild(actionHeader);
	actionItems.appendChild(actionList);

	// Action buttons
	const actionButtons = document.createElement('div');
	actionButtons.className = 'actionButtons';
	const copyButton = document.createElement('button');
	copyButton.textContent = 'Copy';
	const replyButton = document.createElement('button');
	replyButton.textContent = 'Reply';
	const doubleCheckButton = document.createElement('button');
	doubleCheckButton.textContent = 'Double Check';

	actionButtons.appendChild(copyButton);
	actionButtons.appendChild(doubleCheckButton);
	actionButtons.appendChild(replyButton);

	// Assemble summary box
	summaryBox.appendChild(mailSummary); // `mailSummary` with `summaryParagraph` is now the first child
	summaryBox.appendChild(actionItems);
	summaryBox.appendChild(actionButtons);

	// Create intro copy (visible initially)
	const introCopy = document.createElement('div');
	introCopy.className = 'intoCopy';
	const introHeader = document.createElement('h2');
	introHeader.innerHTML =
		'🚀 <span style="color: #32cd32;">Supercharge</span> your gmail with <span style="color: #32cd32;">MailMind AI</span>';
	const introText = document.createElement('p');
	introText.textContent =
		'Tired of reading long emails? MailMind AI brings AI-powered summaries right into your Gmail sidebar. Instantly get the key points, copy, double-check, or reply in seconds—saving you time and effort. Stay focused, work smarter, and never miss important details again!';

	const featureContainer = document.createElement('div');
	// Create the heading
	const heading = document.createElement('h3');
	heading.textContent = 'What can we do with MailMind AI?';
	featureContainer.appendChild(heading);
	// Create the list
	const list = document.createElement('ul');
	const features = ['Get Summary', 'Get Action Item (if any)', 'Double Check'];
	features.forEach((featureText) => {
		const listItem = document.createElement('li');
		listItem.textContent = featureText;
		list.appendChild(listItem);
	});
	featureContainer.appendChild(list);

	const tryNowBtn = document.createElement('button');
	tryNowBtn.textContent = 'Try Now ✨ (by selecting mail)';

	introCopy.appendChild(introHeader);
	introCopy.appendChild(introText);
	introCopy.appendChild(featureContainer);
	introCopy.appendChild(tryNowBtn);

	// Assemble container
	container.appendChild(header);
	container.appendChild(summaryBox);
	container.appendChild(introCopy);
	sidebar.appendChild(container);

	// Insert into Gmail's DOM
	const targetContainer = document.querySelector('.aUx');
	if (targetContainer) {
		targetContainer.insertBefore(sidebar, targetContainer.firstChild);
	} else {
		console.error('Target container (.aUx) not found.');
	}

	// Add button functionality
	copyButton.addEventListener('click', () => {
		const summaryText = document.querySelector('.mail-summery p').textContent;
		copyToClipboard(summaryText);
	});

	doubleCheckButton.addEventListener('click', () => {
		// Implement double check functionality
		console.log('Double check clicked');
	});

	replyButton.addEventListener('click', () => {
		// Implement reply functionality
		console.log('Reply clicked');
	});

	monitorEmailClicks();
}

async function monitorEmailClicks() {
	document.addEventListener('click', async (event) => {
		// Make the event listener async
		const emailItem = event.target.closest('.zA');
		if (emailItem) {
			const summaryBox = document.querySelector('.summery-box');
			const introCopy = document.querySelector('.intoCopy');
			const summaryParagraph = document.querySelector('.mail-summery p');
			const actionList = document.querySelector('.action-items ul');

			// Show loading state
			summaryParagraph.textContent = 'Loading summary...';
			actionList.innerHTML = '';
			const loadingLi = document.createElement('li');
			loadingLi.textContent = 'Fetching action items...';
			actionList.appendChild(loadingLi);

			// Toggle visibility
			introCopy.style.display = 'none';
			summaryBox.style.display = 'block';

			try {
				await waitForEmailContentLoad(); // Wait for email content to load
				const fullEmailDetails = getFullEmailDetails(emailItem);

				const response = await fetch('http://localhost:8000/summarize', {
					// Wait for API response
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
	});
}

function waitForEmailContentLoad() {
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
			console.error('Timeout waiting for email content to load.');
			resolve(); // Resolve anyway to proceed with potentially incomplete content
		}, 10000); // Timeout after 10 seconds (adjust as needed)
	});
}

function getEmailSubject(emailItem) {
	// **Important: Inspect the DOM to find the correct selector for the subject.
	//  `.ha h2` or `.hP` are common, but might need adjustment.**
	const subjectElement = emailItem.querySelector('.ha h2'); // Try to find subject within the clicked email item context
	if (subjectElement) {
		return subjectElement.textContent.trim();
	} else {
		console.warn(
			'Subject element not found with selector ".ha h2" within email item. Trying a broader search.'
		);
		const broaderSubjectElement = document.querySelector('.hP'); // Fallback selector - might need further DOM inspection
		if (broaderSubjectElement) {
			return broaderSubjectElement.textContent.trim();
		} else {
			console.warn(
				'Subject element not found with selector ".hP" either. Subject might not be accessible or selector is incorrect.'
			);
			return 'Subject not found'; // Return a default message if subject is not found
		}
	}
}

function getEmailContent() {
	let emailBody = '';
	// Try primary email content selector
	const emailBodyElements = document.querySelectorAll('.ii.gt');

	if (emailBodyElements && emailBodyElements.length > 0) {
		emailBodyElements.forEach((element) => {
			emailBody += element.textContent + '\n\n';
		});
	}

	// Normalize the email content
	emailBody = normalizeEmailContent(emailBody);

	console.log('getEmailContent() called - Fetched content:', emailBody); // ADDED LOG
	return emailBody.trim();
}

function getFullEmailDetails(emailItem) {
	const subject = getEmailSubject(emailItem); // Reuse your existing subject function
	const content = getEmailContent(); // Reuse your existing content function

	const combinedDetails = `Subject: ${subject}\nMail Content:\n${content}`; // Format the combined string
	return combinedDetails;
}

function normalizeEmailContent(content) {
	// Remove excessive whitespace and new lines
	return content
		.replace(/\s+/g, ' ') // Replace multiple spaces/newlines with a single space
		.replace(/^\s+|\s+$/g, '') // Trim leading and trailing whitespace
		.replace(/\s*([.,!?;])\s*/g, '$1 '); // Ensure punctuation is followed by a space
}

function updateSummaryBox(apiResponse) {
	const summaryParagraph = document.querySelector('.mail-summery p');
	const actionList = document.querySelector('.action-items ul');

	summaryParagraph.textContent = apiResponse.summary || 'Summary not found.'; // Display summary or default
	console.log('from the update box: ', apiResponse.summary);

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

function copyToClipboard(text) {
	// Use the Clipboard API to copy text
	navigator.clipboard
		.writeText(text)
		.then(() => {
			// Show feedback to the user
			const feedbackElement = document.createElement('div');
			feedbackElement.textContent = 'Summary copied to clipboard!';
			feedbackElement.className = 'copy-feedback';
			document.body.appendChild(feedbackElement);

			// Remove feedback after 2 seconds
			setTimeout(() => {
				document.body.removeChild(feedbackElement);
			}, 2000);
		})
		.catch((err) => {
			console.error('Failed to copy: ', err);
		});
}

// Initialize when the page loads
window.addEventListener('load', createSummarySidebar);
