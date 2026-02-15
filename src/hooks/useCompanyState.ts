import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type CompanyButtonState = 'default' | 'pending' | 'rejected' | 'dashboard';

export interface CompanyData {
  id: string;
  name: string;
  is_approved: boolean;
  is_suspended: boolean;
  verification_stage: string;
  rejection_reason: string | null;
  trust_level: string | null;
  [key: string]: any;
}

export const useCompanyState = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buttonState, setButtonState] = useState<CompanyButtonState>('default');

  const fetchCompany = async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setCompany(data as CompanyData | null);

    if (!data) {
      setButtonState('default');
    } else if (data.is_approved) {
      setButtonState('dashboard');
    } else if (data.rejection_reason) {
      setButtonState('rejected');
    } else {
      setButtonState('pending');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompany();

    // Realtime subscription for instant updates
    if (!user) return;
    const channel = supabase
      .channel('company-state')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'companies',
        filter: `created_by=eq.${user.id}`,
      }, () => { fetchCompany(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return { company, loading, buttonState, refetch: fetchCompany };
};
