import { supabase } from '../lib/supabase';
import { Booking, BookingMember, DashboardMetrics } from '../types';

export const bookingService = {
  async createBooking(
    bookingData: {
      package_id: string;
      booking_date: string;
      travel_group_name: string;
      number_of_members: number;
      total_price: number;
      advance_paid: number;
    },
    members: { member_name: string; member_phone: string }[]
  ): Promise<Booking> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        user_id: user.id,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    const membersWithBookingId = members.map(member => ({
      ...member,
      booking_id: booking.id,
    }));

    const { error: membersError } = await supabase
      .from('booking_members')
      .insert(membersWithBookingId);

    if (membersError) throw membersError;

    await supabase.rpc('increment', {
      row_id: bookingData.package_id,
      x: 1,
    });

    return booking;
  },

  async getUserBookings(): Promise<Booking[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        package:packages(*),
        members:booking_members(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        package:packages(*),
        members:booking_members(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateBookingStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled',
    adminNotes?: string,
    whatsappLink?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    if (whatsappLink !== undefined) {
      updateData.whatsapp_conversation_link = whatsappLink;
    }

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('status, total_price, advance_paid');

    if (error) throw error;

    const metrics: DashboardMetrics = {
      total_bookings: bookings?.length || 0,
      pending_bookings: bookings?.filter(b => b.status === 'pending').length || 0,
      confirmed_bookings: bookings?.filter(b => b.status === 'confirmed').length || 0,
      cancelled_bookings: bookings?.filter(b => b.status === 'cancelled').length || 0,
      total_revenue: bookings
        ?.filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + Number(b.total_price), 0) || 0,
      advance_revenue: bookings?.reduce((sum, b) => sum + Number(b.advance_paid), 0) || 0,
    };

    return metrics;
  },
};
