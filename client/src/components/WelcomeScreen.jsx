import React from 'react';
import './WelcomeScreen.css';

const WelcomeScreen = ({
	privacyMode,
	togglePrivacyMode,
	showApiKeyInput,
	tempApiKey,
	setTempApiKey,
	handleSetOpenaiApiKey,
	onClose,
	onSettingsClick,
	onRefreshClick,
}) => {
	return (
		<div className="welcome-screen-mailmind">
			<div className="mailmind-header">
				<span className="mailmind-title">MailMind AI</span>
				<button onClick={onClose} className="mailmind-close-button">
					×
				</button>
			</div>

			<h2 className="mailmind-main-title">
				SuperCharge Your Inbox
				<br />
				with AI-Powered
				<br />
				Summaries
			</h2>

			<ul className="mailmind-features-list">
				<li>✅ Summarize emails</li>
				<li>✅ Reply smart</li>
				<li>✅ Extract action items</li>
			</ul>
			<div className="mailmind-how-it-works-container">
				<h3 className="mailmind-section-title" style={{ marginTop: '0px' }}>
					How It Works
				</h3>
				<div className="mailmind-how-it-works-steps">
					<div className="mailmind-how-it-works-step">
						<div className="mailmind-step-number">1</div>
						<p className="mailmind-step-text">Open your email</p>
					</div>
					<div className="mailmind-how-it-works-step">
						<div className="mailmind-step-number">2</div>
						<p className="mailmind-step-text">Let MailMind summarize</p>
					</div>
					<div className="mailmind-how-it-works-step">
						<div className="mailmind-step-number">3</div>
						<p className="mailmind-step-text">Copy or reply instantly</p>
					</div>
				</div>
			</div>

			<div>
				<h2 className="feature-title">Features that make MailMind unique</h2>
				<p className="feature-text">AI-Powered Summaries</p>
				<p className="feature-text">Actionable Task Extraction</p>
				<p className="feature-text">Smart Reply</p>
				<p className="feature-text">Copy & Share in one click</p>
				<p className="feature-text">Double-check summaries</p>
			</div>

			<div className="mailmind-settings-section">
				<div className="mailmind-privacy-toggle-container">
					<span className="mailmind-toggle-label">Privacy Mode</span>
					<label className="mailmind-switch">
						<input
							type="checkbox"
							checked={privacyMode}
							onChange={togglePrivacyMode}
						/>
						<span className="mailmind-slider"></span>
					</label>
				</div>
				<p className="mailmind-privacy-description">
					*If you consern about sharing information outside, use Privacy Mode
					which uses the local LLM's so expect delay based on your system specs.
				</p>
				{showApiKeyInput && (
					<div className="mailmind-api-key-container">
						<label htmlFor="openaiApiKey">OpenAI API Key:</label>
						<input
							id="openaiApiKey"
							type="password"
							placeholder="Enter your OpenAI API Key"
							value={tempApiKey}
							onChange={(e) => setTempApiKey(e.target.value)}
						/>
						<button
							className="mailmind-button"
							onClick={() => handleSetOpenaiApiKey(tempApiKey)}
						>
							Save API Key
						</button>
					</div>
				)}
			</div>

			<div className="mailmind-footer">
				<button onClick={onRefreshClick} className="mailmind-footer-button">
					<span className="mailmind-footer-icon">🔄</span> Refresh
				</button>
				<button onClick={onSettingsClick} className="mailmind-footer-button">
					<span className="mailmind-footer-icon">⚙️</span> settings
				</button>
			</div>
		</div>
	);
};

export default WelcomeScreen;
