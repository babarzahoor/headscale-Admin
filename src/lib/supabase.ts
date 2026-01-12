import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  username: string;
  role: 'admin' | 'user';
  expiration_date?: string;
  traffic_limit: number;
  traffic_used: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Node {
  id: number;
  user_id: string;
  headscale_id?: string;
  node_name: string;
  ip_address?: string;
  last_seen?: string;
  client_version?: string;
  os?: string;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: number;
  user_id: string;
  node_id: number;
  headscale_route_id?: string;
  route: string;
  enabled: boolean;
  created_at: string;
}

export interface ACL {
  id: number;
  user_id: string;
  name: string;
  rules: any;
  created_at: string;
  updated_at: string;
}

export interface PreauthKey {
  id: number;
  user_id: string;
  key: string;
  expiration?: string;
  used: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: string;
  action: string;
  content: string;
  created_at: string;
}
