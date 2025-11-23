import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import inquirer from 'inquirer';
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
      missing.push('Docker Desktop (must be installed AND opened/running)');
      warnings.push('Docker Desktop is required to run Supabase locally.');
      warnings.push('   → Download: https://www.docker.com/products/docker-desktop');
      warnings.push('   → After installation, OPEN Docker Desktop application');
      warnings.push('   → Wait for Docker to fully start (check system tray for whale icon)');
      warnings.push('   → Verify: docker info');
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

  // Final step: Check what needs to be started and run connectivity tests
  await runFinalConnectivityCheck(projectPath, config, spinner);
}

async function setupLocalSupabase(projectPath: string, spinner?: Ora) {
  // Check if Supabase CLI is installed
  if (!(await isSupabaseCliInstalled())) {
    spinner?.warn('Supabase CLI not found (optional - can install later)');
    return;
  }

  // Check if Docker is running
  if (!(await isDockerRunning())) {
    spinner?.warn('Docker Desktop is not running. Please install and open Docker Desktop, then try again.');
    console.log(chalk.yellow('   → Download: https://www.docker.com/products/docker-desktop'));
    console.log(chalk.yellow('   → After installation, OPEN Docker Desktop application'));
    console.log(chalk.yellow('   → Wait for Docker to fully start, then run: npx supabase start'));
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

async function runFinalConnectivityCheck(
  projectPath: string,
  config: SetupConfig,
  spinner?: Ora
) {
  // Stop spinner for user interaction
  if (spinner && spinner.isSpinning) {
    spinner.stop();
  }

  console.log(chalk.blue('\n🔍 Final Connectivity Check\n'));
  console.log(chalk.gray('─'.repeat(60)));

  // Check what needs to be started/configured
  const needsSetup = await checkWhatNeedsSetup(projectPath, config);

  // Display requirements if there are any issues (services, config, or prerequisites)
  const hasIssues = 
    needsSetup.servicesToStart.length > 0 || 
    needsSetup.configNeeded.length > 0 || 
    needsSetup.missingPrerequisites.length > 0;

  if (hasIssues) {
    // Display what needs to be done
    displaySetupRequirements(needsSetup);

    // If there are missing prerequisites, we can't proceed with starting services
    // but we can still run connectivity tests to show what's missing
    if (needsSetup.missingPrerequisites.length > 0) {
      console.log(chalk.yellow('\n⚠️  Missing prerequisites detected. Connectivity tests will likely fail.\n'));
      console.log(chalk.gray('   You can still run connectivity tests to see what needs to be configured.\n'));
      
      // Ask if user wants to proceed with tests anyway
      const { shouldTest } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldTest',
          message: 'Would you like to run connectivity tests anyway? (They will likely fail)',
          default: false,
        },
      ]);

      if (!shouldTest) {
        console.log(chalk.yellow('\n⏭️  Skipping connectivity tests. Fix prerequisites and run "pnpm test:connectivity" later.\n'));
        return;
      }
    } else {
      // No missing prerequisites, can start services and run tests
      const { shouldStart } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldStart',
          message: 'Would you like to start necessary services and run connectivity tests now?',
          default: true,
        },
      ]);

      if (!shouldStart) {
        console.log(chalk.yellow('\n⏭️  Skipping connectivity tests. You can run them later with: pnpm test:connectivity\n'));
        return;
      }

      // Start services if needed
      if (needsSetup.servicesToStart.length > 0) {
        if (spinner) {
          spinner.start('Starting services...');
        }
        await startRequiredServices(projectPath, needsSetup.servicesToStart, spinner);
      }
    }
  }

  // Run connectivity tests
  if (spinner) {
    spinner.start('Running connectivity tests...');
  }
  await testConnectivity(projectPath, config, spinner);
}

interface SetupRequirements {
  servicesToStart: string[];
  configNeeded: Array<{
    type: 'database' | 'auth';
    message: string;
    action: string;
  }>;
  missingPrerequisites: string[];
}

/**
 * Unified validation function to check if an environment variable value is configured.
 * This ensures consistent validation logic across all checks.
 * 
 * @param value - The environment variable value to check
 * @param type - The type of variable ('database' or 'auth')
 * @returns true if the value is properly configured, false otherwise
 */
