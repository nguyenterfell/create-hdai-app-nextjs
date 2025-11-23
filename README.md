# create-hdai-app-nextjs

**A CLI tool that scaffolds production-ready Next.js applications with authentication, database, and deployment configured out of the box.**

This is a project generator (like `create-next-app`, but with batteries included) that creates a fully configured Next.js 15 application with Supabase authentication, PostgreSQL database via Drizzle ORM, and Vercel deployment setup. Instead of spending hours configuring auth, database connections, and environment variables, you get a working full-stack app in seconds. Perfect for developers who want to skip the boilerplate and start building features immediately.

## Quick Start

```bash
npx create-hdai-app-nextjs my-app
cd my-app
pnpm db:push    # Push database schema
pnpm dev        # Start development server
```

**Note:** Dependencies are automatically installed during creation, so you can skip `pnpm install`!

## What You Get

**Full Stack:**
- ⚛️ Next.js 15 with React Server Components
- 🎨 Tailwind CSS v4
- 🔐 Supabase Authentication
- 🗄️ PostgreSQL with Drizzle ORM
- 🚀 Vercel deployment ready

**Local Development:**
- ⚡ Runs Next.js + Supabase locally (Docker)
- 🏠 Local Supabase database
- 🔧 Supabase Auth emulator
- ✅ Zero external accounts needed

**Production:**
- 🌐 Vercel deployment ready
- 🗄️ Supabase, Neon, or custom PostgreSQL
- 🔐 Production Supabase Auth

## Usage

### Create a new app

The prompts during creation configure your **initial setup**. You can always add production services later using the `connect` command.

```bash
# Basic setup (local development) - Recommended for getting started
# Prompts will ask if you want to configure production services now
npx create-hdai-app-nextjs my-app

# Skip prompts, use defaults (local development)
npx create-hdai-app-nextjs my-app --fast

# Full production setup (configure everything now)
npx create-hdai-app-nextjs my-app --full

# Configure specific production services during creation
npx create-hdai-app-nextjs my-app --auth
npx create-hdai-app-nextjs my-app --database supabase
npx create-hdai-app-nextjs my-app --deploy
```

**Recommended workflow:**
1. Start with local development: `npx create-hdai-app-nextjs my-app` (answer "No" to production prompts)
2. Develop and test locally
3. When ready, add production services: `npx create-hdai-app-nextjs connect`

### Connect production services

```bash
cd my-app

# Connect services interactively
npx create-hdai-app-nextjs connect

# Connect specific service
npx create-hdai-app-nextjs connect --auth
npx create-hdai-app-nextjs connect --database supabase
npx create-hdai-app-nextjs connect --deploy
```

### Check connection status

```bash
npx create-hdai-app-nextjs status
```

### Verify setup

```bash
npx create-hdai-app-nextjs verify
```

This command checks:
- ✅ All required files exist
- ✅ Dependencies are installed
- ✅ Environment variables are configured
- ✅ Database connection works
- ✅ Supabase Auth connection works
- ✅ Next.js can build successfully

## Features

- ✅ Next.js 15 with App Router
- ✅ React Server Components
- ✅ Supabase Auth (local & production)
- ✅ Drizzle ORM with PostgreSQL
- ✅ TypeScript
- ✅ Tailwind CSS v4
- ✅ Vitest testing setup
- ✅ GitHub Actions CI/CD
- ✅ Vercel deployment config

## Requirements

- Node.js 20+
- pnpm 8+
- Docker (for local Supabase)

## Dependency Check & Auto-Installation

The CLI automatically checks dependencies before running any commands. If dependencies are missing, it will offer to install them automatically.

### Dependency Check Flow

When you run the CLI, it follows this process:

1. **Check dependencies** → Compares your environment against `REQUIREMENTS.md` requirements
2. **List missing items** → Shows what needs to be installed
3. **Prompt user** → Asks for confirmation to install dependencies
4. **Install** → Automatically installs pnpm and/or local dependencies if confirmed
5. **Verify** → Re-checks to ensure everything is installed correctly

### What Gets Checked

- **Node.js version** - Must be >= 20.0.0
- **pnpm** - Must be installed and >= 8.0.0 (required for CLI operations)
- **Local dependencies** - Required npm packages for local development (commander, chalk, ora, etc.)

### User Experience

Instead of failing immediately, the CLI:
- ✅ Shows what's missing in a clear list
- ✅ Offers to fix it automatically with a simple yes/no prompt
- ✅ Installs dependencies with progress feedback
- ✅ Verifies installation was successful
- ✅ Only exits if you decline or installation fails

