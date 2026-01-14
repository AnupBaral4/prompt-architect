// supabase-config.js - Supabase client configuration

// TODO: Replace these with your actual Supabase project credentials
// You can find these in your Supabase project settings at:
// https://app.supabase.com/project/YOUR_PROJECT/settings/api

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase };
}

console.log('✅ Supabase client initialized');