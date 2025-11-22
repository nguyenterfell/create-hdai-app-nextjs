import fs from 'fs-extra';
import path from 'path';

export async function copyTemplate(
  sourceDir: string,
  targetDir: string,
  context: Record<string, any>
) {
  if (!(await fs.pathExists(sourceDir))) {
    throw new Error(`Template directory not found: ${sourceDir}`);
  }

  // Recursively copy all files
  await copyDirectory(sourceDir, targetDir);
}

async function copyDirectory(source: string, target: string) {
  await fs.ensureDir(target);
  
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

export async function processTemplateFiles(
  projectPath: string,
  replacements: Record<string, any>
) {
  // Recursively process all files
  await processDirectory(projectPath, replacements);
}

async function processDirectory(dir: string, replacements: Record<string, any>) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .git, .next, etc.
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === '.next' ||
      entry.name === 'dist' ||
      entry.name.startsWith('.')
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      await processDirectory(fullPath, replacements);
    } else {
      // Process file
      let content = await fs.readFile(fullPath, 'utf-8');
      let modified = false;

      // Replace template variables
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        if (content.includes(`{{${key}}}`)) {
          content = content.replace(regex, String(value));
          modified = true;
        }
      }

      if (modified) {
        await fs.writeFile(fullPath, content, 'utf-8');
      }
    }
  }
}

