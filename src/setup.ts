import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { Ora } from 'ora';
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

export async function setupProject(projectPath: string, config: SetupConfig, spinner?: Ora) {
  // Install dependencies
  if (spinner && spinner.isSpinning) {
    spinner.text = 'Installing dependencies (this may take a few minutes)...';
  }
  execSync('pnpm install', {
    cwd: projectPath,
    stdio: 'inherit',
  });
  if (spinner && spinner.isSpinning) {
    spinner.text = 'Dependencies installed';
  }

  // Initialize Supabase if using local
  if (!config.useProductionDatabase) {
    if (spinner && spinner.isSpinning) {
      spinner.text = 'Setting up local Supabase...';
    }
    await setupLocalSupabase(projectPath, spinner);
  }

  // Create .env files
  if (spinner && spinner.isSpinning) {
    spinner.text = 'Configuring environment variables...';
  }
  await createEnvFiles(projectPath, config);

  // Initialize git if not already initialized
  const gitPath = path.join(projectPath, '.git');
  if (!(await fs.pathExists(gitPath))) {
    if (spinner && spinner.isSpinning) {
      spinner.text = 'Initializing git repository...';
    }
    execSync('git init', {
      cwd: projectPath,
      stdio: 'pipe',
    });
  }
}

async function setupLocalSupabase(projectPath: string, spinner?: Ora) {
  // Check if Supabase CLI is installed
  if (!(await isSupabaseCliInstalled())) {
    spinner?.warn('Supabase CLI not found (optional - can install later)');
    return;
  }

  // Check if Docker is running
  if (!(await isDockerRunning())) {
    spinner?.warn('Docker is not running (optional - can start later)');
    return;
  }

  try {
    // Check if supabase directory already exists (from template)
    const supabasePath = path.join(projectPath, 'supabase');
    if (!(await fs.pathExists(supabasePath))) {
      if (spinner && spinner.isSpinning) {
        spinner.text = 'Initializing Supabase...';
      }
      execSync('npx supabase init', {
        cwd: projectPath,
        stdio: 'pipe',
      });
    }

    // Check if Supabase is already running
    if (await isSupabaseRunning(projectPath)) {
      if (spinner && spinner.isSpinning) {
        spinner.text = 'Supabase is already running';
      }
    } else {
      if (spinner && spinner.isSpinning) {
        spinner.text = 'Starting Supabase (this may take 1-2 minutes)...';
      }
      execSync('npx supabase start', {
        cwd: projectPath,
        stdio: 'pipe',
      });
      if (spinner && spinner.isSpinning) {
        spinner.text = 'Supabase started successfully';
      }
    }
  } catch (error) {
    spinner?.warn('Supabase setup skipped (can start manually later)');
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

