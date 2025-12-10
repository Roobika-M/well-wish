import { supabase } from '../lib/supabase';

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  upvotes: number;
  created_at: string;
}

export async function fetchComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Comment[];
}


export async function createComment(postId: string, content: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ post_id: postId, content }])
    .select()
    .single();

  if (error) throw error;
  return data as Comment;
}

export async function upvoteComment(commentId: string, currentUpvotes: number) {
  const { data, error } = await supabase
    .from('comments')
    .update({ upvotes: currentUpvotes + 1 })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data as Comment;
}
