// Add these imports at the top if not already present
import React, { useMemo, useState } from 'react';
import './SummaryView.css';
import { copyToClipboard, getFullEmailDetails } from '../utils/emailUtils.js';
import { doubleCheckSummary } from '../utils/doubleCheckFun.js';
import { handleReply } from '../utils/replyUtils.js';

const SummaryView = ({
	summary,
	actionItems,
	timeTaken,
	onBack,
	onClose,
	onSettingsClick,
	onActionItemToggle,
	selectedActionItemIds,
	onToggleActionItemSelection,
}) => {
	const [isCustomReplyModalOpen, setIsCustomReplyModalOpen] = useState(false);
	const [customInstructions, setCustomInstructions] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDetailedDropdownOpen, setIsDetailedDropdownOpen] = useState(false);
	const [summaryStyle, setSummaryStyle] = useState('standard');
	const [isRefreshing, setIsRefreshing] = useState(false); // New state for tracking refresh status

	const toggleCustomReplyModal = () => {
		setIsCustomReplyModalOpen(!isCustomReplyModalOpen);
	};

	const toggleDetailedDropdown = () => {
		setIsDetailedDropdownOpen(!isDetailedDropdownOpen);
	};

	const handleSummaryStyleChange = (style) => {
		setSummaryStyle(style);
		setIsDetailedDropdownOpen(false);
		
		// Here you would typically regenerate the summary with the new style
		// For now, we'll just log it
		console.log(`Summary style changed to: ${style}`);
		
		// You can add logic here to regenerate the summary with the new style
		// For example, call a modified version of doubleCheckSummary that includes the style
	};

	// Add this new function to handle custom reply submission
	const handleCustomReply = async () => {
		try {
			setIsSubmitting(true);
			
			// Get the currently selected email
			const emailItem = document.querySelector('.zA.yO');
			if (!emailItem) {
				throw new Error('No email selected');
			}
			
			// Get email content
			const emailContent = getFullEmailDetails(emailItem);
			
			// Find and click Gmail's reply button
			const replyButton = document.querySelector('[aria-label="Reply"]');
			if (replyButton) {
				replyButton.click();
				
				// Wait for the compose box to appear
				await waitForElement('.Am.Al.editable');
				
				// Find the compose box and insert loading text
				const composeBox = document.querySelector('.Am.Al.editable');
				if (composeBox) {
					// Show loading state
					composeBox.innerHTML = 'Generating custom reply...<br><br>';
					
					// Prepare request body
					const currentPrivacyMode = localStorage.getItem('privacyMode') === 'true';
					const requestBody = {
						email_content: emailContent,
						custom_instructions: customInstructions,
						privacy_mode: currentPrivacyMode,
					};
					
					// If privacy mode is off, get and add the API key
					if (!requestBody.privacy_mode) {
						const apiKey = localStorage.getItem('openai_api_key');
						if (apiKey) {
							requestBody.openai_api_key = apiKey;
						} else {
							// Handle missing API key when not in privacy mode
							console.error('OpenAI API Key is missing and Privacy Mode is OFF. Custom reply generation aborted.');
							composeBox.innerHTML = 'Error: OpenAI API Key is missing. Please set it in the sidebar.<br><br>';
							setIsSubmitting(false);
							return; // Stop execution
						}
					}
					
					// Get AI-generated custom reply from server
					console.log('Sending custom reply request to server...');
					console.log(requestBody);
					
					const response = await fetch('http://localhost:8000/custom-reply', {
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
						console.log('Parsed response data:', data);
						
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
					
					// Close the modal
					toggleCustomReplyModal();
				}
			} else {
				throw new Error('Reply button not found');
			}
		} catch (error) {
			console.error('Error handling custom reply:', error);
			alert('Failed to generate custom reply. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Add the waitForElement function if it's not already imported
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

	// Process actionItems to ensure they are in the correct format (array of objects)
	const processedActionItems = useMemo(() => {
		if (!actionItems || actionItems.length === 0) {
			return []; // Return empty array if no action items or if it's undefined/null
		}
		return actionItems.map((item, index) => {
			if (typeof item === 'string') {
				return { id: String(index), text: item, completed: false };
			}
			// If item is already an object, ensure it has the necessary properties
			// This provides a fallback if the structure is partially correct but misses 'id' or 'completed'
			return {
				id: item.id !== undefined ? String(item.id) : String(index),
				text: item.text !== undefined ? String(item.text) : String(item),
				completed:
					item.completed !== undefined ? Boolean(item.completed) : false,
				isLoading:
					item.isLoading !== undefined ? Boolean(item.isLoading) : false,
			};
		});
	}, [actionItems]); // Recalculate only when actionItems prop changes

	// Move the handleRefreshSummary function inside the component, before the return statement
	// Around line 230, after handleActionItemToggle and before the return statement
	
	// Handler for checkbox change (does nothing yet)
	const handleActionItemToggle = (itemId) => {
		console.log('Toggled action item:', itemId);
		// Here you would typically update the state of actionItems
		if (onActionItemToggle) {
			onActionItemToggle(itemId);
		}
	};
	
	// Add this function to handle the refresh action
	const handleRefreshSummary = async () => {
		try {
			setIsRefreshing(true); // Set refreshing state to true
			await doubleCheckSummary(); // Call the doubleCheckSummary function
		} catch (error) {
			console.error('Error refreshing summary:', error);
		} finally {
			// Set a timeout to reset the refreshing state after a short delay
			// This ensures the user sees the loading state even if the operation is very quick
			setTimeout(() => {
				setIsRefreshing(false);
			}, 500);
		}
	};

	return (
		<div className="summary-sidebar-mailmind summary-view-mailmind-new">
			{/* Header */}
			<nav className="nav-header-mailmind">
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<button
						className="back-button-mailmind"
						onClick={onBack}
						title="Back to Welcome"
					>
						←
					</button>
					<h1>MailMind AI</h1>
				</div>
				<button
					className="close-button-mailmind"
					title="Close sidebar"
					onClick={onClose}
				>
					✕
				</button>
			</nav>

			{/* Main Content Area */}
			<div className="summary-content-area-mailmind">
				{/* Summary Section */}
				<div className="summary-header-controls-mailmind">
					<div className="summary-title-icon-mailmind">
						<span className="icon-mailmind">📄</span>
						<h3 style={{ fontSize: '1rem', margin: '0px' }}>
							Summary ({timeTaken ? timeTaken.toFixed(1) : '0.0'}s)
						</h3>
					</div>
					<div className="summary-actions-mailmind-top">
						<div className="detailed-dropdown-container">
							<button
								className="detailed-button-mailmind"
								onClick={toggleDetailedDropdown}
							>
								{summaryStyle === 'standard' ? 'Detailed' : 
								 summaryStyle === 'detailed' ? 'Detailed' :
								 summaryStyle === 'compact' ? 'Compact' :
								 summaryStyle === 'tothepoint' ? 'To The Point' : 'Detailed'}
								<span className="dropdown-arrow">▼</span>
							</button>
							{isDetailedDropdownOpen && (
								<div className="detailed-dropdown-menu">
									<button onClick={() => handleSummaryStyleChange('detailed')}>Detailed</button>
									<button onClick={() => handleSummaryStyleChange('compact')}>Compact</button>
									<button onClick={() => handleSummaryStyleChange('tothepoint')}>To The Point</button>
									<button onClick={() => handleSummaryStyleChange('standard')}>Standard</button>
								</div>
							)}
						</div>
						<button
							className="refresh-summary-button-mailmind"
							onClick={handleRefreshSummary}
							disabled={isRefreshing}
						>
							{isRefreshing ? '⏳' : '🔄'}
						</button>
					</div>
				</div>
				<div className="summary-section-mailmind">
					<div className="summary-text-mailmind">
						<p>
							{isRefreshing ? (
								'Refreshing summary and action items... Please wait.'
							) : (
								summary ||
								'Lorem ipsum dolor sit amet consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante.'
							)}
						</p>
					</div>
				</div>

				{/* Action Items Section */}
				<div className="action-items-header-mailmind">
					<span className="icon-mailmind">☰</span> {/* Action Items Icon */}
					<h3 style={{ fontSize: '1rem', margin: '0px' }}>Action Items</h3>
				</div>
				<div className="action-items-section-mailmind">
					<ul className="action-item-list-mailmind">
						{isRefreshing ? (
							<li className="action-item-mailmind action-item-loading-mailmind">
								Refreshing action items...
							</li>
						) : processedActionItems && processedActionItems.length > 0 ? (
							processedActionItems.map((item) => {
								// Check for the loading state item
								if (item.isLoading) {
									return (
										<li
											key={item.id || 'loading'}
											className="action-item-mailmind action-item-loading-mailmind"
										>
											{item.text}
										</li>
									);
								}
								// Regular item rendering
								return (
									<li
										key={item.id}
										className={`action-item-mailmind ${
											selectedActionItemIds.includes(item.id)
												? 'selected-action-item-mailmind'
												: ''
										}`}
										onClick={() =>
											onToggleActionItemSelection &&
											onToggleActionItemSelection(item.id)
										}
									>
										{/* Remove checkbox and label, just display text */}
										<span>{item.text}</span>
									</li>
								);
							})
						) : (
							<li className="action-item-mailmind no-action-items-mailmind">
								No action items found.
							</li>
						)}
					</ul>
				</div>

				{/* Primary Action Buttons */}
				<div className="primary-actions-mailmind">
					<button
						className="action-button-mailmind copy-button-mailmind"
						onClick={() => copyToClipboard(summary)}
					>
						<span className="icon-mailmind">📋</span> Copy
					</button>
				</div>

				{/* Secondary Action Buttons */}
				<div className="secondary-actions-mailmind">
					<button
						className="secondary-action-button-mailmind"
						onClick={handleReply}
					>
						<span className="icon-mailmind">↩️</span> Reply
					</button>
					<button
						className="secondary-action-button-mailmind"
						onClick={toggleCustomReplyModal}
					>
						<span className="icon-mailmind">↩️</span> Custome Reply
					</button>
					{/* <button
						className="secondary-action-button-mailmind"
						onClick={() => console.log('Add to tasks clicked')}
					>
						<span className="icon-mailmind">✅</span> Add to tasks
					</button> */}
				</div>

				{/* Feedback Section */}
				<div className="feedback-section-mailmind">
					<p>was this summary helpful?</p>
					<button
						className="feedback-button-mailmind"
						onClick={() => console.log('Thumbs up clicked')}
					>
						<span className="icon-mailmind">👍</span>
					</button>
					<button
						className="feedback-button-mailmind"
						onClick={() => console.log('Thumbs down clicked')}
					>
						<span className="icon-mailmind">👎</span>
					</button>
				</div>
			</div>

			{/* Footer */}
			<footer className="footer-mailmind">
				<button
					className="footer-button-mailmind"
					onClick={() => console.log('Footer Refresh clicked')}
				>
					<span className="icon-mailmind">🔄</span> Refresh
				</button>
				<button
					className="footer-button-mailmind"
					onClick={onSettingsClick} // Assuming onSettingsClick is passed from App.jsx
				>
					<span className="icon-mailmind">⚙️</span> Settings
				</button>
				<button
					className="footer-button-mailmind"
					onClick={() => console.log('History clicked')}
				>
					<span className="icon-mailmind">🕒</span> History
				</button>
			</footer>

			{/* Custom Reply Modal */}
			{isCustomReplyModalOpen && (
				<div className="custom-reply-modal-mailmind">
					<div className="custom-reply-modal-content-mailmind">
						<div className="custom-reply-modal-header-mailmind">
							<h2>Custom Reply</h2>
							<button
								onClick={toggleCustomReplyModal}
								className="close-modal-button-mailmind"
							>
								✕
							</button>
						</div>
						<div className="custom-reply-modal-body-mailmind">
							<textarea
								placeholder="Enter your custom reply instructions here..."
								className="custom-reply-input-mailmind"
								rows="4"
								value={customInstructions}
								onChange={(e) => setCustomInstructions(e.target.value)}
							/>
							<button
								className="submit-custom-reply-button-mailmind"
								onClick={handleCustomReply}
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Generating...' : 'Send Reply'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SummaryView;
