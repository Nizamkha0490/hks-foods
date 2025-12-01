import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  BookOpen,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  ClipboardList
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { KFMLogo } from './KFMLogo';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Products', url: '/products', icon: Package },
  { title: 'Orders', url: '/orders', icon: ShoppingCart },
  { title: 'Customers', url: '/customers', icon: Users },
  { title: 'Suppliers', url: '/suppliers', icon: Truck },
  { title: 'Ledgers', url: '/ledgers', icon: BookOpen },
  { title: 'Creditor / Debitor', url: '/creditor-debitor', icon: FileText },
  { title: 'Expenses', url: '/expenses', icon: Receipt },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-border-primary bg-bg-secondary">
      <KFMLogo />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={active ? 'bg-accent text-white border-l-4 border-accent' : 'hover:bg-hover-primary'}
                    >
                      <NavLink to={item.url} end={item.url === '/'}>
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
