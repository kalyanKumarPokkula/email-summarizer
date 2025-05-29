import React, { useState, useEffect, useCallback } from 'react';
import './Sidebar.css'; // Make sure this path is correct
import WelcomeScreen from './components/WelcomeScreen.jsx';
import SummaryView from './components/SummaryView.jsx';

// Initial state from localStorage or defaults
const initialPrivacyMode = localStorage.getItem('privacyMode') === 'true';
const initialApiKey = localStorage.getItem('openai_api_key') || '';

const App = ({ onSummarize }) => {
	const [currentView, setCurrentView] = useState('welcome'); // 'welcome' or 'summary'
	const [privacyMode, setPrivacyMode] = useState(initialPrivacyMode);
	const [openaiApiKey, setOpenaiApiKey] = useState(initialApiKey);
	const [showApiKeyInput, setShowApiKeyInput] = useState(
		!initialPrivacyMode && !initialApiKey
	);
	const [tempApiKey, setTempApiKey] = useState('');

	// Summary state
	const [summaryText, setSummaryText] = useState('');
	const [actionItems, setActionItems] = useState([]);
	const [summaryTime, setSummaryTime] = useState(0.0);

	const handleSetOpenaiApiKey = useCallback((key) => {
		if (key) {
			setOpenaiApiKey(key);
			localStorage.setItem('openai_api_key', key);
			setShowApiKeyInput(false); // Hide input once key is set
			setTempApiKey(''); // Clear temporary key
		} else {
			console.warn('Attempted to set an empty API key.');
		}
	}, []);

	const togglePrivacyMode = useCallback(() => {
		const newMode = !privacyMode;
		setPrivacyMode(newMode);
		localStorage.setItem('privacyMode', newMode.toString());
		setShowApiKeyInput(!newMode && !openaiApiKey);
		console.log('Privacy Mode:', newMode ? 'ON (Local LLM)' : 'OFF (OpenAI)');
	}, [privacyMode, openaiApiKey]);

	useEffect(() => {
		// This effect updates API key input visibility when privacyMode or apiKey changes
		setShowApiKeyInput(!privacyMode && !openaiApiKey);
	}, [privacyMode, openaiApiKey]);

	const showSummaryView = useCallback((data) => {
		setSummaryText(data.summary || 'Summary not available.');
		setActionItems(data.actionItems || []);
		setSummaryTime(data.timeTaken || 0.0);
		setCurrentView('summary');
	}, []);

	const showWelcomeView = useCallback(() => {
		setCurrentView('welcome');
	}, [privacyMode, openaiApiKey]);

	// Expose a function to the window for main.js to call
	useEffect(() => {
		window.showSummaryViewInReact = showSummaryView;
		return () => {
			delete window.showSummaryViewInReact;
		};
	}, [showSummaryView]);

	const handleCloseSidebar = () => {
		const sidebarRoot = document.getElementById('mailmind-sidebar-container');
		if (sidebarRoot) {
			sidebarRoot.style.display = 'none';
		}
	};

	const handleSettingsClick = () => {
		console.log('Settings clicked - showing API key input');
		setShowApiKeyInput(true);
		setCurrentView('welcome'); // Ensure welcome screen is visible to show API key input
	};

	const handleRefreshClick = () => {
		console.log('Refresh clicked');
		showWelcomeView();
	};

	if (currentView === 'summary') {
		return (
			<SummaryView
				summary={summaryText}
				actionItems={actionItems}
				timeTaken={summaryTime}
				onBack={showWelcomeView}
				onClose={handleCloseSidebar}
			/>
		);
	}

	// Welcome View
	return (
		<div className="summary-sidebar-mailmind">
			<WelcomeScreen
				privacyMode={privacyMode}
				togglePrivacyMode={togglePrivacyMode}
				showApiKeyInput={showApiKeyInput}
				tempApiKey={tempApiKey}
				setTempApiKey={setTempApiKey}
				handleSetOpenaiApiKey={handleSetOpenaiApiKey}
				onSummarize={onSummarize}
				onClose={handleCloseSidebar}
				onSettingsClick={handleSettingsClick}
				onRefreshClick={handleRefreshClick}
			/>
		</div>
	);
};

export default App;
