import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, Package, Booking, AvailableDate } from '../lib/supabase';

interface AppContextType {
  packages: Package[];
  bookings: Booking[];
  availableDates: AvailableDate[];
  isAdmin: boolean;
  loading: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  fetchPackages: () => Promise<void>;
  fetchBookings: () => Promise<void>;
  fetchAvailableDates: (packageId: string) => Promise<AvailableDate[]>;
  addPackage: (pkg: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePackage: (id: string, pkg: Partial<Package>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<string>;
  confirmBooking: (id: string) => Promise<void>;
  addAvailableDate: (date: Omit<AvailableDate, 'id' | 'created_at'>) => Promise<void>;
  deleteAvailableDate: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchAvailableDates = async (packageId: string) => {
    try {
      const { data, error } = await supabase
        .from('available_dates')
        .select('*')
        .eq('package_id', packageId)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setAvailableDates(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching available dates:', error);
      return [];
    }
  };

  const addPackage = async (pkg: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('packages')
        .insert([pkg]);

      if (error) throw error;
      await fetchPackages();
    } catch (error) {
      console.error('Error adding package:', error);
      throw error;
    }
  };

  const updatePackage = async (id: string, pkg: Partial<Package>) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update({ ...pkg, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchPackages();
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  };

  const addBooking = async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{ ...booking, status: 'pending' }])
        .select()
        .single();

      if (error) throw error;
      await fetchBookings();
      return data.id;
    } catch (error) {
      console.error('Error adding booking:', error);
      throw error;
    }
  };

  const confirmBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchBookings();
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  };

  const addAvailableDate = async (date: Omit<AvailableDate, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('available_dates')
        .insert([date]);

      if (error) throw error;
      await fetchAvailableDates(date.package_id);
    } catch (error) {
      console.error('Error adding available date:', error);
      throw error;
    }
  };

  const deleteAvailableDate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('available_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting available date:', error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchPackages();
      await fetchBookings();
      setLoading(false);
    };

    initializeData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        packages,
        bookings,
        availableDates,
        isAdmin,
        loading,
        setIsAdmin,
        fetchPackages,
        fetchBookings,
        fetchAvailableDates,
        addPackage,
        updatePackage,
        deletePackage,
        addBooking,
        confirmBooking,
        addAvailableDate,
        deleteAvailableDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
