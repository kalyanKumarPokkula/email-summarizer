import { generateSummary } from '../utils/updateSummaryBox.js';

export async function monitorEmailClicks() {
	document.addEventListener('click', async (event) => {
		const emailItem = event.target.closest('.zA');
		if (emailItem) {
			const summaryBox = document.querySelector('.summery-box');
			const introCopy = document.querySelector('.intoCopy');

			// Toggle visibility
			introCopy.style.display = 'none';
			summaryBox.style.display = 'block';

			await generateSummary(emailItem);
		}
	});
}
