# Requirements & Dependencies Installation Guide

This document outlines all requirements and dependencies needed to use and develop the `create-hdai-app-nextjs` CLI tool.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Using the CLI Tool](#using-the-cli-tool)
- [Developing the CLI Tool](#developing-the-cli-tool)
- [Dependencies Overview](#dependencies-overview)
- [Installation Instructions](#installation-instructions)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

#### Node.js
- **Version:** Node.js >= 20.0.0
- **Installation:**
  ```bash
  # Check your current version
  node --version
  
  # Install via nvm (recommended)
  nvm install 20
  nvm use 20
  
  # Or download from https://nodejs.org/
  ```

#### pnpm (Package Manager)
- **Version:** pnpm >= 8.0.0
- **Why pnpm?** This project uses pnpm for faster, more efficient dependency management and to ensure consistent installations.
- **Installation:**
  ```bash
  # Install pnpm globally
  npm install -g pnpm
  
  # Verify installation
  pnpm --version
  ```

### Optional but Recommended

- **Git** - For version control
- **Docker** - Required if you want to run Supabase locally (for generated apps)

## Using the CLI Tool

### For End Users

**No installation required!** The CLI tool can be used directly via `npx`:

```bash
npx create-hdai-app-nextjs my-app
```

When you run this command:
- `npx` automatically downloads and runs the latest version
- Dependencies are resolved automatically
- No local installation needed

**Note:** The first run may take a moment as `npx` downloads the package and its dependencies.

### Local Installation (Optional)

If you want to install the CLI globally for faster access:

```bash
npm install -g create-hdai-app-nextjs
# or
pnpm add -g create-hdai-app-nextjs
```

Then use it directly:
```bash
create-hdai-app-nextjs my-app
```

## Developing the CLI Tool

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd create-hdai-apps-nextjs
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```
   
   If `pnpm` is not available, you can use `npm`:
   ```bash
   npm install
   ```
   
   **Note:** While `npm` works, `pnpm` is the recommended package manager for this project.

3. **Verify installation:**
   ```bash
   # Check that dependencies are installed
   ls node_modules
   
   # Test the CLI locally
   pnpm dev
   # or
   node bin/cli.js my-test-app
   ```

### Development Dependencies

The following are required for development:

- **TypeScript** (`^5.3.3`) - Type checking and compilation
- **tsx** (`^4.7.0`) - TypeScript execution for development
- **@types/node** (`^22.15.20`) - TypeScript definitions for Node.js
- **@types/fs-extra** (`^11.0.4`) - TypeScript definitions
- **@types/inquirer** (`^9.0.7`) - TypeScript definitions

### Runtime Dependencies

These are required when the CLI runs:

- **commander** (`^12.1.0`) - CLI framework for command parsing
- **chalk** (`^5.3.0`) - Terminal string styling
- **ora** (`^8.1.1`) - Elegant terminal spinners
- **inquirer** (`^10.2.2`) - Interactive command line prompts
- **fs-extra** (`^11.2.0`) - Enhanced file system operations
- **get-port** (`^7.0.0`) - Find available ports

## Dependencies Overview

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `commander` | ^12.1.0 | CLI command parsing and argument handling |
| `chalk` | ^5.3.0 | Terminal output styling (colors, formatting) |
| `ora` | ^8.1.1 | Loading spinners for better UX |
| `inquirer` | ^10.2.2 | Interactive prompts for user input |
| `fs-extra` | ^11.2.0 | Enhanced file system operations (copy, move, etc.) |
| `get-port` | ^7.0.0 | Find available network ports |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.3.3 | TypeScript compiler |
| `tsx` | ^4.7.0 | Execute TypeScript files directly |
| `@types/node` | ^22.15.20 | TypeScript definitions for Node.js |
| `@types/fs-extra` | ^11.0.4 | TypeScript definitions for fs-extra |
| `@types/inquirer` | ^9.0.7 | TypeScript definitions for inquirer |

## Installation Instructions

### Step-by-Step Setup

1. **Verify Node.js version:**
   ```bash
   node --version  # Should be >= 20.0.0
   ```

2. **Install pnpm (if not already installed):**
   ```bash
   npm install -g pnpm
   pnpm --version  # Should be >= 8.0.0
   ```

3. **Navigate to project directory:**
   ```bash
   cd create-hdai-apps-nextjs
   ```

4. **Install all dependencies:**
   ```bash
   pnpm install
   ```
   
   This will:
   - Install all production dependencies
   - Install all development dependencies
   - Create `node_modules` directory
   - Generate `pnpm-lock.yaml` (or `package-lock.json` if using npm)

5. **Verify installation:**
   ```bash
   # Check that key dependencies are available
   pnpm list commander chalk ora
   
   # Or test the CLI
   pnpm dev
   ```

### Building the Project

To build the TypeScript source to JavaScript:

```bash
pnpm run build
```

This compiles TypeScript files in `src/` to JavaScript (if you add a build output directory).

**Note:** Currently, the CLI runs TypeScript directly via `tsx`, so building is optional unless you're preparing for publication.

## Troubleshooting

### Common Issues

#### Error: Cannot find package 'commander'

**Problem:** Dependencies are not installed.

**Solution:**
```bash
pnpm install
# or
npm install
```

#### Error: pnpm: command not found

**Problem:** pnpm is not installed.

**Solution:**
```bash
npm install -g pnpm
```

**Alternative:** Use `npm` instead (though pnpm is recommended):
```bash
npm install
```

#### Error: Node.js version too old

**Problem:** Node.js version is below 20.0.0.

**Solution:**
- Install Node.js 20 or higher
- Use `nvm` to manage multiple Node.js versions:
  ```bash
  nvm install 20
  nvm use 20
  ```

#### Error: Module not found when running via npx

**Problem:** When running `npx create-hdai-app-nextjs`, dependencies might not resolve correctly.

**Solution:**
- Ensure the package is properly published with all dependencies listed in `package.json`
- For local development, install dependencies first:
  ```bash
  pnpm install
  ```

#### TypeScript errors during development

**Problem:** TypeScript compilation errors.

**Solution:**
```bash
# Ensure all dev dependencies are installed
pnpm install

# Check TypeScript version
pnpm list typescript

# Run type checking
pnpm exec tsc --noEmit
```

### Verification Checklist

After installation, verify everything works:

- [ ] Node.js version >= 20.0.0
- [ ] pnpm version >= 8.0.0 (or npm available)
- [ ] `node_modules` directory exists
- [ ] Can run `pnpm list` without errors
- [ ] Can run `pnpm dev` or `node bin/cli.js --help`
- [ ] No missing dependency errors

### Getting Help

If you encounter issues not covered here:

1. Check that all prerequisites are met
2. Verify Node.js and pnpm versions
3. Try deleting `node_modules` and reinstalling:
   ```bash
   rm -rf node_modules
   pnpm install
   ```
4. Check for any error messages in the terminal
5. Review the main [README.md](../README.md) for usage instructions

## Additional Notes

### Package Manager Choice

- **pnpm** is the recommended package manager for this project
- **npm** will work but may have different behavior
- **yarn** is not tested and not recommended

### Lock Files

- `pnpm-lock.yaml` - Generated by pnpm (preferred)
- `package-lock.json` - Generated by npm (acceptable)
- Do not commit both lock files - use one consistently

### CI/CD Considerations

For continuous integration, ensure your CI environment has:
- Node.js >= 20.0.0
- pnpm >= 8.0.0 (or configure npm as fallback)
- Sufficient disk space for `node_modules`

Example CI setup:
```yaml
# Example GitHub Actions
- uses: pnpm/action-setup@v2
  with:
    version: 8
- uses: actions/setup-node@v3
  with:
    node-version: '20'
    cache: 'pnpm'
```

