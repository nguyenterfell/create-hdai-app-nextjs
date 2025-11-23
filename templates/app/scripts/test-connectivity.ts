#!/usr/bin/env node
/**
 * Connectivity test script
 * Tests database and Supabase Auth connections
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from 'drizzle-orm';
import { getDatabase, closeDatabase } from '../lib/db';
import { createBrowserClient } from '@supabase/ssr';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath, override: false });

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
}

async function testDatabase(): Promise<TestResult> {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return {
      name: 'Database Connection',
      success: false,
      error: 'DATABASE_URL environment variable is not set',
    };
  }

  try {
    const db = getDatabase();
    // Test with a simple query using Drizzle's sql helper
    await db.execute(sql`SELECT 1`);
    await closeDatabase();
    
    return {
      name: 'Database Connection',
      success: true,
    };
  } catch (error: any) {
    // Make sure to close database connection even on error
    try {
      await closeDatabase();
    } catch {
      // Ignore errors when closing
    }
    
    return {
      name: 'Database Connection',
      success: false,
      error: error?.message || 'Failed to connect to database',
    };
  }
}

async function testSupabaseAuth(): Promise<TestResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      name: 'Supabase Auth Connection',
      success: false,
      error: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are not set',
    };
  }

  try {
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
    
    // Test connection by making a simple API call
    const { error } = await supabase.auth.getSession();
    
    // Even if there's no session, if we get a response (no network error), the connection works
    // The error might be about auth, not connectivity
    if (error && error.message.includes('fetch')) {
      return {
        name: 'Supabase Auth Connection',
        success: false,
        error: `Network error: ${error.message}`,
      };
    }
    
    return {
      name: 'Supabase Auth Connection',
      success: true,
    };
  } catch (error: any) {
    return {
      name: 'Supabase Auth Connection',
      success: false,
      error: error?.message || 'Failed to connect to Supabase',
    };
  }
}

async function runTests() {
  console.log('\n🔍 Testing connectivity...\n');

  const results: TestResult[] = [];

  // Test database
  const dbResult = await testDatabase();
  results.push(dbResult);

  // Test Supabase Auth
  const authResult = await testSupabaseAuth();
  results.push(authResult);

  // Print results
  console.log('Results:');
  console.log('─'.repeat(50));
  
  for (const result of results) {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  
  console.log('─'.repeat(50));
  
  const allPassed = results.every((r) => r.success);
  const passedCount = results.filter((r) => r.success).length;
  const totalCount = results.length;

  if (allPassed) {
    console.log(`\n✅ All connectivity tests passed (${passedCount}/${totalCount})`);
    console.log('\n🎉 Your app is ready to use!');
    console.log('   Next steps:');
    console.log('   1. Run database migrations: pnpm db:push');
    console.log('   2. Start development server: pnpm dev');
    process.exit(0);
  } else {
    console.log(`\n⚠️  Some connectivity tests failed (${passedCount}/${totalCount} passed)`);
    console.log('\n📝 Setup Instructions:\n');
    
    // Provide specific instructions based on what failed
    const dbFailed = !results.find(r => r.name === 'Database Connection')?.success;
    const authFailed = !results.find(r => r.name === 'Supabase Auth Connection')?.success;
    
    if (dbFailed) {
      console.log('🗄️  Database Connection Failed:');
      const dbResult = results.find(r => r.name === 'Database Connection');
      if (dbResult?.error?.includes('not set')) {
        console.log('   1. Add DATABASE_URL to your .env.local file');
        console.log('   2. For local development:');
        console.log('      - Make sure Supabase is running: npx supabase start');
        console.log('      - The DATABASE_URL should be set automatically');
        console.log('   3. For production:');
        console.log('      - Get your database connection string from your provider');
        console.log('      - Format: postgresql://user:password@host:port/database');
      } else {
        console.log('   1. Check that your DATABASE_URL is correct in .env.local');
        console.log('   2. Verify the database server is accessible');
        console.log('   3. For local Supabase: run npx supabase start');
        console.log('   4. For production: verify your connection string and network access');
      }
      console.log('');
    }
    
    if (authFailed) {
      console.log('🔐 Supabase Auth Connection Failed:');
      const authResult = results.find(r => r.name === 'Supabase Auth Connection');
      if (authResult?.error?.includes('not set')) {
        console.log('   1. Add NEXT_PUBLIC_SUPABASE_URL to your .env.local file');
        console.log('   2. Add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file');
        console.log('   3. For local development:');
        console.log('      - Make sure Supabase is running: npx supabase start');
        console.log('      - Credentials will be fetched automatically');
        console.log('   4. For production:');
        console.log('      - Get credentials from: https://supabase.com/dashboard/project/_/settings/api');
      } else if (authResult?.error?.includes('fetch') || authResult?.error?.includes('Network')) {
        console.log('   1. Check that NEXT_PUBLIC_SUPABASE_URL is correct');
        console.log('   2. Verify the Supabase project is accessible');
        console.log('   3. For local: ensure Supabase is running (npx supabase start)');
        console.log('   4. For production: verify your project URL and network connectivity');
      } else {
        console.log('   1. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
        console.log('   2. Check that your Supabase project is active');
        console.log('   3. For local: run npx supabase start');
      }
      console.log('');
    }
    
    console.log('💡 After fixing the issues, run this test again:');
    console.log('   pnpm test:connectivity\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error running connectivity tests:', error);
  process.exit(1);
});

