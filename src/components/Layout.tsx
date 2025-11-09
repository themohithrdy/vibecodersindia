import { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Flame, Hammer, Users, User, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
}

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/ai-news', icon: Flame, label: 'AI News' },
  { path: '/build', icon: Hammer, label: 'Build' },
  { path: '/share', icon: Users, label: 'Share' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children, rightSidebar }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-[57px] left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mr-3"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <h1 className="text-xl font-bold text-primary">
          VCI
        </h1>
      </header>

      <div className="flex w-full pt-[73px] lg:pt-[57px]">
        {/* Left Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-[73px] lg:top-[57px] left-0 h-[calc(100vh-73px)] lg:h-[calc(100vh-57px)] w-64 bg-card border-r border-border z-30 transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="p-6 border-b border-border hidden lg:block">
            <h1 className="text-2xl font-bold text-primary">
              Vibe Coding India
            </h1>
            <p className="text-sm text-muted-foreground mt-1">AI Creator Platform</p>
          </div>
          
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 max-w-7xl mx-auto px-6 py-10">
          {children}
        </main>

        {/* Right Sidebar */}
        {rightSidebar && (
          <aside className="hidden xl:block sticky top-[57px] h-[calc(100vh-57px)] w-80 border-l border-border p-6 overflow-hidden">
            {rightSidebar}
          </aside>
        )}
      </div>
    </div>
  );
}
