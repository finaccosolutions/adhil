import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Package {
  id: string;
  title: string;
  description: string;
  destination: string;
  price_per_head: number;
  advance_payment: number;
  duration_days: number;
  start_date?: string;
  end_date?: string;
  max_capacity: number;
  image_url?: string;
  gallery_images?: string[];
  inclusions?: any[];
  itinerary?: any[];
  facilities?: any[];
  contact_info?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageDate {
  id: string;
  package_id: string;
  available_date: string;
  max_bookings: number;
  current_bookings: number;
  is_available: boolean;
  created_at: string;
}
