import { copyToClipboard } from '../utils/emailUtils.js';
import { doubleCheckSummary } from '../utils/doubleCheckFun.js';
import { handleReply } from '../utils/replyUtils.js';

// Global state
let privacyMode = false;
let openaiApiKey = localStorage.getItem('openai_api_key'); // Load API key on init

export function createSummarySidebar() {
	const sidebar = document.createElement('div');
	sidebar.className = 'summary-sidebar summary-sidebar-mailmind'; // Added a specific class for new styles

	// --- Styles for the new welcome screen ---
	const styleElement = document.createElement('style');
	styleElement.textContent = `
		.summary-sidebar-mailmind {
			background-color: #101728; /* Dark blue-ish background */
			color: #FFFFFF;
			padding: 0; /* Remove padding if nav has its own */
			width: 360px;
			height: 100vh;
			overflow-y: auto;
			display: flex;
			flex-direction: column;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
		}
        .summary-sidebar-mailmind .nav-header-mailmind {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px; /* Padding for nav */
            background-color: #101728; /* Match sidebar, or slightly different if needed */
            position: sticky;
            top: 0;
            z-index: 10;
        }
        .summary-sidebar-mailmind .nav-header-mailmind h1 {
            font-size: 1.4em;
            font-weight: bold;
            margin: 0;
        }
        .summary-sidebar-mailmind .nav-header-mailmind .back-button-mailmind,
        .summary-sidebar-mailmind .nav-header-mailmind .close-button-mailmind {
            color: #FFFFFF;
            background: transparent;
            border: none;
            font-size: 1.5em;
            cursor: pointer;
        }
        .summary-sidebar-mailmind .nav-header-mailmind .close-button-mailmind {
            font-size: 1.3em;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind {
            padding: 0 20px 20px 20px; /* Padding for content below nav */
            text-align: center;
            flex-grow: 1;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind h2 {
            font-size: 2em;
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 10px;
            line-height: 1.2;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .sub-heading-mailmind {
            font-size: 0.95em;
            margin-bottom: 25px;
            color: #cbd5e0; /* Lighter gray */
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .sub-heading-mailmind .emoji {
            color: #48bb78; /* Green checkmark */
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .action-buttons-mailmind {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 25px;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .action-buttons-mailmind button {
            padding: 12px 20px;
            border: none;
            border-radius: 25px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.1s ease;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .action-buttons-mailmind button:active {
            transform: scale(0.98);
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .get-extension-btn-mailmind {
            background: linear-gradient(to right, #3b82f6, #2563eb);
            color: white;
            min-width: 150px;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .watch-demo-btn-mailmind {
            background-color: #303958;
            color: white;
            min-width: 150px;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .demo-image-placeholder-mailmind {
            background-color: #1a202c;
            border-radius: 12px;
            height: 190px;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-image: url('https://raw.githubusercontent.com/kalyanKumarPokkula/email-summarizer/main/client/public/logo.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            border: 1px solid #2d3748;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .section-title-mailmind {
            font-size: 1.25em;
            font-weight: bold;
            margin-top: 30px;
            margin-bottom: 20px;
            text-align: left;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .section-title-mailmind .emoji {
            margin-right: 8px;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .how-it-works-steps-mailmind {
            display: flex;
            justify-content: space-between; /* Changed to space-between */
            margin-bottom: 30px;
            text-align: center;
            gap: 10px; /* Added gap */
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .how-it-works-step-mailmind {
            flex: 1;
            padding: 10px 5px; /* Added some padding */
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .step-number-mailmind {
            background-color: #2563eb;
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .step-text-mailmind {
            font-size: 0.9em;
            color: #e2e8f0;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .features-list-mailmind button {
            display: flex;
            align-items: center;
            background-color: #1a2233;
            color: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #2d3748;
            width: 100%;
            text-align: left;
            margin-bottom: 10px;
            font-size: 0.95em;
            cursor: pointer;
        }
        .summary-sidebar-mailmind .welcome-screen-mailmind .features-list-mailmind .feature-icon-mailmind {
            font-size: 1.4em;
            margin-right: 15px;
            width: 28px; /* For alignment */
            text-align: center;
            color: #60a5fa; /* Icon color */
        }
         .summary-sidebar-mailmind .welcome-screen-mailmind .features-list-mailmind .feature-icon-mailmind.chat-icon { color: #facc15; } /* Yellow for chat */
         .summary-sidebar-mailmind .welcome-screen-mailmind .features-list-mailmind .feature-icon-mailmind.copy-icon { color: #a78bfa; } /* Purple for copy */
         .summary-sidebar-mailmind .welcome-screen-mailmind .features-list-mailmind .feature-icon-mailmind.check-icon { color: #fb7185; } /* Pink for double check */

        .summary-sidebar-mailmind .welcome-screen-mailmind .feature-text-mailmind .coming-soon-mailmind {
            font-size: 0.8em;
            color: #94a3b8;
            margin-left: 5px;
        }
        .summary-sidebar-mailmind .settings-section-mailmind {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #2d3748;
            text-align: left;
        }
        .summary-sidebar-mailmind .api-key-container-mailmind {
            background-color: #1a2233;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
            border: 1px solid #2d3748;
        }
        .summary-sidebar-mailmind .api-key-container-mailmind label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            font-size: 0.9em;
        }
        .summary-sidebar-mailmind .api-key-container-mailmind input[type="password"] {
            width: calc(100% - 22px);
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid #3e4c62;
            border-radius: 4px;
            background-color: #101728;
            color: white;
            font-size: 0.9em;
        }
        .summary-sidebar-mailmind .api-key-container-mailmind button {
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            background-color: #38a169;
            color: white;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.9em;
        }
        .summary-sidebar-mailmind .privacy-toggle-container-mailmind {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 15px;
            background-color: #1a2233;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 1px solid #2d3748;
        }
        .summary-sidebar-mailmind .toggle-label-mailmind {
            font-size: 0.95em;
            margin-right: 10px;
            font-weight: 500;
        }
        .summary-sidebar-mailmind .switch-mailmind {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
        }
        .summary-sidebar-mailmind .switch-mailmind input { display: none; }
        .summary-sidebar-mailmind .slider-mailmind {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #3e4c62;
            transition: .4s;
            border-radius: 24px;
        }
        .summary-sidebar-mailmind .slider-mailmind:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        .summary-sidebar-mailmind input:checked + .slider-mailmind {
            background-color: #38a169;
        }
        .summary-sidebar-mailmind input:checked + .slider-mailmind:before {
            transform: translateX(20px);
        }
        /* Summary Box styles from original code - ensure they don't conflict or adapt them */
        .summary-sidebar-mailmind .summery-box { /* Renamed to avoid conflicts with potential global styles */
            padding: 15px; /* Add padding to summary box content */
            background-color: #101728; /* Ensure it matches */
            flex-grow: 1; /* Allow it to take space */
        }
        .summary-sidebar-mailmind .mail-summery h3, .summary-sidebar-mailmind .action-items h3 {
             margin-top: 0;
             margin-bottom: 10px;
             font-size: 1.1em;
        }
        .summary-sidebar-mailmind .mail-summery p, .summary-sidebar-mailmind .action-items ul {
            font-size: 0.9em;
            color: #cbd5e0;
            line-height: 1.6;
        }
        .summary-sidebar-mailmind .action-items ul { list-style-type: disc; padding-left: 20px; }
        .summary-sidebar-mailmind .actionButtons button {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 8px 12px;
            margin-right: 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
        }
        .summary-sidebar-mailmind .actionButtons button:hover { background-color: #1d4ed8; }
        .summary-sidebar-mailmind .summary-header-container {
             display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;
        }
        .summary-sidebar-mailmind .summary-timer { font-size: 0.8em; color: #a0aec0; }

	`;
	document.head.appendChild(styleElement);

	// --- Navigation Header ---
	const nav = document.createElement('nav');
	nav.className = 'nav-header-mailmind';

	const backButton = document.createElement('button');
	backButton.className = 'back-button-mailmind';
	backButton.innerHTML = '⬅️';
	backButton.style.display = 'none'; // Hidden initially

	const headerText = document.createElement('h1');
	headerText.innerHTML = 'MailMind AI ✨';

	const closeButton = document.createElement('button');
	closeButton.className = 'close-button-mailmind';
	closeButton.innerHTML = '✖';
	closeButton.title = 'Close sidebar';

	const leftNavGroup = document.createElement('div');
	leftNavGroup.style.display = 'flex';
	leftNavGroup.style.alignItems = 'center';
	leftNavGroup.appendChild(backButton);
	leftNavGroup.appendChild(headerText);

	nav.appendChild(leftNavGroup);
	nav.appendChild(closeButton);
	sidebar.appendChild(nav);

	// --- Welcome Screen ---
	const welcomeScreen = document.createElement('div');
	welcomeScreen.className = 'welcome-screen-mailmind';

	const mainHeading = document.createElement('h2');
	mainHeading.innerHTML =
		'Supercharge your inbox <br>with AI-powered summaries ❤️';
	welcomeScreen.appendChild(mainHeading);

	const subHeading = document.createElement('p');
	subHeading.className = 'sub-heading-mailmind';
	subHeading.innerHTML =
		'<span class="emoji">✅</span> Summarize emails. <span class="emoji">✅</span> Extract action items. <span class="emoji">✅</span> Reply smart.';
	welcomeScreen.appendChild(subHeading);

	const actionButtons = document.createElement('div');
	actionButtons.className = 'action-buttons-mailmind';
	const getExtensionBtn = document.createElement('button');
	getExtensionBtn.className = 'get-extension-btn-mailmind';
	getExtensionBtn.innerHTML = '⬇️ Get the Extension';
	const watchDemoBtn = document.createElement('button');
	watchDemoBtn.className = 'watch-demo-btn-mailmind';
	watchDemoBtn.innerHTML = '▶️ Watch Demo';
	actionButtons.appendChild(getExtensionBtn);
	actionButtons.appendChild(watchDemoBtn);
	welcomeScreen.appendChild(actionButtons);

	const demoImagePlaceholder = document.createElement('div');
	demoImagePlaceholder.className = 'demo-image-placeholder-mailmind';
	welcomeScreen.appendChild(demoImagePlaceholder);

	const howItWorksTitle = document.createElement('h3');
	howItWorksTitle.className = 'section-title-mailmind';
	howItWorksTitle.innerHTML = '<span class="emoji">✨</span> How It Works';
	welcomeScreen.appendChild(howItWorksTitle);

	const howItWorksSteps = document.createElement('div');
	howItWorksSteps.className = 'how-it-works-steps-mailmind';
	const stepsData = [
		{ number: '1', text: 'Open your email' },
		{ number: '2', text: 'Let MailMind summarize' },
		{ number: '3', text: 'Copy or reply instantly' },
	];
	stepsData.forEach((step) => {
		const stepDiv = document.createElement('div');
		stepDiv.className = 'how-it-works-step-mailmind';
		const stepNumber = document.createElement('div');
		stepNumber.className = 'step-number-mailmind';
		stepNumber.textContent = step.number;
		const stepText = document.createElement('p');
		stepText.className = 'step-text-mailmind';
		stepText.textContent = step.text;
		stepDiv.appendChild(stepNumber);
		stepDiv.appendChild(stepText);
		howItWorksSteps.appendChild(stepDiv);
	});
	welcomeScreen.appendChild(howItWorksSteps);

	const featuresTitle = document.createElement('h3');
	featuresTitle.className = 'section-title-mailmind';
	featuresTitle.innerHTML =
		'<span class="emoji">⚙️</span> Features That Make You Productive';
	welcomeScreen.appendChild(featuresTitle);

	const featuresList = document.createElement('div');
	featuresList.className = 'features-list-mailmind';
	const featuresData = [
		{ icon: '🪄', text: 'AI-Powered Summaries' },
		{ icon: '📋', text: 'Actionable Task Extraction' },
		{
			icon: '💬',
			text: 'Smart Replies',
			comingSoon: true,
			iconClass: 'chat-icon',
		},
		{ icon: '🔗', text: 'Copy & Share in One Click', iconClass: 'copy-icon' },
		{ icon: '❔', text: 'Double-check summaries', iconClass: 'check-icon' },
	];

	// Helper to create feature buttons
	function createFeatureButton(icon, text, comingSoon = false, iconClass = '') {
		const button = document.createElement('button');
		const iconSpan = document.createElement('span');
		iconSpan.className = 'feature-icon-mailmind ' + iconClass;
		iconSpan.textContent = icon;
		const textSpan = document.createElement('span');
		textSpan.className = 'feature-text-mailmind';
		textSpan.textContent = text;
		if (comingSoon) {
			const soonSpan = document.createElement('span');
			soonSpan.className = 'coming-soon-mailmind';
			soonSpan.textContent = '(coming soon)';
			textSpan.appendChild(soonSpan);
		}
		button.appendChild(iconSpan);
		button.appendChild(textSpan);
		return button;
	}

	featuresData.forEach((feature) => {
		featuresList.appendChild(
			createFeatureButton(
				feature.icon,
				feature.text,
				feature.comingSoon,
				feature.iconClass
			)
		);
	});
	welcomeScreen.appendChild(featuresList);

	// --- Settings Section (Privacy Toggle & API Key) ---
	const settingsSection = document.createElement('div');
	settingsSection.className = 'settings-section-mailmind';
	welcomeScreen.appendChild(settingsSection);

	// Privacy Toggle
	const privacyToggle = document.createElement('div');
	privacyToggle.className = 'privacy-toggle-container-mailmind';
	const toggleLabel = document.createElement('label');
	toggleLabel.className = 'toggle-label-mailmind';
	toggleLabel.textContent = 'Privacy Mode (Use Local LLM)';
	const toggleSwitch = document.createElement('label');
	toggleSwitch.className = 'switch-mailmind';
	const toggleInput = document.createElement('input');
	toggleInput.type = 'checkbox';
	const toggleSlider = document.createElement('span');
	toggleSlider.className = 'slider-mailmind';
	toggleSwitch.appendChild(toggleInput);
	toggleSwitch.appendChild(toggleSlider);
	privacyToggle.appendChild(toggleLabel);
	privacyToggle.appendChild(toggleSwitch);
	settingsSection.appendChild(privacyToggle);

	// API Key Input Field (from user's diff, adapted)
	const apiKeyContainer = document.createElement('div');
	apiKeyContainer.className = 'api-key-container-mailmind';
	apiKeyContainer.style.display = 'none'; // Initially hidden

	const apiKeyLabel = document.createElement('label');
	apiKeyLabel.textContent = 'OpenAI API Key:';

	const apiKeyInput = document.createElement('input');
	apiKeyInput.type = 'password';
	apiKeyInput.placeholder = 'Enter your OpenAI API Key';

	const apiKeySaveButton = document.createElement('button');
	apiKeySaveButton.textContent = 'Save API Key';

	apiKeyContainer.appendChild(apiKeyLabel);
	apiKeyContainer.appendChild(apiKeyInput);
	apiKeyContainer.appendChild(apiKeySaveButton);
	settingsSection.appendChild(apiKeyContainer);

	function updateApiKeyInputVisibility() {
		openaiApiKey = localStorage.getItem('openai_api_key');
		if (!privacyMode && !openaiApiKey) {
			// Show if NOT in privacy mode AND no key
			apiKeyContainer.style.display = 'block';
		} else {
			apiKeyContainer.style.display = 'none';
		}
	}
	updateApiKeyInputVisibility(); // Initial check

	apiKeySaveButton.addEventListener('click', () => {
		const key = apiKeyInput.value.trim();
		if (key) {
			localStorage.setItem('openai_api_key', key);
			openaiApiKey = key;
			apiKeyInput.value = '';
			updateApiKeyInputVisibility();
			// alert('OpenAI API Key saved!'); // Optional
		} else {
			alert('Please enter a valid API Key.');
		}
	});

	toggleInput.addEventListener('change', () => {
		privacyMode = toggleInput.checked;
		console.log(
			'Privacy Mode:',
			privacyMode ? 'ON (Local LLM)' : 'OFF (OpenAI)'
		);
		updateApiKeyInputVisibility();
	});

	sidebar.appendChild(welcomeScreen);

	// --- Summary Box (for when an email is selected) ---
	const summaryBox = document.createElement('div');
	summaryBox.className = 'summery-box'; // Original class, can be styled via .summary-sidebar-mailmind .summery-box
	summaryBox.style.display = 'none'; // Hidden initially

	const mailSummary = document.createElement('div');
	mailSummary.className = 'mail-summery';
	const summaryHeaderContainer = document.createElement('div');
	summaryHeaderContainer.className = 'summary-header-container';
	const summaryHeader = document.createElement('h3');
	summaryHeader.textContent = 'Summary:';
	const timerElement = document.createElement('span');
	timerElement.className = 'summary-timer';
	timerElement.textContent = '(0.0s)';
	summaryHeaderContainer.appendChild(summaryHeader);
	summaryHeaderContainer.appendChild(timerElement);
	mailSummary.appendChild(summaryHeaderContainer);
	const summaryParagraph = document.createElement('p');
	mailSummary.appendChild(summaryParagraph);

	const actionItems = document.createElement('div');
	actionItems.className = 'action-items';
	const actionHeader = document.createElement('h3');
	actionHeader.textContent = 'Action Items:';
	const actionList = document.createElement('ul');
	actionItems.appendChild(actionHeader);
	actionItems.appendChild(actionList);

	const summaryActionButtons = document.createElement('div');
	summaryActionButtons.className = 'actionButtons'; // Original class
	const copyButton = document.createElement('button');
	copyButton.textContent = 'Copy';
	const replyButton = document.createElement('button');
	replyButton.textContent = 'Reply';
	const doubleCheckButton = document.createElement('button');
	doubleCheckButton.textContent = 'Double Check';
	summaryActionButtons.appendChild(copyButton);
	summaryActionButtons.appendChild(doubleCheckButton);
	summaryActionButtons.appendChild(replyButton);

	summaryBox.appendChild(mailSummary);
	summaryBox.appendChild(actionItems);
	summaryBox.appendChild(summaryActionButtons);
	sidebar.appendChild(summaryBox);

	// --- Event Listeners & Logic ---
	closeButton.addEventListener('click', () => {
		sidebar.style.display = 'none';
	});

	backButton.addEventListener('click', () => {
		summaryBox.style.display = 'none';
		backButton.style.display = 'none';
		welcomeScreen.style.display = 'block';
		updateApiKeyInputVisibility();
	});

	// This listener is in the global scope in original code, might be in main.js
	// For now, ensure elements are switched correctly if it were here.
	// Assuming generateSummary is called elsewhere after this.
	document.addEventListener('click', (event) => {
		const emailItem = event.target.closest('.zA'); // Gmail's email item selector
		// Check if the click is on an email item AND the sidebar is currently visible
		if (emailItem && sidebar.style.display !== 'none') {
			welcomeScreen.style.display = 'none';
			summaryBox.style.display = 'block';
			backButton.style.display = 'block';
			// The actual call to generateSummary should be handled by the main logic that
			// monitors email clicks and uses the 'generateSummary' function from updateSummaryBox.js
		}
	});

	copyButton.addEventListener('click', () => {
		const summaryText = summaryParagraph.textContent; // Ensure this selector is correct
		copyToClipboard(summaryText);
	});

	doubleCheckButton.addEventListener('click', (event) => {
		console.log('Double check clicked');
		doubleCheckSummary(event); // Assuming doubleCheckSummary is defined
	});

	replyButton.addEventListener('click', async () => {
		console.log('Reply clicked');
		await handleReply(); // Assuming handleReply is defined
	});

	return sidebar;
}

export function getPrivacyMode() {
	return privacyMode;
}

export function getOpenAIApiKey() {
	return localStorage.getItem('openai_api_key');
}
