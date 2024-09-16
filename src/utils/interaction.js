import inquirer from 'inquirer';

export async function askQuestion(args) {
  let message = "Dev AI: I am ready for the next task \nYou:";
  if (args === "create app") {
    message = "Dev AI: Hello, I am your AI agent. How can I help you with development? \nYou:";
  }

  let userInput = '';

  // Loop until valid input is provided
  while (true) {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "user_input",
        message: message,
        prefix: "",
      },
    ]);

    userInput = answers.user_input.trim();

    if (userInput !== "") {
      break; // Exit the loop if valid input is provided
    }

    console.log("Input cannot be empty. Please provide a valid response.");
  }

  return userInput;
}

export function askAppDetails() {
  return inquirer.prompt([
    {
      type: "input",
      name: "appName",
      message: "What is the app name? (No spaces allowed):",
      validate: function (input) {
        if (input.trim() === "") {
          return "App name is required!";
        }
        if (/\s/.test(input)) {
          return "App name cannot contain spaces. Please enter a valid name.";
        }
        return true;
      },
    },
  ]);
}