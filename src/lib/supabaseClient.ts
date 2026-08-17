import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btsyntusefbncinmwfmj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0c3ludHVzZWZibmNpbm13Zm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MjE4NDYsImV4cCI6MjEwMjQ5Nzg0Nn0.-FarnPnGSpWm5ZkJe8HXeOm52KI3UTrOVyosUFUpccE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
