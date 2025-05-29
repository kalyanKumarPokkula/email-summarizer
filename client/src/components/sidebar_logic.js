// This file can be used to hold logic that was previously in sidebar.js
// such as fetching API keys or privacy mode, if we want to separate it from App.jsx.
// For now, App.jsx handles this directly with localStorage and React state.

export function getOpenAIApiKey() {
	return localStorage.getItem('openai_api_key');
}

export function getPrivacyMode() {
	return localStorage.getItem('privacyMode') === 'true';
}

// You might move other utility functions here if they are not directly tied to React components
// or are shared across multiple components in the future.
