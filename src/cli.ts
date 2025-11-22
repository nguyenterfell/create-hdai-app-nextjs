#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { createApp } from './create-app.js';
import { connectService } from './connect.js';
import { checkStatus } from './status.js';
import { verifySetup } from './verify.js';

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
    const spinner = ora('Creating your Next.js app...').start();
    
    try {
      await createApp({
        projectName: projectName, // Will prompt if not provided
        path: options.path,
        full: options.full,
        auth: options.auth,
        database: options.database,
        deploy: options.deploy,
        fast: options.fast,
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


