import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, Building2, Briefcase, Flag, Settings, ArrowLeft, Shield
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/companies', icon: Building2, label: 'Companies' },
  { to: '/admin/jobs', icon: Briefcase, label: 'Jobs & Gigs' },
  { to: '/admin/reports', icon: Flag, label: 'Reports & Audit' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { profile, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-subtitle text-primary">Admin Panel</h2>
          </div>
          <p className="text-tiny text-muted-foreground truncate">{profile?.full_name} • {role?.replace('_', ' ')}</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-caption font-medium transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-caption text-muted-foreground hover:text-foreground w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
