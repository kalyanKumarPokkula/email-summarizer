import React from 'react';
import './SummaryView.css'; // Import the new CSS file
import { copyToClipboard } from '../utils/emailUtils.js';
import { doubleCheckSummary } from '../utils/doubleCheckFun.js';
import { handleReply } from '../utils/replyUtils.js';

const SummaryView = ({
	summary,
	actionItems,
	timeTaken,
	onBack,
	onClose,
	onSettingsClick,
}) => {
	// Mock action items if not provided, for UI display
	const displayActionItems =
		actionItems && actionItems.length > 0
			? actionItems
			: [
					{ id: '1', text: 'Placeholder Action 1', completed: false },
					{ id: '2', text: 'Placeholder Action 2', completed: false },
			  ];

	// Handler for checkbox change (does nothing yet)
	const handleActionItemToggle = (itemId) => {
		console.log('Toggled action item:', itemId);
		// Here you would typically update the state of actionItems
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
				<div className="summary-section-mailmind">
					<div className="summary-header-controls-mailmind">
						<div className="summary-title-icon-mailmind">
							<span className="icon-mailmind">📄</span> {/* Summary Icon */}
							<h3>Summary ({timeTaken ? timeTaken.toFixed(1) : '0.0'}s)</h3>
						</div>
						<div className="summary-actions-mailmind-top">
							<button
								className="detailed-button-mailmind"
								onClick={() => console.log('Detailed clicked')}
							>
								Detailed
							</button>
							<button
								className="refresh-summary-button-mailmind"
								onClick={() => console.log('Refresh Summary clicked')}
							>
								🔄
							</button>
						</div>
					</div>
					<div className="summary-text-mailmind">
						<p>
							{summary ||
								'Lorem ipsum dolor sit amet consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante.'}
						</p>
					</div>
				</div>

				{/* Action Items Section */}
				<div className="action-items-section-mailmind">
					<div className="action-items-header-mailmind">
						<span className="icon-mailmind">☰</span> {/* Action Items Icon */}
						<h3>Action Items</h3>
					</div>
					<ul className="action-item-list-mailmind">
						{displayActionItems.map((item) => (
							<li key={item.id} className="action-item-mailmind">
								<input
									type="checkbox"
									id={`action-${item.id}`}
									checked={item.completed}
									onChange={() => handleActionItemToggle(item.id)}
									className="action-item-checkbox-mailmind"
								/>
								<label htmlFor={`action-${item.id}`}>{item.text}</label>
							</li>
						))}
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
					<button
						className="action-button-mailmind double-check-button-mailmind"
						onClick={doubleCheckSummary}
					>
						<span className="icon-mailmind">🔁</span> Double Check
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
						onClick={() => console.log('Save to Notion clicked')}
					>
						<span className="icon-mailmind">N</span> Save to Notion
					</button>
					<button
						className="secondary-action-button-mailmind"
						onClick={() => console.log('Add to tasks clicked')}
					>
						<span className="icon-mailmind">✅</span> Add to tasks
					</button>
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
		</div>
	);
};

export default SummaryView;
