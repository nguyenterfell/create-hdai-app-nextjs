#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { createApp } from './create-app.js';
import { connectService } from './connect.js';
import { checkStatus } from './status.js';
import { verifySetup } from './verify.js';
import { checkDependencies, installPnpm, installLocalDependencies } from './utils.js';

// Run dependency check before initializing CLI
async function initializeCLI() {
  let checkResult = await checkDependencies();
  
  // Show warnings
  if (checkResult.warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️  Dependency Warnings:'));
    checkResult.warnings.forEach((warning) => {
      console.log(chalk.yellow(`   ${warning}`));
    });
    console.log(); // Empty line for spacing
  }
  
  // If dependencies are missing, offer to install them
  if (!checkResult.success) {
    console.log(chalk.yellow('\n⚠️  Dependency Check Results:\n'));
    checkResult.errors.forEach((error) => {
      console.log(chalk.yellow(`   ${error}`));
    });
    console.log();
    
    // Build list of installable items
    const itemsToInstall: string[] = [];
    const installActions: Array<() => Promise<boolean | { success: boolean; error?: string; needsSudo?: boolean }>> = [];
    
    if (checkResult.installable.pnpm.needsInstall) {
      itemsToInstall.push('pnpm (package manager)');
      installActions.push(async () => await installPnpm(false));
    } else if (checkResult.installable.pnpm.needsUpgrade) {
      itemsToInstall.push(`pnpm (upgrade from ${checkResult.installable.pnpm.currentVersion} to >=8.0.0)`);
      installActions.push(async () => await installPnpm(true));
    }
    
    if (checkResult.installable.localDeps.needsInstall) {
      itemsToInstall.push(`Local dependencies: ${checkResult.installable.localDeps.missing.join(', ')}`);
      installActions.push(async () => await installLocalDependencies());
    }
    
    // If there are installable items, prompt the user
    if (itemsToInstall.length > 0) {
      console.log(chalk.cyan('The following dependencies can be installed automatically:\n'));
      itemsToInstall.forEach((item, index) => {
        console.log(chalk.cyan(`   ${index + 1}. ${item}`));
      });
      console.log();
      
      const { shouldInstall } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldInstall',
          message: 'Would you like to install these dependencies now?',
          default: true,
        },
      ]);
      
      if (shouldInstall) {
        const spinner = ora('Installing dependencies...').start();
        
        try {
          // Install all items sequentially
          for (let i = 0; i < installActions.length; i++) {
            const result = await installActions[i]();
            
            // Handle pnpm installation result
            if (typeof result === 'object' && 'success' in result) {
              if (!result.success) {
                spinner.fail(chalk.red(`Failed to install: ${itemsToInstall[i]}`));
                
                if (result.needsSudo) {
                  console.error(chalk.yellow('\n⚠️  Permission Error: Global installation requires elevated privileges.\n'));
                  console.log(chalk.cyan('You have several options to install pnpm:\n'));
                  
                  console.log(chalk.white('1. Use sudo (requires password):'));
                  console.log(chalk.gray('   sudo npm install -g pnpm\n'));
                  
                  console.log(chalk.white('2. Use Corepack (recommended, no sudo needed):'));
                  console.log(chalk.gray('   corepack enable'));
                  console.log(chalk.gray('   corepack prepare pnpm@latest --activate\n'));
                  
                  console.log(chalk.white('3. Use a Node version manager (nvm, fnm, etc.):'));
                  console.log(chalk.gray('   # With nvm:'));
                  console.log(chalk.gray('   nvm install --lts'));
                  console.log(chalk.gray('   npm install -g pnpm\n'));
                  
                  console.log(chalk.white('4. Install via standalone script (no npm needed):'));
                  console.log(chalk.gray('   curl -fsSL https://get.pnpm.io/install.sh | sh -\n'));
                  
                  console.log(chalk.gray('After installing pnpm, run the command again.\n'));
                  console.log(chalk.gray('See docs/REQUIREMENTS.md for detailed instructions.\n'));
                } else {
                  console.error(chalk.red(`\nError: ${result.error || 'Installation failed'}\n`));
                  console.error(chalk.gray('See docs/REQUIREMENTS.md for detailed installation instructions.\n'));
                }
                process.exit(1);
              }
            } else if (result === false) {
              // Handle boolean return (for local dependencies)
              spinner.fail(chalk.red(`Failed to install: ${itemsToInstall[i]}`));
              console.error(chalk.red('\nPlease install dependencies manually.'));
              console.error(chalk.gray('See docs/REQUIREMENTS.md for detailed installation instructions.\n'));
              process.exit(1);
            }
          }
          
          spinner.succeed(chalk.green('Dependencies installed successfully!'));
          console.log();
          
          // Re-check dependencies after installation
          checkResult = await checkDependencies();
          
          if (!checkResult.success) {
            console.error(chalk.red('\n❌ Some dependencies are still missing after installation.\n'));
            checkResult.errors.forEach((error) => {
              console.error(chalk.red(`   ${error}`));
            });
            console.error(chalk.gray('\nSee docs/REQUIREMENTS.md for detailed installation instructions.\n'));
            process.exit(1);
          }
        } catch (error) {
          spinner.fail(chalk.red('Failed to install dependencies'));
          console.error(error);
          console.error(chalk.gray('\nSee docs/REQUIREMENTS.md for detailed installation instructions.\n'));
          process.exit(1);
        }
      } else {
        console.log(chalk.gray('\nInstallation cancelled. Please install dependencies manually.'));
        console.error(chalk.gray('See docs/REQUIREMENTS.md for detailed installation instructions.\n'));
        process.exit(1);
      }
    } else {
      // Non-installable errors (like Node.js version)
      console.error(chalk.red('\n❌ Dependency Check Failed:\n'));
      checkResult.errors.forEach((error) => {
        console.error(chalk.red(`   ${error}`));
      });
      console.error(chalk.gray('\nSee docs/REQUIREMENTS.md for detailed installation instructions.\n'));
      process.exit(1);
    }
  }
}

