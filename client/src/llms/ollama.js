import { Ollama } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';

export async function replyTheMail(mailContent) {
	const llm = new Ollama({
		model: 'phi4:latest', // Default value
		temperature: 0,
		maxRetries: 2,
	});

	const promptTemplateString = `
Please generate an email reply only not the subject to the following email content.

Email Content:
{mail_content}

Generate Reply:
`;

	const replyPrompt = PromptTemplate.fromTemplate(promptTemplateString);

	const chain = replyPrompt.pipe(llm);
	const result = await chain.invoke({
		mail_content: mailContent,
	});

	// console.log(result);
	return result;
}

// main().catch(console.error);
