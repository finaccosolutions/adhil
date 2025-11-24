import { supabase } from '../lib/supabase';
import { Package, PackageAvailableDate } from '../types';

export const packageService = {
  async getAllPackages(): Promise<Package[]> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPackageById(id: string): Promise<Package | null> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAvailableDates(packageId: string): Promise<PackageAvailableDate[]> {
    const { data, error } = await supabase
      .from('package_available_dates')
      .select('*')
      .eq('package_id', packageId)
      .eq('is_available', true)
      .gte('available_date', new Date().toISOString().split('T')[0])
      .order('available_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createPackage(packageData: Omit<Package, 'id' | 'created_at' | 'updated_at'>): Promise<Package> {
    const { data, error } = await supabase
      .from('packages')
      .insert(packageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePackage(id: string, packageData: Partial<Package>): Promise<Package> {
    const { data, error } = await supabase
      .from('packages')
      .update({ ...packageData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePackage(id: string): Promise<void> {
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addAvailableDate(packageId: string, date: string): Promise<void> {
    const { error } = await supabase
      .from('package_available_dates')
      .insert({
        package_id: packageId,
        available_date: date,
      });

    if (error) throw error;
  },

  async removeAvailableDate(id: string): Promise<void> {
    const { error } = await supabase
      .from('package_available_dates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