// Initialize and check dependencies
await initializeCLI();

const program = new Command();

program
  .name('create-hdai-app-nextjs')
  .description('AI-ready Full-Stack Next.js Starter Kit')
  .version('0.1.0');

// Main create command
program
  .argument('[project-name]', 'Name of the project to create')
  .option('--full', 'Set up with all production services')
  .option('--auth', 'Set up with production Supabase Auth')
  .option('--database <provider>', 'Set up with production database (supabase, neon, custom)')
  .option('--deploy', 'Set up with Vercel deployment configuration')
  .option('--fast', 'Skip interactive prompts, use defaults')
  .option('--path <path>', 'Path to create the project', process.cwd())
  .action(async (projectName, options) => {
    const spinner = ora('Initializing...').start();
    
    try {
      await createApp({
        projectName: projectName, // Will prompt if not provided
        path: options.path,
        full: options.full,
        auth: options.auth,
        database: options.database,
        deploy: options.deploy,
        fast: options.fast,
        spinner, // Pass spinner for progress updates
      });
      
      spinner.succeed(chalk.green('App created successfully!'));
      
      console.log('\n' + chalk.cyan('Next steps:'));
      console.log(`  cd ${projectName || 'my-app'}`);
      console.log('  pnpm db:push    # Push database schema');
      console.log('  pnpm dev        # Start development server');
      console.log('\n' + chalk.gray('Happy coding! 🚀'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to create app'));
      console.error(error);
      process.exit(1);
    }
  });

// Connect command for progressive connection
program
  .command('connect')
  .description('Connect production services to an existing project')
  .option('--auth', 'Connect production Supabase Auth')
  .option('--database [provider]', 'Connect production database (supabase, neon, custom)')
  .option('--deploy', 'Set up Vercel deployment')
  .option('--path <path>', 'Path to the project', process.cwd())
  .action(async (options) => {
    const spinner = ora('Connecting services...').start();
    
    try {
      await connectService(options);
      spinner.succeed(chalk.green('Services connected successfully!'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to connect services'));
      console.error(error);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check connection status of services')
  .option('--path <path>', 'Path to the project', process.cwd())
  .action(async (options) => {
    try {
      await checkStatus(options.path);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

// Verify command
program
  .command('verify')
  .description('Verify that everything is set up correctly')
  .option('--path <path>', 'Path to the project', process.cwd())
  .action(async (options) => {
    try {
      const success = await verifySetup(options.path);
      process.exit(success ? 0 : 1);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

program.parse();


