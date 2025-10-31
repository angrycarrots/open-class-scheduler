#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env file if it exists
config({ path: path.join(rootDir, '.env.local') });

// Get Supabase connection details
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  console.error('This script requires admin access to activate user emails.');
  process.exit(1);
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Usage: node activate-user.js <email>');
  console.error('Example: node activate-user.js user@example.com');
  process.exit(1);
}

// Basic email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`Error: Invalid email address format: ${email}`);
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log(`Connecting to Supabase at ${supabaseUrl}...`);
console.log(`Looking up user: ${email}\n`);

try {
  // Find user by email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error fetching users:', listError.message);
    process.exit(1);
  }

  const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.error(`Error: User not found with email: ${email}`);
    process.exit(1);
  }

  console.log(`Found user: ${user.email}`);
  console.log(`User ID: ${user.id}`);
  console.log(`Created: ${new Date(user.created_at).toLocaleString()}`);

  // Check if email is already confirmed
  if (user.email_confirmed_at) {
    console.log(`\n✓ Email already confirmed at: ${new Date(user.email_confirmed_at).toLocaleString()}`);
    console.log('No action needed.');
    process.exit(0);
  }

  console.log('\n✗ Email not confirmed');
  console.log('Activating user email...\n');

  // Update user to confirm email
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      email_confirm: true,
    }
  );

  if (updateError) {
    console.error('Error activating user:', updateError.message);
    process.exit(1);
  }

  console.log('✓ Success! User email has been activated.');
  console.log(`Email: ${updatedUser.user.email}`);
  console.log(`Confirmed at: ${new Date(updatedUser.user.email_confirmed_at).toLocaleString()}`);

} catch (error) {
  console.error('Unexpected error:', error.message);
  process.exit(1);
}
