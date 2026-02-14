import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  User, FileText, Shield, Bell, LogOut, ChevronRight, Building2, Edit3, BadgeCheck, Briefcase, LayoutDashboard
} from 'lucide-react';

const ProfilePage = () => {
  const { profile, role, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: Edit3, label: 'Edit Profile', desc: 'Update your information', action: () => {} },
    { icon: FileText, label: 'My CV', desc: 'Manage your documents', action: () => {} },
    { icon: Building2, label: 'Apply as Company', desc: 'Become an employer', action: () => navigate('/company/register') },
    { icon: Briefcase, label: 'Post a Job', desc: 'Post jobs for your company', action: () => navigate('/post-job'), show: role === 'employer' || isAdmin },
    { icon: LayoutDashboard, label: 'Admin Dashboard', desc: 'Manage the platform', action: () => navigate('/admin'), show: isAdmin },
    { icon: Bell, label: 'Notifications', desc: 'Manage alerts', action: () => {} },
    { icon: Shield, label: 'Security', desc: 'Password & privacy', action: () => {} },
  ].filter((item) => item.show !== false);

  return (
    <div className="animate-fade-in">
      <div className="bg-primary px-4 pb-10 pt-6 rounded-b-3xl">
        <h1 className="text-title text-primary-foreground mb-5">Profile</h1>
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary-foreground/20 flex items-center justify-center text-3xl text-primary-foreground font-bold shrink-0" style={{ height: 72, width: 72 }}>
            {profile?.full_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-subtitle text-primary-foreground truncate">{profile?.full_name || 'User'}</h2>
              {profile?.is_verified && <BadgeCheck className="h-5 w-5 text-primary-foreground shrink-0" />}
            </div>
            <p className="text-caption text-primary-foreground/70">{profile?.email}</p>
            <Badge className="mt-1.5 bg-primary-foreground/15 text-primary-foreground border-0 text-tiny capitalize">
              {role?.replace('_', ' ') || 'Job Seeker'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-5">
        <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-caption font-semibold">Profile Completion</p>
            <p className="text-caption font-bold text-primary">{profile?.profile_completion || 10}%</p>
          </div>
          <Progress value={profile?.profile_completion || 10} className="h-2.5 rounded-full" />
          <p className="text-tiny text-muted-foreground mt-2">Complete your profile to get better job matches</p>
        </div>

        {profile?.skills && profile.skills.length > 0 && (
          <div className="mt-5">
            <h3 className="text-caption font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-tiny px-3 py-1">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-1">
          {menuItems.map((item) => (
            <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted transition-colors">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-body font-medium">{item.label}</p>
                <p className="text-tiny text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>

        <Button onClick={handleLogout} variant="outline" className="w-full mt-6 mb-4 h-12 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5 text-body font-medium">
          <LogOut className="h-5 w-5 mr-2" /> Log Out
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
