import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminLoginRequest {
  username: string;
  password: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Admin login function invoked');
    
    const { username, password }: AdminLoginRequest = await req.json();
    
    if (!username || !password) {
      console.log('Missing username or password');
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a service role client to securely access admin data
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Securely lookup admin email by username
    const { data: profile, error: profileError } = await supabaseServiceRole
      .from('profiles')
      .select('email')
      .eq('username', username)
      .eq('role', 'admin')
      .maybeSingle();

    console.log('Profile lookup result:', { found: !!profile, error: profileError });

    if (profileError || !profile) {
      console.log('Admin profile not found or error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create regular client for auth operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Authenticate with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: password,
    });

    console.log('Auth result:', { success: !!authData.session, error: authError });

    if (authError || !authData.session) {
      console.log('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return session information for the client to use
    return new Response(
      JSON.stringify({ 
        success: true,
        session: authData.session,
        user: authData.user
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Admin login function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});