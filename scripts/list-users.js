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
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Use service role key if available (for admin access), otherwise use anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseKey) {
  console.error('Error: Missing Supabase credentials.');
  console.error('Please set one of the following environment variables:');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (recommended for admin access)');
  console.error('  - VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log(`Connecting to Supabase at ${supabaseUrl}...\n`);

try {
  // Query users from auth.users table
  // Note: This requires service role key for full access to auth schema
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error fetching users:', error.message);
    console.error('\nNote: Listing users requires SUPABASE_SERVICE_ROLE_KEY to be set.');
    process.exit(1);
  }

  if (!users || users.users.length === 0) {
    console.log('No users found.');
    process.exit(0);
  }

  console.log(`Found ${users.users.length} user(s):\n`);
  console.log('─'.repeat(100));
  console.log(
    'Email'.padEnd(40) +
    'Confirmed'.padEnd(15) +
    'Created At'.padEnd(25) +
    'Last Sign In'
  );
  console.log('─'.repeat(100));

  // Sort users by creation date (newest first)
  const sortedUsers = users.users.sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  for (const user of sortedUsers) {
    const email = user.email || 'N/A';
    const confirmed = user.email_confirmed_at ? '✓ Yes' : '✗ No';
    const createdAt = user.created_at
      ? new Date(user.created_at).toLocaleString()
      : 'N/A';
    const lastSignIn = user.last_sign_in_at
      ? new Date(user.last_sign_in_at).toLocaleString()
      : 'Never';

    console.log(
      email.padEnd(40) +
      confirmed.padEnd(15) +
      createdAt.padEnd(25) +
      lastSignIn
    );
  }

  console.log('─'.repeat(100));
  console.log(`\nTotal: ${users.users.length} user(s)`);
  
  // Summary statistics
  const confirmedCount = sortedUsers.filter(u => u.email_confirmed_at).length;
  const unconfirmedCount = sortedUsers.length - confirmedCount;
  console.log(`Confirmed: ${confirmedCount} | Unconfirmed: ${unconfirmedCount}`);

} catch (error) {
  console.error('Unexpected error:', error.message);
  process.exit(1);
}
