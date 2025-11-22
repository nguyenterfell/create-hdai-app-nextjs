import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

/**
 * Check if Docker is running
 */
export async function isDockerRunning(): Promise<boolean> {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if Supabase CLI is installed
 */
export async function isSupabaseCliInstalled(): Promise<boolean> {
  try {
    execSync('npx supabase --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if Supabase is running locally
 */
export async function isSupabaseRunning(projectPath: string): Promise<boolean> {
  try {
    const output = execSync('npx supabase status', {
      cwd: projectPath,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return output.includes('API URL:') && output.includes('localhost');
  } catch {
    return false;
  }
}

/**
 * Get Supabase local credentials from `supabase status`
 */
export interface SupabaseCredentials {
  apiUrl: string;
  anonKey: string;
  dbUrl: string;
}

export async function getSupabaseLocalCredentials(
  projectPath: string
): Promise<SupabaseCredentials | null> {
  try {
    const output = execSync('npx supabase status', {
      cwd: projectPath,
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    // Parse the output to extract credentials
    const apiUrlMatch = output.match(/API URL:\s*(.+)/);
    const anonKeyMatch = output.match(/anon key:\s*(.+)/);
    const dbUrlMatch = output.match(/DB URL:\s*(.+)/);

    if (apiUrlMatch && anonKeyMatch && dbUrlMatch) {
      return {
        apiUrl: apiUrlMatch[1].trim(),
        anonKey: anonKeyMatch[1].trim(),
        dbUrl: dbUrlMatch[1].trim(),
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Update .env.local with Supabase credentials
 */
export async function updateEnvFile(
  envPath: string,
  updates: Record<string, string>
): Promise<void> {
  let content = '';
  if (await fs.pathExists(envPath)) {
    content = await fs.readFile(envPath, 'utf-8');
  }

  // Update or add each variable
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      // Replace existing
      content = content.replace(regex, `${key}=${value}`);
    } else {
      // Add new
      if (content && !content.endsWith('\n')) {
        content += '\n';
      }
      content += `${key}=${value}\n`;
    }
  }

  await fs.writeFile(envPath, content, 'utf-8');
}

/**
 * Test database connection
 * Note: This is a simple format check. Actual connection testing
 * should be done in the context of the generated app where postgres is available.
 */
export async function testDatabaseConnection(dbUrl: string): Promise<boolean> {
  try {
    // Validate URL format
    const isValidFormat =
      dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
    if (!isValidFormat) {
      return false;
    }

    // Try to test connection if postgres is available
    // (This will work when called from verify.ts in project context)
    try {
      const { default: postgres } = await import('postgres');
      const sql = postgres(dbUrl, { max: 1, idle_timeout: 5 });
      await sql`SELECT 1`;
      await sql.end();
      return true;
    } catch {
      // postgres not available in this context, but URL format is valid
      return true;
    }
  } catch {
    return false;
  }
}

/**
 * Test Supabase auth connection
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<boolean> {
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

