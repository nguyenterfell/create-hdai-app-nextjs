'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Graduation Stoles
          </span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Products
            </Button>
          </Link>
          
          <Link href="/quote">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Request Quote
            </Button>
          </Link>
          
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
              0
            </span>
          </Button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="default">Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