**Example:**
```bash
npx create-hdai-app-nextjs my-app

⚠️  Dependency Check Results:
   pnpm is required but not installed.

The following dependencies can be installed automatically:

   1. pnpm (package manager)

? Would you like to install these dependencies now? (Y/n)
```

For detailed information about all requirements and dependencies, see [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md).

## How It Works

### Creating a New App - Step by Step

When you run `npx create-hdai-app-nextjs my-app`, here's exactly what happens:

#### 1. **Configuration & Prompts** (Initial Setup)
   - **Project Name Prompt:**
     - If you don't provide a project name as an argument, you'll be prompted: **"What is the name of your project?"**
     - Default: `my-app`
     - Must be a valid directory name (letters, numbers, hyphens, underscores only)
   - **Service Configuration Prompts:**
     - If you don't use `--fast` or `--full` flags, you'll be prompted to configure your **initial setup**:
       - **"Configure production Supabase Auth now?"** 
         - Default: **No** (uses local Supabase for development)
         - If Yes: You'll need to provide production credentials
         - If No: Local Supabase will be set up automatically
       - **"Configure production database now?"**
         - Default: **No - use local Supabase for development**
         - Options: Supabase, Neon, or Custom PostgreSQL (production)
         - If No: Local Supabase database will be configured automatically
       - **"Add Vercel deployment configuration now?"**
         - Default: **No** (you can add this later)
         - If Yes: Creates `vercel.json` configuration file
   - **Important:** These prompts configure your **initial setup**. You can always add production services later using the `connect` command.

#### 2. **Project Structure Creation**
   - Creates the project directory (`my-app/`)
   - Copies all template files from `templates/app/` to your project
   - Processes template variables (replaces `{{PROJECT_NAME}}` with your app name)
   - Sets up the complete Next.js 15 project structure

#### 3. **Dependency Installation**
   - Automatically runs `pnpm install` in your new project
   - Installs all required packages:
     - Next.js 15, React 19, TypeScript
     - Supabase client libraries
     - Drizzle ORM
     - Tailwind CSS v4
     - Testing libraries (Vitest)
   - **You don't need to run `pnpm install` manually!**

#### 4. **Local Supabase Setup** (if using local development)
   - **Checks prerequisites:**
     - Verifies Supabase CLI is installed (shows warning if not)
     - Checks if Docker is running (shows warning if not)
   - **Initializes Supabase:**
     - Runs `npx supabase init` if needed
     - Checks if Supabase is already running
     - Starts Supabase with `npx supabase start` if not running
   - **Fetches credentials:**
     - Automatically runs `npx supabase status`
     - Extracts API URL, anon key, and database URL
     - Updates `.env.local` with real credentials (no placeholders!)

#### 5. **Environment File Setup**
   - Creates `.env.local` from `.env.example` template
   - **For local setup:**
     - Sets `DATABASE_URL` to local Supabase PostgreSQL
     - Sets `NEXT_PUBLIC_SUPABASE_URL` to local Supabase API
     - Sets `NEXT_PUBLIC_SUPABASE_ANON_KEY` to real anon key (fetched automatically)
   - **For production setup:**
     - Adds placeholder comments for you to fill in later
   - Adds `NEXT_PUBLIC_SITE_URL` for OAuth callbacks

#### 6. **Git Initialization**
   - Automatically runs `git init` in your project
   - Your project is ready for version control

#### 7. **Completion**
   - Shows success message with next steps
   - Your app is ready to use!

### What Gets Created

Your new app includes:

```
my-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── login/             # Login page
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utilities
│   ├── db.ts             # Drizzle database connection
│   └── supabase/         # Supabase clients (server, client, middleware)
├── schema/                # Drizzle database schemas
├── middleware.ts          # Next.js middleware (auth)
├── .env.example           # Environment variable template
├── .env.local             # Your local environment (auto-configured)
├── drizzle.config.ts      # Drizzle ORM configuration
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
└── supabase/              # Supabase local configuration
```

### Commands Explained

#### `create` - Create New App
```bash
npx create-hdai-app-nextjs my-app [options]
```

**What it does:**
- Creates project structure
- Installs dependencies
- Sets up Supabase (if local)
- Configures environment variables
- Initializes git

**Options:**
- `--full` - Set up with all production services
- `--auth` - Use production Supabase Auth
- `--database <provider>` - Use production database (supabase, neon, custom)
- `--deploy` - Add Vercel deployment config
- `--fast` - Skip prompts, use defaults
- `--path <path>` - Specify where to create the project

#### `connect` - Connect Production Services
```bash
npx create-hdai-app-nextjs connect [options]
```

**What it does:**
- Prompts for service credentials (if not provided via flags)
- **Validates credentials** before saving (tests connections)
- **Creates backup** of `.env.local` before modifications
- Updates `.env.local` with production credentials
- Tests connections to ensure they work

