import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export const userService = {
  async getAllUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUserWithBookings(userId: string) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw profileError;

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        package:packages(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (bookingsError) throw bookingsError;

    return {
      profile,
      bookings: bookings || [],
    };
  },
};
