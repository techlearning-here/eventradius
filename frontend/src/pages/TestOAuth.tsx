import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const TestOAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const testOAuth = async () => {
      console.log('=== OAuth Test Started ===');
      
      // Test 1: Check if Google OAuth is configured
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            skipBrowserRedirect: true, // Don't redirect, just get the URL
          },
        });
        
        console.log('OAuth URL generated:', data?.url);
        console.log('OAuth error:', error);
        
        if (data?.url) {
          console.log('✅ Google OAuth is properly configured');
          console.log('🔗 OAuth URL:', data.url);
          
          // Now try the actual redirect
          window.location.href = data.url;
        } else {
          console.error('❌ Google OAuth configuration error:', error);
        }
        
      } catch (err) {
        console.error('❌ OAuth setup error:', err);
      }
    };

    testOAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Testing OAuth configuration...</p>
        <p className="text-sm text-gray-500 mt-2">Check console for details</p>
      </div>
    </div>
  );
};

export default TestOAuth;
