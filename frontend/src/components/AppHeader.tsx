import { Search, Bell, User, LogOut, Settings } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';


export const AppHeader = () => {
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
    <header className="h-16 border-b border-border-primary bg-bg-secondary flex items-center justify-between px-4 gap-4 no-print">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-hover-primary transition-colors"
              title="User menu"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-popover border-border shadow-lg"
          >
            <DropdownMenuItem
              onClick={handleSettings}
              className="cursor-pointer flex items-center gap-2 text-foreground hover:bg-accent focus:bg-accent"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>

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
