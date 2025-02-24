// server.js
const express = require('express');
const cors = require('cors'); // Import the cors middleware
const app = express();
const port = 3001;

app.use(cors()); // Enable CORS for all routes - simplest setup

app.post('/summery', (req, res) => {
	// Corrected endpoint name to '/summmery' to match your code
	const responseJson = {
		Summary:
			'Before the term-end theory exams, Pokkula Dinesh Kumar must ensure system compatibility with the exam platform using their laptop or desktop.',
		'Action Items': [
			'Test your system compatibility using the provided username and password on the exam platform.',
			'Download and install the SEBLite tool and follow instructions from the attached PDF.',
		],
	};
	res.json(responseJson);
});

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
