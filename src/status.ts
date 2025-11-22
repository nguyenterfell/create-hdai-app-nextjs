import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import {
  isSupabaseRunning,
  getSupabaseLocalCredentials,
  testDatabaseConnection,
  testSupabaseConnection,
} from './utils.js';

export async function checkStatus(projectPath: string) {
  const resolvedPath = path.resolve(projectPath || process.cwd());
  const envPath = path.join(resolvedPath, '.env.local');

  if (!(await fs.pathExists(envPath))) {
    console.log(
      chalk.yellow('No .env.local file found. Using default local configuration.')
    );
    return;
  }

  const envContent = await fs.readFile(envPath, 'utf-8');

  console.log(chalk.cyan('\n📊 Connection Status\n'));

  // Check database
  const dbUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1];
  if (dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1')) {
    console.log(chalk.green('✅ Database: Production'));
    console.log(chalk.gray(`   ${dbUrl.substring(0, 50)}...`));
    
    // Test connection
    process.stdout.write(chalk.gray('   Testing connection... '));
    const dbConnected = await testDatabaseConnection(dbUrl);
    if (dbConnected) {
      console.log(chalk.green('✓ Connected'));
    } else {
      console.log(chalk.red('✗ Connection failed'));
    }
  } else {
    console.log(chalk.yellow('🔧 Database: Local (Supabase)'));
    
    // Check if Supabase is running
    const isRunning = await isSupabaseRunning(resolvedPath);
    if (isRunning) {
      console.log(chalk.green('   ✓ Supabase is running'));
      
      // Test connection
      if (dbUrl) {
        process.stdout.write(chalk.gray('   Testing connection... '));
        const dbConnected = await testDatabaseConnection(dbUrl);
        if (dbConnected) {
          console.log(chalk.green('✓ Connected'));
        } else {
          console.log(chalk.red('✗ Connection failed'));
        }
      }
    } else {
      console.log(chalk.red('   ✗ Supabase is not running'));
      console.log(chalk.gray('   Run: npx supabase start'));
    }
  }

  // Check auth
  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
  const supabaseAnonKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1];
  
  if (supabaseUrl && !supabaseUrl.includes('localhost') && !supabaseUrl.includes('127.0.0.1')) {
    console.log(chalk.green('✅ Auth: Production'));
    console.log(chalk.gray(`   ${supabaseUrl}`));
    
    // Test connection
    if (supabaseAnonKey) {
      process.stdout.write(chalk.gray('   Testing connection... '));
      const authConnected = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
      if (authConnected) {
        console.log(chalk.green('✓ Connected'));
      } else {
        console.log(chalk.red('✗ Connection failed'));
      }
    }
  } else {
    console.log(chalk.yellow('🔧 Auth: Local (Supabase)'));
    
    // Check if Supabase is running
    const isRunning = await isSupabaseRunning(resolvedPath);
    if (isRunning) {
      console.log(chalk.green('   ✓ Supabase is running'));
      
      // Try to get actual credentials
      const credentials = await getSupabaseLocalCredentials(resolvedPath);
      if (credentials) {
        console.log(chalk.gray(`   API URL: ${credentials.apiUrl}`));
        
        // Test connection
        process.stdout.write(chalk.gray('   Testing connection... '));
        const authConnected = await testSupabaseConnection(
          credentials.apiUrl,
          credentials.anonKey
        );
        if (authConnected) {
          console.log(chalk.green('✓ Connected'));
        } else {
          console.log(chalk.red('✗ Connection failed'));
        }
      }
    } else {
      console.log(chalk.red('   ✗ Supabase is not running'));
      console.log(chalk.gray('   Run: npx supabase start'));
    }
  }

  // Check deployment
  const vercelPath = path.join(resolvedPath, 'vercel.json');
  if (await fs.pathExists(vercelPath)) {
    console.log(chalk.green('✅ Deployment: Vercel configured'));
  } else {
    console.log(chalk.yellow('🔧 Deployment: Not configured'));
  }

  console.log('');
}


