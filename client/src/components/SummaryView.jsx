import React from 'react';
import { copyToClipboard } from '../utils/emailUtils.js';
import { doubleCheckSummary } from '../utils/doubleCheckFun.js';
import { handleReply } from '../utils/replyUtils.js';

const SummaryView = ({ summary, actionItems, timeTaken, onBack, onClose }) => {
	return (
		<div className="summary-sidebar-mailmind">
			<nav className="nav-header-mailmind">
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<button
						className="back-button-mailmind"
						onClick={onBack}
						title="Back to Welcome"
					>
						⬅️
					</button>
					<h1>MailMind AI ✨</h1>
				</div>
				<button
					className="close-button-mailmind"
					title="Close sidebar"
					onClick={onClose}
				>
					✖
				</button>
			</nav>
			<div className="summery-box">
				<div className="mail-summery">
					<div className="summary-header-container">
						<h3>Summary:</h3>
						<span className="summary-timer">({timeTaken.toFixed(1)}s)</span>
					</div>
					<p>{summary || 'Summary not available.'}</p>
				</div>
				<div className="action-items">
					<h3>Action Items:</h3>
					{actionItems && actionItems.length > 0 ? (
						<ul>
							{actionItems.map((item, index) => (
								<li key={index}>{item}</li>
							))}
						</ul>
					) : (
						<p>No action items found.</p>
					)}
				</div>
				<div className="actionButtons">
					<button onClick={() => copyToClipboard(summary)}>Copy Summary</button>
					<button onClick={doubleCheckSummary}>Double Check</button>
					<button onClick={handleReply}>Reply</button>
				</div>
			</div>
		</div>
	);
};

export default SummaryView;
