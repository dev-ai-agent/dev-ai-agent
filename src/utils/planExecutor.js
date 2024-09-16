import { chat } from "./aiHandler.js";
import { processResponse } from "./fileManager.js";
import {componentPrompt,pagePrompt,apiPrompt,dependencyPrompt} from '../prompt/index.js'

export async function executePlan(plan, appName, messages) {



  // Process APIs
  if (plan.apis && plan.apis.length > 0) {
    for (let api of plan.apis) {
      console.log(`\nCreating API: ${api.name} - ${api.description}\n`);

      messages.push({
        role: "user",
        content: `
        ${apiPrompt}
        Please generate the code for the API: ${api.name}. ${api.description}`,
      });

      const aiResponse = await chat(messages);

      // Append AI response to the messages for context
      messages.push({
        role: "assistant",
        content: aiResponse.content,
      });

      // Process the AI response and create the API files
      await processResponse(aiResponse.content, appName);
    }
  }
  
  // Process components
  if (plan.components && plan.components.length > 0) {
    for (let component of plan.components) {
      console.log(
        `\nCreating Component: ${component.name} - ${component.description}\n`
      );

      messages.push({
        role: "user",
        content: `${componentPrompt}

        Please generate the code for the component: ${component.name}. ${component.description}
        `,
      });

      const aiResponse = await chat(messages);

      // Append AI response to the messages for context
      messages.push({
        role: "assistant",
        content: aiResponse.content,
      });

      // Process the AI response and create the component files
      await processResponse(aiResponse.content, appName);
    }
  }

  // Process pages
  if (plan.pages && plan.pages.length > 0) {
    for (let page of plan.pages) {
      console.log(`\nCreating Page: ${page.name} - ${page.description}\n`);

      messages.push({
        role: "user",
        content: `${pagePrompt}
        
        generate the code for the page: ${page.name}. ${page.description}`,
      });

      const aiResponse = await chat(messages);

      // Append AI response to the messages for context
      messages.push({
        role: "assistant",
        content: aiResponse.content,
      });

      // Process the AI response and create the page files
      await processResponse(aiResponse.content, appName);
    }
  }


}
