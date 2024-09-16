import { spawn } from 'child_process';
import ora from 'ora';

// Extract modules from the AI response
export function extractModules(rawResponse) {
  const match = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    try {
      const jsonString = match[1].trim();
      const parsedData = JSON.parse(jsonString);
      return (
        parsedData.modules.map(
          (module) => `${module.name}@${module.version}`,
        ) || []
      );
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  } else {
    console.error('No JSON block found or incorrect format');
    return [];
  }
}

// Install a single module asynchronously
async function installModule(module, directory) {
  return new Promise((resolve, reject) => {
    const command = 'npm';
    const args = ['install', module, '--save'];

    const spinner = ora(`Installing module: ${module}...`).start();

    const process = spawn(command, args, { shell: true, cwd: directory });

    process.stdout.on('data', (data) => {
      spinner.text = data.toString();
    });

    process.stderr.on('data', (data) => {
      spinner.text = data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(`Module '${module}' installed successfully.`);
        resolve();
      } else {
        spinner.fail(
          `Failed to install module: ${module}. Exited with code ${code}`,
        );
        reject(
          new Error(
            `Failed to install module: ${module}. Exited with code ${code}`,
          ),
        );
      }
    });
  });
}

// Install modules one by one asynchronously
export async function installModulesWithProgress(modulesList, directory) {
  for (const module of modulesList) {
    try {
      await installModule(module, directory);
    } catch (error) {
      console.error(`Error installing module ${module}:`, error);
      break; // Stop the installation process if a module fails
    }
  }
}

// Main function to extract and install modules from AI's response asynchronously
export async function installModulesFromResponse(rawResponse, directory) {
  const modules = extractModules(rawResponse);
  if (modules.length > 0) {
    try {
      await installModulesWithProgress(modules, directory);
      console.log('All modules installed successfully!');

      // const command = 'npm';
      // const args = ['run', 'dev'];

      // spawn(command, args, { shell: true, cwd: directory });
    } catch (error) {
      console.error('Installation failed:', error);
    }
  } else {
    console.error('No modules found to install.');
  }
}
