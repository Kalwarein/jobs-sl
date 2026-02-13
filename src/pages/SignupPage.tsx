import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="bg-primary px-6 pt-16 pb-10 rounded-b-3xl">
        <h1 className="text-display text-primary-foreground">Create Account</h1>
        <p className="text-body text-primary-foreground/70 mt-1">Join Job Giver SL today</p>
      </div>

      <div className="flex-1 px-6 pt-6">
        <div className="space-y-4">
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Full Name</label>
            <Input placeholder="Enter your full name" className="h-12 rounded-xl text-body" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Email</label>
            <Input placeholder="Enter your email" className="h-12 rounded-xl text-body" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Phone Number</label>
            <Input placeholder="+232" className="h-12 rounded-xl text-body" />
          </div>
          <div>
            <label className="text-caption font-semibold mb-1.5 block">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                className="h-12 rounded-xl text-body pr-12"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate('/')}
          className="w-full h-13 rounded-xl text-body-lg font-semibold mt-6"
          style={{ height: 52 }}
        >
          Create Account
        </Button>

        <p className="text-center text-body text-muted-foreground mt-6">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-primary font-semibold">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
