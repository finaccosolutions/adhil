export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  title: string;
  description?: string;
  destination?: string;
  price_per_head: string | number;
  advance_payment: string | number;
  duration_days: number;
  start_date?: string;
  end_date?: string;
  max_capacity: number;
  image_url?: string;
  gallery_images?: string[];
  inclusions?: Inclusion[];
  itinerary?: ItineraryDay[];
  facilities?: Facility[];
  contact_info?: ContactInfo;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inclusion {
  icon: string;
  text: string;
}

export interface Facility {
  icon: string;
  text: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  activity: string;
}

export interface ContactInfo {
  note: string;
  phone: string;
}

export interface PackageAvailableDate {
  id: string;
  package_id: string;
  available_date: string;
  current_bookings: number;
  is_available: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  package_id: string;
  booking_date: string;
  travel_group_name: string;
  number_of_members: number;
  total_price: number;
  advance_paid: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'advance_paid' | 'fully_paid';
  whatsapp_conversation_link?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  package?: Package;
  members?: BookingMember[];
}

export interface BookingMember {
  id: string;
  booking_id: string;
  member_name: string;
  member_phone: string;
  created_at: string;
}

export interface DashboardMetrics {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  advance_revenue: number;
}
