#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local file
config({ path: '.env.local' });

// Load environment variables from .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Error: Please provide an email address');
  console.log('Usage: node get-magic.js user@example.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('Error: Invalid email format');
  process.exit(1);
}

// Generate and send magic link
async function sendMagicLink() {
  console.log(`Sending magic link to ${email}...`);
  
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/classes`,
      },
    });

    if (error) {
      throw error;
    }

    console.log('Magic link sent successfully!');
    console.log('The user can now check their email and click the link to sign in.');
    
  } catch (error) {
    console.error('Error sending magic link:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the function
sendMagicLink();
