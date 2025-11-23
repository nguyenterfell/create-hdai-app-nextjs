# gradstoles-ecomm

Full-stack Next.js application with Supabase Auth, Drizzle ORM, and Vercel deployment.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (for local Supabase development)

### Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start Supabase locally:**
   ```bash
   npx supabase start
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Update .env.local with your local Supabase credentials
   ```

4. **Run database migrations:**
   ```bash
   pnpm db:push
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

## 📁 Project Structure

```
├── app/              # Next.js App Router
│   ├── api/         # API routes (Route Handlers)
│   ├── login/       # Login page
│   └── page.tsx     # Home page
├── components/      # React components
├── lib/            # Utilities
│   ├── db.ts       # Database connection (Drizzle)
│   └── supabase/   # Supabase client setup
├── middleware.ts   # Next.js middleware (auth)
├── schema/         # Database schema (Drizzle)
└── drizzle/        # Database migrations
```

## 🗄️ Database

This project uses Drizzle ORM with PostgreSQL.

### Commands

- `pnpm db:push` - Push schema changes to database
- `pnpm db:generate` - Generate migration files
- `pnpm db:studio` - Open Drizzle Studio

### Adding New Tables

1. Create schema file in `schema/`
2. Export from schema index
3. Run `pnpm db:push`

## 🔐 Authentication

Authentication is handled by Supabase Auth with Next.js middleware.

- **Local**: Uses Supabase local (Docker)
- **Production**: Uses your Supabase project

## 🚀 Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Environment Variables

Set these in your Vercel project settings or `.env.local` for local development.

## 🧪 Testing

```bash
pnpm test        # Run tests
pnpm test:ui     # Run tests with UI
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

## 🆘 Troubleshooting

**Supabase not starting:**
- Make sure Docker is running
- Try: `npx supabase stop` then `npx supabase start`

**Database connection errors:**
- Check your `DATABASE_URL` in `.env.local`
- Verify Supabase is running: `npx supabase status`

**Auth not working:**
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify middleware is running (check `middleware.ts`)


