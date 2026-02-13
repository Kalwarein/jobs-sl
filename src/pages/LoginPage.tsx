import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="bg-primary px-6 pt-16 pb-12 rounded-b-3xl">
        <div className="h-14 w-14 rounded-xl bg-primary-foreground/15 flex items-center justify-center mb-5">
          <span className="text-2xl font-extrabold text-primary-foreground">JG</span>
        </div>
        <h1 className="text-display text-primary-foreground">Welcome back</h1>
        <p className="text-body text-primary-foreground/70 mt-1">Sign in to find your next opportunity</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-6 pt-8">
        <div className="space-y-4">
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter email" className="h-12 rounded-xl text-body" required />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Password</label>
            <div className="relative">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                className="h-12 rounded-xl text-body pr-12"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full rounded-xl text-body-lg font-semibold mt-6" style={{ height: 52 }}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </Button>

        <p className="text-center text-body text-muted-foreground mt-6">
          Don't have an account?{' '}
          <button type="button" onClick={() => navigate('/signup')} className="text-primary font-semibold">Sign Up</button>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
