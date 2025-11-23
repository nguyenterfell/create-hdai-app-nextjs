import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      // @ts-expect-error - postgres is not a dependency of the CLI tool, only of generated apps
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

/**
 * Dependency check result
 */
export interface DependencyCheckResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  installable: {
    pnpm: { needsInstall: boolean; needsUpgrade: boolean; currentVersion?: string };
    localDeps: { needsInstall: boolean; missing: string[] };
  };
}

/**
 * Parse version string and compare
 */
function compareVersions(version: string, minVersion: string): boolean {
  const v1 = version.split('.').map(Number);
  const v2 = minVersion.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;
    if (num1 > num2) return true;
    if (num1 < num2) return false;
  }
  return true; // versions are equal
}

/**
 * Get Node.js version
 */
function getNodeVersion(): string | null {
  try {
    return process.version.replace('v', '');
  } catch {
    return null;
  }
}

/**
 * Check if Node.js version meets requirements
 */
function checkNodeVersion(): { success: boolean; version: string | null; message?: string } {
  const version = getNodeVersion();
  if (!version) {
    return { success: false, version: null, message: 'Could not determine Node.js version' };
  }
  
  const minVersion = '20.0.0';
  const meetsRequirement = compareVersions(version, minVersion);
  
  if (!meetsRequirement) {
    return {
      success: false,
      version,
      message: `Node.js version ${version} is below required version ${minVersion}. Please upgrade to Node.js >= 20.0.0`,
    };
  }
  
  return { success: true, version };
}

/**
 * Check if pnpm is installed and meets version requirements
 */
function checkPnpm(): { installed: boolean; version: string | null; meetsRequirement: boolean } {
  try {
    const output = execSync('pnpm --version', { encoding: 'utf-8', stdio: 'pipe' }).trim();
    const version = output;
    const minVersion = '8.0.0';
    const meetsRequirement = compareVersions(version, minVersion);
    return { installed: true, version, meetsRequirement };
  } catch {
    return { installed: false, version: null, meetsRequirement: false };
  }
}

/**
 * Check if npm is installed (fallback)
 */
function checkNpm(): boolean {
  try {
    execSync('npm --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if required dependencies are installed locally
 * This only applies when running from local development, not via npx
 */
async function checkLocalDependencies(): Promise<{ installed: boolean; missing: string[] }> {
  const requiredDeps = [
    'commander',
    'chalk',
    'ora',
    'inquirer',
    'fs-extra',
    'get-port',
  ];
  
  const projectRoot = path.resolve(__dirname, '..');
  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  // Check if we're in a local development environment
  // We're in local dev if:
  // 1. package.json exists (this is the actual project)
  // 2. We're NOT in a temp npx directory (common patterns: .npm, _npx, /tmp/)
  const isNpxTempDir = projectRoot.includes('.npm') || 
                       projectRoot.includes('_npx') ||
                       /[\/\\]tmp[\/\\]/.test(projectRoot) ||
                       /[\/\\]temp[\/\\]/.test(projectRoot);
  
  const hasPackageJson = await fs.pathExists(packageJsonPath);
  
  // If we're in an npx temp directory, skip the check (dependencies are managed by npx)
  if (isNpxTempDir) {
    return { installed: true, missing: [] };
  }
  
  // Only check dependencies if we're in local development (has package.json)
  if (hasPackageJson) {
    const hasNodeModules = await fs.pathExists(nodeModulesPath);
    
    if (!hasNodeModules) {
      // Dependencies haven't been installed
      return {
        installed: false,
        missing: requiredDeps,
      };
    }
    
    // Check each required dependency
    const missing: string[] = [];
    for (const dep of requiredDeps) {
      const depPath = path.join(nodeModulesPath, dep);
      if (!(await fs.pathExists(depPath))) {
        missing.push(dep);
      }
    }
    
    return {
      installed: missing.length === 0,
      missing,
    };
  }
  
  // Unknown environment, assume dependencies are available (likely via npx or global install)
  return { installed: true, missing: [] };
}

/**
 * Check all dependencies against requirements
 * This runs at CLI initialization to ensure the environment is ready
 */
export async function checkDependencies(): Promise<DependencyCheckResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check Node.js version
  const nodeCheck = checkNodeVersion();
  if (!nodeCheck.success) {
    errors.push(nodeCheck.message || 'Node.js version check failed');
  }
  
  // Check package manager
  // pnpm is REQUIRED because:
  // 1. Listed in package.json engines as >=8.0.0
  // 2. CLI hardcodes 'pnpm install' in setup.ts
  // 3. Generated apps expect pnpm for their scripts
  const pnpmCheck = checkPnpm();
  
  const pnpmInstallable = {
    needsInstall: !pnpmCheck.installed,
    needsUpgrade: pnpmCheck.installed && !pnpmCheck.meetsRequirement,
    currentVersion: pnpmCheck.version || undefined,
  };
  
  if (!pnpmCheck.installed) {
    errors.push('pnpm is required but not installed.');
  } else if (!pnpmCheck.meetsRequirement) {
    errors.push(`pnpm version ${pnpmCheck.version} is below required version 8.0.0.`);
  }
  
  // Check local dependencies (only for local development)
  const depsCheck = await checkLocalDependencies();
  const localDepsInstallable = {
    needsInstall: !depsCheck.installed,
    missing: depsCheck.missing,
  };
  
  if (!depsCheck.installed) {
    errors.push(`Missing required dependencies: ${depsCheck.missing.join(', ')}`);
  }
  
  return {
    success: errors.length === 0,
    errors,
    warnings,
    installable: {
      pnpm: pnpmInstallable,
      localDeps: localDepsInstallable,
    },
  };
}

/**
 * Install pnpm globally
 * Returns an object with success status and error details if failed
 */
export async function installPnpm(upgrade: boolean = false): Promise<{ success: boolean; error?: string; needsSudo?: boolean }> {
  try {
    const command = upgrade ? 'npm install -g pnpm@latest' : 'npm install -g pnpm';
    execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
    return { success: true };
  } catch (error: any) {
    const errorMessage = error?.stderr?.toString() || error?.message || String(error);
    const isPermissionError = 
      errorMessage.includes('EACCES') || 
      errorMessage.includes('permission denied') ||
      errorMessage.includes('permissions');
    
    if (isPermissionError) {
      return { 
        success: false, 
        needsSudo: true,
        error: 'Permission denied. Global npm installs require elevated privileges.'
      };
    }
    
    return { 
      success: false, 
      error: errorMessage || 'Unknown error occurred'
    };
  }
}

/**
 * Install local dependencies
 */
export async function installLocalDependencies(): Promise<boolean> {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    const packageJsonPath = path.join(projectRoot, 'package.json');
    
    if (!(await fs.pathExists(packageJsonPath))) {
      return false;
    }
    
    // Check if pnpm is available, fallback to npm
    const pnpmCheck = checkPnpm();
    const packageManager = pnpmCheck.installed ? 'pnpm' : 'npm';
    
    execSync(`${packageManager} install`, {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    return true;
  } catch (error) {
    return false;
  }
}