**Options:**
- `--auth` - Connect production Supabase Auth
- `--database [provider]` - Connect production database
- `--deploy` - Set up Vercel deployment
- `--path <path>` - Path to your project

**Safety features:**
- Backs up `.env.local` before changes
- Tests connections before saving
- Prompts for confirmation if connection test fails

#### `status` - Check Connection Status
```bash
npx create-hdai-app-nextjs status
```

**What it checks:**
- Reads `.env.local` configuration
- **Tests actual database connectivity** (not just file contents)
- **Tests actual Supabase Auth connectivity**
- Checks if local Supabase is running
- Shows connection status (connected/failed)
- Displays actual credentials (for local setup)

**Output shows:**
- Database: Local or Production (with connection test result)
- Auth: Local or Production (with connection test result)
- Deployment: Vercel configured or not

#### `verify` - Verify Complete Setup
```bash
npx create-hdai-app-nextjs verify
```

**What it verifies:**
- ✅ All required files exist (`package.json`, `.env.local`, etc.)
- ✅ Dependencies are installed (`node_modules` exists)
- ✅ Environment variables are configured (no placeholders)
- ✅ **Database connection works** (actual connection test)
- ✅ **Supabase Auth connection works** (actual connection test)
- ✅ Next.js can build successfully (`pnpm run build`)
- ✅ Local Supabase is running (if using local setup)

**Returns:**
- Exit code 0 if all checks pass
- Exit code 1 if any checks fail
- Detailed error messages for each failed check

### Automated vs Manual Steps

#### ✅ Fully Automated (No Action Required)
- Project structure creation
- Dependency installation (`pnpm install`)
- Supabase initialization (if using local)
- Supabase startup (if Docker is running)
- Credential fetching from `supabase status`
- Environment file creation and configuration
- Git repository initialization

#### ⚠️ Conditional Automation
- **Supabase setup:** Only automated if:
  - Supabase CLI is installed
  - Docker is running
  - Using local development (not production)
- **If conditions aren't met:** Shows helpful warnings and instructions

#### 📝 Manual Steps (After Creation)
1. **Run database migrations:**
   ```bash
   pnpm db:push
   ```
   This pushes your Drizzle schema to the database.

2. **Start development server:**
   ```bash
   pnpm dev
   ```

3. **Optional - Verify setup:**
   ```bash
   npx create-hdai-app-nextjs verify
   ```

### Environment Variables

The CLI automatically manages these environment variables:

- **`DATABASE_URL`** - PostgreSQL connection string
  - Local: `postgresql://postgres:postgres@localhost:54322/postgres`
  - Production: Your production database URL

- **`NEXT_PUBLIC_SUPABASE_URL`** - Supabase API URL
  - Local: `http://localhost:54321` (auto-fetched)
  - Production: Your Supabase project URL

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - Supabase anonymous key
  - Local: Auto-fetched from `supabase status`
  - Production: Your Supabase project anon key

- **`NEXT_PUBLIC_SITE_URL`** - Application URL for OAuth callbacks
  - Default: `http://localhost:3000`

### Troubleshooting

**Supabase not starting automatically:**
- Check Docker is running: `docker info`
- Check Supabase CLI is installed: `npx supabase --version`
- Start manually: `npx supabase start`
- Then update credentials: `npx create-hdai-app-nextjs connect`

**Credentials not fetched:**
- Make sure Supabase is running: `npx supabase status`
- If not running, start it: `npx supabase start`
- Credentials will be fetched automatically on next setup

**Connection tests failing:**
- Check your `.env.local` has correct values
- Verify services are running (Supabase, database)
- Use `npx create-hdai-app-nextjs status` to diagnose

## Development

After creating your app:

1. **Navigate to your app:**
   ```bash
   cd my-app
   ```

2. **Dependencies are already installed** (done automatically during creation)

3. **Supabase is automatically started** (if using local setup and Docker is running)

4. **Environment variables are automatically configured** (credentials fetched from `supabase status`)

5. **Run database migrations:**
   ```bash
   pnpm db:push
   ```

6. **Verify everything is set up:**
   ```bash
   npx create-hdai-app-nextjs verify
   ```

7. **Start dev server:**
   ```bash
   pnpm dev
   ```

### Manual Setup (if needed)

If Supabase wasn't started automatically:

1. **Start Supabase locally:**
   ```bash
   npx supabase start
   ```

2. **Update environment variables** (if not auto-configured):
   ```bash
   # Get credentials
   npx supabase status
   # Update .env.local with the values shown
   ```

3. **Or use the connect command:**
   ```bash
   npx create-hdai-app-nextjs connect
   ```

## License

MIT


