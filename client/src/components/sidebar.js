import { copyToClipboard } from '../utils/emailUtils.js';
import { doubleCheckSummary } from '../utils/doubleCheckFun.js';
import { handleReply } from '../utils/replyUtils.js';

// Add this near the top of the file, after the imports
let privacyMode = false;

export function createSummarySidebar() {
	// Create sidebar container
	const sidebar = document.createElement('div');
	sidebar.className = 'summary-sidebar';

	// Create main container structure
	const container = document.createElement('div');
	container.className = 'container';

	// Create navigation header
	const nav = document.createElement('nav');
	nav.className = 'nav-header';

	// Create back button (hidden initially)
	const backButton = document.createElement('button');
	backButton.className = 'back-button';
	backButton.innerHTML = '⬅️';
	backButton.style.display = 'none';

	// Create header text
	const headerText = document.createElement('h1');
	headerText.innerHTML = 'MailMind AI ✨';

	// Assemble nav
	nav.appendChild(backButton);
	nav.appendChild(headerText);

	// Create summary box (hidden initially)
	const summaryBox = document.createElement('div');
	summaryBox.className = 'summery-box';
	summaryBox.style.display = 'none';

	// Mail summary section (now will hold combined subject and content)
	const mailSummary = document.createElement('div');
	mailSummary.className = 'mail-summery';

	// Create a header container to hold both the summary heading and timer
	const headerContainer = document.createElement('div');
	headerContainer.className = 'summary-header-container';
	headerContainer.style.display = 'flex';
	headerContainer.style.justifyContent = 'space-between';
	headerContainer.style.alignItems = 'center';

	const summaryHeader = document.createElement('h3');
	summaryHeader.textContent = 'Summary:';

	// Create timer element
	const timerElement = document.createElement('span');
	timerElement.className = 'summary-timer';
	timerElement.textContent = '(0.0s)';
	timerElement.style.fontSize = '0.8em';
	timerElement.style.color = '#666';

	// Add both elements to the header container
	headerContainer.appendChild(summaryHeader);
	headerContainer.appendChild(timerElement);

	// Add the header container to the mail summary
	mailSummary.appendChild(headerContainer);

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

	// Add this after the tryNowBtn code
	const privacyToggle = document.createElement('div');
	privacyToggle.className = 'privacy-toggle-container';

	const toggleLabel = document.createElement('label');
	toggleLabel.className = 'toggle-label';
	toggleLabel.textContent = 'Privacy Mode';

	const toggleSwitch = document.createElement('label');
	toggleSwitch.className = 'switch';

	const toggleInput = document.createElement('input');
	toggleInput.type = 'checkbox';

	const toggleSlider = document.createElement('span');
	toggleSlider.className = 'slider';

	toggleSwitch.appendChild(toggleInput);
	toggleSwitch.appendChild(toggleSlider);

	privacyToggle.appendChild(toggleLabel);
	privacyToggle.appendChild(toggleSwitch);

	introCopy.appendChild(introHeader);
	introCopy.appendChild(introText);
	introCopy.appendChild(featureContainer);
	introCopy.appendChild(tryNowBtn);
	introCopy.appendChild(privacyToggle);

	// Assemble container
	container.appendChild(nav);
	container.appendChild(summaryBox);
	container.appendChild(introCopy);
	sidebar.appendChild(container);

	// Add back button functionality
	backButton.addEventListener('click', () => {
		// Hide summary box and back button
		summaryBox.style.display = 'none';
		backButton.style.display = 'none';
		// Show intro copy
		introCopy.style.display = 'block';
	});

	// Modify your existing monitorEmailClicks function to show back button
	const originalDisplay = introCopy.style.display;
	document.addEventListener('click', async (event) => {
		const emailItem = event.target.closest('.zA');
		if (emailItem) {
			introCopy.style.display = 'none';
			summaryBox.style.display = 'block';
			backButton.style.display = 'block'; // Show back button when email is selected
		}
	});

	// Add button functionality
	copyButton.addEventListener('click', () => {
		const summaryText = document.querySelector('.mail-summery p').textContent;
		copyToClipboard(summaryText);
	});

	doubleCheckButton.addEventListener('click', (event) => {
		console.log('Double check clicked');
		doubleCheckSummary(event);
	});

	replyButton.addEventListener('click', async () => {
		console.log('Reply clicked');
		handleReply();
	});

	// Update the privacy toggle event listener
	toggleInput.addEventListener('change', (event) => {
		privacyMode = event.target.checked;
		console.log('Privacy Mode:', privacyMode);
	});

	return sidebar;
}

// Add this export so other files can access the privacy mode
export function getPrivacyMode() {
	return privacyMode;
}
