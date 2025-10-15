import { useEffect, useState } from 'react';
import { ThumbsUp, Sparkles } from 'lucide-react';
import { fetchPosts, upvotePost, subscribeToPostChanges } from '../services/posts';
import { fetchComments, createComment, upvoteComment, Comment } from '../services/comments'; // Add comment services
import { Post } from '../lib/supabase';
import CommentForm from './CommentForm'; // Your comment form component

export function WishWall() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upvotingIds, setUpvotingIds] = useState<Set<number>>(new Set());
  const [commentingIds, setCommentingIds] = useState<Set<number>>(new Set());

  const loadPosts = async () => {
    const { data, error: fetchError } = await fetchPosts();
    if (fetchError) {
      setError('Failed to load wishes. Please refresh the page.');
      setLoading(false);
      return;
    }
    setPosts(data || []);
    setLoading(false);

    // Fetch comments for all posts
    const newCommentsMap: Record<number, Comment[]> = {};
    for (const post of data || []) {
      try {
        const comments = await fetchComments(post.id);
        newCommentsMap[post.id] = comments;
      } catch(_) {
        newCommentsMap[post.id] = [];
      }
    }
    setCommentsMap(newCommentsMap);
  };

  useEffect(() => {
    loadPosts();
    const unsubscribe = subscribeToPostChanges(loadPosts);
    return () => unsubscribe();
  }, []);

  const handleUpvote = async (post: Post) => {
    if (upvotingIds.has(post.id)) return;
    setUpvotingIds(prev => new Set(prev).add(post.id));
    const { error: upvoteError } = await upvotePost(String(post.id), Number(post.upvotes));
    setUpvotingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(post.id);
      return newSet;
    });
    if (upvoteError) {
      console.error('Failed to upvote:', upvoteError);
      return;
    }
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === post.id ? { ...p, upvotes: p.upvotes + 1 } : p
      )
    );
  };

  const handleCommentAdded = async (postId: number) => {
    setCommentingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(postId);
      return newSet;
    });
    // Refresh comments for this post
    try {
      const comments = await fetchComments(postId);
      setCommentsMap(prev => ({ ...prev, [postId]: comments }));
    } catch {
      // ignore errors
    }
  };

  const handleCommentUpvote = async (postId: number, comment: Comment) => {
    if (commentingIds.has(comment.id)) return;
    setCommentingIds(prev => new Set(prev).add(comment.id));
    const { error } = await upvoteComment(comment.id, comment.upvotes);
    setCommentingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(comment.id);
      return newSet;
    });
    if (error) {
      console.error('Failed to upvote comment:', error);
      return;
    }
    setCommentsMap(prev => {
      const updatedComments = prev[postId].map(c =>
        c.id === comment.id ? { ...c, upvotes: c.upvotes + 1 } : c
      );
      return { ...prev, [postId]: updatedComments };
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <p>Loading wishes...</p>;
  if (error) return <p>{error}</p>;
  if (posts.length === 0) return <p>No wishes yet. Be the first to share!</p>;

  return (
    <div>
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <p>{post.content}</p>
          <small>{formatDate(post.created_at)}</small>
          <button
            onClick={() => handleUpvote(post)}
            disabled={upvotingIds.has(post.id)}
            aria-label={`Upvote this wish (${post.upvotes} upvotes)`}
          >
            <ThumbsUp /> {post.upvotes}
          </button>

          {/* Comments section */}
          <div className="comments-section">
            <h4>Comments</h4>
            {(commentsMap[post.id] || []).map(comment => (
              <div key={comment.id} className="comment">
                <p>{comment.content}</p>
                <small>{formatDate(comment.created_at)}</small>
                <button
                  onClick={() => handleCommentUpvote(post.id, comment)}
                  disabled={commentingIds.has(comment.id)}
                  aria-label={`Upvote this comment (${comment.upvotes} upvotes)`}
                >
                  <ThumbsUp /> {comment.upvotes}
                </button>
              </div>
            ))}

            {/* Comment form */}
            <CommentForm
              postId={post.id}
              createComment={createComment}
              onCommentAdded={() => handleCommentAdded(post.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
