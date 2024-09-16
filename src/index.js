#!/usr/bin/env node

import { askAppDetails, askQuestion } from './utils/interaction.js';
import inquirer from 'inquirer';
import { createNextAppWithProgress } from './utils/appCreation.js';
import { chat } from './utils/aiHandler.js';
import { executePlan } from './utils/planExecutor.js';
import { installModulesFromResponse } from './utils/moduleInstaller.js';
import chalk from 'chalk';

import { dependencyPrompt } from './prompt/index.js';

const model = 'llama3.1';
const messages = [
  {
    role: 'system',
    content: `You are a developer agent tasked with generating code for a Next.js app or component based on user request on creating app or component or feature.
      - No special format required in output.
      - High imp i want entire implementaion do leave any block empty for me to excute
      - High imp rule: i am using "FILE: " so all file name shuld be in this format "FILE: [file name]" 
      - High imp rule: iam using  \`\`\` to extact code so maintain that 
      - Do not use ** any formating 
    `,
  },
];

function main(args) {
  let message = 'Dev AI: I am ready for next task  \nYou:';

  if (args === 'create app')
    message =
      "Dev AI: Hey there, developer! I'm Dev.AI, your AI coding assistant – ready to help you build, debug, and innovate. How can I assist you today? \nYou:";

  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'user_input',
        message: chalk.greenBright(message),
        prefix: '',
      },
    ])
    .then(async (answers) => {
      try {
        // Step 1: Get user input
        const user_input = answers.user_input.trim();
        if (user_input === 'bye') {
          console.log('Thank you. Goodbye.');
          process.exit(0);
        }

        if (user_input.toLowerCase().includes('create a')) {
          const appDetails = await askAppDetails();

          console.log('\nRequesting development plan from AI...\n');

          //Step 2: Ask the AI for a structured JSON plan
          messages.push({
            role: 'user',
            content: `Please provide a detailed plan for creating a ${user_input}.
                      Ensure the response is in JSON format and includes components, pages, and APIs that need to be created.
                      - important: only provide plan for now no code for next response.
                      - this is next js project so page component do not contain any state logic in consume appWrapper component
                      - Here is the plan structure:
                      - Create the entire outline of the project with folder stracture required components and page for the app
                      example response:

                      ##### PLAN example output:
                      \`\`\`json
                      {
                        "apis": [
                          { "name": "APIName", "description": "create the api desgin before start of the app" }
                        ],
                        "components": [
                          { "name": "ComponentName", "description": "create the component and consume the api if required for this building block" }
                        ],
                        "pages": [
                          { "name": "PageName", "description": "consume the compnent created before and build app" }
                        ],
                      }`,
          });

          let plan;

          try {
            // Push user input to the messages array

            const aiPlanResponse = await chat(messages);

            console.log(aiPlanResponse, 'response');

            // Append the AI's plan response to the messages for context
            messages.push({
              role: 'assistant',
              content: aiPlanResponse.content,
            });

            // Parse the AI's JSON response
            plan = await extractJsonFromMarkdown(aiPlanResponse.content);
          } catch (error) {
            console.error('Error parsing AI response:', error);
            return;
          }

          console.log(
            '\nDevelopment Plan Received:\n',
            JSON.stringify(plan, null, 2),
          );

          // setep 2: create a folder
          await createNextAppWithProgress(appDetails.appName);

          // Step 3: Execute the plan based on the AI’s JSON response
          await executePlan(plan, appDetails.appName, messages);

          // Step 4: Install necessary modules based on AI response
          // module executer
          messages.push({
            role: 'user',
            content: `
            ${dependencyPrompt}`,
          });
          const aiResponse = await chat(messages);

          await installModulesFromResponse(aiResponse.content,`./${appDetails.appName}`);

          console.log('\nApp creation completed successfully!\n');
        }

        main(); // Rerun for next interaction
      } catch (error) {
        console.error(error);
      }
    });
}

main('create app');

async function extractJsonFromMarkdown(input) {
  // Step 1: Use a regular expression to extract the JSON content between the ```json block
  const jsonMatch = input.match(/```json([\s\S]*?)```/);

  // Step 2: Check if a match was found
  if (jsonMatch && jsonMatch[1]) {
    const jsonString = jsonMatch[1].trim(); // Clean up any extra spaces or newlines

    // Step 3: Parse the JSON content
    try {
      const parsedJson = JSON.parse(jsonString);
      return parsedJson;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null; // Return null if parsing fails
    }
  } else {
    console.error('No JSON block found.');
    return null; // Return null if no JSON block is found
  }
}
