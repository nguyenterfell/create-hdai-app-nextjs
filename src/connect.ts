import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

export interface ConnectOptions {
  auth?: boolean;
  database?: string;
  deploy?: boolean;
  path?: string;
}

export async function connectService(options: ConnectOptions) {
  const projectPath = path.resolve(options.path || process.cwd());

  if (!(await fs.pathExists(projectPath))) {
    throw new Error(`Project not found at ${projectPath}`);
  }

  // Interactive prompts if needed
  if (!options.auth && !options.database && !options.deploy) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'auth',
        message: 'Connect production Supabase Auth?',
        default: false,
      },
      {
        type: 'list',
        name: 'database',
        message: 'Connect production database?',
        choices: [
          { name: 'Skip', value: undefined },
          { name: 'Supabase', value: 'supabase' },
          { name: 'Neon', value: 'neon' },
          { name: 'Custom PostgreSQL', value: 'custom' },
        ],
        default: 0,
      },
      {
        type: 'confirm',
        name: 'deploy',
        message: 'Set up Vercel deployment?',
        default: false,
      },
    ]);

    Object.assign(options, answers);
  }

  // Connect services
  if (options.auth) {
    await connectAuth(projectPath);
  }

  if (options.database) {
    await connectDatabase(projectPath, options.database);
  }

  if (options.deploy) {
    await connectDeploy(projectPath);
  }

  console.log(chalk.green('\n✅ Services connected successfully!'));
}

async function connectAuth(projectPath: string) {
  const envPath = path.join(projectPath, '.env.local');
  
  // Backup existing .env.local
  if (await fs.pathExists(envPath)) {
    const backupPath = `${envPath}.backup.${Date.now()}`;
    await fs.copyFile(envPath, backupPath);
    console.log(chalk.gray(`   Backup created: ${path.basename(backupPath)}`));
  }
  
  // Prompt for Supabase credentials
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Enter your Supabase project URL:',
      validate: (input) => {
        if (!input || input.length === 0) {
          return 'URL is required';
        }
        if (!input.startsWith('http://') && !input.startsWith('https://')) {
          return 'URL must start with http:// or https://';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'anonKey',
      message: 'Enter your Supabase anon key:',
      validate: (input) => {
        if (!input || input.length === 0) {
          return 'Anon key is required';
        }
        if (input.length < 20) {
          return 'Anon key seems too short';
        }
        return true;
      },
    },
  ]);

  // Test connection before saving
  console.log(chalk.cyan('   Testing connection...'));
  const { testSupabaseConnection } = await import('./utils.js');
  const isConnected = await testSupabaseConnection(answers.url, answers.anonKey);
  
  if (!isConnected) {
    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Connection test failed. Continue anyway?',
        default: false,
      },
    ]);
    if (!confirm.continue) {
      console.log(chalk.yellow('   Cancelled. No changes made.'));
      return;
    }
  } else {
    console.log(chalk.green('   ✓ Connection successful'));
  }

  // Update .env.local
  let envContent = '';
  if (await fs.pathExists(envPath)) {
    envContent = await fs.readFile(envPath, 'utf-8');
  }

  // Remove local auth config (handle various formats)
  envContent = envContent.replace(/^NEXT_PUBLIC_SUPABASE_URL=.*$/gm, '');
  envContent = envContent.replace(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$/gm, '');
  envContent = envContent.replace(/# Local Supabase Auth.*?\n/g, '');
  envContent = envContent.replace(/# Production Supabase Auth.*?\n/g, '');

  // Clean up multiple blank lines
  envContent = envContent.replace(/\n{3,}/g, '\n\n');

  // Add production auth config
  if (!envContent.endsWith('\n') && envContent.length > 0) {
    envContent += '\n';
  }
  envContent += '# Production Supabase Auth\n';
  envContent += `NEXT_PUBLIC_SUPABASE_URL=${answers.url}\n`;
  envContent += `NEXT_PUBLIC_SUPABASE_ANON_KEY=${answers.anonKey}\n`;

  await fs.writeFile(envPath, envContent, 'utf-8');
  console.log(chalk.green('   ✅ Auth configuration updated'));
}

async function connectDatabase(projectPath: string, provider: string) {
  const envPath = path.join(projectPath, '.env.local');

  // Backup existing .env.local
  if (await fs.pathExists(envPath)) {
    const backupPath = `${envPath}.backup.${Date.now()}`;
    await fs.copyFile(envPath, backupPath);
    console.log(chalk.gray(`   Backup created: ${path.basename(backupPath)}`));
  }

  let databaseUrl = '';
  if (provider === 'custom') {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Enter your PostgreSQL connection string:',
        validate: (input) => {
          if (!input || input.length === 0) {
            return 'Connection string is required';
          }
          if (!input.startsWith('postgresql://') && !input.startsWith('postgres://')) {
            return 'Connection string must start with postgresql:// or postgres://';
          }
          return true;
        },
      },
    ]);
    databaseUrl = answer.url;
  } else {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: `Enter your ${provider} database connection string:`,
        validate: (input) => {
          if (!input || input.length === 0) {
            return 'Connection string is required';
          }
          if (!input.startsWith('postgresql://') && !input.startsWith('postgres://')) {
            return 'Connection string must start with postgresql:// or postgres://';
          }
          return true;
        },
      },
    ]);
    databaseUrl = answer.url;
  }

  // Test connection before saving
  console.log(chalk.cyan('   Testing connection...'));
  const { testDatabaseConnection } = await import('./utils.js');
  const isConnected = await testDatabaseConnection(databaseUrl);
  
  if (!isConnected) {
    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Connection test failed or could not verify. Continue anyway?',
        default: false,
      },
    ]);
    if (!confirm.continue) {
      console.log(chalk.yellow('   Cancelled. No changes made.'));
      return;
    }
  } else {
    console.log(chalk.green('   ✓ Connection successful'));
  }

  // Update .env.local
  let envContent = '';
  if (await fs.pathExists(envPath)) {
    envContent = await fs.readFile(envPath, 'utf-8');
  }

  // Remove local database config (handle various formats)
  envContent = envContent.replace(/^DATABASE_URL=.*$/gm, '');
  envContent = envContent.replace(/# Local Supabase.*?\n/g, '');
  envContent = envContent.replace(/# Production Database.*?\n/g, '');

  // Clean up multiple blank lines
  envContent = envContent.replace(/\n{3,}/g, '\n\n');

  // Add production database config
  if (!envContent.endsWith('\n') && envContent.length > 0) {
    envContent += '\n';
  }
  envContent += '# Production Database\n';
  envContent += `DATABASE_URL=${databaseUrl}\n`;

  await fs.writeFile(envPath, envContent, 'utf-8');
  console.log(chalk.green('   ✅ Database configuration updated'));
}

async function connectDeploy(projectPath: string) {
  // Create vercel.json if it doesn't exist
  const vercelPath = path.join(projectPath, 'vercel.json');
  if (!(await fs.pathExists(vercelPath))) {
    await fs.writeJSON(vercelPath, {
      buildCommand: 'pnpm run build',
      outputDirectory: '.next',
      framework: 'nextjs',
    });
  }

  console.log(chalk.cyan('\n📝 Vercel configuration created!'));
  console.log(chalk.gray('Next steps:'));
  console.log('  1. Install Vercel CLI: npm i -g vercel');
  console.log('  2. Run: vercel');
  console.log('  3. Or connect your repo to Vercel dashboard');
}


