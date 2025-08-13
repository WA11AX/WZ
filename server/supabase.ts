import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not found. Some features may be limited.');
}

// Create Supabase client
export const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

// Export functions for common Supabase operations
export async function uploadImage(file: Buffer, path: string): Promise<string | null> {
  if (!supabase) return null;
  
  const { data, error } = await supabase.storage
    .from('tournament-images')
    .upload(path, file, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('tournament-images')
    .getPublicUrl(path);

  return publicUrl;
}

export async function deleteImage(path: string): Promise<boolean> {
  if (!supabase) return false;
  
  const { error } = await supabase.storage
    .from('tournament-images')
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    return false;
  }

  return true;
}

// Real-time subscriptions for tournaments
export function subscribeTournamentUpdates(callback: (payload: any) => void) {
  if (!supabase) return null;
  
  return supabase
    .channel('tournament-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tournaments'
    }, callback)
    .subscribe();
}

// Real-time subscriptions for user updates
export function subscribeUserUpdates(userId: string, callback: (payload: any) => void) {
  if (!supabase) return null;
  
  return supabase
    .channel(`user-${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'users',
      filter: `id=eq.${userId}`
    }, callback)
    .subscribe();
}