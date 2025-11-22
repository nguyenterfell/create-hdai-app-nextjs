import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import {
  isDockerRunning,
  isSupabaseCliInstalled,
  isSupabaseRunning,
  getSupabaseLocalCredentials,
  updateEnvFile,
} from './utils.js';

export interface SetupConfig {
  useProductionAuth?: boolean;
  useProductionDatabase?: string;
  useProductionDeploy?: boolean;
}

export async function setupProject(projectPath: string, config: SetupConfig) {
  // Install dependencies
  console.log(chalk.cyan('Installing dependencies...'));
  execSync('pnpm install', {
    cwd: projectPath,
    stdio: 'inherit',
  });

  // Initialize Supabase if using local
  if (!config.useProductionDatabase) {
    await setupLocalSupabase(projectPath);
  }

  // Create .env files
  await createEnvFiles(projectPath, config);

  // Initialize git if not already initialized
  const gitPath = path.join(projectPath, '.git');
  if (!(await fs.pathExists(gitPath))) {
    console.log(chalk.cyan('Initializing git repository...'));
    execSync('git init', {
      cwd: projectPath,
      stdio: 'inherit',
    });
  }
}

async function setupLocalSupabase(projectPath: string) {
  console.log(chalk.cyan('Setting up local Supabase development...'));

  // Check if Supabase CLI is installed
  if (!(await isSupabaseCliInstalled())) {
    console.warn(
      chalk.yellow(
        '⚠️  Supabase CLI not found. Install it with: npm install -g supabase'
      )
    );
    console.log(
      chalk.gray(
        '   You can still set up Supabase later. For now, using placeholder credentials.'
      )
    );
    return;
  }

  // Check if Docker is running
  if (!(await isDockerRunning())) {
    console.warn(
      chalk.yellow(
        '⚠️  Docker is not running. Please start Docker to use local Supabase.'
      )
    );
    console.log(
      chalk.gray(
        '   You can start Supabase later with: npx supabase start'
      )
    );
    return;
  }

  try {
    // Check if supabase directory already exists (from template)
    const supabasePath = path.join(projectPath, 'supabase');
    if (!(await fs.pathExists(supabasePath))) {
      console.log(chalk.cyan('Initializing Supabase...'));
      execSync('npx supabase init', {
        cwd: projectPath,
        stdio: 'inherit',
      });
    }

    // Check if Supabase is already running
    if (await isSupabaseRunning(projectPath)) {
      console.log(chalk.green('✅ Supabase is already running'));
      // Fetch credentials will happen in createEnvFiles
    } else {
      console.log(chalk.cyan('Starting Supabase (this may take a moment)...'));
      execSync('npx supabase start', {
        cwd: projectPath,
        stdio: 'inherit',
      });
      console.log(chalk.green('✅ Supabase started successfully'));
    }
  } catch (error) {
    console.warn(
      chalk.yellow(
        '⚠️  Failed to start Supabase. You can start it manually later with: npx supabase start'
      )
    );
  }
}

async function createEnvFiles(projectPath: string, config: SetupConfig) {
  const envExamplePath = path.join(projectPath, '.env.example');
  const envLocalPath = path.join(projectPath, '.env.local');

  // Create .env.local from .env.example if it doesn't exist
  if (await fs.pathExists(envExamplePath) && !(await fs.pathExists(envLocalPath))) {
    await fs.copyFile(envExamplePath, envLocalPath);
  }

  // If .env.local doesn't exist, create it with defaults
  if (!(await fs.pathExists(envLocalPath))) {
    let defaultContent = '# Environment Variables\n\n';
    
    if (config.useProductionDatabase) {
      defaultContent += '# Production Database\n';
      defaultContent += '# DATABASE_URL=your-production-database-url\n\n';
    } else {
      defaultContent += '# Local Supabase Database\n';
      defaultContent += 'DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres\n\n';
    }

    if (config.useProductionAuth) {
      defaultContent += '# Production Supabase Auth\n';
      defaultContent += '# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url\n';
      defaultContent += '# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key\n\n';
    } else {
      defaultContent += '# Local Supabase Auth\n';
      defaultContent += 'NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321\n';
      defaultContent += 'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key\n\n';
    }

    defaultContent += '# Application URL\n';
    defaultContent += 'NEXT_PUBLIC_SITE_URL=http://localhost:3000\n';

    await fs.writeFile(envLocalPath, defaultContent, 'utf-8');
  }

  // Try to fetch local Supabase credentials if using local setup
  if (!config.useProductionDatabase && !config.useProductionAuth) {
    const credentials = await getSupabaseLocalCredentials(projectPath);
    if (credentials) {
      console.log(chalk.green('✅ Fetched local Supabase credentials'));
      await updateEnvFile(envLocalPath, {
        NEXT_PUBLIC_SUPABASE_URL: credentials.apiUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: credentials.anonKey,
        DATABASE_URL: credentials.dbUrl,
      });
    } else {
      console.log(
        chalk.yellow(
          '⚠️  Could not fetch Supabase credentials. Make sure Supabase is running.'
        )
      );
      console.log(
        chalk.gray('   Run: npx supabase start, then update .env.local manually')
      );
    }
  } else {
    // Update with production placeholders if needed
    const updates: Record<string, string> = {};
    
    if (config.useProductionDatabase) {
      // Remove local DB URL if it exists, add production placeholder
      let content = await fs.readFile(envLocalPath, 'utf-8');
      content = content.replace(/^DATABASE_URL=.*$/m, '');
      if (!content.includes('DATABASE_URL')) {
        content += '\n# Production Database\n';
        content += '# DATABASE_URL=your-production-database-url\n';
      }
      await fs.writeFile(envLocalPath, content, 'utf-8');
    }

    if (config.useProductionAuth) {
      // Remove local auth if it exists, add production placeholders
      let content = await fs.readFile(envLocalPath, 'utf-8');
      content = content.replace(/^NEXT_PUBLIC_SUPABASE_URL=.*$/m, '');
      content = content.replace(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$/m, '');
      if (!content.includes('NEXT_PUBLIC_SUPABASE_URL')) {
        content += '\n# Production Supabase Auth\n';
        content += '# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url\n';
        content += '# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key\n';
      }
      await fs.writeFile(envLocalPath, content, 'utf-8');
    }
  }
}