function isEnvValueConfigured(value: string, type: 'database' | 'auth'): boolean {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();

  // Check if it's a comment (starts with #)
  if (trimmed.startsWith('#')) {
    return false;
  }

  // Strip inline comments (everything after #)
  // This handles cases like: DATABASE_URL=postgresql://url #comment
  // Note: # is very unlikely to be part of a valid database URL or Supabase URL,
  // so we can safely treat any # as the start of a comment
  let valueWithoutComment = trimmed;
  const commentIndex = trimmed.indexOf('#');
  if (commentIndex !== -1) {
    valueWithoutComment = trimmed.substring(0, commentIndex).trim();
  }

  // If after stripping comments, the value is empty, it's not configured
  if (!valueWithoutComment) {
    return false;
  }

  // Check for placeholder patterns specific to our templates
  const placeholderPatterns = {
    database: [
      'your-production-database-url',
      'your-production',
      'your-local-anon-key', // Sometimes used as placeholder
    ],
    auth: [
      'your-supabase-url',
      'your-supabase-anon-key',
      'your-supabase',
      'your-local-anon-key',
    ],
  };

  const patterns = placeholderPatterns[type];
  for (const pattern of patterns) {
    if (valueWithoutComment.includes(pattern)) {
      return false;
    }
  }

  // Value is configured if it's not empty, not a comment, doesn't have inline comments, and doesn't contain placeholders
  return valueWithoutComment.length > 0;
}

async function checkWhatNeedsSetup(
  projectPath: string,
  config: SetupConfig
): Promise<SetupRequirements> {
  const requirements: SetupRequirements = {
    servicesToStart: [],
    configNeeded: [],
    missingPrerequisites: [],
  };

  const envLocalPath = path.join(projectPath, '.env.local');
  let envContent = '';
  if (await fs.pathExists(envLocalPath)) {
    envContent = await fs.readFile(envLocalPath, 'utf-8');
  }

  // Check for local development setup
  if (!config.useProductionDatabase && !config.useProductionAuth) {
    // Check if Supabase needs to be started
    const supabaseRunning = await isSupabaseRunning(projectPath);
    if (!supabaseRunning) {
      const dockerRunning = await isDockerRunning();
      if (dockerRunning) {
        requirements.servicesToStart.push('Supabase (local)');
      } else {
        requirements.missingPrerequisites.push('Docker Desktop (must be installed AND opened/running - required to run Supabase locally)');
      }
    }

    // Check if credentials need to be fetched
    if (envContent.includes('your-local-anon-key') || !envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      if (!supabaseRunning) {
        requirements.configNeeded.push({
          type: 'auth',
          message: 'Supabase credentials need to be fetched',
          action: 'Start Supabase to auto-fetch credentials',
        });
      }
    }
  }

  // Check for production database configuration
  if (config.useProductionDatabase) {
    const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
    const hasDbUrl = dbUrlMatch && isEnvValueConfigured(dbUrlMatch[1], 'database');
    if (!hasDbUrl) {
      const dbType = config.useProductionDatabase;
      requirements.configNeeded.push({
        type: 'database',
        message: `Production ${dbType} database URL not configured`,
        action: `Add DATABASE_URL to .env.local (get from ${dbType === 'supabase' ? 'Supabase' : dbType === 'neon' ? 'Neon' : 'your database provider'} dashboard)`,
      });
    }
  }

  // Check for production auth configuration
  if (config.useProductionAuth) {
    const authUrlMatch = envContent.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m);
    const authKeyMatch = envContent.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)$/m);
    const hasAuthUrl = authUrlMatch && isEnvValueConfigured(authUrlMatch[1], 'auth');
    const hasAuthKey = authKeyMatch && isEnvValueConfigured(authKeyMatch[1], 'auth');
    if (!hasAuthUrl || !hasAuthKey) {
      requirements.configNeeded.push({
        type: 'auth',
        message: 'Production Supabase Auth credentials not configured',
        action: 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (get from Supabase dashboard)',
      });
    }
  }

  return requirements;
}

function displaySetupRequirements(requirements: SetupRequirements) {
  console.log(chalk.yellow('\n📋 Setup Requirements:\n'));

  if (requirements.missingPrerequisites.length > 0) {
    console.log(chalk.red('❌ Missing Prerequisites:'));
    requirements.missingPrerequisites.forEach((item) => {
      console.log(chalk.red(`   • ${item}`));
    });
    console.log('');
  }

  if (requirements.servicesToStart.length > 0) {
    console.log(chalk.cyan('🚀 Services to Start:'));
    requirements.servicesToStart.forEach((service) => {
      console.log(chalk.white(`   • ${service}`));
    });
    console.log('');
  }

  if (requirements.configNeeded.length > 0) {
    console.log(chalk.yellow('⚙️  Configuration Needed:'));
    requirements.configNeeded.forEach((config) => {
      const icon = config.type === 'database' ? '🗄️' : '🔐';
      console.log(chalk.white(`   ${icon} ${config.message}`));
      console.log(chalk.gray(`      → ${config.action}`));
    });
    console.log('');
  }

  if (
    requirements.servicesToStart.length === 0 &&
    requirements.configNeeded.length === 0 &&
    requirements.missingPrerequisites.length === 0
  ) {
    console.log(chalk.green('✅ Everything is ready! Running connectivity tests...\n'));
  }
}

