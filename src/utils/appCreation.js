import { spawn } from 'child_process';
import ora from 'ora';

// Function to run the Next.js app creation command with progress tracking
export function createNextAppWithProgress(appName) {
  return new Promise((resolve, reject) => {
    try {
      const command = 'npx';
      const args = [
        'create-next-app@latest', // Latest version of Next.js app creator
        appName,                  // The name of the app
        '--ts',                   // Use TypeScript
        '--tailwind',             // Use Tailwind CSS
        '--eslint',               // Include ESLint for linting
        '--app',                  // Use the new app directory structure
        '--src-dir',              // Put all the files inside the src/ directory
        '--use-npm',              // Use npm instead of yarn
        '--import-alias',         // Create an import alias
        '@/*',                    // Create an alias for importing from root
      ];

      const spinner = ora(`Creating Next.js app '${appName}'...`).start(); // Start spinner

      const process = spawn(command, args);

      // Capture stdout data and display it while the spinner runs
      process.stdout.on('data', (data) => {
        spinner.text = data.toString(); // Update spinner text with real-time output
      });

      // Capture stderr data (for errors or warnings) and display it while the spinner runs
      process.stderr.on('data', (data) => {
        spinner.text = data.toString(); // Show errors or warnings in the spinner
      });

      // When the process is finished
      process.on('close', (code) => {
        if (code === 0) {
          spinner.succeed(`Next.js app '${appName}' created successfully.`); // Success message
          resolve();  // Resolve the promise
        } else {
          spinner.fail(`Process exited with code ${code}`); // Fail message
          reject(new Error(`Process exited with code ${code}`));  // Reject the promise
        }
      });
    } catch (error) {
      spinner.fail('Failed to create the Next.js app.'); // If an error occurs
      reject(error);
    }
  });
}
