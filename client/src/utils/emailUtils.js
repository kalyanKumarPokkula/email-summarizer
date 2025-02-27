const normalizeEmailContent = (content) => {
	return content
		.replace(/\s+/g, ' ')
		.replace(/^\s+|\s+$/g, '')
		.replace(/\s*([.,!?;])\s*/g, '$1 ');
};

export const copyToClipboard = async (text) => {
	try {
		await navigator.clipboard.writeText(text);
		showFeedback('Summary copied to clipboard!');
	} catch (err) {
		console.error('Failed to copy:', err);
	}
};

const showFeedback = (message) => {
	const feedbackElement = document.createElement('div');
	feedbackElement.textContent = message;
	feedbackElement.className = 'copy-feedback';
	document.body.appendChild(feedbackElement);

	setTimeout(() => {
		document.body.removeChild(feedbackElement);
	}, 2000);
};

// ================= from here my changes ===============

function getEmailSubject(emailItem) {
	// **Important: Inspect the DOM to find the correct selector for the subject.
	//  `.ha h2` or `.hP` are common, but might need adjustment.**
	const subjectElement = emailItem.querySelector('.ha h2'); // Try to find subject within the clicked email item context
	if (subjectElement) {
		return subjectElement.textContent.trim();
	} else {
		console.log(
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

export function getFullEmailDetails(emailItem) {
	const subject = getEmailSubject(emailItem); // Reuse your existing subject function
	const content = getEmailContent(); // Reuse your existing content function

	const combinedDetails = `Subject: ${subject}\nMail Content:\n${content}`; // Format the combined string
	return combinedDetails;
}
