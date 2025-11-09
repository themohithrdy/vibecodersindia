import { Download, MoreVertical, LogOut, User, Plus, FileText, Code, BookOpen, Moon, Sun, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import SearchBar from './SearchBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useTheme } from 'next-themes';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#030303] border-b border-border z-50 flex items-center justify-between px-6">
        {/* Left Section */}
        <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-white font-bold text-lg hidden sm:inline">vibecoders</span>
        </NavLink>

        {/* Middle Section - Search */}
        <div className="flex-1 justify-center mx-4 hidden md:flex">
          <SearchBar />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-border hover:border-primary hidden lg:inline-flex"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden xl:inline">Get App</span>
          </Button>
          
          {/* Create Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-border hover:border-primary h-10 px-4"
              >
                <Plus className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#1A1A1B] border-border">
              {user ? (
                <>
                  <DropdownMenuItem onClick={() => navigate('/feed')} className="cursor-pointer">
                    <FileText className="mr-2 h-5 w-5" />
                    Create Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/build')} className="cursor-pointer">
                    <Code className="mr-2 h-5 w-5" />
                    Share Build
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/share')} className="cursor-pointer">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Share Story
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => navigate('/auth')} className="cursor-pointer">
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign in to create
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full h-9 w-9"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url || ''} />
                    <AvatarFallback>{user.user_metadata?.name?.[0] || user.email?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#1A1A1B] border-border">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate('/auth')}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Log In
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Divider */}
      <div className="fixed top-14 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent z-40" />
    </>
  );
}
