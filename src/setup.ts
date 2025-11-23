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
  displayPrerequisites,
} from './utils.js';

async function checkPrerequisites(config: SetupConfig, spinner?: Ora) {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Check for local development prerequisites
  if (!config.useProductionDatabase && !config.useProductionAuth) {
    if (!(await isDockerRunning())) {
      missing.push('Docker Desktop');
      warnings.push('Docker is required to run Supabase locally. Install from https://www.docker.com/products/docker-desktop');
    }
    
    if (!(await isSupabaseCliInstalled())) {
      warnings.push('Supabase CLI not found. Will use npx supabase (slower but works)');
    }
  }
  
  // Display warnings
  if (missing.length > 0) {
    console.log(chalk.yellow('\n⚠️  Missing Prerequisites:\n'));
    missing.forEach((item) => {
      console.log(chalk.red(`   ❌ ${item}`));
    });
    console.log('');
    
    if (warnings.length > 0) {
      warnings.forEach((warning) => {
        console.log(chalk.yellow(`   ⚠️  ${warning}`));
      });
      console.log('');
    }
    
    console.log(chalk.yellow('   You can continue, but local Supabase setup may fail.'));
    console.log(chalk.yellow('   You can install missing prerequisites and run setup later.\n'));
  } else if (warnings.length > 0) {
    warnings.forEach((warning) => {
      spinner?.warn(warning);
    });
  }
}

export interface SetupConfig {
  useProductionAuth?: boolean;
  useProductionDatabase?: string;
  useProductionDeploy?: boolean;
}

export async function setupProject(projectPath: string, config: SetupConfig, spinner?: Ora) {
  // Display prerequisites and setup instructions
  if (spinner && spinner.isSpinning) {
    spinner.stop();
  }
  displayPrerequisites(config);
  
  // Check for missing prerequisites and warn user
  await checkPrerequisites(config, spinner);
  
  if (spinner) {
    spinner.start('Starting setup...');
  }
  
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

  // Test connectivity to database and auth services
  if (spinner && spinner.isSpinning) {
    spinner.text = 'Testing connectivity...';
  }
  await testConnectivity(projectPath, spinner);
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
        const dbType = config.useProductionDatabase;
        content += '\n# Production Database\n';
        if (dbType === 'supabase') {
          content += '# Get your connection string from: https://supabase.com/dashboard/project/_/settings/database\n';
        } else if (dbType === 'neon') {
          content += '# Get your connection string from: https://console.neon.tech/\n';
        } else {
          content += '# Use your PostgreSQL connection string\n';
        }
        content += '# DATABASE_URL=postgresql://user:password@host:port/database\n';
      }
      await fs.writeFile(envLocalPath, content, 'utf-8');
      
      console.log(chalk.yellow('\n⚠️  Production Database Configuration Needed:'));
      const dbType = config.useProductionDatabase;
      if (dbType === 'supabase') {
        console.log(chalk.white('   1. Create a Supabase project at https://supabase.com'));
        console.log(chalk.white('   2. Get your database connection string from Project Settings > Database'));
        console.log(chalk.white('   3. Update DATABASE_URL in .env.local'));
      } else if (dbType === 'neon') {
        console.log(chalk.white('   1. Create a Neon project at https://neon.tech'));
        console.log(chalk.white('   2. Get your connection string from the dashboard'));
        console.log(chalk.white('   3. Update DATABASE_URL in .env.local'));
      } else {
        console.log(chalk.white('   1. Ensure your PostgreSQL database is accessible'));
        console.log(chalk.white('   2. Get your connection string (postgresql://user:pass@host:port/dbname)'));
        console.log(chalk.white('   3. Update DATABASE_URL in .env.local'));
      }
      console.log('');
    }

    if (config.useProductionAuth) {
      // Remove local auth if it exists, add production placeholders
      let content = await fs.readFile(envLocalPath, 'utf-8');
      content = content.replace(/^NEXT_PUBLIC_SUPABASE_URL=.*$/m, '');
      content = content.replace(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$/m, '');
      if (!content.includes('NEXT_PUBLIC_SUPABASE_URL')) {
        content += '\n# Production Supabase Auth\n';
        content += '# Get your credentials from: https://supabase.com/dashboard/project/_/settings/api\n';
        content += '# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url\n';
        content += '# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key\n';
      }
      await fs.writeFile(envLocalPath, content, 'utf-8');
      
      console.log(chalk.yellow('⚠️  Production Auth Configuration Needed:'));
      console.log(chalk.white('   1. Create a Supabase project at https://supabase.com (if not already done)'));
      console.log(chalk.white('   2. Get your project URL from Project Settings > API'));
      console.log(chalk.white('   3. Get your anon/public key from Project Settings > API'));
      console.log(chalk.white('   4. Update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'));
      console.log('');
    }
  }
}

async function testConnectivity(projectPath: string, spinner?: Ora) {
  try {
    // Check if .env.local exists
    const envLocalPath = path.join(projectPath, '.env.local');
    if (!(await fs.pathExists(envLocalPath))) {
      spinner?.warn('Skipping connectivity tests: .env.local not found');
      return;
    }

    // Run the connectivity test script
    execSync('pnpm test:connectivity', {
      cwd: projectPath,
      stdio: 'inherit',
    });
    
    if (spinner && spinner.isSpinning) {
      spinner.text = 'Connectivity tests passed';
    }
  } catch (error) {
    // The test script will output its own error messages
    // We just need to handle the case where the script fails
    spinner?.warn('Some connectivity tests failed. Check the output above for details.');
    
    // Display helpful instructions based on what might be missing
    console.log(chalk.yellow('\n📝 Setup Instructions:\n'));
    
    const envLocalPath = path.join(projectPath, '.env.local');
    if (await fs.pathExists(envLocalPath)) {
      const envContent = await fs.readFile(envLocalPath, 'utf-8');
      
      // Check what's missing or needs configuration
      const needsDatabase = !envContent.match(/^DATABASE_URL=(?!.*#).*$/m) || 
                           envContent.includes('your-production-database-url') ||
                           envContent.includes('your-local-anon-key');
      const needsAuth = !envContent.match(/^NEXT_PUBLIC_SUPABASE_URL=(?!.*#).*$/m) ||
                        envContent.includes('your-supabase-url') ||
                        envContent.includes('your-local-anon-key');
      
      if (needsDatabase) {
        console.log(chalk.cyan('🗄️  Database Setup:'));
        if (envContent.includes('localhost:54322')) {
          console.log(chalk.white('   1. Make sure Supabase is running:'));
          console.log(chalk.gray('      npx supabase start'));
          console.log(chalk.white('   2. Or update DATABASE_URL in .env.local with your production database URL'));
        } else {
          console.log(chalk.white('   1. Update DATABASE_URL in .env.local with your database connection string'));
          console.log(chalk.gray('      Format: postgresql://user:password@host:port/database'));
        }
        console.log('');
      }
      
      if (needsAuth) {
        console.log(chalk.cyan('🔐 Auth Setup:'));
        if (envContent.includes('localhost:54321')) {
          console.log(chalk.white('   1. Make sure Supabase is running:'));
          console.log(chalk.gray('      npx supabase start'));
          console.log(chalk.white('   2. The anon key will be fetched automatically when Supabase starts'));
        } else {
          console.log(chalk.white('   1. Get your Supabase project URL and anon key from:'));
          console.log(chalk.gray('      https://supabase.com/dashboard/project/_/settings/api'));
          console.log(chalk.white('   2. Update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'));
        }
        console.log('');
      }
    }
    
    console.log(chalk.yellow('💡 After configuring, run: pnpm test:connectivity\n'));
  }
}

