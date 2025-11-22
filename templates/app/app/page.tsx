import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Welcome to {{PROJECT_NAME}}!</h1>
        <p className="mb-4">You are logged in as: {user.email}</p>
        <div className="mt-8">
          <a
            href="/api/auth/logout"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Logout
          </a>
        </div>
      </div>
    </main>
  );
}


