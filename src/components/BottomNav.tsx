import { Home, Briefcase, PlusCircle, FileText, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/post', icon: PlusCircle, label: 'Post' },
  { to: '/applications', icon: FileText, label: 'Applied' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 text-tiny transition-colors ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground'
              }`
            }
          >
            <tab.icon className="h-6 w-6" strokeWidth={1.8} />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
