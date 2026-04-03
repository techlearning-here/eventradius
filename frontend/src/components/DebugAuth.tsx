import React from 'react';
import { supabase } from '@/integrations/supabase/client';

export const DebugAuth: React.FC = () => {
  const checkConfig = () => {
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'Not set');
    console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
    
    // Test Supabase connection
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('Current session:', data);
      if (error) console.error('Session error:', error);
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <button 
        onClick={checkConfig}
        className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs"
      >
        Check Config
      </button>
      <p className="mt-2">Open browser console to see debug info</p>
    </div>
  );
};
