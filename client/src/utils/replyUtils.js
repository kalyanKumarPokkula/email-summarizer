import { getFullEmailDetails } from './emailUtils.js';

export async function handleReply() {
	try {
		console.log('Starting reply process...'); // Debug log

		// Get the currently selected email
		const emailItem = document.querySelector('.zA.yO');
		if (!emailItem) {
			throw new Error('No email selected');
		}
		console.log('Email item found'); // Debug log

		// Get email content before clicking reply
		const emailContent = getFullEmailDetails(emailItem);
		console.log('Email content:', emailContent); // Debug log

		// Find and click Gmail's reply button
		const replyButton = document.querySelector('[aria-label="Reply"]');
		if (replyButton) {
			replyButton.click();

			// Wait for the compose box to appear
			await waitForElement('.Am.Al.editable');

			// Find the compose box and insert our text
			const composeBox = document.querySelector('.Am.Al.editable');
			if (composeBox) {
				// Show loading state
				composeBox.innerHTML = 'Generating reply...<br><br>';

				// Prepare request body
				const currentPrivacyMode =
					localStorage.getItem('privacyMode') === 'true';
				const requestBody = {
					email_content: emailContent,
					privacy_mode: currentPrivacyMode,
				};

				// If privacy mode is off, get and add the API key
				if (!requestBody.privacy_mode) {
					const apiKey = localStorage.getItem('openai_api_key');
					if (apiKey) {
						requestBody.openai_api_key = apiKey;
					} else {
						// Handle missing API key when not in privacy mode
						console.error(
							'OpenAI API Key is missing and Privacy Mode is OFF. Reply generation aborted.'
						);
						composeBox.innerHTML =
							'Error: OpenAI API Key is missing. Please set it in the sidebar.<br><br>';
						return; // Stop execution
					}
				}

				// Get AI-generated reply from server
				console.log('Sending request to server...'); // Debug log
				const response = await fetch('http://localhost:8000/reply', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(requestBody),
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				try {
					const data = await response.json();
					console.log('Parsed response data:', data); // Debug log

					// Handle both string responses and object responses
					let replyText = typeof data === 'string' ? data : data.reply;

					if (replyText) {
						// Replace template placeholders with empty strings
						replyText = replyText
							.replace(/\[Sender's Name\]/g, '')
							.replace(/\[Your Full Name\]/g, '')
							.replace(/\[Your Contact Information\]/g, '')
							// Replace newlines with HTML line breaks
							.replace(/\n/g, '<br>')
							// Clean up any double line breaks
							.replace(/<br><br><br>/g, '<br><br>');

						composeBox.innerHTML = replyText;
					} else {
						throw new Error('No reply text found in response');
					}
				} catch (jsonError) {
					console.error('Error parsing JSON:', jsonError);
					// If JSON parsing fails, try using response text directly
					const textResponse = await response.text();
					composeBox.innerHTML = textResponse
						.replace(/\[Sender's Name\]/g, '')
						.replace(/\[Your Full Name\]/g, '')
						.replace(/\[Your Contact Information\]/g, '')
						.replace(/\n/g, '<br>')
						.replace(/<br><br><br>/g, '<br><br>');
				}

				// Place cursor at the end
				const selection = window.getSelection();
				const range = document.createRange();
				range.selectNodeContents(composeBox);
				range.collapse(false);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		} else {
			throw new Error('Reply button not found');
		}
	} catch (error) {
		console.error('Error handling reply:', error);
		alert('Failed to generate reply. Please try again.');
	}
}

function waitForElement(selector) {
	return new Promise((resolve) => {
		if (document.querySelector(selector)) {
			return resolve();
		}

		const observer = new MutationObserver(() => {
			if (document.querySelector(selector)) {
				observer.disconnect();
				resolve();
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		// Add timeout to prevent infinite waiting
		setTimeout(() => {
			observer.disconnect();
			resolve(); // Resolve anyway to prevent hanging indefinitely
		}, 5000);
	});
}
