import { supabase } from './supabase';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  phone: string;
}

export async function signUp({ email, password, username, phone }: SignUpData) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        phone,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('User creation failed');

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      username,
      phone,
      role: 'user',
    });

  if (profileError) {
    console.error('Profile creation error:', profileError);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function adminSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile || profile.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('You do not have admin privileges');
  }

  return { user: data.user, profile };
}
