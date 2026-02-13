import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      navigate('/', { replace: true });
    }, 2200);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary">
      <div className="animate-fade-in flex flex-col items-center gap-3">
        <div className="h-20 w-20 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
          <span className="text-4xl font-extrabold text-primary-foreground">JG</span>
        </div>
        <h1 className="text-display text-primary-foreground">Job Giver SL</h1>
        <p className="text-body text-primary-foreground/70">Find jobs in Sierra Leone</p>
      </div>
      <div className="absolute bottom-12">
        <p className="text-tiny text-primary-foreground/40">Made for Sierra Leone 🇸🇱</p>
      </div>
    </div>
  );
};

export default SplashScreen;
