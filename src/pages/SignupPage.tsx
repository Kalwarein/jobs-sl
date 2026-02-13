import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Account created!', description: 'Please check your email to verify your account.' });
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="bg-primary px-6 pt-16 pb-10 rounded-b-3xl">
        <h1 className="text-display text-primary-foreground">Create Account</h1>
        <p className="text-body text-primary-foreground/70 mt-1">Join Job Giver SL today</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-6 pt-6">
        <div className="space-y-4">
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Full Name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="h-12 rounded-xl text-body" required />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" className="h-12 rounded-xl text-body" required />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Password</label>
            <div className="relative">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password (min 6 chars)"
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
          {submitting ? 'Creating...' : 'Create Account'}
        </Button>

        <p className="text-center text-body text-muted-foreground mt-6">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')} className="text-primary font-semibold">Sign In</button>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
