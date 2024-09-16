import fs from 'fs';
import path from 'path';

export async function processResponse(response, projectDir) {
  try {
    console.log("\nCreating files...");
    const lines = response.split("\n");

    let currentFile = "";
    let fileContent = [];
    let insideCodeBlock = false;

    for (const line of lines) {
      let trimmedLine = line.replace(/\*/g, '').trim();

      if (trimmedLine.startsWith("FILE:")) {
        // Write the previous file if there's any content
        if (currentFile && fileContent.length > 0) {
          await writeFile(`${projectDir}/${currentFile}`, fileContent.join("\n"));
        }

        // Start tracking the new file
        currentFile = trimmedLine.split("FILE: ")[1].trim();
        fileContent = [];
        continue;
      }

      if (trimmedLine.startsWith("```")) {
        insideCodeBlock = !insideCodeBlock;
        continue;
      }

      // Collect lines inside the code block
      if (insideCodeBlock && currentFile) {
        fileContent.push(trimmedLine);
      }
    }

    // Write the last file if there's any content
    if (currentFile && fileContent.length > 0) {
      await writeFile(`${projectDir}/${currentFile}`, fileContent.join("\n"));
    }

    console.log('All files created successfully.');
  } catch (error) {
    console.error("Error creating files:", error);
    throw error;
  }
}


async function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    
    // Create the directory if it doesn't exist (recursively)
    await fs.promises.mkdir(dir, { recursive: true });
    
    // Write the file content
    await fs.promises.writeFile(filePath, content);

    console.log(`File '${filePath}' created successfully.`);
  } catch (err) {
    console.error(`Error writing to file ${filePath}:`, err);
    throw err; // Re-throw error to allow handling by the caller
  }
}