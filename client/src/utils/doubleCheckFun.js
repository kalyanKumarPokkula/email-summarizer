import { generateSummary } from './updateSummaryBox.js';

export async function doubleCheckSummary(event) {
	const emailItem = document.querySelector('.zA.yO'); // Get the currently selected email
	if (emailItem) {
		await generateSummary(emailItem);
	} else {
		console.error('No email selected for double check');
		const summaryParagraph = document.querySelector('.mail-summery p');
		summaryParagraph.textContent = 'Please select an email first.';
	}
}
