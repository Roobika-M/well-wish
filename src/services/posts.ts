import { supabase, Post } from '../lib/supabase';

export async function createPost(content: string, recipient?: string | null): Promise<{ data: Post | null; error: Error | null }> {
  try {
    const insertPayload: any = { content };
    if (recipient && recipient.trim()) insertPayload.recipient = recipient.trim();

    const { data, error } = await supabase
      .from('posts')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function fetchPosts(): Promise<{ data: Post[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function upvotePost(postId: string, currentUpvotes: number): Promise<{ data: Post | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update({ upvotes: currentUpvotes + 1 })
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export function subscribeToPostChanges(callback: () => void) {
  const channel = supabase
    .channel('posts-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
