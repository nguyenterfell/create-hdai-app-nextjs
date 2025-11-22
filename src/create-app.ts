import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { copyTemplate, processTemplateFiles } from './template.js';
import { setupProject } from './setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CreateAppOptions {
  projectName: string;
  path: string;
  full?: boolean;
  auth?: boolean;
  database?: string;
  deploy?: boolean;
  fast?: boolean;
}

export async function createApp(options: CreateAppOptions) {
  let { projectName, path: basePath, fast } = options;
  
  // Prompt for project name if not provided
  if (!projectName) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of your project?',
        default: 'my-app',
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return 'Project name cannot be empty';
          }
          // Check for valid directory name characters
          if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
            return 'Project name can only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        },
      },
    ]);
    projectName = answer.projectName;
  }

  const projectPath = path.resolve(basePath, projectName);

  // Check if directory exists
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Directory ${projectName} already exists`);
  }

  // Determine configuration
  let config = {
    useProductionAuth: options.auth || options.full || false,
    useProductionDatabase: options.database || (options.full ? 'supabase' : undefined),
    useProductionDeploy: options.deploy || options.full || false,
  };

  // Interactive prompts if not fast mode
  if (!fast && !options.full) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useProductionAuth',
        message: 'Configure production Supabase Auth now? (No = use local Supabase for development)',
        default: false,
        when: !options.auth,
      },
      {
        type: 'list',
        name: 'useProductionDatabase',
        message: 'Configure production database now? (Select "No" to use local Supabase for development)',
        choices: [
          { name: 'No - use local Supabase for development', value: undefined },
          { name: 'Yes - Supabase (production)', value: 'supabase' },
          { name: 'Yes - Neon (production)', value: 'neon' },
          { name: 'Yes - Custom PostgreSQL (production)', value: 'custom' },
        ],
        default: 0,
        when: !options.database && !options.full,
      },
      {
        type: 'confirm',
        name: 'useProductionDeploy',
        message: 'Add Vercel deployment configuration now? (You can add this later)',
        default: false,
        when: !options.deploy && !options.full,
      },
    ]);

    config = { ...config, ...answers };
  }

  // Create project directory
  await fs.ensureDir(projectPath);

  // Copy template files
  const templateDir = path.join(__dirname, '..', 'templates', 'app');
  await copyTemplate(templateDir, projectPath, {
    projectName,
    ...config,
  });

  // Process template files (replace placeholders)
  await processTemplateFiles(projectPath, {
    PROJECT_NAME: projectName,
    USE_PRODUCTION_AUTH: config.useProductionAuth ? 'true' : 'false',
    USE_PRODUCTION_DATABASE: config.useProductionDatabase || 'false',
    USE_PRODUCTION_DEPLOY: config.useProductionDeploy ? 'true' : 'false',
  });

  // Run setup
  await setupProject(projectPath, config);

  console.log(chalk.green(`\n✅ Created ${projectName} at ${projectPath}`));
}

