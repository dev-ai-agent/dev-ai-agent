import chalk from 'chalk';
import OpenAI from "openai";

const API_KEY = process.env.OPEN_API_KEY

// Initialize OpenAI instance with your API key
const openai = new OpenAI({
  apiKey: API_KEY, // Use environment variables for security
});

async function chat(messages) {
  let content = '';

  try {
    // Create a stream using OpenAI's chat completion API
    const stream = await openai.chat.completions.create({
      model: "gpt-4o", // Ensure the model name is valid
      messages: messages,
      stream: true, // Enable streaming
      temperature:0.5
    });

    // Process the stream using for await...of loop
    for await (const chunk of stream) {
      // Extract and display the chunk's content, if available
      const chunkContent = chunk.choices[0]?.delta?.content || "";
      process.stdout.write(chalk.green(chunkContent));
      content += chunkContent; // Accumulate the content
    }

    // Return the accumulated content
    return { role: 'assistant', content: content.trim() };

  } catch (error) {
    console.error('Error from OpenAI:', error);
    throw error; // Pass the error up the chain
  }
}

export { chat };
