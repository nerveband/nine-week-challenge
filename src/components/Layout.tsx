import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Clock, History, BarChart3, User, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Daily', href: '/daily', icon: CalendarDays },
  { name: 'Weekly', href: '/weekly', icon: Clock },
  { name: 'History', href: '/history', icon: History },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const NavLink = ({ item }: { item: typeof navigation[number] }) => (
    <Link
      to={item.href}
      className={cn(
        'flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out',
        currentPath === item.href
          ? 'bg-secondary text-secondary-foreground'
          : 'text-muted-foreground hover:bg-secondary/50'
      )}
    >
      <item.icon className="h-5 w-5" />
      {item.name}
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold">Nine Week Challenge</h2>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {navigation.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop header content */}
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link to="/daily" className="flex items-center space-x-2">
                <CalendarDays className="h-6 w-6" />
                <h1 className="text-lg font-semibold">Nine Week Challenge</h1>
              </Link>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex lg:items-center lg:space-x-1">
              {navigation.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <main className="min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
} 