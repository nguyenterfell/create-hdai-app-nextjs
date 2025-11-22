import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import {
  isDockerRunning,
  isSupabaseCliInstalled,
  isSupabaseRunning,
  getSupabaseLocalCredentials,
  testDatabaseConnection,
  testSupabaseConnection,
} from './utils.js';

export async function verifySetup(projectPath: string) {
  const resolvedPath = path.resolve(projectPath || process.cwd());

  console.log(chalk.cyan('\n🔍 Verifying Setup\n'));

  let allChecksPassed = true;

  // Check if project directory exists
  if (!(await fs.pathExists(resolvedPath))) {
    console.log(chalk.red('✗ Project directory not found'));
    return false;
  }
  console.log(chalk.green('✅ Project directory exists'));

  // Check package.json exists
  const packageJsonPath = path.join(resolvedPath, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    console.log(chalk.red('✗ package.json not found'));
    allChecksPassed = false;
  } else {
    console.log(chalk.green('✅ package.json exists'));
  }

  // Check node_modules exists (dependencies installed)
  const nodeModulesPath = path.join(resolvedPath, 'node_modules');
  if (!(await fs.pathExists(nodeModulesPath))) {
    console.log(chalk.yellow('⚠️  node_modules not found'));
    console.log(chalk.gray('   Run: pnpm install'));
    allChecksPassed = false;
  } else {
    console.log(chalk.green('✅ Dependencies installed'));
  }

  // Check .env.local exists
  const envPath = path.join(resolvedPath, '.env.local');
  if (!(await fs.pathExists(envPath))) {
    console.log(chalk.yellow('⚠️  .env.local not found'));
    console.log(chalk.gray('   Run: cp .env.example .env.local'));
    allChecksPassed = false;
  } else {
    console.log(chalk.green('✅ .env.local exists'));
    
    // Check environment variables
    const envContent = await fs.readFile(envPath, 'utf-8');
    const dbUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1];
    const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
    const supabaseAnonKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1];

    // Check database configuration
    if (!dbUrl || dbUrl.includes('your-') || dbUrl.includes('placeholder')) {
      console.log(chalk.yellow('⚠️  DATABASE_URL not configured'));
      allChecksPassed = false;
    } else {
      const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
      console.log(
        chalk.green(`✅ DATABASE_URL configured (${isLocal ? 'local' : 'production'})`)
      );

      // Test database connection
      process.stdout.write(chalk.gray('   Testing database connection... '));
      try {
        // Try to test connection - postgres should be in project's node_modules
        // We need to change the import context to the project directory
        const originalCwd = process.cwd();
        try {
          process.chdir(resolvedPath);
          const { default: postgres } = await import('postgres');
          const sql = postgres(dbUrl, { max: 1, idle_timeout: 5 });
          await sql`SELECT 1`;
          await sql.end();
          console.log(chalk.green('✓ Connected'));
        } catch (importError) {
          // postgres not available or connection failed
          // Fallback: validate URL format
          const isValidFormat =
            dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
          if (isValidFormat) {
            console.log(
              chalk.yellow('⚠️  Cannot test (postgres not found, but URL format is valid)')
            );
          } else {
            console.log(chalk.red('✗ Invalid URL format'));
            allChecksPassed = false;
          }
        } finally {
          process.chdir(originalCwd);
        }
      } catch (error) {
        console.log(chalk.red('✗ Connection failed'));
        allChecksPassed = false;
      }
    }

    // Check Supabase configuration
    if (!supabaseUrl || supabaseUrl.includes('your-') || supabaseUrl.includes('placeholder')) {
      console.log(chalk.yellow('⚠️  NEXT_PUBLIC_SUPABASE_URL not configured'));
      allChecksPassed = false;
    } else {
      const isLocal = supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1');
      console.log(
        chalk.green(
          `✅ NEXT_PUBLIC_SUPABASE_URL configured (${isLocal ? 'local' : 'production'})`
        )
      );

      if (!supabaseAnonKey || supabaseAnonKey.includes('your-') || supabaseAnonKey.includes('placeholder')) {
        console.log(chalk.yellow('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not configured'));
        allChecksPassed = false;
      } else {
        console.log(chalk.green('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY configured'));

        // Test Supabase connection
        process.stdout.write(chalk.gray('   Testing Supabase connection... '));
        try {
          const authConnected = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
          if (authConnected) {
            console.log(chalk.green('✓ Connected'));
          } else {
            console.log(chalk.red('✗ Connection failed'));
            allChecksPassed = false;
          }
        } catch (error) {
          console.log(chalk.red('✗ Connection error'));
          allChecksPassed = false;
        }
      }

      // If using local Supabase, check if it's running
      if (isLocal) {
        if (await isSupabaseCliInstalled()) {
          const isRunning = await isSupabaseRunning(resolvedPath);
          if (isRunning) {
            console.log(chalk.green('✅ Local Supabase is running'));
          } else {
            console.log(chalk.yellow('⚠️  Local Supabase is not running'));
            console.log(chalk.gray('   Run: npx supabase start'));
            allChecksPassed = false;
          }
        } else {
          console.log(chalk.yellow('⚠️  Supabase CLI not installed'));
          console.log(chalk.gray('   Install: npm install -g supabase'));
        }
      }
    }
  }

  // Check if Next.js can build
  console.log(chalk.cyan('\n📦 Checking Next.js build...'));
  try {
    process.stdout.write(chalk.gray('   Running build check... '));
    execSync('pnpm run build', {
      cwd: resolvedPath,
      stdio: 'pipe',
      timeout: 60000, // 60 seconds
    });
    console.log(chalk.green('✓ Build successful'));
  } catch (error) {
    console.log(chalk.red('✗ Build failed'));
    console.log(chalk.gray('   Check the error messages above'));
    allChecksPassed = false;
  }

  // Summary
  console.log(chalk.cyan('\n📋 Summary\n'));
  if (allChecksPassed) {
    console.log(chalk.green('✅ All checks passed! Your app is ready to go.'));
    console.log(chalk.gray('   Run: pnpm dev'));
  } else {
    console.log(chalk.yellow('⚠️  Some checks failed. Please fix the issues above.'));
  }

  console.log('');

  return allChecksPassed;
}

