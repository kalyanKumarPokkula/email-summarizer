import { replyTheMail } from '../llms/ollama.js';
import { getFullEmailDetails } from './emailUtils.js';

export async function handleReply() {
	try {
		// Get the currently selected email
		const emailItem = document.querySelector('.zA.yO');
		if (!emailItem) {
			throw new Error('No email selected');
		}

		// Get email content before clicking reply
		const emailContent = getFullEmailDetails(emailItem);

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

				// Get AI-generated reply
				const mailReply = await replyTheMail(emailContent);
				composeBox.innerHTML = mailReply;

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
			resolve();
		}, 5000);
	});
}
