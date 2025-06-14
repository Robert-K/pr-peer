import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { writable } from 'svelte/store';

/*
Could be helpful:
https://medium.com/@aleksej.gudkov/llama-cpp-python-examples-a-guide-to-using-llama-models-with-python-1df9ba7a5fcd
*/

const openai = new OpenAI({
	apiKey: 'random_string',
	baseURL: 'https://67939-3000.2.codesphere.com/v1/',
	dangerouslyAllowBrowser: true // Only use this in a controlled environment
});

export async function getChatResponse(messages: ChatCompletionMessageParam[]) {
	try {
		const response = await openai.chat.completions.create(
			{
				model: 'gpt-3.5-turbo',
				messages: messages,
				max_tokens: 1000,
				temperature: 0.7
			},
			{
				headers: {
					'Access-Control-Allow-Origin': '*'
				}
				// method: 'patch'
			}
		);
		return response.choices[0].message.content;
	} catch (error) {
		console.error('Error fetching chat response:', error);
		throw error;
	}
}

export function getChatResponseStreamed(messages: ChatCompletionMessageParam[]) {
	const responseStore = writable('');
	(async () => {
		try {
			const response_stream = await openai.chat.completions.create(
				{
					model: 'gpt-3.5-turbo',
					messages: messages,
					max_tokens: 1000,
					temperature: 0.7,
					stream: true
				},
				{
					headers: {
						'Access-Control-Allow-Origin': '*'
					}
					// method: 'patch'
				}
			);
			let response_state = "";
			for await (const part of response_stream) {
				response_state += part.choices[0]?.delta?.content || '';
				responseStore.set(response_state);
			}
		} catch (error) {
			console.error('Error fetching chat response stream:', error);
			responseStore.set(error as string);
		}
	})();
	return responseStore;
}

// v1
