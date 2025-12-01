import { Search, Bell, User, Sun, Moon, LogOut, Settings } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const AppHeader = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('rememberMe');
    
    // Show logout success message
    toast.success('Logged out successfully');
    
    // Redirect to login page with replace to prevent going back
    navigate('/login', { replace: true });
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <header className="h-16 border-b border-kf-border bg-card flex items-center justify-between px-4 gap-4 no-print">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        {/* <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Quick search..." 
            className="pl-9 bg-muted border-kf-border focus-visible:ring-primary"
          />
        </div> */}
      </div>
      
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="bg-[#1F293B] hover:bg-[#3C4A6B] border border-kf-border transition-all duration-300"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-[#E7D8B8] drop-shadow-[0_0_8px_rgba(231,216,184,0.6)]" />
          ) : (
            <Moon className="h-5 w-5 text-[#E7D8B8] drop-shadow-[0_0_8px_rgba(231,216,184,0.6)]" />
          )}
        </Button>

        {/* Notifications */}
        {/* <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-muted"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </Button> */}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-muted transition-colors"
              title="User menu"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 bg-card border-kf-border shadow-lg"
          >
            {/* Settings */}
            <DropdownMenuItem 
              onClick={handleSettings}
              className="cursor-pointer flex items-center gap-2 text-kf-text-light hover:bg-kf-wheat/10 focus:bg-kf-wheat/10"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-kf-border" />
            
            {/* Logout */}
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer flex items-center gap-2 text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