async function startRequiredServices(
  projectPath: string,
  services: string[],
  spinner?: Ora
) {
  for (const service of services) {
    if (service.includes('Supabase')) {
      try {
        if (spinner && spinner.isSpinning) {
          spinner.text = `Starting ${service}...`;
        }

        // Check if Supabase is already running
        if (await isSupabaseRunning(projectPath)) {
          if (spinner && spinner.isSpinning) {
            spinner.text = `${service} is already running`;
          }
          continue;
        }

        // Start Supabase
        execSync('npx supabase start', {
          cwd: projectPath,
          stdio: 'pipe',
        });

        // Fetch and update credentials
        const credentials = await getSupabaseLocalCredentials(projectPath);
        if (credentials) {
          const envLocalPath = path.join(projectPath, '.env.local');
          await updateEnvFile(envLocalPath, {
            NEXT_PUBLIC_SUPABASE_URL: credentials.apiUrl,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: credentials.anonKey,
            DATABASE_URL: credentials.dbUrl,
          });
          console.log(chalk.green(`✅ ${service} started and credentials updated`));
        } else {
          console.log(chalk.yellow(`⚠️  ${service} started but credentials not fetched`));
        }
      } catch (error) {
        console.log(chalk.red(`❌ Failed to start ${service}`));
        console.log(chalk.gray('   You can start it manually later with: npx supabase start'));
      }
    }
  }
}

async function testConnectivity(projectPath: string, config: SetupConfig, spinner?: Ora) {
  // Stop spinner to show test output clearly
  if (spinner && spinner.isSpinning) {
    spinner.stop();
  }

  try {
    // Check if .env.local exists
    const envLocalPath = path.join(projectPath, '.env.local');
    if (!(await fs.pathExists(envLocalPath))) {
      console.log(chalk.yellow('\n⚠️  Skipping connectivity tests: .env.local not found\n'));
      return;
    }

    // Run the connectivity test script
    execSync('pnpm test:connectivity', {
      cwd: projectPath,
      stdio: 'inherit',
    });
    
    // If we get here, tests passed
    console.log(chalk.green('\n✅ Connectivity tests completed successfully!\n'));
  } catch (error) {
    // The test script will output its own error messages
    // Now display comprehensive results and recommendations
    await displayConnectivityResults(projectPath, config);
  }
}

async function displayConnectivityResults(projectPath: string, config: SetupConfig) {
  console.log(chalk.yellow('\n📊 Connectivity Test Results & Recommendations\n'));
  console.log(chalk.gray('─'.repeat(60)));

  const envLocalPath = path.join(projectPath, '.env.local');
  if (!(await fs.pathExists(envLocalPath))) {
    console.log(chalk.red('\n❌ .env.local file not found'));
    console.log(chalk.white('   Create .env.local with your environment variables\n'));
    return;
  }

  const envContent = await fs.readFile(envLocalPath, 'utf-8');
  const recommendations: string[] = [];

  // Check database configuration
  const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
  const hasDbUrl = dbUrlMatch && isEnvValueConfigured(dbUrlMatch[1], 'database');
  
  if (!hasDbUrl) {
    console.log(chalk.red('❌ Database: Not configured'));
    if (config.useProductionDatabase) {
      const dbType = config.useProductionDatabase;
      console.log(chalk.white(`   Action: Add DATABASE_URL to .env.local`));
      console.log(chalk.gray(`   Get from: ${dbType === 'supabase' ? 'https://supabase.com/dashboard' : dbType === 'neon' ? 'https://neon.tech' : 'your database provider'}`));
    } else {
      console.log(chalk.white('   Action: Start Supabase locally'));
      console.log(chalk.gray('   Run: npx supabase start'));
    }
    recommendations.push('Configure DATABASE_URL in .env.local');
  } else {
    console.log(chalk.green('✅ Database: Configured'));
  }

  // Check auth configuration
  const authUrlMatch = envContent.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m);
  const authKeyMatch = envContent.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)$/m);
  const hasAuthUrl = authUrlMatch && isEnvValueConfigured(authUrlMatch[1], 'auth');
  const hasAuthKey = authKeyMatch && isEnvValueConfigured(authKeyMatch[1], 'auth');

  if (!hasAuthUrl || !hasAuthKey) {
    console.log(chalk.red('❌ Auth: Not configured'));
    if (config.useProductionAuth) {
      console.log(chalk.white('   Action: Add Supabase Auth credentials to .env.local'));
      console.log(chalk.gray('   Get from: https://supabase.com/dashboard/project/_/settings/api'));
    } else {
      console.log(chalk.white('   Action: Start Supabase to auto-fetch credentials'));
      console.log(chalk.gray('   Run: npx supabase start'));
    }
    recommendations.push('Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  } else {
    console.log(chalk.green('✅ Auth: Configured'));
  }

  // Display recommendations
  if (recommendations.length > 0) {
    console.log(chalk.yellow('\n📝 Next Steps:\n'));
    recommendations.forEach((rec, index) => {
      console.log(chalk.white(`   ${index + 1}. ${rec}`));
    });
    console.log(chalk.gray('\n   After fixing, run: pnpm test:connectivity\n'));
  } else {
    console.log(chalk.green('\n✅ All services are configured!\n'));
  }
}

