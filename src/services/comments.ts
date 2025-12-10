import { supabase } from '../lib/supabase';

export interface Comment {
  id: number;
  post_id: number;
  content: string;
  upvotes: number;
  created_at: string;
}

export async function fetchComments(postId: number) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}


export async function createComment(postId: number, content: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ post_id: postId, content }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upvoteComment(commentId: number, currentUpvotes: number) {
  const { data, error } = await supabase
    .from('comments')
    .update({ upvotes: currentUpvotes + 1 })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
